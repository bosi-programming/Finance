import { useState } from 'react';
import { Button, Input, Modal, Selector } from 'bosi-design-system/react';
import { useTranslation } from 'react-i18next';

import {
  type BudgetDraft,
  type BudgetDraftErrorKey,
  type BudgetDraftErrors,
  type BudgetDraftField,
  validateBudgetDraft,
} from '@/domain/budgets/budgetDraft';
import { valuePlaceholder } from '@/domain/budgets/budgetValue';
import { formatMoneyFixed } from '@/domain/money';
import { useLocaleSettings } from '@/i18n/useLocaleSettings';
import { type Budget, type BudgetType } from '@/types/budget';

export interface BudgetFormModalProps {
  mode: 'add' | 'edit';
  initialDraft: BudgetDraft;
  categories: string[];
  categoryTypes: Record<string, BudgetType>;
  onSave: (fields: Omit<Budget, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const NEW_CATEGORY_ID = '__new-category__';

export function BudgetFormModal({
  mode,
  initialDraft,
  categories,
  categoryTypes,
  onSave,
  onCancel,
  onDelete,
}: BudgetFormModalProps) {
  const { t } = useTranslation();
  const settings = useLocaleSettings();
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState<BudgetDraftErrors>({});

  const update = (
    changes: Partial<BudgetDraft>,
    clears: BudgetDraftField[],
  ) => {
    setDraft((current) => ({ ...current, ...changes }));
    setErrors((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([field]) => !clears.includes(field as BudgetDraftField),
        ),
      ),
    );
  };

  const typeOptions = [
    { id: 'fixed', label: t('budgetForm.typeFixed') },
    { id: 'percentage', label: t('budgetForm.typePercentage') },
  ];

  const message = (key: BudgetDraftErrorKey | undefined) =>
    key === undefined
      ? undefined
      : t(key, { min: formatMoneyFixed(0, settings) });

  const save = () => {
    const result = validateBudgetDraft(draft, settings);
    if (result.ok) {
      setErrors({});
      onSave(result.fields);
    } else {
      setErrors(result.errors);
    }
  };

  return (
    <Modal
      open
      title={t(mode === 'add' ? 'budgetForm.addTitle' : 'budgetForm.editTitle')}
      onClose={onCancel}
      actions={
        <>
          {mode === 'edit' && onDelete && (
            <Button action="error" onClick={onDelete}>
              {t('common.delete')}
            </Button>
          )}
          <Button color="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button color="primary" onClick={save}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          name="budget-name"
          label={t('budgetForm.nameLabel')}
          placeholder={t('budgetForm.namePlaceholder')}
          value={draft.name}
          error={message(errors.name)}
          setValue={(name) => {
            update({ name }, ['name']);
          }}
        />
        <Selector
          name="budget-category"
          label={t('budgetForm.categoryLabel')}
          placeholder={t('budgetForm.categoryPlaceholder')}
          options={[
            ...categories.map((category) => ({
              id: category,
              label: category,
            })),
            ...(draft.addingCategory
              ? [{ id: NEW_CATEGORY_ID, label: t('budgetForm.newCategory') }]
              : []),
          ]}
          value={draft.addingCategory ? NEW_CATEGORY_ID : draft.category}
          error={draft.addingCategory ? undefined : message(errors.category)}
          onChange={(event) => {
            const category = event.target.value;
            update(
              {
                category,
                addingCategory: false,
                type: categoryTypes[category] ?? '',
              },
              ['category', 'type', 'value'],
            );
          }}
          onAddNew={() => {
            update({ addingCategory: true, type: '' }, [
              'category',
              'type',
              'value',
            ]);
          }}
          addNewLabel={t('budgetForm.addNewCategory')}
        />
        {draft.addingCategory && (
          <>
            <Input
              name="budget-new-category"
              label={t('budgetForm.newCategory')}
              placeholder={t('budgetForm.newCategoryPlaceholder')}
              value={draft.newCategory}
              error={message(errors.category)}
              setValue={(newCategory) => {
                update({ newCategory }, ['category']);
              }}
            />
            <Selector
              name="budget-type"
              label={t('budgetForm.typeLabel')}
              placeholder={t('budgetForm.typePlaceholder')}
              options={typeOptions}
              value={draft.type}
              error={message(errors.type)}
              onChange={(event) => {
                update({ type: event.target.value as BudgetType }, [
                  'type',
                  'value',
                ]);
              }}
            />
          </>
        )}
        <Input
          name="budget-value"
          label={t('budgetForm.valueLabel')}
          type="text"
          placeholder={valuePlaceholder(draft.type, settings)}
          value={draft.valueText}
          error={message(errors.value)}
          setValue={(valueText) => {
            update({ valueText }, ['value']);
          }}
        />
      </div>
    </Modal>
  );
}
