import { appStateSchema, legacyCliSchema } from '@/persistence/schema';
import {
  type AppState,
  type Budget,
  type BudgetType,
  type LegacyCliFile,
} from '@/types/budget';

interface LegacyGroup {
  group: 'fixed' | 'percentage';
  field: string;
  type: BudgetType;
  category: string;
}

const LEGACY_GROUPS: LegacyGroup[] = [
  { group: 'fixed', field: 'personal', type: 'fixed', category: 'personal' },
  { group: 'fixed', field: 'business', type: 'fixed', category: 'business' },
  {
    group: 'fixed',
    field: 'subscriptions',
    type: 'fixed',
    category: 'subscriptions',
  },
  {
    group: 'fixed',
    field: 'fixedInvestments',
    type: 'fixed',
    category: 'fixed investments',
  },
  {
    group: 'percentage',
    field: 'investments',
    type: 'percentage',
    category: 'investments',
  },
  {
    group: 'percentage',
    field: 'leisure',
    type: 'percentage',
    category: 'leisure',
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fromLegacy = (file: LegacyCliFile): AppState => {
  const budgets: Budget[] = [];
  for (const { group, field, type, category } of LEGACY_GROUPS) {
    const values: Record<string, number | undefined> = file[group] ?? {};
    const value = values[field];
    if (value !== undefined) {
      budgets.push({
        id: `legacy-${field}`,
        name: category,
        type,
        value,
        category,
      });
    }
  }
  return { version: 'v0', salary: file.salary, budgets };
};

export function parseImportFile(text: string): AppState | null {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(json)) {
    return null;
  }
  if ('version' in json) {
    const result = appStateSchema.safeParse(json);
    return result.success ? result.data : null;
  }
  const result = legacyCliSchema.safeParse(json);
  return result.success ? fromLegacy(result.data) : null;
}
