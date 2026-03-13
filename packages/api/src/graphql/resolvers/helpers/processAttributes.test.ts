import { describe, it, expect } from 'vitest';
import { GraphQLResolveInfo, FieldNode, FragmentDefinitionNode, Kind } from 'graphql';
import { resolveRequestedAttributes } from './processAttributes';

function createMockInfo(
  fieldNodes: FieldNode[],
  fragments: Record<string, FragmentDefinitionNode> = {}
): GraphQLResolveInfo {
  return {
    fieldNodes,
    fragments,
    fieldName: 'dummy',
    returnType: {} as any,
    parentType: {} as any,
    path: { key: 'dummy', prev: undefined },
    schema: {} as any,
    rootValue: undefined,
    operation: {
      kind: Kind.OPERATION_DEFINITION,
      operation: 'query',
      selectionSet: { kind: Kind.SELECTION_SET, selections: [] },
    },
    variableValues: {},
  } as unknown as GraphQLResolveInfo;
}

describe('processAttributes', () => {
  describe('resolveRequestedAttributes', () => {
    it('extracts direct field selections', () => {
      const info = createMockInfo([
        {
          kind: Kind.FIELD,
          name: { kind: Kind.NAME, value: 'dummy' },
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'device' } },
              { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'app' } },
              { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'not_an_attribute' } },
            ],
          },
        },
      ]);
      const result = resolveRequestedAttributes(info);
      expect(result).toEqual(['app', 'device']);
    });

    it('extracts fields from inline fragments', () => {
      const info = createMockInfo([
        {
          kind: Kind.FIELD,
          name: { kind: Kind.NAME, value: 'dummy' },
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.INLINE_FRAGMENT,
                selectionSet: {
                  kind: Kind.SELECTION_SET,
                  selections: [
                    { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'utm_campaign' } },
                  ],
                },
              },
            ],
          },
        },
      ]);
      expect(resolveRequestedAttributes(info)).toEqual(['utm_campaign']);
    });

    it('extracts fields from fragment spreads', () => {
      const fragments: Record<string, FragmentDefinitionNode> = {
        MyFragment: {
          kind: Kind.FRAGMENT_DEFINITION,
          name: { kind: Kind.NAME, value: 'MyFragment' },
          typeCondition: { kind: Kind.NAMED_TYPE, name: { kind: Kind.NAME, value: 'SomeType' } },
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [{ kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'geo_country' } }],
          },
        },
      };

      const info = createMockInfo(
        [
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: 'dummy' },
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                { kind: Kind.FRAGMENT_SPREAD, name: { kind: Kind.NAME, value: 'MyFragment' } },
              ],
            },
          },
        ],
        fragments
      );

      expect(resolveRequestedAttributes(info)).toEqual(['geo_country']);
    });

    it('returns empty array if no attributes are selected', () => {
      const info = createMockInfo([
        {
          kind: Kind.FIELD,
          name: { kind: Kind.NAME, value: 'dummy' },
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'id' } },
              { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'count' } },
            ],
          },
        },
      ]);
      expect(resolveRequestedAttributes(info)).toEqual([]);
    });
  });
});
