import enumType from './enum';
import inputType from './input';
import queryType from './query';
import scalarType from './scalar';

import articleType from './type/article';
import rankType from './type/rank';
import trendType from './type/trend';

const typeDefs = [
  enumType,
  inputType,
  queryType,
  scalarType,
  articleType,
  rankType,
  trendType,
];

export default typeDefs;
