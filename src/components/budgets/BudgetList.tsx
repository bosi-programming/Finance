import { useId } from 'react';
import { IconButton, Paper, Typography } from 'bosi-design-system/react';
import { useTranslation } from 'react-i18next';

import {
  budgetDetails,
  formatGroupTotal,
  groupBudgets,
  type BudgetGroup,
} from '@/domain/budgets/budgetFormat';
import { useLocaleSettings } from '@/i18n/useLocaleSettings';
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
  const { t } = useTranslation();
  const settings = useLocaleSettings();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <Typography size="h4" as="h2" id={headingId}>
          {group.category}
        </Typography>
        <Typography size="details" as="p" className="text-right">
          {formatGroupTotal(group, settings)}
        </Typography>
      </div>
      <ul className="flex flex-col gap-2">
        {group.budgets.map((budget) => (
          <li key={budget.id}>
            <Paper className="flex items-center gap-4">
              <div className="flex flex-1 flex-col md:flex-row md:items-center md:gap-6">
                <Typography size="h3" color="primary" className="md:w-[240px]">
                  {budget.name}
                </Typography>
                <Typography size="body" as="p" className="mb-0!">
                  {budgetDetails(budget, t, settings)}
                </Typography>
              </div>
              <div className="flex gap-2">
                <IconButton
                  action="delete"
                  aria-label={t('budgets.deleteNamed', { name: budget.name })}
                  onClick={() => {
                    onDelete(budget);
                  }}
                />
                <IconButton
                  action="edit"
                  aria-label={t('budgets.editNamed', { name: budget.name })}
                  onClick={() => {
                    onEdit(budget);
                  }}
                />
              </div>
            </Paper>
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
    <div className="flex flex-col gap-4">
      {groupBudgets(budgets).map((group) => (
        <BudgetGroupSection
          key={group.category}
          group={group}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
