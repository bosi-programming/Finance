import { Button, Paper, Typography } from 'bosi-design-system/react';

const pageClasses = 'flex w-full max-w-md flex-col items-center gap-4 p-6';

export function Home() {
  return (
    <Paper className={pageClasses}>
      <Typography size="h1">Home</Typography>
      <Button color="primary">Primary action</Button>
    </Paper>
  );
}
