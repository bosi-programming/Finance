import {
  formatValueInput,
  parseBudgetValue,
} from '@/domain/budgets/budgetValue';
import { LOCALE_SETTINGS, type LocaleSettings } from '@/i18n/languages';
import { type Budget, type BudgetType } from '@/types/budget';

export interface BudgetDraft {
  name: string;
  type: BudgetType | '';
  valueText: string;
  category: string;
  addingCategory: boolean;
  newCategory: string;
}

const DEFAULT_SETTINGS = LOCALE_SETTINGS.en;

export const EMPTY_DRAFT: BudgetDraft = {
  name: '',
  type: '',
  valueText: '',
  category: '',
  addingCategory: false,
  newCategory: '',
};

export function draftFromBudget(
  budget: Budget,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): BudgetDraft {
  return {
    name: budget.name,
    type: budget.type,
    valueText: formatValueInput(budget, settings),
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

export const BUDGET_NAME_REQUIRED_KEY = 'validation.budgetNameRequired';
export const BUDGET_TYPE_REQUIRED_KEY = 'validation.budgetTypeRequired';
export const FIXED_VALUE_INVALID_KEY = 'validation.fixedValueInvalid';
export const PERCENTAGE_VALUE_INVALID_KEY = 'validation.percentageValueInvalid';
export const BUDGET_CATEGORY_REQUIRED_KEY = 'validation.budgetCategoryRequired';

export type BudgetDraftErrorKey =
  | typeof BUDGET_NAME_REQUIRED_KEY
  | typeof BUDGET_TYPE_REQUIRED_KEY
  | typeof FIXED_VALUE_INVALID_KEY
  | typeof PERCENTAGE_VALUE_INVALID_KEY
  | typeof BUDGET_CATEGORY_REQUIRED_KEY;

export type BudgetDraftField = 'name' | 'type' | 'value' | 'category';
export type BudgetDraftErrors = Partial<
  Record<BudgetDraftField, BudgetDraftErrorKey>
>;
export type BudgetDraftResult =
  | { ok: true; fields: Omit<Budget, 'id'> }
  | { ok: false; errors: BudgetDraftErrors };

export function validateBudgetDraft(
  draft: BudgetDraft,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): BudgetDraftResult {
  const errors: BudgetDraftErrors = {};
  const name = draft.name.trim();
  const category = (
    draft.addingCategory ? draft.newCategory : draft.category
  ).trim();
  let value = 0;

  if (name === '') {
    errors.name = BUDGET_NAME_REQUIRED_KEY;
  }
  if (draft.type === '') {
    if (draft.addingCategory) {
      errors.type = BUDGET_TYPE_REQUIRED_KEY;
    }
  } else {
    const parsed = parseBudgetValue(draft.type, draft.valueText, settings);
    if (parsed.ok) {
      value = parsed.value;
    } else {
      errors.value =
        draft.type === 'percentage'
          ? PERCENTAGE_VALUE_INVALID_KEY
          : FIXED_VALUE_INVALID_KEY;
    }
  }
  if (category === '') {
    errors.category = BUDGET_CATEGORY_REQUIRED_KEY;
  }

  if (Object.keys(errors).length > 0 || draft.type === '') {
    return { ok: false, errors };
  }
  return { ok: true, fields: { name, type: draft.type, value, category } };
}
