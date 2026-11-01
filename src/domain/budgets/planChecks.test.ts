import { describe, expect, it } from 'vitest';

import { fixedOverSalaryMessage, percentageOverMessage } from './planChecks';

describe('percentageOverMessage', () => {
  it('names the total and the 100% limit', () => {
    expect(percentageOverMessage(110)).toBe(
      'Percentages sum to 110% — must be 100% or less.',
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
