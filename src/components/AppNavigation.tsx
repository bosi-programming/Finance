import { useLocation, useNavigate } from '@tanstack/react-router';
import { Button, Navigation, NavItem } from 'bosi-design-system/react';
import { type MouseEvent } from 'react';
import { useImportFile } from '@/components/useImportFile';
import { downloadAppState } from '@/persistence/exportFile';
import { SCHEMA_VERSION } from '@/persistence/schema';
import { useFinanceStore } from '@/store';

const NAV_ITEMS = [
  { to: '/salary', label: 'Salary' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/result', label: 'Result' },
] as const;

export function AppNavigation() {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const salary = useFinanceStore((state) => state.salary);
  const budgets = useFinanceStore((state) => state.budgets);
  const { inputProps, openFilePicker } = useImportFile('Import file');

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
          {label}
        </NavItem>
      ))}
      rightItems={
        <>
          <Button color="primary" size="small" onClick={openFilePicker}>
            Import
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
            Export
          </Button>
          <input {...inputProps} />
        </>
      }
    />
  );
}
