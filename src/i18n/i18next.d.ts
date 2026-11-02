import 'i18next';

import { type en } from '@/i18n/locales/en';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
  }
}
