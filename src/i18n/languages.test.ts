import { describe, expect, it } from 'vitest';

import { LOCALE_SETTINGS, resolveLanguage } from './languages';

describe('resolveLanguage', () => {
  it.each([
    [['pt-BR'], 'pt-BR'],
    [['pt'], 'pt-BR'],
    [['pt-PT'], 'pt-BR'],
    [['es'], 'es'],
    [['es-MX'], 'es'],
    [['en-US'], 'en'],
    [['en'], 'en'],
    [['fr-FR'], 'en'],
    [[], 'en'],
    [['fr-FR', 'es-ES', 'pt-BR'], 'es'],
    [['PT-br'], 'pt-BR'],
  ])('maps %j to %s', (languages, expected) => {
    expect(resolveLanguage(languages)).toBe(expected);
  });
});

describe('LOCALE_SETTINGS', () => {
  it('uses USD for en', () => {
    expect(LOCALE_SETTINGS.en).toEqual({
      numberLocale: 'en-US',
      currency: 'USD',
    });
  });

  it('uses BRL for pt-BR', () => {
    expect(LOCALE_SETTINGS['pt-BR']).toEqual({
      numberLocale: 'pt-BR',
      currency: 'BRL',
    });
  });

  it('uses EUR for es', () => {
    expect(LOCALE_SETTINGS.es).toEqual({
      numberLocale: 'es-ES',
      currency: 'EUR',
    });
  });
});
