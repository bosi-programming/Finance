import { useId } from 'react';
import { Typography } from 'bosi-design-system/react';

import {
  budgetDetails,
  formatGroupTotal,
  groupBudgets,
  type BudgetGroup,
} from '@/domain/budgets/budgetFormat';
import { type Budget } from '@/types/budget';

function BudgetGroupSection({ group }: { group: BudgetGroup }) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <Typography size="h2" id={headingId}>
        {group.category}
      </Typography>
      <Typography size="details" as="p">
        {formatGroupTotal(group)}
      </Typography>
      <ul className="flex flex-col gap-2">
        {group.budgets.map((budget) => (
          <li key={budget.id}>
            <Typography size="body">{budget.name}</Typography>
            <Typography size="details" as="p">
              {budgetDetails(budget)}
            </Typography>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BudgetList({ budgets }: { budgets: Budget[] }) {
  return (
    <>
      {groupBudgets(budgets).map((group) => (
        <BudgetGroupSection key={group.category} group={group} />
      ))}
    </>
  );
}
