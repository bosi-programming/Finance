import { persist } from '@/persistence/sync';
import { SCHEMA_VERSION, storedRowSchema } from '@/persistence/schema';
import { type AppState, type Budget } from '@/types/budget';
import { create } from 'zustand';

export const STORAGE_FAILED_MESSAGE =
  'Your data could not be saved in this browser.';
export const IMPORT_FAILED_MESSAGE =
  'Import failed. Your data was not changed.';

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
  toast: string | null;
  setSalary: (salary: number) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  clearToast: () => void;
  showToast: (message: string) => void;
  hydrate: (row: unknown) => void;
  replaceAll: (state: AppState) => Promise<boolean>;
  getNetSalary: () => number | null;
  getTotalFixed: () => number;
  getTotalPercentage: () => number;
}

export const useFinanceStore = create<State>()((set, get) => {
  const saveCurrent = () => {
    const { salary, budgets } = get();
    persist({ version: SCHEMA_VERSION, salary, budgets }).catch(() => {
      set({ toast: STORAGE_FAILED_MESSAGE });
    });
  };

  return {
    salary: null,
    budgets: [],
    toast: null,
    setSalary: (salary) => {
      set({ salary });
      saveCurrent();
    },
    addBudget: (budget) => {
      set((state) => ({
        budgets: [...state.budgets, budget],
      }));
      saveCurrent();
    },
    updateBudget: (budget) => {
      set((state) => ({
        budgets: state.budgets.map((current) =>
          current.id === budget.id ? budget : current,
        ),
      }));
      saveCurrent();
    },
    deleteBudget: (budgetId) => {
      set((state) => ({
        budgets: state.budgets.filter((budget) => budget.id !== budgetId),
      }));
      saveCurrent();
    },
    clearToast: () => {
      set({ toast: null });
    },
    showToast: (message) => {
      set({ toast: message });
    },
    hydrate: (row) => {
      const result = storedRowSchema.safeParse(row);
      if (result.success) {
        set({ salary: result.data.salary, budgets: result.data.budgets });
        return;
      }
      set({ salary: null, budgets: [] });
    },
    replaceAll: async ({ salary, budgets }) => {
      const before = get();
      try {
        await persist({ version: SCHEMA_VERSION, salary, budgets });
      } catch {
        set({ toast: IMPORT_FAILED_MESSAGE });
        return false;
      }
      const after = get();
      const changedDuringWrite =
        after.salary !== before.salary || after.budgets !== before.budgets;
      set({ salary, budgets });
      if (changedDuringWrite) {
        saveCurrent();
      }
      return true;
    },
    getNetSalary: () => getNetSalary(get().salary, get().budgets),
    getTotalFixed: () => getFixedBudgetsTotal(get().budgets),
    getTotalPercentage: () => getTotalPercentage(get().budgets),
  };
});
