import type { Budget, BudgetType } from '@/types/budget';
import { create } from 'zustand';

const sumBudgetsByType = (budgets: Budget[], type: BudgetType) =>
  budgets.reduce(
    (total, budget) => (budget.type === type ? total + budget.value : total),
    0,
  );

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
  getTotalFixed: () => sumBudgetsByType(get().budgets, 'fixed'),
  getTotalPercentage: () => sumBudgetsByType(get().budgets, 'percentage'),
  getNetSalary: () => {
    const { salary, budgets } = get();
    return salary === null ? null : salary - sumBudgetsByType(budgets, 'fixed');
  },
}));
