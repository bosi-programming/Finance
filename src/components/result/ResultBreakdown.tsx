import { useId } from 'react';
import { Paper, Typography } from 'bosi-design-system/react';

import { ResultAmountSection } from '@/components/result/ResultAmountSection';
import {
  groupAllocations,
  type AllocationGroup,
} from '@/domain/budgets/allocationGroups';
import { budgetDetails } from '@/domain/budgets/budgetFormat';
import { formatMoney } from '@/domain/money';
import { type BudgetAllocationItem } from '@/types/budget';

function AllocationGroupSection({ group }: { group: AllocationGroup }) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <Typography size="h4" as="h2" id={headingId}>
          {group.category}
        </Typography>
        <Typography size="details" as="p" className="text-right">
          {formatMoney(group.total)}
        </Typography>
      </div>
      <ul className="flex flex-col gap-2">
        {group.allocations.map((allocation) => (
          <li key={allocation.id}>
            <Paper className="flex items-center gap-4">
              <div className="flex flex-1 flex-col md:flex-row md:items-center md:gap-6">
                <Typography size="h3" color="primary" className="md:w-[240px]">
                  {allocation.name}
                </Typography>
                <Typography size="body" as="p" className="mb-0!">
                  {budgetDetails(allocation)}
                </Typography>
              </div>
              <Typography size="body" as="p" className="mb-0! text-right">
                {formatMoney(allocation.amount)}
              </Typography>
            </Paper>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ResultBreakdown({
  allocations,
  remaining,
}: {
  allocations: BudgetAllocationItem[];
  remaining: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      {groupAllocations(allocations).map((group) => (
        <AllocationGroupSection key={group.category} group={group} />
      ))}
      <ResultAmountSection label="Remaining" amount={remaining} />
    </div>
  );
}
