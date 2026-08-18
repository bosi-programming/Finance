import type { Budget } from '@/types/budget';
import { create } from 'zustand';

interface State {
  salary: number | null;
  budgets: Budget[];
  setSalary: (salary: number) => void;
  addBudget: (newBudget: Budget) => void;
  updateBudget: (updatedBudget: Budget) => void;
  deleteBudget: (budgetToDelete: Budget) => void;
}

export const filterBudgetByName = (budgets: Budget[], budgetToRemove: Budget) =>
  budgets.filter((el) => el.name !== budgetToRemove.name);

export const getFixedBudgetsTotal = (budgets: Budget[]) => {
  const fixedBudgets = budgets.filter((el) => el.type === 'fixed');
  return fixedBudgets.reduce((acc, el) => acc + el.value, 0);
};

export const getNetSalary = (salary: number, budgets: Budget[]) => {
  const totalFixed = getFixedBudgetsTotal(budgets);
  return salary - totalFixed;
};

export const getTotalPercentage = (budgets: Budget[]) => {
  const percentageBudgets = budgets.filter((el) => el.type === 'percentage');
  return percentageBudgets.reduce((acc, el) => acc + el.value, 0);
};

export const getPercentageBudgetValues = (
  salary: number,
  budgets: Budget[],
) => {
  const netSalary = getNetSalary(salary, budgets);
  const percentageBudgets = budgets.filter((el) => el.type === 'percentage');
  return percentageBudgets.map((el) => ({
    ...el,
    value: Math.round(el.value * netSalary * 100) / 100,
  }));
};

export const useFinanceStore = create<State>()((set) => ({
  salary: null,
  budgets: [],
  setSalary: (salary: number) => {
    set((state: State) => ({ ...state, salary }));
  },
  addBudget: (newBudget: Budget) => {
    set((state: State) => ({
      ...state,
      budgets: [...state.budgets, newBudget],
    }));
  },
  updateBudget: (updatedBudget: Budget) => {
    set((state: State) => {
      const filteredBudgets = filterBudgetByName(state.budgets, updatedBudget);
      return {
        ...state,
        budgets: [...filteredBudgets, updatedBudget],
      };
    });
  },
  deleteBudget: (budgetToDelete: Budget) => {
    set((state: State) => {
      const filteredBudgets = filterBudgetByName(state.budgets, budgetToDelete);
      return {
        ...state,
        budgets: filteredBudgets,
      };
    });
  },
  getTotalFixed: () => {
    const state = useFinanceStore.getState();
    return getFixedBudgetsTotal(state.budgets);
  },
  getNetSalary: () => {
    const state = useFinanceStore.getState();
    if (!state.salary) return 0;
    return getNetSalary(state.salary, state.budgets);
  },
  getTotalPercentage: () => {
    const state = useFinanceStore.getState();
    getTotalPercentage(state.budgets);
  },
  getPercentageBudgetValues: () => {
    const state = useFinanceStore.getState();
    if (!state.salary) return 0;
    return getPercentageBudgetValues(state.salary, state.budgets);
  },
}));
