export type AppLanguage = 'en' | 'pt-BR' | 'es';

export interface LocaleSettings {
  numberLocale: string;
  currency: 'USD' | 'BRL' | 'EUR';
}

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export const LOCALE_SETTINGS: Record<AppLanguage, LocaleSettings> = {
  en: { numberLocale: 'en-US', currency: 'USD' },
  'pt-BR': { numberLocale: 'pt-BR', currency: 'BRL' },
  es: { numberLocale: 'es-ES', currency: 'EUR' },
};

const PREFIXES: [string, AppLanguage][] = [
  ['pt', 'pt-BR'],
  ['es', 'es'],
  ['en', 'en'],
];

const matchLanguage = (tag: string): AppLanguage | undefined => {
  const base = tag.toLowerCase().split('-')[0];
  return PREFIXES.find(([prefix]) => prefix === base)?.[1];
};

export function resolveLanguage(
  navigatorLanguages: readonly string[],
): AppLanguage {
  for (const tag of navigatorLanguages) {
    const language = matchLanguage(tag);
    if (language !== undefined) {
      return language;
    }
  }
  return DEFAULT_LANGUAGE;
}

export function isAppLanguage(value: string): value is AppLanguage {
  return value in LOCALE_SETTINGS;
}
