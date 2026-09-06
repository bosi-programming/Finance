import { useState } from 'react';
import { Input, Paper, Typography } from 'bosi-design-system/react';

const pageClasses = 'flex w-full max-w-md flex-col items-center gap-4 p-6';

export function Salary() {
  const [salary, setSalary] = useState('');

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
    </Paper>
  );
}
