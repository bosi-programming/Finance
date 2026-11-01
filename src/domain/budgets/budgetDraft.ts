import {
  formatValueInput,
  parseBudgetValue,
} from '@/domain/budgets/budgetValue';
import { type Budget, type BudgetType } from '@/types/budget';

export interface BudgetDraft {
  name: string;
  type: BudgetType | '';
  valueText: string;
  category: string;
  addingCategory: boolean;
  newCategory: string;
}

export const EMPTY_DRAFT: BudgetDraft = {
  name: '',
  type: '',
  valueText: '',
  category: '',
  addingCategory: false,
  newCategory: '',
};

export function draftFromBudget(budget: Budget): BudgetDraft {
  return {
    name: budget.name,
    type: budget.type,
    valueText: formatValueInput(budget),
    category: budget.category,
    addingCategory: false,
    newCategory: '',
  };
}

export function categoryTypes(budgets: Budget[]): Record<string, BudgetType> {
  const types: Record<string, BudgetType> = {};
  for (const budget of budgets) {
    types[budget.category] ??= budget.type;
  }
  return types;
}

export type BudgetDraftField = 'name' | 'type' | 'value' | 'category';
export type BudgetDraftErrors = Partial<Record<BudgetDraftField, string>>;
export type BudgetDraftResult =
  | { ok: true; fields: Omit<Budget, 'id'> }
  | { ok: false; errors: BudgetDraftErrors };

export const BUDGET_NAME_REQUIRED_MESSAGE = 'Enter a budget name.';
export const BUDGET_TYPE_REQUIRED_MESSAGE = 'Choose a budget type.';
export const FIXED_VALUE_INVALID_MESSAGE = 'Enter an amount above $ 0.00.';
export const PERCENTAGE_VALUE_INVALID_MESSAGE =
  'Enter a percentage between 0 and 100.';
export const BUDGET_CATEGORY_REQUIRED_MESSAGE = 'Choose a category.';

export function validateBudgetDraft(draft: BudgetDraft): BudgetDraftResult {
  const errors: BudgetDraftErrors = {};
  const name = draft.name.trim();
  const category = (
    draft.addingCategory ? draft.newCategory : draft.category
  ).trim();
  let value = 0;

  if (name === '') {
    errors.name = BUDGET_NAME_REQUIRED_MESSAGE;
  }
  if (draft.type === '') {
    if (draft.addingCategory) {
      errors.type = BUDGET_TYPE_REQUIRED_MESSAGE;
    }
  } else {
    const parsed = parseBudgetValue(draft.type, draft.valueText);
    if (parsed.ok) {
      value = parsed.value;
    } else {
      errors.value =
        draft.type === 'percentage'
          ? PERCENTAGE_VALUE_INVALID_MESSAGE
          : FIXED_VALUE_INVALID_MESSAGE;
    }
  }
  if (category === '') {
    errors.category = BUDGET_CATEGORY_REQUIRED_MESSAGE;
  }

  if (Object.keys(errors).length > 0 || draft.type === '') {
    return { ok: false, errors };
  }
  return { ok: true, fields: { name, type: draft.type, value, category } };
}
