import { type AppState } from '@/types/budget';

export const EXPORT_FILE_NAME = 'finance-fe-v0.json';
const JSON_INDENT = 2;

export function serializeAppState({
  version,
  salary,
  budgets,
}: AppState): string {
  return JSON.stringify({ version, salary, budgets }, null, JSON_INDENT);
}

export function downloadAppState(state: AppState): void {
  const blob = new Blob([serializeAppState(state)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = EXPORT_FILE_NAME;
  anchor.click();
  URL.revokeObjectURL(url);
}
