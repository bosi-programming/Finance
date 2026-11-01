const AMOUNT_PATTERN = /^\$?(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?$/;

export type MoneyParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'empty' | 'invalid' };

export function parseMoney(text: string): MoneyParseResult {
  const compact = text.replace(/\s/g, '');
  if (compact === '') {
    return { ok: false, reason: 'empty' };
  }
  if (!AMOUNT_PATTERN.test(compact)) {
    return { ok: false, reason: 'invalid' };
  }
  const value = Number(compact.replace(/[$,]/g, ''));
  if (value > Number.MAX_SAFE_INTEGER) {
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, value };
}

const CENTS_PER_UNIT = 100;

export function formatMoney(value: number): string {
  const isWhole = Number.isInteger(
    Math.round(value * CENTS_PER_UNIT) / CENTS_PER_UNIT,
  );
  const digits = isWhole ? 0 : 2;
  const amount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
  return `$${amount}`;
}

const fixedFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoneyFixed(value: number): string {
  return `$ ${fixedFormatter.format(value)}`;
}
