import { type Budget } from '@/types/budget';

export const getFixedBudgetsTotal = (budgets: Budget[]) => {
  const fixedBudgets = budgets.filter((el) => el.type === 'fixed');
  return fixedBudgets.reduce((acc, el) => acc + el.value, 0);
};

export const getNetSalary = (salary: number | null, budgets: Budget[]) => {
  if (salary === null) {
    return null;
  }
  return salary - getFixedBudgetsTotal(budgets);
};

export const getTotalPercentage = (budgets: Budget[]) => {
  const percentageBudgets = budgets.filter((el) => el.type === 'percentage');
  return percentageBudgets.reduce((acc, el) => acc + el.value, 0);
};
