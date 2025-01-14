import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';

export interface ENRERelationSet extends ENRERelationAbilityBase {
  readonly type: 'set',
  readonly isInit: boolean,
}

export const recordRelationSet = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  init = false,
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'set' as const;
    },

    get isInit() {
      return init;
    },
  };

  rGraph.add(_obj);

  return _obj;
};
