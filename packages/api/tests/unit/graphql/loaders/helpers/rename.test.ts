import { renameKeySnakeToCamel, camelToSnake } from '@/graphql/loaders/helpers/rename';
import { describe, expect, it } from 'vitest';

describe('renameKeySnakeToCamel', () => {
  it('should convert snake_case keys to camelCase in a simple object', () => {
    const input = { first_name: 'John', last_name: 'Doe' };
    const expected = { firstName: 'John', lastName: 'Doe' };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle nested objects', () => {
    const input = { user_profile: { user_name: 'john_doe', user_age: 30 } };
    const expected = { userProfile: { userName: 'john_doe', userAge: 30 } };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle arrays of objects', () => {
    const input = [{ item_id: 1 }, { item_id: 2 }];
    const expected = [{ itemId: 1 }, { itemId: 2 }];
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should return non-object values as is', () => {
    expect(renameKeySnakeToCamel('string')).toBe('string');
    expect(renameKeySnakeToCamel(123)).toBe(123);
    expect(renameKeySnakeToCamel(null)).toBe(null);
    expect(renameKeySnakeToCamel(undefined)).toBe(undefined);
  });

  it('should handle dates correctly without touching them', () => {
    const date = new Date();
    const input = { created_at: date };
    const expected = { createdAt: date };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle complex nested structures', () => {
    const input = {
      order_list: [
        {
          order_id: 1,
          order_details: {
            product_name: 'Widget',
            price_value: 100,
          },
        },
      ],
      meta_data: {
        created_at: '2023-01-01',
      },
    };
    const expected = {
      orderList: [
        {
          orderId: 1,
          orderDetails: {
            productName: 'Widget',
            priceValue: 100,
          },
        },
      ],
      metaData: {
        createdAt: '2023-01-01',
      },
    };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle keys with numbers and exclude them from conversion', () => {
    const input = { user_1_name: 'Alice', item_2_value: 100 };
    const expected = { user_1Name: 'Alice', item_2Value: 100 };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should handle leading, trailing, and consecutive underscores appropriately', () => {
    const input = { _id: 1, name_: 'Bob', double__underscore: true };
    const expected = { Id: 1, name_: 'Bob', double_Underscore: true };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
  });

  it('should ignore properties from prototype chain', () => {
    const proto = { inherited_key: 1 };
    const input = Object.create(proto);
    input.own_key = 2;
    const expected = { ownKey: 2 };
    expect(renameKeySnakeToCamel(input)).toEqual(expected);
    expect(renameKeySnakeToCamel<Record<string, unknown>>(input).inheritedKey).toBeUndefined();
    expect(renameKeySnakeToCamel<Record<string, unknown>>(input).inherited_key).toBeUndefined();
  });
});

describe('camelToSnake', () => {
  it('should convert camelCase string to snake_case', () => {
    expect(camelToSnake('firstName')).toBe('first_name');
    expect(camelToSnake('lastName')).toBe('last_name');
    expect(camelToSnake('userProfileAge')).toBe('user_profile_age');
  });

  it('should handle strings with no uppercase letters', () => {
    expect(camelToSnake('lowercase')).toBe('lowercase');
    expect(camelToSnake('already_snake')).toBe('already_snake');
  });

  it('should handle strings starting with uppercase letters', () => {
    expect(camelToSnake('PascalCase')).toBe('_pascal_case');
    expect(camelToSnake('Id')).toBe('_id');
  });

  it('should handle empty strings', () => {
    expect(camelToSnake('')).toBe('');
  });
});

describe('camelToSnake', () => {
  it('should convert camelCase keys to snake_case', () => {
    expect(camelToSnake('firstName')).toEqual('first_name');
    expect(camelToSnake('userProfileAge')).toEqual('user_profile_age');
    expect(camelToSnake('snake_case_already')).toEqual('snake_case_already');
    expect(camelToSnake('a')).toEqual('a');
    expect(camelToSnake('A')).toEqual('_a');
  });

  it('should return cached value if called multiple times', () => {
    const firstCall = camelToSnake('someValue');
    const secondCall = camelToSnake('someValue');
    expect(firstCall).toEqual('some_value');
    expect(firstCall).toEqual(secondCall);
  });
});
