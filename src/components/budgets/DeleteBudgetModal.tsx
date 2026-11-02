import { Button, Modal, Typography } from 'bosi-design-system/react';
import { useTranslation } from 'react-i18next';

import { type Budget } from '@/types/budget';

export function DeleteBudgetModal({
  budget,
  onConfirm,
  onCancel,
}: {
  budget: Budget;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      open
      title={t('deleteBudget.title', { name: budget.name })}
      onClose={onCancel}
      actions={
        <>
          <Button color="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button action="error" onClick={onConfirm}>
            {t('common.delete')}
          </Button>
        </>
      }
    >
      <Typography size="body">{t('deleteBudget.body')}</Typography>
    </Modal>
  );
}
