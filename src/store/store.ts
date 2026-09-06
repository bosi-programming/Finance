import type { Budget } from '@/types/budget';
import { create } from 'zustand';

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

interface State {
  salary: number | null;
  budgets: Budget[];
  setSalary: (salary: number) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  getNetSalary: () => number | null;
  getTotalFixed: () => number;
  getTotalPercentage: () => number;
}

export const useFinanceStore = create<State>()((set, get) => ({
  salary: null,
  budgets: [],
  setSalary: (salary) => {
    set({ salary });
  },
  addBudget: (budget) => {
    set((state) => ({
      budgets: [...state.budgets, budget],
    }));
  },
  updateBudget: (budget) => {
    set((state) => ({
      budgets: state.budgets.map((current) =>
        current.id === budget.id ? budget : current,
      ),
    }));
  },
  deleteBudget: (budgetId) => {
    set((state) => ({
      budgets: state.budgets.filter((budget) => budget.id !== budgetId),
    }));
  },
  getNetSalary: () => getNetSalary(get().salary, get().budgets),
  getTotalFixed: () => getFixedBudgetsTotal(get().budgets),
  getTotalPercentage: () => getTotalPercentage(get().budgets),
}));
