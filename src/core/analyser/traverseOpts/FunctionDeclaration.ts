/**
 * FunctionDeclaration|FunctionExpression
 *
 * Extractable entity:
 *   * Function
 *     - (Exclude) Arrow Function
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {FunctionDeclaration, FunctionExpression, SourceLocation} from '@babel/types';
import {ENREEntityFunction, recordEntityFunction} from '../entities/eFunction';
import {toENRELocation, ToENRELocationPolicy} from '../../utils/locationHelper';
import {verbose} from '../../utils/cliRender';
import {buildENRECodeName, ENRENameBuildOption} from '../../utils/nameHelper';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<FunctionDeclaration | FunctionExpression>) => {
      let entity: ENREEntityFunction;

      if (path.node.id) {
        entity = recordEntityFunction(
          buildENRECodeName(ENRENameBuildOption.value, path.node.id.name),
          toENRELocation(path.node.loc as SourceLocation, ToENRELocationPolicy.NoEnd),
          scope[scope.length - 1],
          false,
          path.node.async,
          path.node.generator,
        );
      } else {
        entity = recordEntityFunction(
          buildENRECodeName(ENRENameBuildOption.anonymous, {type: 'function'}),
          toENRELocation(path.node.loc as SourceLocation, ToENRELocationPolicy.NoEnd),
          scope[scope.length - 1],
          false,
          path.node.async,
          path.node.generator,
        );
      }
      verbose('FunctionDeclaration: ' + entity.name.printableName);

      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};