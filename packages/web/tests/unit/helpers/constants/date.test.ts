import { describe, expect, it } from 'vitest';
import { RELATIVE_OPTIONS_QUICK_ACCESS } from '@/helpers/constants/date';
import { timezoneOffset as tOffset } from '@/helpers/date';

describe('Date Constants', () => {
  describe('RELATIVE_OPTIONS_QUICK_ACCESS', () => {
    it('should have exact number of options', () => {
      expect(RELATIVE_OPTIONS_QUICK_ACCESS).toHaveLength(3);
    });

    it('should contain "Today" option with correct date strings', () => {
      const option = RELATIVE_OPTIONS_QUICK_ACCESS.find((o) => o.label === 'Today');
      expect(option).toBeDefined();
      expect(option?.startDateString).toBe(`So0D${tOffset}`);
      expect(option?.endDateString).toBe(`So1D${tOffset}`);
    });

    it('should contain "This week" option with correct date strings', () => {
      const option = RELATIVE_OPTIONS_QUICK_ACCESS.find((o) => o.label === 'This week');
      expect(option).toBeDefined();
      expect(option?.startDateString).toBe(`So0W${tOffset}`);
      expect(option?.endDateString).toBe(`So1D${tOffset}`);
    });

    it('should contain "This month" option with correct date strings', () => {
      const option = RELATIVE_OPTIONS_QUICK_ACCESS.find((o) => o.label === 'This month');
      expect(option).toBeDefined();
      expect(option?.startDateString).toBe(`So0M${tOffset}`);
      expect(option?.endDateString).toBe(`So1D${tOffset}`);
    });
  });
});
