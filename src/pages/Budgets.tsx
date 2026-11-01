import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Banner, Button, Paper, Typography } from 'bosi-design-system/react';

import { BudgetFormModal } from '@/components/budgets/BudgetFormModal';
import { BudgetList } from '@/components/budgets/BudgetList';
import { DeleteBudgetModal } from '@/components/budgets/DeleteBudgetModal';
import {
  categoryTypes,
  draftFromBudget,
  EMPTY_DRAFT,
} from '@/domain/budgets/budgetDraft';
import { groupBudgets } from '@/domain/budgets/budgetFormat';
import {
  fixedOverSalaryMessage,
  isFixedOverSalary,
  isPercentageOver,
  percentageOverMessage,
  percentageTotal,
} from '@/domain/budgets/planChecks';
import { getFixedBudgetsTotal } from '@/domain/budgets/totals';
import { useFinanceStore } from '@/store';
import { type Budget } from '@/types/budget';

type BudgetDialog =
  | null
  | { kind: 'add' }
  | { kind: 'edit'; budget: Budget }
  | { kind: 'delete'; budget: Budget };

const EMPTY_HINT = 'No budgets yet. Add your first one to split your salary.';
const LIST_HINT = 'Add, edit, and delete fixed and percentage budgets.';

export function Budgets() {
  const budgets = useFinanceStore((state) => state.budgets);
  const addBudget = useFinanceStore((state) => state.addBudget);
  const updateBudget = useFinanceStore((state) => state.updateBudget);
  const deleteBudget = useFinanceStore((state) => state.deleteBudget);
  const salary = useFinanceStore((state) => state.salary);
  const showToast = useFinanceStore((state) => state.showToast);
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<BudgetDialog>(null);
  const hasBudgets = budgets.length > 0;
  const fixedTotal = getFixedBudgetsTotal(budgets);

  const warnIfPercentageOver = useCallback(() => {
    if (!isPercentageOver(budgets)) {
      return false;
    }
    showToast(percentageOverMessage(percentageTotal(budgets)));
    return true;
  }, [budgets, showToast]);

  useEffect(() => {
    warnIfPercentageOver();
  }, [warnIfPercentageOver]);

  const handleSeeResult = () => {
    if (warnIfPercentageOver()) {
      return;
    }
    void navigate({ to: '/result' });
  };

  return (
    <Paper className="border-0! p-0! shadow-none! flex w-full flex-col gap-8 md:max-w-[1008px] lg:mb-auto lg:mt-12">
      <div className="flex flex-col gap-2">
        <Typography size="h1" color="primary">
          Your budgets
        </Typography>
        <Typography size="body" className="mb-0!">
          {hasBudgets ? LIST_HINT : EMPTY_HINT}
        </Typography>
      </div>
      {salary !== null && isFixedOverSalary(fixedTotal, salary) && (
        <Banner type="warning">
          {fixedOverSalaryMessage(fixedTotal - salary)}
        </Banner>
      )}
      {hasBudgets && (
        <BudgetList
          budgets={budgets}
          onEdit={(budget) => {
            setDialog({ kind: 'edit', budget });
          }}
          onDelete={(budget) => {
            setDialog({ kind: 'delete', budget });
          }}
        />
      )}
      <div className="flex flex-col gap-2 md:flex-row md:justify-end">
        <Button
          color="primary"
          size="full-width"
          className="md:h-10.5! md:w-auto!"
          onClick={() => {
            setDialog({ kind: 'add' });
          }}
        >
          Add budget
        </Button>
        {hasBudgets && (
          <Button
            color="secondary"
            size="full-width"
            className="md:h-10.5! md:w-auto!"
            onClick={handleSeeResult}
          >
            See result
          </Button>
        )}
      </div>
      {dialog?.kind === 'add' && (
        <BudgetFormModal
          mode="add"
          initialDraft={EMPTY_DRAFT}
          categories={groupBudgets(budgets).map((group) => group.category)}
          categoryTypes={categoryTypes(budgets)}
          onSave={(fields) => {
            addBudget({ id: crypto.randomUUID(), ...fields });
            setDialog(null);
          }}
          onCancel={() => {
            setDialog(null);
          }}
        />
      )}
      {dialog?.kind === 'edit' && (
        <BudgetFormModal
          mode="edit"
          initialDraft={draftFromBudget(dialog.budget)}
          categories={groupBudgets(budgets).map((group) => group.category)}
          categoryTypes={categoryTypes(budgets)}
          onSave={(fields) => {
            updateBudget({ id: dialog.budget.id, ...fields });
            setDialog(null);
          }}
          onDelete={() => {
            setDialog({ kind: 'delete', budget: dialog.budget });
          }}
          onCancel={() => {
            setDialog(null);
          }}
        />
      )}
      {dialog?.kind === 'delete' && (
        <DeleteBudgetModal
          budget={dialog.budget}
          onConfirm={() => {
            deleteBudget(dialog.budget.id);
            setDialog(null);
          }}
          onCancel={() => {
            setDialog(null);
          }}
        />
      )}
    </Paper>
  );
}
