/**
 * StaticBlock
 *
 * Extracted entities:
 *   * Block (Class static block)
 */

import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {StaticBlock} from '@babel/types';
import {recordEntityBlock} from '@enre/data/lib/entity/structure/block';
import {toENRELocation} from '@enre/location';

type PathType = NodePath<StaticBlock>

export default {
  enter: (path: PathType, {file: {logs}, scope}: ENREContext) => {
    const entity = recordEntityBlock(
      'class-static-block',
      toENRELocation(path.node.loc),
      scope.last(),
    );
    scope.push(entity);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  },
};
