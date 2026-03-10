import article from './type/article.graphql';
import rank from './type/rank.graphql';
import trend from './type/trend.graphql';
import enumTypes from './enum.graphql';
import inputTypes from './input.graphql';
import queryTypes from './query.graphql';
import scalarTypes from './scalar.graphql';

const typeDefs = [enumTypes, inputTypes, queryTypes, scalarTypes, article, rank, trend];

export default typeDefs;
