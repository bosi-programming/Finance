import { useState } from 'react';
import { Paper, Selector, Typography } from 'bosi-design-system/react';

const pageClasses = 'flex w-full max-w-md flex-col items-center gap-4 p-6';

export function Budgets() {
  const [budgetType, setBudgetType] = useState('');

  return (
    <Paper className={pageClasses}>
      <Typography size="h1">Budgets</Typography>
      <Selector
        name="budget-type"
        label="Budget type"
        placeholder="Select a budget type"
        value={budgetType}
        onChange={(event) => {
          setBudgetType(event.target.value);
        }}
        options={[
          { id: 'fixed', label: 'Fixed' },
          { id: 'percentage', label: 'Percentage' },
        ]}
      />
    </Paper>
  );
}
