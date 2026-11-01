import {
  getFixedBudgetsTotal,
  getNetSalary,
  getTotalPercentage,
} from '@/domain/budgets/totals';
import {
  SCHEMA_VERSION,
  type AppState,
  type Budget,
  type StoredRow,
} from '@/types/budget';
import { type StoragePort } from '@/types/storage';
import { create } from 'zustand';

export const STORAGE_FAILED_MESSAGE =
  'Your data could not be saved in this browser.';
export const IMPORT_FAILED_MESSAGE =
  'Import failed. Your data was not changed.';

const noopStorage: StoragePort = {
  persist: async () => {},
};

let storage: StoragePort = noopStorage;

export const configureStorage = (port: StoragePort) => {
  storage = port;
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
  hydrate: (row: StoredRow | null) => void;
  replaceAll: (state: AppState) => Promise<boolean>;
  getNetSalary: () => number | null;
  getTotalFixed: () => number;
  getTotalPercentage: () => number;
}

export const useFinanceStore = create<State>()((set, get) => {
  const saveCurrent = () => {
    const { salary, budgets } = get();
    storage.persist({ version: SCHEMA_VERSION, salary, budgets }).catch(() => {
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
      if (row === null) {
        set({ salary: null, budgets: [] });
        return;
      }
      set({ salary: row.salary, budgets: row.budgets });
    },
    replaceAll: async ({ salary, budgets }) => {
      const before = get();
      try {
        await storage.persist({ version: SCHEMA_VERSION, salary, budgets });
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
