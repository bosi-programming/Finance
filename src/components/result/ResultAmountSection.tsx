import { useId } from 'react';
import { Paper, Typography } from 'bosi-design-system/react';

import { formatMoney } from '@/domain/money';
import { useLocaleSettings } from '@/i18n/useLocaleSettings';

export function ResultAmountSection({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  const headingId = useId();
  const settings = useLocaleSettings();

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
          {formatMoney(amount, settings)}
        </Typography>
      </Paper>
    </section>
  );
}
