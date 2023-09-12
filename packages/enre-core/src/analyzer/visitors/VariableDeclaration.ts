/**
 * VariableDeclaration
 *
 * Extracted entities:
 *   * Variable
 *
 * Extracted relations:
 *   * Set @init=true
 */

import {NodePath} from '@babel/traverse';
import {PatternLike, VariableDeclaration} from '@babel/types';
import {
  ENREEntityCollectionAnyChildren,
  ENREEntityVariable,
  id,
  recordEntityVariable,
  recordRelationSet,
} from '@enre/data';
import {ENRELocation} from '@enre/location';
import {ENREContext} from '../context';
import {ModifierLifeCycleKind, ModifierType} from '../context/modifier-stack';
import traverseBindingPattern from './common/traverseBindingPattern';
import ENREName from '@enre/naming';
import {variableKind} from '@enre/shared';

const buildOnRecord = (kind: variableKind, hasInit: boolean) => {
  return (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
    const entity = recordEntityVariable(
      new ENREName('Norm', name),
      location,
      scope.last(),
      {kind},
    );

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);

    if (hasInit) {
      // Record relation `set`
      recordRelationSet(
        scope.last(),
        entity,
        location,
        {isInit: true},
      );
    }

    return entity;
  };
};

type PathType = NodePath<VariableDeclaration>

export default {
  enter: (path: PathType, {scope, modifier}: ENREContext) => {
    const kind = path.node.kind;
    for (const declarator of path.node.declarations) {
      const hasInit = !!declarator.init;

      const returned = traverseBindingPattern<id<ENREEntityVariable>>(
        declarator.id as PatternLike,
        scope,
        buildOnRecord(kind as variableKind, hasInit),
      );

      /**
       * Setup to extract properties from object literals,
       * which expects id to be an identifier (not binding patterns)
       */
      if (declarator.id.type === 'Identifier') {
        if (declarator.init?.type === 'ObjectExpression') {
          if (returned) {
            scope.push(returned);

            modifier.push({
              type: ModifierType.acceptProperty,
              proposer: returned,
              lifeCycle: ModifierLifeCycleKind.disposable,
            });
          }
        }
      }
    }
  },

  exit: (path: PathType, {scope, modifier}: ENREContext) => {
    let top = modifier.at(-1);

    /**
     * This removes `acceptProperty` modifier
     */
    if (top && top.type === ModifierType.acceptProperty) {
      modifier.pop();
      top = modifier.at(-1);
    }

    /**
     * This removes the long-term `export` modifier that exports
     * all variable declarations within the export declaration.
     */
    if (top && top.type === ModifierType.export && top.lifeCycle === ModifierLifeCycleKind.onCondition) {
      modifier.pop();
    }
  }
};
