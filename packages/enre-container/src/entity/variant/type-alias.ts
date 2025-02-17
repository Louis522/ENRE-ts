import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';

export interface ENREEntityTypeAlias extends ENREEntityAbilityBase {
  readonly type: 'type alias';
}

export const recordEntityTypeAlias = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityTypeAlias => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'type alias' as const;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
