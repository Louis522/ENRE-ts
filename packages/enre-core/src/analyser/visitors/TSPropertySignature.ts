/**
 * TSPropertySignature
 *
 * Extracted entities:
 *   * Property
 */

import {NodePath} from '@babel/traverse';
import {TSPropertySignature} from '@babel/types';
import {ENREEntityProperty, recordEntityProperty} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose, warn} from '@enre/logging';
import {buildENREName, ENRENameModified} from '@enre/naming';
import {ENREContext} from '../context';
import {ENREEntityCollectionAnyChildren} from '@enre/container/lib/entity/collections';

type PathType = NodePath<TSPropertySignature>

export default (path: PathType, {scope}: ENREContext) => {
  let entity: ENREEntityProperty | undefined = undefined;

  switch (path.node.key.type) {
    case 'Identifier':
      entity = recordEntityProperty(
        buildENREName(path.node.key.name),
        toENRELocation(path.node.key.loc),
        scope.last(),
      );
      break;

    // TODO: If a string literal has the same content as a numeric literal, an warning should raise
    case 'StringLiteral':
      entity = recordEntityProperty(
        buildENREName<ENRENameModified>({
          raw: path.node.key.value,
          as: 'StringLiteral',
        }),
        toENRELocation(path.node.key.loc),
        scope.last(),
      );
      break;

    case 'NumericLiteral':
      entity = recordEntityProperty(
        buildENREName<ENRENameModified>({
          raw: path.node.key.extra?.raw as string || (warn('Encounter a NumericLiteral node without extra.raw'), ''),
          as: 'NumericLiteral',
          value: path.node.key.value.toString(),
        }),
        toENRELocation(path.node.key.loc),
        scope.last(),
      );
      break;

    default:
    // WONT-FIX: Extract name from other expressions
  }

  if (entity) {
    verbose('Record Entity Property: ' + entity.name.printableName);
    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
  }
};
