import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AppState } from '@/types/budget';
import {
  downloadAppState,
  EXPORT_FILE_NAME,
  serializeAppState,
} from './exportFile';

const state: AppState = {
  version: 'v0',
  salary: 5000,
  budgets: [
    {
      id: 'rent-1',
      name: 'Rent',
      type: 'fixed',
      value: 2000,
      category: 'Housing',
    },
  ],
};

describe('serializeAppState', () => {
  it('drops actions and extra store fields', () => {
    const storeLike = {
      ...state,
      toast: 'hello',
      setSalary: () => undefined,
    };

    expect(JSON.parse(serializeAppState(storeLike)) as unknown).toEqual(state);
  });

  it('uses two-space JSON', () => {
    expect(serializeAppState(state)).toBe(JSON.stringify(state, null, 2));
  });

  it('keeps the key order version, salary, budgets', () => {
    expect(Object.keys(JSON.parse(serializeAppState(state)) as object)).toEqual(
      ['version', 'salary', 'budgets'],
    );
  });

  it('adds no trailing newline', () => {
    expect(serializeAppState(state).endsWith('}')).toBe(true);
  });
});

describe('downloadAppState', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('names the file', () => {
    const names: string[] = [];
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function click(this: HTMLAnchorElement) {
        names.push(this.download);
      },
    );

    downloadAppState(state);

    expect(EXPORT_FILE_NAME).toBe('finance-fe-v0.json');
    expect(names).toEqual(['finance-fe-v0.json']);
  });

  it('downloads a JSON blob and then revokes its URL', () => {
    const calls: string[] = [];
    const blobs: Blob[] = [];
    URL.createObjectURL = vi.fn((blob: Blob | MediaSource) => {
      blobs.push(blob as Blob);
      calls.push('create');
      return 'blob:test';
    });
    const revoked: string[] = [];
    URL.revokeObjectURL = vi.fn((url: string) => {
      calls.push('revoke');
      revoked.push(url);
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      calls.push('click');
    });

    downloadAppState(state);

    expect(calls).toEqual(['create', 'click', 'revoke']);
    expect(blobs[0].type).toBe('application/json');
    expect(revoked).toEqual(['blob:test']);
  });
});
