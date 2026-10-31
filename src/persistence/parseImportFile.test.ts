import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseImportFile } from './parseImportFile';

function sample(name: string): string {
  return readFileSync(resolve(process.cwd(), 'samples', name), 'utf8');
}

const rent = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed',
  value: 2000,
  category: 'Housing',
};

const travel = {
  id: 'travel-1',
  name: 'Travel',
  type: 'percentage',
  value: 60,
  category: 'Hobbies',
};

function appState(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    version: 'v0',
    salary: 5000,
    budgets: [rent, travel],
    ...overrides,
  });
}

describe('parseImportFile app state', () => {
  it('returns the state with budget order kept', () => {
    expect(parseImportFile(appState())).toEqual({
      version: 'v0',
      salary: 5000,
      budgets: [rent, travel],
    });
  });

  it('accepts an empty budget list', () => {
    expect(parseImportFile(appState({ budgets: [] }))).toEqual({
      version: 'v0',
      salary: 5000,
      budgets: [],
    });
  });

  it('accepts a salary of 0', () => {
    expect(parseImportFile(appState({ salary: 0 }))?.salary).toBe(0);
  });
});

describe('parseImportFile CLI export', () => {
  it('maps every group', () => {
    expect(parseImportFile(sample('legacy-cli-export.json'))).toEqual({
      version: 'v0',
      salary: 5000,
      budgets: [
        {
          id: 'legacy-personal',
          name: 'personal',
          type: 'fixed',
          value: 800,
          category: 'personal',
        },
        {
          id: 'legacy-business',
          name: 'business',
          type: 'fixed',
          value: 400,
          category: 'business',
        },
        {
          id: 'legacy-subscriptions',
          name: 'subscriptions',
          type: 'fixed',
          value: 100,
          category: 'subscriptions',
        },
        {
          id: 'legacy-fixedInvestments',
          name: 'fixed investments',
          type: 'fixed',
          value: 300,
          category: 'fixed investments',
        },
        {
          id: 'legacy-investments',
          name: 'investments',
          type: 'percentage',
          value: 20,
          category: 'investments',
        },
        {
          id: 'legacy-leisure',
          name: 'leisure',
          type: 'percentage',
          value: 10,
          category: 'leisure',
        },
      ],
    });
  });

  it('keeps a present zero', () => {
    const result = parseImportFile(
      JSON.stringify({ salary: 5000, fixed: { personal: 0 } }),
    );

    expect(result?.budgets).toEqual([
      {
        id: 'legacy-personal',
        name: 'personal',
        type: 'fixed',
        value: 0,
        category: 'personal',
      },
    ]);
  });

  it('skips an absent group', () => {
    const result = parseImportFile(
      JSON.stringify({ salary: 5000, percentage: { leisure: 15 } }),
    );

    expect(result?.budgets).toEqual([
      {
        id: 'legacy-leisure',
        name: 'leisure',
        type: 'percentage',
        value: 15,
        category: 'leisure',
      },
    ]);
  });

  it('returns no budgets for a salary-only file', () => {
    expect(parseImportFile(JSON.stringify({ salary: 5000 }))).toEqual({
      version: 'v0',
      salary: 5000,
      budgets: [],
    });
  });

  it('rejects an empty object', () => {
    expect(parseImportFile('{}')).toBeNull();
  });

  it('rejects a file with groups and no salary', () => {
    expect(
      parseImportFile(JSON.stringify({ fixed: { personal: 800 } })),
    ).toBeNull();
  });

  it('rejects an unknown key in a CLI file', () => {
    expect(
      parseImportFile(JSON.stringify({ salary: 5000, extra: 1 })),
    ).toBeNull();
  });

  it('rejects a negative CLI group', () => {
    expect(
      parseImportFile(
        JSON.stringify({ salary: 5000, fixed: { personal: -1 } }),
      ),
    ).toBeNull();
  });
});

describe('parseImportFile validation', () => {
  it('rejects invalid JSON', () => {
    expect(parseImportFile('{ not json')).toBeNull();
  });

  it('rejects text that is not an object', () => {
    expect(parseImportFile('42')).toBeNull();
    expect(parseImportFile('null')).toBeNull();
    expect(parseImportFile('[]')).toBeNull();
  });

  it('rejects a wrong type', () => {
    expect(parseImportFile(appState({ salary: '5000' }))).toBeNull();
  });

  it('rejects a missing field', () => {
    expect(
      parseImportFile(JSON.stringify({ version: 'v0', salary: 5000 })),
    ).toBeNull();
  });

  it('rejects an extra key', () => {
    expect(parseImportFile(appState({ extra: true }))).toBeNull();
  });

  it('rejects an extra key in a budget', () => {
    expect(
      parseImportFile(appState({ budgets: [{ ...rent, extra: true }] })),
    ).toBeNull();
  });

  it('rejects an unknown budget type', () => {
    expect(
      parseImportFile(appState({ budgets: [{ ...rent, type: 'other' }] })),
    ).toBeNull();
  });

  it('rejects another version', () => {
    expect(parseImportFile(appState({ version: 'v1' }))).toBeNull();
  });

  it('does not read a v1 file as a CLI export', () => {
    expect(
      parseImportFile(JSON.stringify({ version: 'v1', salary: 5000 })),
    ).toBeNull();
  });

  it('rejects a negative salary', () => {
    expect(parseImportFile(appState({ salary: -1 }))).toBeNull();
  });

  it('rejects a negative budget value', () => {
    expect(
      parseImportFile(appState({ budgets: [{ ...rent, value: -1 }] })),
    ).toBeNull();
  });

  it('rejects a non-finite salary', () => {
    expect(
      parseImportFile('{"version":"v0","salary":1e999,"budgets":[]}'),
    ).toBeNull();
  });

  it('rejects a non-finite budget value', () => {
    const text = `{"version":"v0","salary":5000,"budgets":[{"id":"a","name":"A","type":"fixed","value":1e999,"category":"C"}]}`;

    expect(parseImportFile(text)).toBeNull();
  });

  it.each(['id', 'name', 'category'])('rejects an empty %s', (field) => {
    expect(
      parseImportFile(appState({ budgets: [{ ...rent, [field]: '' }] })),
    ).toBeNull();
  });

  it('rejects duplicate ids', () => {
    expect(
      parseImportFile(
        appState({ budgets: [rent, { ...travel, id: rent.id }] }),
      ),
    ).toBeNull();
  });
});

describe('parseImportFile invalid plans', () => {
  it('accepts percentages above 100', () => {
    const result = parseImportFile(sample('app-state-error.json'));

    expect(result?.budgets).toHaveLength(3);
  });

  it('accepts fixed above salary', () => {
    const result = parseImportFile(sample('app-state-warning.json'));

    expect(result?.budgets).toHaveLength(2);
  });

  it('accepts the valid sample', () => {
    expect(parseImportFile(sample('app-state-valid.json'))).not.toBeNull();
  });
});
