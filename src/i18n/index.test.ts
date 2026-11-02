import { afterEach, describe, expect, it } from 'vitest';

import { currentLanguage, currentLocaleSettings, i18n } from '@/i18n';

describe('i18n', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('translates in en by default in tests', () => {
    expect(i18n.t('nav.salary')).toBe('Salary');
  });

  it.each([
    ['pt-BR', 'Salário', 'BRL'],
    ['es', 'Salario', 'EUR'],
  ])('switches to %s', async (language, salary, currency) => {
    await i18n.changeLanguage(language);

    expect(i18n.t('nav.salary')).toBe(salary);
    expect(currentLanguage()).toBe(language);
    expect(currentLocaleSettings().currency).toBe(currency);
  });

  it('sets the document lang and title', async () => {
    await i18n.changeLanguage('pt-BR');

    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.title).toBe('App de Finanças do Bosi');
  });

  it('interpolates without escaping', () => {
    expect(i18n.t('budgets.deleteNamed', { name: 'Rent & Co' })).toBe(
      'Delete Rent & Co',
    );
  });
});
