import { LOCALE_SETTINGS, type LocaleSettings } from '@/i18n/languages';

export type MoneyParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'empty' | 'invalid' };

const DEFAULT_SETTINGS = LOCALE_SETTINGS.en;
const SAMPLE_NUMBER = 12345678.9;
const CENTS_PER_UNIT = 100;
const MONEY_FRACTION_DIGITS = 2;

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeSpaces = (text: string) => text.replace(/[\u00a0\u202f]/g, ' ');

interface NumberSymbols {
  group: string;
  decimal: string;
  currency: string;
  currencyFirst: boolean;
}

const symbolsCache = new Map<string, NumberSymbols>();

function numberSymbols({
  numberLocale,
  currency,
}: LocaleSettings): NumberSymbols {
  const cacheKey = `${numberLocale}|${currency}`;
  const cached = symbolsCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const parts = new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency,
  }).formatToParts(SAMPLE_NUMBER);
  const find = (type: Intl.NumberFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  const symbols = {
    group: normalizeSpaces(find('group')),
    decimal: find('decimal'),
    currency: find('currency'),
    currencyFirst:
      parts.findIndex((part) => part.type === 'currency') <
      parts.findIndex((part) => part.type === 'integer'),
  };
  symbolsCache.set(cacheKey, symbols);
  return symbols;
}

function amountPattern({ group, decimal }: NumberSymbols): RegExp {
  const g = escapeRegExp(group);
  const d = escapeRegExp(decimal);
  return new RegExp(`^(\\d{1,3}(${g}\\d{3})+|\\d+)(${d}\\d{1,2})?$`);
}

function stripCurrency(compact: string, symbols: NumberSymbols): string {
  const { currency, currencyFirst } = symbols;
  if (currencyFirst && compact.startsWith(currency)) {
    return compact.slice(currency.length);
  }
  if (!currencyFirst && compact.endsWith(currency)) {
    return compact.slice(0, -currency.length);
  }
  return compact;
}

function toNumber(text: string, symbols: NumberSymbols): number {
  return Number(
    text.split(symbols.group).join('').replace(symbols.decimal, '.'),
  );
}

export function parseMoney(
  text: string,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): MoneyParseResult {
  const compact = text.replace(/\s/g, '');
  if (compact === '') {
    return { ok: false, reason: 'empty' };
  }
  const symbols = numberSymbols(settings);
  const amount = stripCurrency(compact, symbols);
  if (!amountPattern(symbols).test(amount)) {
    return { ok: false, reason: 'invalid' };
  }
  const value = toNumber(amount, symbols);
  if (value > Number.MAX_SAFE_INTEGER) {
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, value };
}

export function roundToCents(value: number): number {
  const rounded = Math.round(Math.abs(value) * CENTS_PER_UNIT) / CENTS_PER_UNIT;
  return value < 0 && rounded > 0 ? -rounded : rounded;
}

function currencyFormat(
  { numberLocale, currency }: LocaleSettings,
  digits: number,
): Intl.NumberFormat {
  return new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatMoney(
  value: number,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  const rounded = roundToCents(value);
  const digits = Number.isInteger(rounded) ? 0 : MONEY_FRACTION_DIGITS;
  return normalizeSpaces(currencyFormat(settings, digits).format(rounded));
}

export function formatMoneyFixed(
  value: number,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  const text = normalizeSpaces(
    currencyFormat(settings, MONEY_FRACTION_DIGITS).format(value),
  );
  const { currency, currencyFirst } = numberSymbols(settings);
  if (currencyFirst && !text.startsWith(`${currency} `)) {
    return text.replace(currency, `${currency} `);
  }
  return text;
}

export function formatNumber(
  value: number,
  maximumFractionDigits: number,
  { numberLocale }: LocaleSettings = DEFAULT_SETTINGS,
): string {
  return new Intl.NumberFormat(numberLocale, { maximumFractionDigits }).format(
    value,
  );
}

export function parseNumber(
  text: string,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): number | null {
  const { decimal } = numberSymbols(settings);
  const pattern = new RegExp(`^\\d+(${escapeRegExp(decimal)}\\d{1,2})?$`);
  return pattern.test(text) ? Number(text.replace(decimal, '.')) : null;
}
