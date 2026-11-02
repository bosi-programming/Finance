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
import { i18n } from '@/i18n';
import { type StoragePort } from '@/types/storage';
import { create } from 'zustand';

export const storageFailedMessage = () => i18n.t('toast.storageFailed');
export const importFailedMessage = () => i18n.t('toast.importFailed');

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
      set({ toast: storageFailedMessage() });
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
        set({ toast: importFailedMessage() });
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
