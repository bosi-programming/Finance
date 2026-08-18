export type BudgetType = 'fixed' | 'percentage';

export interface Budget {
  name: string;
  type: BudgetType;
  value: number;
  category: string;
}

export interface BudgetAllocationItem extends Budget {
  amount: number;
}

export type CategoryTotals = Record<string, number>;

export interface AllocationResult {
  salary: number;
  fixedTotal: number;
  percentageTotal: number;
  remainder: number;
  remaining: number;
  allocations: BudgetAllocationItem[];
  categoryTotals: CategoryTotals;
  error: string | null;
  warning: string | null;
}

export interface AppState {
  version: 'v0';
  salary: number;
  budgets: Budget[];
}

export interface LegacyCliExport {
  salary?: number;
  fixed?: {
    personal?: number;
    business?: number;
    subscriptions?: number;
    fixedInvestments?: number;
  };
  percentage?: {
    investments?: number;
    leisure?: number;
  };
}
