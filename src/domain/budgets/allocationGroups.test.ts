import { describe, expect, it } from 'vitest';

import type { BudgetAllocationItem } from '@/types/budget';

import { groupAllocations } from './allocationGroups';

const rent: BudgetAllocationItem = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed',
  value: 2000,
  category: 'Housing',
  amount: 2000,
};
const travel: BudgetAllocationItem = {
  id: 'travel-1',
  name: 'Travel',
  type: 'percentage',
  value: 60,
  category: 'Hobbies',
  amount: 1800,
};
const repairs: BudgetAllocationItem = {
  id: 'repairs-1',
  name: 'Repairs',
  type: 'percentage',
  value: 10,
  category: 'Housing',
  amount: 300,
};

describe('groupAllocations', () => {
  it('groups by category in first-seen order', () => {
    const groups = groupAllocations([rent, travel, repairs]);

    expect(groups.map((group) => group.category)).toEqual([
      'Housing',
      'Hobbies',
    ]);
    expect(groups[0].allocations).toEqual([rent, repairs]);
    expect(groups[1].allocations).toEqual([travel]);
  });

  it('sums each category total', () => {
    const groups = groupAllocations([rent, travel, repairs]);

    expect(groups.map((group) => group.total)).toEqual([2300, 1800]);
  });

  it('returns nothing for no allocations', () => {
    expect(groupAllocations([])).toEqual([]);
  });
});
