import { describe, expect, it } from 'vitest';

import {
  fixedOverSalaryMessage,
  isPercentageOver,
  percentageOverMessage,
} from './planChecks';

describe('percentageOverMessage', () => {
  it('names the total and the 100% limit', () => {
    expect(percentageOverMessage(110)).toBe(
      'Percentages sum to 110% — must be 100% or less.',
    );
  });

  it('shows a total just above 100 without rounding it to 100', () => {
    expect(percentageOverMessage(100.004)).toBe(
      'Percentages sum to 100.004% — must be 100% or less.',
    );
  });
});

describe('fixedOverSalaryMessage', () => {
  it('names the excess over the salary', () => {
    expect(fixedOverSalaryMessage(500)).toBe(
      'Fixed budgets exceed your salary by $500.',
    );
  });
});

describe('isPercentageOver', () => {
  const percent = (value: number) => ({
    id: String(value),
    name: 'p',
    type: 'percentage' as const,
    value,
    category: 'Plan',
  });

  it('treats a sum of 100 with float noise as within the limit', () => {
    expect(
      isPercentageOver([percent(0.01), percent(70.68), percent(29.31)]),
    ).toBe(false);
  });

  it('flags a sum above 100 by less than a rounding step', () => {
    expect(isPercentageOver([percent(60), percent(40.004)])).toBe(true);
  });

  it('flags a sum above 100', () => {
    expect(isPercentageOver([percent(60), percent(40.01)])).toBe(true);
  });
});
