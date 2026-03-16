import { describe, it, expect } from 'vitest';
import { cn } from './index';

describe('cn utility function', () => {
  it('merges basic string class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditionally applied classes', () => {
    const isTrue = true;
    const isFalse = false;

    expect(cn('class1', isTrue ? 'class2' : '', isFalse ? 'class3' : '')).toBe('class1 class2');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('handles objects with boolean values', () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3');
  });

  it('handles mixed inputs (strings, arrays, objects, booleans)', () => {
    expect(
      cn('class1', ['class2', 'class3'], { class4: true, class5: false }, 'class6', false)
    ).toBe('class1 class2 class3 class4 class6');
  });

  it('merges tailwind classes and resolves conflicts', () => {
    // Both define padding, so the later one should override the earlier one
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-red-500', 'bg-blue-500', 'bg-green-500')).toBe('bg-green-500');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn(null, undefined, false, '')).toBe('');
  });

  it('handles complex tailwind class conflicts correctly', () => {
    expect(cn('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]')).toBe(
      'hover:bg-dark-red p-3 bg-[#B91C1C]'
    );
  });
});
