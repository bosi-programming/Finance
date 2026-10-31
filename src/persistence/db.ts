import Dexie, { type Table } from 'dexie';
import { type StoredRow } from '@/types/budget';

export const KEY = 'current';

export const db = new Dexie('finance-fe') as Dexie & {
  appState: Table<StoredRow, string>;
};

db.version(1).stores({ appState: '' });
