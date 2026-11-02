import { useTranslation } from 'react-i18next';

import {
  DEFAULT_LANGUAGE,
  isAppLanguage,
  LOCALE_SETTINGS,
  type LocaleSettings,
} from '@/i18n/languages';

export function useLocaleSettings(): LocaleSettings {
  const { i18n } = useTranslation();
  return LOCALE_SETTINGS[
    isAppLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE
  ];
}
