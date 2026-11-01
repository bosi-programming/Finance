import { describe, expect, it } from 'vitest';

import {
  BUDGET_CATEGORY_REQUIRED_MESSAGE,
  BUDGET_NAME_REQUIRED_MESSAGE,
  BUDGET_TYPE_REQUIRED_MESSAGE,
  EMPTY_DRAFT,
  categoryTypes,
  draftFromBudget,
  FIXED_VALUE_INVALID_MESSAGE,
  PERCENTAGE_VALUE_INVALID_MESSAGE,
  validateBudgetDraft,
} from './budgetDraft';
import type { Budget } from '@/types/budget';

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

  it('flags the name and category of an empty draft', () => {
    expect(validateBudgetDraft(EMPTY_DRAFT)).toEqual({
      ok: false,
      errors: {
        name: BUDGET_NAME_REQUIRED_MESSAGE,
        category: BUDGET_CATEGORY_REQUIRED_MESSAGE,
      },
    });
  });

  it('flags the missing type only when adding a category', () => {
    expect(
      validateBudgetDraft({ ...EMPTY_DRAFT, addingCategory: true }),
    ).toEqual({
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

describe('draftFromBudget', () => {
  it('seeds a fixed and a percentage budget', () => {
    const rent: Budget = {
      id: 'rent-1',
      name: 'Rent',
      type: 'fixed',
      value: 2000,
      category: 'Housing',
    };
    const fun: Budget = {
      id: 'fun-1',
      name: 'Fun',
      type: 'percentage',
      value: 60,
      category: 'Leisure',
    };

    expect(draftFromBudget(rent)).toEqual({
      name: 'Rent',
      type: 'fixed',
      valueText: '$ 2,000.00',
      category: 'Housing',
      addingCategory: false,
      newCategory: '',
    });
    expect(draftFromBudget(fun)).toEqual({
      name: 'Fun',
      type: 'percentage',
      valueText: '60%',
      category: 'Leisure',
      addingCategory: false,
      newCategory: '',
    });
  });
});

describe('categoryTypes', () => {
  it('maps each category to the type of its first budget', () => {
    const budgets: Budget[] = [
      { id: 'a', name: 'A', type: 'fixed', value: 1, category: 'Housing' },
      { id: 'b', name: 'B', type: 'percentage', value: 1, category: 'Housing' },
      { id: 'c', name: 'C', type: 'percentage', value: 1, category: 'Leisure' },
    ];

    expect(categoryTypes(budgets)).toEqual({
      Housing: 'fixed',
      Leisure: 'percentage',
    });
  });
});
