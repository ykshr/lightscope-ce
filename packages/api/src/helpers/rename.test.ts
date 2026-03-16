import { describe, it, expect } from 'vitest';
import { renameKeySnakeToCamel } from './rename';

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
});
