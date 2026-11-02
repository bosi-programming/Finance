import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  DEFAULT_LANGUAGE,
  isAppLanguage,
  LOCALE_SETTINGS,
  resolveLanguage,
  type AppLanguage,
  type LocaleSettings,
} from '@/i18n/languages';
import { en } from '@/i18n/locales/en';
import { es } from '@/i18n/locales/es';
import { ptBR } from '@/i18n/locales/pt-BR';

export const resources = {
  en: { translation: en },
  'pt-BR': { translation: ptBR },
  es: { translation: es },
} as const;

const syncDocument = (language: string) => {
  document.documentElement.lang = language;
  document.title = i18n.t('app.title');
};

i18n.on('languageChanged', syncDocument);

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(navigator.languages),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: Object.keys(resources),
  interpolation: { escapeValue: false },
  initAsync: false,
  returnNull: false,
});

export function currentLanguage(): AppLanguage {
  return isAppLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;
}

export function currentLocaleSettings(): LocaleSettings {
  return LOCALE_SETTINGS[currentLanguage()];
}

export { i18n };
