import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button, Input, Typography } from 'bosi-design-system/react';
import { useImportFile } from '@/components/useImportFile';
import {
  formatSalary,
  parseSalary,
  salaryErrorMessage,
} from '@/domain/salary/salaryAmount';
import { useFinanceStore } from '@/store';

export function Salary() {
  const navigate = useNavigate();
  const storedSalary = useFinanceStore((state) => state.salary);
  const hasBudgets = useFinanceStore((state) => state.budgets.length > 0);
  const setSalary = useFinanceStore((state) => state.setSalary);
  const { inputProps, openFilePicker } = useImportFile('Import JSON file');
  const [amountText, setAmountText] = useState(
    storedSalary === null ? '' : formatSalary(storedSalary),
  );
  const [error, setError] = useState<string | undefined>(undefined);

  const hasSalary = storedSalary !== null;

  const updateText = (text: string) => {
    setAmountText(text);
    setError(undefined);
  };

  const reformat = () => {
    const result = parseSalary(amountText);
    if (result.ok) {
      setAmountText(formatSalary(result.value));
    }
  };

  const submit = () => {
    const result = parseSalary(amountText);
    if (!result.ok) {
      setError(salaryErrorMessage(result.reason));
      return;
    }
    setSalary(result.value);
    void navigate({ to: '/budgets' });
  };

  return (
    <div className="flex w-full flex-col gap-4 md:w-[400px]">
      <div className="flex flex-col gap-2">
        <Typography size="h1" color="primary">
          {hasSalary ? 'Your gross salary' : "What's your gross salary?"}
        </Typography>
        <Typography size="body">
          {hasSalary
            ? 'Update it anytime — budgets recalculate instantly.'
            : "Your starting point. Next, you'll split it into budgets."}
        </Typography>
      </div>
      <div onBlur={reformat}>
        <Input
          name="salary"
          label="Gross salary"
          placeholder="$ 0.00"
          type="text"
          value={amountText}
          setValue={updateText}
          error={error}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button color="primary" size="full-width" onClick={submit}>
          Continue
        </Button>
        {!hasSalary && (
          <>
            <Button
              color="secondary"
              size="full-width"
              onClick={openFilePicker}
            >
              Import JSON
            </Button>
            <input {...inputProps} />
          </>
        )}
        {hasSalary && !hasBudgets && (
          <Button
            color="secondary"
            size="full-width"
            onClick={() => {
              void navigate({ to: '/budgets' });
            }}
          >
            Add budgets
          </Button>
        )}
        {hasSalary && hasBudgets && (
          <Button
            color="secondary"
            size="full-width"
            onClick={() => {
              void navigate({ to: '/result' });
            }}
          >
            See result
          </Button>
        )}
      </div>
    </div>
  );
}
