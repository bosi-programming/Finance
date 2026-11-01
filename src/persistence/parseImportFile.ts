import { appStateSchema, legacyCliSchema } from '@/persistence/schema';
import {
  SCHEMA_VERSION,
  type AppState,
  type Budget,
  type BudgetType,
  type LegacyCliFile,
} from '@/types/budget';

interface LegacyGroup {
  type: BudgetType;
  field: string;
  category: string;
}

const LEGACY_GROUPS: LegacyGroup[] = [
  { type: 'fixed', field: 'personal', category: 'personal' },
  { type: 'fixed', field: 'business', category: 'business' },
  { type: 'fixed', field: 'subscriptions', category: 'subscriptions' },
  { type: 'fixed', field: 'fixedInvestments', category: 'fixed investments' },
  { type: 'percentage', field: 'investments', category: 'investments' },
  { type: 'percentage', field: 'leisure', category: 'leisure' },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fromLegacy = (file: LegacyCliFile): AppState => {
  const budgets: Budget[] = [];
  for (const { type, field, category } of LEGACY_GROUPS) {
    const values: Record<string, number | undefined> = file[type] ?? {};
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
  return { version: SCHEMA_VERSION, salary: file.salary, budgets };
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
