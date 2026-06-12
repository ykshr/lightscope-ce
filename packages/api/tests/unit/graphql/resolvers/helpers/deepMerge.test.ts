import deepMerge from '@/graphql/resolvers/helpers/deepMerge';
import { describe, expect, it } from 'vitest';

describe('deepMerge', () => {
  it('should merge two simple objects', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 2 });
  });

  it('should overwrite existing properties in target', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3 };
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 3 });
  });

  it('should deep merge nested objects', () => {
    const target = { a: { x: 1, y: 2 } };
    const source = { a: { y: 3, z: 4 } };
    expect(deepMerge(target, source)).toEqual({ a: { x: 1, y: 3, z: 4 } });
  });

  it('should handle multiple sources', () => {
    const target = { a: 1 };
    const source1 = { b: 2 };
    const source2 = { c: 3 };
    expect(deepMerge(target, source1, source2)).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should return target if no sources provided', () => {
    const target = { a: 1 };
    expect(deepMerge(target)).toEqual({ a: 1 }); // It returns a copy
    // Check if it is a copy or reference? The code says { ...target }
  });

  it('should merge arrays by concatenating them', () => {
    const target = { a: [1, 2] };
    const source = { a: [3, 4] };
    expect(deepMerge(target, source)).toEqual({ a: [1, 2, 3, 4] });
  });

  it('should ignore non-object sources', () => {
    const target = { a: 1 };
    // @ts-ignore
    expect(deepMerge(target, null, undefined, 123, 'string')).toEqual({ a: 1 });
  });

  it('should deeply merge arrays within nested objects', () => {
    const target = { a: { b: { c: [1, 2] } } };
    const source = { a: { b: { c: [3, 4] } } };
    expect(deepMerge(target, source)).toEqual({ a: { b: { c: [1, 2, 3, 4] } } });
  });

  it('should prevent prototype pollution', () => {
    const target = {};
    const payload = JSON.parse('{"__proto__":{"polluted":true}}');
    deepMerge(target, payload);
    // @ts-ignore
    expect({}.polluted).toBeUndefined();

    const payload2 = JSON.parse('{"constructor":{"prototype":{"polluted2":true}}}');
    deepMerge(target, payload2);
    // @ts-ignore
    expect({}.polluted2).toBeUndefined();

    const payload3 = JSON.parse('{"prototype":{"polluted3":true}}');
    deepMerge(target, payload3);
    // @ts-ignore
    expect({}.polluted3).toBeUndefined();
  });
});
