import { expect, describe, test, vi, beforeEach } from 'vitest';
import { getElementMetadata } from '../../../src/helpers/elementMetadata';

// Mock Node object for test environment
const Node = {
  ELEMENT_NODE: 1,
};
global.Node = Node as any;

// Mock function to simulate HTMLElement for testing
function createMockElement(options: any = {}): HTMLElement {
  const mockEl = {
    getAttribute: vi.fn((attr: string) => options.attributes?.[attr] || null),
    id: options.id || '',
    textContent: options.textContent || '',
    tagName: options.tagName || 'DIV',
    nodeName: options.tagName || 'DIV',
    nodeType: options.nodeType !== undefined ? options.nodeType : 1, // Node.ELEMENT_NODE
    parentElement: options.parentElement || null,
    previousElementSibling: options.previousElementSibling || null,
  };
  return mockEl as unknown as HTMLElement;
}

describe('getElementMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('element_id extraction', () => {
    test('should prioritize data-lightscope-id', () => {
      const el = createMockElement({
        attributes: {
          'data-lightscope-id': 'lightscope-123',
          'data-analytics-id': 'analytics-123',
        },
        id: 'element-id',
      });
      const metadata = getElementMetadata(el);
      expect(metadata.element_id).toBe('lightscope-123');
    });

    test('should fallback to data-analytics-id', () => {
      const el = createMockElement({
        attributes: {
          'data-analytics-id': 'analytics-123',
        },
        id: 'element-id',
      });
      const metadata = getElementMetadata(el);
      expect(metadata.element_id).toBe('analytics-123');
    });

    test('should fallback to id property', () => {
      const el = createMockElement({
        id: 'element-id',
      });
      const metadata = getElementMetadata(el);
      expect(metadata.element_id).toBe('element-id');
    });

    test('should fallback to getElementPath when no IDs are present', () => {
      const parent = createMockElement({ tagName: 'DIV' });
      const sibling1 = createMockElement({ tagName: 'SPAN', parentElement: parent });
      const sibling2 = createMockElement({ tagName: 'P', previousElementSibling: sibling1, parentElement: parent });
      const target = createMockElement({ tagName: 'SPAN', previousElementSibling: sibling2, parentElement: parent });

      const metadata = getElementMetadata(target);
      expect(metadata.element_id).toBe('div:nth-of-type(1) > span:nth-of-type(2)');
    });

    test('getElementPath should stop traversing when encountering an ID', () => {
      const grandParent = createMockElement({ tagName: 'SECTION', id: 'main-section' });
      const parent = createMockElement({ tagName: 'DIV', parentElement: grandParent });
      const target = createMockElement({ tagName: 'BUTTON', parentElement: parent });

      const metadata = getElementMetadata(target);
      expect(metadata.element_id).toBe('section#main-section > div:nth-of-type(1) > button:nth-of-type(1)');
    });
  });

  describe('element_label extraction', () => {
    test('should prioritize data-lightscope-label', () => {
      const el = createMockElement({
        attributes: {
          'data-lightscope-label': 'Lightscope Label',
          'data-analytics-label': 'Analytics Label',
          'aria-label': 'Aria Label',
        },
        textContent: 'Text Content',
      });
      const metadata = getElementMetadata(el);
      expect(metadata.element_label).toBe('Lightscope Label');
    });

    test('should fallback to data-analytics-label', () => {
      const el = createMockElement({
        attributes: {
          'data-analytics-label': 'Analytics Label',
          'aria-label': 'Aria Label',
        },
        textContent: 'Text Content',
      });
      const metadata = getElementMetadata(el);
      expect(metadata.element_label).toBe('Analytics Label');
    });

    test('should fallback to aria-label', () => {
      const el = createMockElement({
        attributes: {
          'aria-label': 'Aria Label',
        },
        textContent: 'Text Content',
      });
      const metadata = getElementMetadata(el);
      expect(metadata.element_label).toBe('Aria Label');
    });

    test('should fallback to textContent and truncate it to 100 characters', () => {
      const longText = 'A'.repeat(150);
      const el = createMockElement({
        textContent: `  ${longText}  `, // Test trimming as well
      });
      const metadata = getElementMetadata(el);
      expect(metadata.element_label).toBe('A'.repeat(100));
      expect(metadata.element_label.length).toBe(100);
    });

    test('should fallback to empty string if no label is found', () => {
      const el = createMockElement();
      const metadata = getElementMetadata(el);
      expect(metadata.element_label).toBe('');
    });
  });

  describe('element_type extraction', () => {
    test('should prioritize data-lightscope-type', () => {
      const el = createMockElement({
        attributes: {
          'data-lightscope-type': 'custom-type',
        },
        tagName: 'BUTTON',
      });
      const metadata = getElementMetadata(el);
      expect(metadata.element_type).toBe('custom-type');
    });

    test('should fallback to lowercase tagName', () => {
      const el = createMockElement({
        tagName: 'BUTTON',
      });
      const metadata = getElementMetadata(el);
      expect(metadata.element_type).toBe('button');
    });
  });
});
