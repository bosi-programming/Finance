import { db, KEY } from '@/persistence/db';
import { type StoredRow } from '@/types/budget';

export type OkRead = {
  status: 'ok';
  row: unknown;
  stamp: number;
  clean: boolean;
};
export type LiveRead = OkRead | { status: 'failed' };

let writesIssued = 0;
let writesSettled = 0;

export function persist(row: StoredRow): Promise<string> {
  writesIssued += 1;
  return db.appState.put(row, KEY).finally(() => {
    writesSettled += 1;
  });
}

export function readCurrent(): Promise<LiveRead> {
  const stamp = writesIssued;
  const clean = writesIssued === writesSettled;
  return db.appState.get(KEY).then(
    (row): LiveRead => ({ status: 'ok', row, stamp, clean }),
    (): LiveRead => ({ status: 'failed' }),
  );
}

export function isFresh(read: OkRead): boolean {
  return read.clean && read.stamp === writesIssued;
}
