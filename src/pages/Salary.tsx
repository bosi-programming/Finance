import { useState } from 'react';
import { Button, Input, Paper, Typography } from 'bosi-design-system/react';
import { useImportFile } from '@/components/useImportFile';
import { useFinanceStore } from '@/store';

const pageClasses = 'flex w-full max-w-md flex-col items-center gap-4 p-6';

export function Salary() {
  const [salary, setSalary] = useState('');
  const storedSalary = useFinanceStore((state) => state.salary);
  const { inputProps, openFilePicker } = useImportFile('Import JSON file');

  return (
    <Paper className={pageClasses}>
      <Typography size="h1">Salary</Typography>
      <Input
        name="salary"
        label="Salary"
        placeholder="Enter your salary"
        type="number"
        value={salary}
        setValue={setSalary}
      />
      {storedSalary === null && (
        <>
          <Button color="secondary" onClick={openFilePicker}>
            Import JSON
          </Button>
          <input {...inputProps} />
        </>
      )}
    </Paper>
  );
}
