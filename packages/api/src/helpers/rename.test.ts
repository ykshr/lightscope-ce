import { describe, expect, it } from 'vitest';
import { renameKeySnakeToCamel } from './rename';

describe('renameKeySnakeToCamel', () => {
  it('should convert simple snake_case keys to camelCase', () => {
    const input = { first_name: 'John', last_name: 'Doe' };
    const expected = { firstName: 'John', lastName: 'Doe' };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle multiple underscores', () => {
    const input = { some_very_long_key_name: 'value' };
    const expected = { someVeryLongKeyName: 'value' };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle nested objects', () => {
    const input = {
      user_info: {
        first_name: 'John',
        address_details: {
          street_name: 'Main St',
        },
      },
    };
    const expected = {
      userInfo: {
        firstName: 'John',
        addressDetails: {
          streetName: 'Main St',
        },
      },
    };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle arrays of objects', () => {
    const input = [
      { item_id: 1, item_name: 'A' },
      { item_id: 2, item_name: 'B' },
    ];
    const expected = [
      { itemId: 1, itemName: 'A' },
      { itemId: 2, itemName: 'B' },
    ];
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle nested arrays and objects', () => {
    const input = {
      items_list: [{ item_id: 1, tags_list: ['tag_one', 'tag_two'] }],
    };
    const expected = {
      itemsList: [{ itemId: 1, tagsList: ['tag_one', 'tag_two'] }],
    };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle primitive values', () => {
    expect(renameKeySnakeToCamel('some_string')).toBe('some_string');
    expect(renameKeySnakeToCamel(123)).toBe(123);
    expect(renameKeySnakeToCamel(true)).toBe(true);
    expect(renameKeySnakeToCamel(null)).toBe(null);
    expect(renameKeySnakeToCamel(undefined)).toBe(undefined);
  });

  it('should not change Date objects', () => {
    const date = new Date();
    const input = { created_at: date };
    const expected = { createdAt: date };
    const result = renameKeySnakeToCamel(input);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt).toEqual(date);
  });

  it('should handle already camelCase keys', () => {
    const input = { alreadyCamel: 'value', another_one: 'value' };
    const expected = { alreadyCamel: 'value', anotherOne: 'value' };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle empty objects and arrays', () => {
    expect(renameKeySnakeToCamel({})).toEqual({});
    expect(renameKeySnakeToCamel([])).toEqual([]);
  });
});
