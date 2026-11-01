import { type BudgetAllocationItem } from '@/types/budget';

export interface AllocationGroup {
  category: string;
  allocations: BudgetAllocationItem[];
  total: number;
}

export function groupAllocations(
  allocations: BudgetAllocationItem[],
): AllocationGroup[] {
  const groups = new Map<string, AllocationGroup>();
  for (const allocation of allocations) {
    const group = groups.get(allocation.category) ?? {
      category: allocation.category,
      allocations: [],
      total: 0,
    };
    group.allocations.push(allocation);
    group.total += allocation.amount;
    groups.set(allocation.category, group);
  }
  return [...groups.values()];
}
