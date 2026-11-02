import { describe, expect, it } from 'vitest';

import { en } from './en';
import { es } from './es';
import { ptBR } from './pt-BR';

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>(
    (entries, [key, value]) => {
      const path = prefix === '' ? key : `${prefix}.${key}`;
      return typeof value === 'string'
        ? { ...entries, [path]: value }
        : { ...entries, ...flatten(value, path) };
    },
    {},
  );
}

const placeholders = (text: string) =>
  [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();

const english = flatten(en);

describe.each([
  ['pt-BR', ptBR],
  ['es', es],
])('%s translation', (_, translation) => {
  const translated = flatten(translation);

  it('has the same keys as en', () => {
    expect(Object.keys(translated).sort()).toEqual(Object.keys(english).sort());
  });

  it('keeps every placeholder of en', () => {
    for (const [key, text] of Object.entries(english)) {
      expect(placeholders(translated[key]), key).toEqual(placeholders(text));
    }
  });

  it('has no empty text', () => {
    for (const [key, text] of Object.entries(translated)) {
      expect(text.trim(), key).not.toBe('');
    }
  });
});
