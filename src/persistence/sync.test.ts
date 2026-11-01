import { beforeEach, describe, expect, it } from 'vitest';

import { resetPersistence } from '@/test/resetPersistence';
import { db } from '@/persistence/db';
import { type StoredRow } from '@/types/budget';
import { isFresh, persist, readCurrent } from './sync';

const row: StoredRow = { version: 'v0', salary: 100, budgets: [] };

async function okRead() {
  const read = await readCurrent();
  if (read.status !== 'ok') {
    throw new Error('expected an ok read');
  }
  return read;
}

describe('isFresh', () => {
  beforeEach(resetPersistence);

  it('accepts a clean read', async () => {
    const read = await okRead();

    expect(isFresh(read)).toBe(true);
  });

  it('rejects a read started before a write', async () => {
    const read = await okRead();

    await persist(row);

    expect(isFresh(read)).toBe(false);
  });

  it('rejects a read after that write settled', async () => {
    const write = persist(row);
    const read = await okRead();
    await write;

    expect(isFresh(read)).toBe(false);
  });

  it('rejects a read started during a write', async () => {
    const write = persist(row);
    const read = await okRead();

    expect(read.clean).toBe(false);
    expect(isFresh(read)).toBe(false);
    await write;
  });
});

describe('readCurrent', () => {
  beforeEach(resetPersistence);

  it('reads the stored row', async () => {
    await db.appState.put(row, 'current');

    const read = await okRead();

    expect(read.row).toEqual(row);
  });

  it('reads undefined when there is no row', async () => {
    const read = await okRead();

    expect(read.row).toBeUndefined();
  });

  it('returns failed when the database is closed', async () => {
    db.close();

    expect(await readCurrent()).toEqual({ status: 'failed' });
  });
});

describe('persist', () => {
  beforeEach(resetPersistence);

  it('writes the row under the current key', async () => {
    await persist(row);

    expect(await db.appState.get('current')).toEqual(row);
  });
});
