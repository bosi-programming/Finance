import Dexie from 'dexie';
import { vi } from 'vitest';
import { db } from '@/persistence/db';
import { persist } from '@/persistence/sync';
import { configureStorage, useFinanceStore } from '@/store';

const initialIndexedDB = Dexie.dependencies.indexedDB;

export async function resetPersistence(): Promise<void> {
  vi.restoreAllMocks();
  Dexie.dependencies.indexedDB = initialIndexedDB;
  configureStorage({ persist });
  if (!db.isOpen()) {
    await db.open();
  }
  await db.appState.clear();
  useFinanceStore.setState({ salary: null, budgets: [], toast: null });
}
