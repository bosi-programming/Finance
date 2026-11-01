import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Banner, Button, Typography } from 'bosi-design-system/react';

import { BudgetFormModal } from '@/components/budgets/BudgetFormModal';
import { BudgetList } from '@/components/budgets/BudgetList';
import { DeleteBudgetModal } from '@/components/budgets/DeleteBudgetModal';
import { draftFromBudget, EMPTY_DRAFT } from '@/domain/budgets/budgetDraft';
import { groupBudgets } from '@/domain/budgets/budgetFormat';
import {
  fixedOverSalaryMessage,
  percentageOverMessage,
} from '@/domain/budgets/planChecks';
import {
  getFixedBudgetsTotal,
  getTotalPercentage,
  useFinanceStore,
} from '@/store';
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

  useEffect(() => {
    const total = getTotalPercentage(budgets);
    if (total > 100) {
      showToast(percentageOverMessage(total));
    }
  }, [budgets, showToast]);

  const handleSeeResult = () => {
    const total = getTotalPercentage(budgets);
    if (total > 100) {
      showToast(percentageOverMessage(total));
      return;
    }
    void navigate({ to: '/result' });
  };

  return (
    <div className="flex w-full flex-col gap-8 md:max-w-[1008px]">
      <Typography size="h1">Your budgets</Typography>
      <Typography size="body">{hasBudgets ? LIST_HINT : EMPTY_HINT}</Typography>
      {salary !== null && fixedTotal > salary && (
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
      <Button
        color="primary"
        size="full-width"
        onClick={() => {
          setDialog({ kind: 'add' });
        }}
      >
        Add budget
      </Button>
      {hasBudgets && (
        <Button color="secondary" size="full-width" onClick={handleSeeResult}>
          See result
        </Button>
      )}
      {dialog?.kind === 'add' && (
        <BudgetFormModal
          mode="add"
          initialDraft={EMPTY_DRAFT}
          categories={groupBudgets(budgets).map((group) => group.category)}
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
    </div>
  );
}
