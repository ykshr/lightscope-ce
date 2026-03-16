import { describe, it, expect } from 'vitest';
import { GraphQLResolveInfo, FieldNode, FragmentDefinitionNode } from 'graphql';
import {
  resolveRequestedAttributes,
  resolveRequestedAttributesWithArticle,
} from './processAttributes';

function createMockInfo(
  fieldNodes: any[],
  fragments: Record<string, any> = {}
): GraphQLResolveInfo {
  return {
    fieldNodes: fieldNodes as FieldNode[],
    fragments: fragments as Record<string, FragmentDefinitionNode>,
  } as unknown as GraphQLResolveInfo;
}

describe('processAttributes', () => {
  describe('resolveRequestedAttributes', () => {
    it('should extract simple fields', () => {
      const info = createMockInfo([
        {
          kind: 'Field',
          name: { kind: 'Name', value: 'dummyRoot' },
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              { kind: 'Field', name: { kind: 'Name', value: 'age' } },
              { kind: 'Field', name: { kind: 'Name', value: 'app' } },
              { kind: 'Field', name: { kind: 'Name', value: 'unknown_field' } },
            ],
          },
        },
      ]);
      const result = resolveRequestedAttributes(info);
      expect(result).toEqual(['age', 'app']);
    });

    it('should handle inline fragments', () => {
      const info = createMockInfo([
        {
          kind: 'Field',
          name: { kind: 'Name', value: 'dummyRoot' },
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'InlineFragment',
                selectionSet: {
                  kind: 'SelectionSet',
                  selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'device' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'domain' } },
                  ],
                },
              },
            ],
          },
        },
      ]);
      const result = resolveRequestedAttributes(info);
      expect(result).toEqual(['device', 'domain']);
    });

    it('should handle fragment spreads', () => {
      const fragments = {
        MyFragment: {
          kind: 'FragmentDefinition',
          name: { kind: 'Name', value: 'MyFragment' },
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              { kind: 'Field', name: { kind: 'Name', value: 'referrer' } },
              { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
            ],
          },
        },
      };

      const info = createMockInfo(
        [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'dummyRoot' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'MyFragment' } }],
            },
          },
        ],
        fragments
      );
      const result = resolveRequestedAttributes(info);
      expect(result).toEqual(['gender', 'referrer']);
    });

    it('should not include url or article', () => {
      const info = createMockInfo([
        {
          kind: 'Field',
          name: { kind: 'Name', value: 'dummyRoot' },
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              { kind: 'Field', name: { kind: 'Name', value: 'url' } },
              { kind: 'Field', name: { kind: 'Name', value: 'article' } },
              { kind: 'Field', name: { kind: 'Name', value: 'app_type' } },
            ],
          },
        },
      ]);
      const result = resolveRequestedAttributes(info);
      expect(result).toEqual(['app_type']);
    });
  });

  describe('resolveRequestedAttributesWithArticle', () => {
    it('should extract fields including url and article', () => {
      const info = createMockInfo([
        {
          kind: 'Field',
          name: { kind: 'Name', value: 'dummyRoot' },
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              { kind: 'Field', name: { kind: 'Name', value: 'url' } },
              { kind: 'Field', name: { kind: 'Name', value: 'article' } },
              { kind: 'Field', name: { kind: 'Name', value: 'app_type' } },
              { kind: 'Field', name: { kind: 'Name', value: 'unknown_field' } },
            ],
          },
        },
      ]);
      const result = resolveRequestedAttributesWithArticle(info);
      expect(result).toEqual(['app_type', 'url', 'article']);
    });
  });
});
