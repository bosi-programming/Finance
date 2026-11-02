import { useEffect, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Banner, Button, Paper, Typography } from 'bosi-design-system/react';
import { useTranslation } from 'react-i18next';

import { ResultAmountSection } from '@/components/result/ResultAmountSection';
import { ResultBreakdown } from '@/components/result/ResultBreakdown';
import { allocateBudgets } from '@/domain/budgets/allocateBudgets';
import {
  fixedOverSalaryMessage,
  isPercentageOver,
  percentageOverMessage,
  percentageTotal,
} from '@/domain/budgets/planChecks';
import { useLocaleSettings } from '@/i18n/useLocaleSettings';
import { useFinanceStore } from '@/store';

function ResultPage({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <Paper className="border-0! p-0! shadow-none! flex w-full flex-col gap-8 md:max-w-[1008px] lg:mb-auto lg:mt-12">
      <Typography size="h1" color="primary">
        {t('result.title')}
      </Typography>
      {children}
    </Paper>
  );
}

function ResultCta({ label, to }: { label: string; to: '/budgets' }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2 md:flex-row md:justify-end">
      <Button
        color="primary"
        size="full-width"
        className="md:h-10.5! md:w-auto!"
        onClick={() => {
          void navigate({ to });
        }}
      >
        {label}
      </Button>
    </div>
  );
}

function ResultPlan({ salary }: { salary: number }) {
  const { t } = useTranslation();
  const settings = useLocaleSettings();
  const budgets = useFinanceStore((state) => state.budgets);
  const showToast = useFinanceStore((state) => state.showToast);
  const result = allocateBudgets(salary, budgets);

  useEffect(() => {
    if (!isPercentageOver(budgets)) {
      return;
    }
    const message = percentageOverMessage(
      percentageTotal(budgets),
      t,
      settings,
    );
    showToast(message);
    return () => {
      const { toast, clearToast } = useFinanceStore.getState();
      if (toast === message) {
        clearToast();
      }
    };
  }, [budgets, showToast, t, settings]);

  return (
    <ResultPage>
      <ResultAmountSection label={t('result.salary')} amount={salary} />
      {result.warning !== null && (
        <Banner type="warning">
          {fixedOverSalaryMessage(result.fixedTotal - salary, t, settings)}
        </Banner>
      )}
      {result.error === null && (
        <ResultBreakdown
          allocations={result.allocations}
          remaining={result.remaining}
        />
      )}
      <ResultCta label={t('result.editBudgets')} to="/budgets" />
    </ResultPage>
  );
}

export function Result() {
  const salary = useFinanceStore((state) => state.salary);

  if (salary === null) {
    return null;
  }

  return <ResultPlan salary={salary} />;
}
