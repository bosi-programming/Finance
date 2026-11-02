import { describe, expect, it } from 'vitest';

import { LOCALE_SETTINGS } from '@/i18n/languages';

import {
  formatMoney,
  formatMoneyFixed,
  formatNumber,
  parseMoney,
  parseNumber,
} from './money';

const en = LOCALE_SETTINGS.en;
const ptBR = LOCALE_SETTINGS['pt-BR'];
const es = LOCALE_SETTINGS.es;

describe('formatMoney', () => {
  it.each([
    [en, 5000, '$5,000'],
    [en, 1234.5, '$1,234.50'],
    [ptBR, 5000, 'R$ 5.000'],
    [ptBR, 1234.5, 'R$ 1.234,50'],
    [ptBR, -1.115, '-R$ 1,12'],
    [es, 5000, '5000 €'],
    [es, 12345678.9, '12.345.678,90 €'],
    [es, -0.005, '-0,01 €'],
  ])('formats in the locale currency: %j %s', (settings, value, text) => {
    expect(formatMoney(value, settings)).toBe(text);
  });

  it('defaults to en', () => {
    expect(formatMoney(2000)).toBe('$2,000');
  });
});

describe('formatMoneyFixed', () => {
  it.each([
    [en, 0, '$ 0.00'],
    [en, 5000, '$ 5,000.00'],
    [ptBR, 0, 'R$ 0,00'],
    [ptBR, 1234567.89, 'R$ 1.234.567,89'],
    [es, 0, '0,00 €'],
    [es, 5000.5, '5000,50 €'],
  ])('keeps two decimals: %j %s', (settings, value, text) => {
    expect(formatMoneyFixed(value, settings)).toBe(text);
  });
});

describe('parseMoney', () => {
  it.each([
    [ptBR, 'R$ 1.234,56', 1234.56],
    [ptBR, '1234,5', 1234.5],
    [ptBR, '1.234', 1234],
    [ptBR, 'R$0', 0],
    [es, '1234,56 €', 1234.56],
    [es, '12.345.678,90€', 12345678.9],
    [es, '5000', 5000],
    [en, '$ 5,000.00', 5000],
  ])('parses locale amounts: %j %s', (settings, text, value) => {
    expect(parseMoney(text, settings)).toEqual({ ok: true, value });
  });

  it.each([
    [ptBR, '1,234.56'],
    [ptBR, '$ 5'],
    [ptBR, '5 R$'],
    [ptBR, '1.23,45'],
    [es, '€ 5'],
    [es, '1,234.56'],
    [en, '5000 $'],
    [en, '1.234,56'],
  ])('rejects amounts from another locale: %j %s', (settings, text) => {
    expect(parseMoney(text, settings)).toEqual({
      ok: false,
      reason: 'invalid',
    });
  });

  it('reports empty text', () => {
    expect(parseMoney('  ', ptBR)).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('formatNumber', () => {
  it.each([
    [en, 12.5, '12.5'],
    [ptBR, 12.5, '12,5'],
    [es, 33.33, '33,33'],
    [es, 100, '100'],
  ])('uses the locale decimal: %j %s', (settings, value, text) => {
    expect(formatNumber(value, 2, settings)).toBe(text);
  });
});

describe('parseNumber', () => {
  it.each([
    [en, '12.5', 12.5],
    [ptBR, '12,5', 12.5],
    [es, '60', 60],
  ])('parses with the locale decimal: %j %s', (settings, text, value) => {
    expect(parseNumber(text, settings)).toBe(value);
  });

  it.each([
    [en, '12,5'],
    [ptBR, '12.5'],
    [es, '1e5'],
  ])('rejects the other decimal: %j %s', (settings, text) => {
    expect(parseNumber(text, settings)).toBeNull();
  });
});
