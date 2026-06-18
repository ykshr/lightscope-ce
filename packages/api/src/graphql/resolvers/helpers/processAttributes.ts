import { camelToSnake } from '@/graphql/loaders/helpers/rename';
import { FragmentDefinitionNode, GraphQLResolveInfo, SelectionNode } from 'graphql';

function collectSelectedFields(info: GraphQLResolveInfo): Set<string> {
  const result = new Set<string>();

  const fragments = info.fragments;

  function walk(selections: readonly SelectionNode[]) {
    for (const selection of selections) {
      switch (selection.kind) {
        case 'Field':
          result.add(selection.name.value);
          break;

        case 'InlineFragment':
          walk(selection.selectionSet.selections);
          break;

        case 'FragmentSpread': {
          const fragment: FragmentDefinitionNode | undefined = fragments[selection.name.value];
          if (fragment) {
            walk(fragment.selectionSet.selections);
          }
          break;
        }
      }
    }
  }

  for (const fieldNode of info.fieldNodes) {
    if (fieldNode.selectionSet) {
      walk(fieldNode.selectionSet.selections);
    }
  }

  return result;
}

const RequestAttributes = [
  'age',
  'app_type',
  'app',
  'device_type',
  'device_vendor',
  'device',
  'gender',
  'geo_continent',
  'geo_country',
  'geo_subdivision',
  'geo_city',
  'domain',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign',
] as const;

const RequestAttributesWithArticle = [...RequestAttributes, 'url', 'article'] as const;

export type RequestAttribute = (typeof RequestAttributes)[number];

export type RequestAttributesWithArticle = (typeof RequestAttributesWithArticle)[number];

export function resolveRequestedAttributes(info: GraphQLResolveInfo): RequestAttribute[] {
  const selected = collectSelectedFields(info);
  const selectedSnake = new Set(Array.from(selected, camelToSnake));
  return RequestAttributes.filter((a) => selectedSnake.has(a));
}

export function resolveRequestedAttributesWithArticle(
  info: GraphQLResolveInfo
): RequestAttributesWithArticle[] {
  const selected = collectSelectedFields(info);
  const selectedSnake = new Set(Array.from(selected, camelToSnake));
  return RequestAttributesWithArticle.filter((a) => selectedSnake.has(a));
}
