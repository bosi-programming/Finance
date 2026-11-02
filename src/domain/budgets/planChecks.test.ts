import { describe, expect, it } from 'vitest';

import { i18n } from '@/i18n';
import { LOCALE_SETTINGS } from '@/i18n/languages';

import {
  fixedOverSalaryMessage,
  isPercentageOver,
  percentageOverMessage,
} from './planChecks';

describe('percentageOverMessage', () => {
  it('names the total and the 100% limit', () => {
    expect(percentageOverMessage(110, i18n.t)).toBe(
      'Percentages sum to 110% — must be 100% or less.',
    );
  });

  it('shows a total just above 100 without rounding it to 100', () => {
    expect(percentageOverMessage(100.004, i18n.t)).toBe(
      'Percentages sum to 100.004% — must be 100% or less.',
    );
  });

  it('writes the message in pt-BR', async () => {
    await i18n.changeLanguage('pt-BR');

    expect(percentageOverMessage(100.5, i18n.t, LOCALE_SETTINGS['pt-BR'])).toBe(
      'Os percentuais somam 100,5% — devem ser 100% ou menos.',
    );
  });
});

describe('fixedOverSalaryMessage', () => {
  it('names the excess over the salary', () => {
    expect(fixedOverSalaryMessage(500, i18n.t)).toBe(
      'Fixed budgets exceed the salary by $500.',
    );
  });

  it('writes the message in es', async () => {
    await i18n.changeLanguage('es');

    expect(fixedOverSalaryMessage(1500.5, i18n.t, LOCALE_SETTINGS.es)).toBe(
      'Los presupuestos fijos superan el salario en 1500,50 €.',
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
