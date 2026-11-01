import { Button, Modal, Typography } from 'bosi-design-system/react';

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
  return (
    <Modal
      open
      title={`Delete ${budget.name}?`}
      onClose={onCancel}
      actions={
        <>
          <Button color="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button action="error" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <Typography size="body">This can&apos;t be undone.</Typography>
    </Modal>
  );
}
