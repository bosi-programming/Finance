import { Card, Paper, Typography } from 'bosi-design-system/react';

const pageClasses = 'flex w-full max-w-md flex-col items-center gap-4 p-6';

export function Result() {
  return (
    <Paper className={pageClasses}>
      <Typography size="h1">Result</Typography>
      <Card title="Result" content="Distribution preview" />
    </Paper>
  );
}
