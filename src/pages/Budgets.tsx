import { Paper, Typography } from 'bosi-design-system/react';

import { BudgetList } from '@/components/budgets/BudgetList';
import { useFinanceStore } from '@/store';

const EMPTY_HINT = 'No budgets yet. Add your first one to split your salary.';
const LIST_HINT = 'Add, edit, and delete fixed and percentage budgets.';

export function Budgets() {
  const budgets = useFinanceStore((state) => state.budgets);
  const hasBudgets = budgets.length > 0;

  return (
    <Paper className="flex w-full flex-col gap-8 md:w-[400px]">
      <Typography size="h1">Your budgets</Typography>
      <Typography size="body">{hasBudgets ? LIST_HINT : EMPTY_HINT}</Typography>
      {hasBudgets && <BudgetList budgets={budgets} />}
    </Paper>
  );
}
