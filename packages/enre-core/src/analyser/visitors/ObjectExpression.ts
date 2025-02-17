/**
 * ObjectExpression
 *
 * Extracted entities:
 *   * Property
 */

import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {ObjectExpression, SourceLocation} from '@babel/types';
import {ModifierType} from '../context/modifier-stack';
import {ENREEntityCollectionInFile, ENREEntityProperty, recordEntityProperty} from '@enre/container';
import {buildENREName, ENRENameModified} from '@enre/naming';
import {toENRELocation} from '@enre/location';
import {verbose, warn} from '@enre/logging';

type PathType = NodePath<ObjectExpression>

export default (path: PathType, {scope, modifier}: ENREContext) => {
  const topCommand = modifier.at(-1);
  if (!(topCommand && topCommand.type === ModifierType.acceptProperty)) {
    /**
     * Those conditions make this function only record `Entity: Property`
     * exclusively in an ObjectExpression as VariableDeclaration's init,
     * but not other places (such as object literals as function's parameter).
     */
    return;
  }

  for (const objectProperty of path.node.properties) {
    if (objectProperty.type === 'SpreadElement') {
      // TODO?: SpreadElement inference
      continue;
    }

    let entity: ENREEntityProperty | undefined;

    const keyType = objectProperty.key.type;
    switch (keyType) {
      case 'Identifier':
        recordEntityProperty(
          buildENREName(objectProperty.key.name),
          toENRELocation(objectProperty.key.loc),
          scope.last(),
        );
        break;

      case 'StringLiteral':
        recordEntityProperty(
          buildENREName<ENRENameModified>({raw: objectProperty.key.value, as: 'StringLiteral'}),
          toENRELocation(objectProperty.key.loc as SourceLocation),
          scope.last(),
        );
        break;

      case 'NumericLiteral':
        recordEntityProperty(
          buildENREName<ENRENameModified>({
            raw: objectProperty.key.extra?.raw as string || (warn('Encounter a NumericLiteral node without extra.raw'), ''),
            as: 'NumericLiteral',
            value: objectProperty.key.value.toString(),
          }),
          toENRELocation(objectProperty.key.loc as SourceLocation),
          scope.last(),
        );
        break;

      default:
    }

    if (entity) {
      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
      verbose('Record Entity Property: ' + entity.name.printableName);
    }
  }
};
