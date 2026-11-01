import { useId } from 'react';
import { IconButton, Typography } from 'bosi-design-system/react';

import {
  budgetDetails,
  formatGroupTotal,
  groupBudgets,
  type BudgetGroup,
} from '@/domain/budgets/budgetFormat';
import { type Budget } from '@/types/budget';

function BudgetGroupSection({
  group,
  onEdit,
  onDelete,
}: {
  group: BudgetGroup;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}) {
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
            <IconButton
              action="edit"
              aria-label={`Edit ${budget.name}`}
              onClick={() => {
                onEdit(budget);
              }}
            />
            <IconButton
              action="delete"
              aria-label={`Delete ${budget.name}`}
              onClick={() => {
                onDelete(budget);
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BudgetList({
  budgets,
  onEdit,
  onDelete,
}: {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}) {
  return (
    <>
      {groupBudgets(budgets).map((group) => (
        <BudgetGroupSection
          key={group.category}
          group={group}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
