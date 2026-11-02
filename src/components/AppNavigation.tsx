import { useLocation, useNavigate } from '@tanstack/react-router';
import { Button, Navigation, NavItem } from 'bosi-design-system/react';
import { type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useImportFile } from '@/components/useImportFile';
import { downloadAppState } from '@/persistence/exportFile';
import { useFinanceStore } from '@/store';
import { SCHEMA_VERSION } from '@/types/budget';

const NAV_ITEMS = [
  { to: '/salary', label: 'nav.salary' },
  { to: '/budgets', label: 'nav.budgets' },
  { to: '/result', label: 'nav.result' },
] as const;

export function AppNavigation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const salary = useFinanceStore((state) => state.salary);
  const budgets = useFinanceStore((state) => state.budgets);
  const { inputProps, openFilePicker } = useImportFile(
    t('nav.importFileLabel'),
  );

  const goTo =
    (to: (typeof NAV_ITEMS)[number]['to']) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      void navigate({ to });
    };

  return (
    <Navigation
      leftItems={NAV_ITEMS.map(({ to, label }) => (
        <NavItem key={to} href={to} active={pathname === to} onClick={goTo(to)}>
          {t(label)}
        </NavItem>
      ))}
      rightItems={
        <>
          <Button color="primary" size="small" onClick={openFilePicker}>
            {t('nav.import')}
          </Button>
          <Button
            color="primary"
            size="small"
            disabled={salary === null}
            onClick={() => {
              if (salary !== null) {
                downloadAppState({ version: SCHEMA_VERSION, salary, budgets });
              }
            }}
          >
            {t('nav.export')}
          </Button>
          <input {...inputProps} />
        </>
      }
    />
  );
}
