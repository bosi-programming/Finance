import { useState } from 'react';
import { Button, Input, Modal, Selector } from 'bosi-design-system/react';

import {
  type BudgetDraft,
  validateBudgetDraft,
} from '@/domain/budgets/budgetDraft';
import { valuePlaceholder } from '@/domain/budgets/budgetValue';
import { type Budget, type BudgetType } from '@/types/budget';

export interface BudgetFormModalProps {
  mode: 'add' | 'edit';
  initialDraft: BudgetDraft;
  categories: string[];
  onSave: (fields: Omit<Budget, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const TYPE_OPTIONS = [
  { id: 'fixed', label: 'Fixed' },
  { id: 'percentage', label: 'Percentage' },
];

export function BudgetFormModal({
  mode,
  initialDraft,
  categories,
  onSave,
  onCancel,
}: BudgetFormModalProps) {
  const [draft, setDraft] = useState(initialDraft);

  const update = (changes: Partial<BudgetDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };

  const save = () => {
    const result = validateBudgetDraft(draft);
    if (result.ok) {
      onSave(result.fields);
    }
  };

  return (
    <Modal
      open
      title={mode === 'add' ? 'Add budget' : 'Edit budget'}
      onClose={onCancel}
      actions={
        <>
          <Button color="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button color="primary" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          name="budget-name"
          label="Name"
          placeholder="Budget name"
          value={draft.name}
          setValue={(name) => {
            update({ name });
          }}
        />
        <Selector
          name="budget-type"
          label="Type"
          placeholder="Select a type"
          options={TYPE_OPTIONS}
          value={draft.type}
          onChange={(event) => {
            update({ type: event.target.value as BudgetType });
          }}
        />
        <Input
          name="budget-value"
          label="Value"
          type="text"
          placeholder={valuePlaceholder(draft.type)}
          value={draft.valueText}
          setValue={(valueText) => {
            update({ valueText });
          }}
        />
        <Selector
          name="budget-category"
          label="Category"
          placeholder="Select a category"
          options={categories.map((category) => ({
            id: category,
            label: category,
          }))}
          value={draft.addingCategory ? '' : draft.category}
          onChange={(event) => {
            update({ category: event.target.value, addingCategory: false });
          }}
          onAddNew={() => {
            update({ addingCategory: true });
          }}
          addNewLabel="+ Add new category"
        />
        {draft.addingCategory && (
          <Input
            name="budget-new-category"
            label="New category"
            placeholder="Category name"
            value={draft.newCategory}
            setValue={(newCategory) => {
              update({ newCategory });
            }}
          />
        )}
      </div>
    </Modal>
  );
}
