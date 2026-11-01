import { describe, expect, it } from 'vitest';

import {
  BUDGET_CATEGORY_REQUIRED_MESSAGE,
  BUDGET_NAME_REQUIRED_MESSAGE,
  BUDGET_TYPE_REQUIRED_MESSAGE,
  EMPTY_DRAFT,
  FIXED_VALUE_INVALID_MESSAGE,
  PERCENTAGE_VALUE_INVALID_MESSAGE,
  validateBudgetDraft,
} from './budgetDraft';

describe('validateBudgetDraft', () => {
  it('returns fields for a valid draft', () => {
    expect(
      validateBudgetDraft({
        ...EMPTY_DRAFT,
        name: ' Rent ',
        type: 'fixed',
        valueText: '2,000',
        category: 'Housing',
      }),
    ).toEqual({
      ok: true,
      fields: { name: 'Rent', type: 'fixed', value: 2000, category: 'Housing' },
    });
  });

  it('uses the new category when adding one', () => {
    expect(
      validateBudgetDraft({
        ...EMPTY_DRAFT,
        name: 'Groceries',
        type: 'fixed',
        valueText: '300',
        addingCategory: true,
        newCategory: ' Food ',
      }),
    ).toEqual({
      ok: true,
      fields: {
        name: 'Groceries',
        type: 'fixed',
        value: 300,
        category: 'Food',
      },
    });
  });

  it('flags every empty field', () => {
    expect(validateBudgetDraft(EMPTY_DRAFT)).toEqual({
      ok: false,
      errors: {
        name: BUDGET_NAME_REQUIRED_MESSAGE,
        type: BUDGET_TYPE_REQUIRED_MESSAGE,
        category: BUDGET_CATEGORY_REQUIRED_MESSAGE,
      },
    });
  });

  it('flags a blank name', () => {
    expect(
      validateBudgetDraft({
        ...EMPTY_DRAFT,
        name: '   ',
        type: 'fixed',
        valueText: '10',
        category: 'Housing',
      }),
    ).toEqual({ ok: false, errors: { name: BUDGET_NAME_REQUIRED_MESSAGE } });
  });

  it('flags a bad fixed value', () => {
    expect(
      validateBudgetDraft({
        ...EMPTY_DRAFT,
        name: 'Rent',
        type: 'fixed',
        valueText: '0',
        category: 'Housing',
      }),
    ).toEqual({ ok: false, errors: { value: FIXED_VALUE_INVALID_MESSAGE } });
  });

  it('flags a bad percentage value', () => {
    expect(
      validateBudgetDraft({
        ...EMPTY_DRAFT,
        name: 'Fun',
        type: 'percentage',
        valueText: '101',
        category: 'Leisure',
      }),
    ).toEqual({
      ok: false,
      errors: { value: PERCENTAGE_VALUE_INVALID_MESSAGE },
    });
  });

  it('flags an empty new category', () => {
    expect(
      validateBudgetDraft({
        ...EMPTY_DRAFT,
        name: 'Fun',
        type: 'percentage',
        valueText: '10',
        addingCategory: true,
        newCategory: '',
      }),
    ).toEqual({
      ok: false,
      errors: { category: BUDGET_CATEGORY_REQUIRED_MESSAGE },
    });
  });
});
