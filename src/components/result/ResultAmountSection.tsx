import { useId } from 'react';
import { Paper, Typography } from 'bosi-design-system/react';

import { formatMoney } from '@/domain/money';

export function ResultAmountSection({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      <Paper className="flex items-baseline justify-between gap-4">
        <Typography size="h4" as="h2" id={headingId}>
          {label}
        </Typography>
        <Typography
          size="h3"
          as="p"
          color="primary"
          className="mb-0! text-right"
        >
          {formatMoney(amount)}
        </Typography>
      </Paper>
    </section>
  );
}
