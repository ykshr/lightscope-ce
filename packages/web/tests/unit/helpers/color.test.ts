import { describe, it, expect } from 'vitest';
import { getColorForIndex, getColorsForCount } from '@/helpers/color';

describe('color helpers', () => {
  describe('getColorForIndex', () => {
    it('should return colors from the palette', () => {
      const color0 = getColorForIndex(0);
      const color1 = getColorForIndex(1);
      expect(color0).toContain('var(--chart-blue-');
      expect(color1).toContain('var(--chart-blue-');
      expect(color0).not.toBe(color1);
    });

    it('should cycle colors', () => {
      // 5 default colors
      const color0 = getColorForIndex(0);
      const color5 = getColorForIndex(5);
      expect(color0).toBe(color5);
    });
  });

  describe('getColorsForCount', () => {
    it('should return correct number of colors', () => {
      const colors = getColorsForCount(3);
      expect(colors).toHaveLength(3);
    });

    it('should return array of colors', () => {
      const colors = getColorsForCount(2);
      expect(colors[0]).toBe(getColorForIndex(0));
      expect(colors[1]).toBe(getColorForIndex(1));
    });
  });
});
