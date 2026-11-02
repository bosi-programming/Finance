import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Typography } from 'bosi-design-system/react';
import { useImportFile } from '@/components/useImportFile';
import {
  formatSalary,
  parseSalary,
  salaryErrorKey,
  type SalaryErrorKey,
} from '@/domain/salary/salaryAmount';
import { useLocaleSettings } from '@/i18n/useLocaleSettings';
import { useFinanceStore } from '@/store';

export function Salary() {
  const { t } = useTranslation();
  const settings = useLocaleSettings();
  const navigate = useNavigate();
  const storedSalary = useFinanceStore((state) => state.salary);
  const hasBudgets = useFinanceStore((state) => state.budgets.length > 0);
  const setSalary = useFinanceStore((state) => state.setSalary);
  const { inputProps, openFilePicker } = useImportFile(
    t('salary.importJsonFileLabel'),
  );
  const [amountText, setAmountText] = useState(
    storedSalary === null ? '' : formatSalary(storedSalary, settings),
  );
  const [errorKey, setErrorKey] = useState<SalaryErrorKey | undefined>(
    undefined,
  );

  const hasSalary = storedSalary !== null;

  const updateText = (text: string) => {
    setAmountText(text);
    setErrorKey(undefined);
  };

  const reformat = () => {
    const result = parseSalary(amountText, settings);
    if (result.ok) {
      setAmountText(formatSalary(result.value, settings));
    }
  };

  const submit = () => {
    const result = parseSalary(amountText, settings);
    if (!result.ok) {
      setErrorKey(salaryErrorKey(result.reason));
      return;
    }
    setSalary(result.value);
    void navigate({ to: '/budgets' });
  };

  return (
    <div className="flex w-full flex-col gap-4 md:w-[400px]">
      <div className="flex flex-col gap-2">
        <Typography size="h1" color="primary">
          {hasSalary ? t('salary.titleSaved') : t('salary.titleNew')}
        </Typography>
        <Typography size="body">
          {hasSalary ? t('salary.hintSaved') : t('salary.hintNew')}
        </Typography>
      </div>
      <div onBlur={reformat}>
        <Input
          name="salary"
          label={t('salary.label')}
          placeholder={formatSalary(0, settings)}
          type="text"
          value={amountText}
          setValue={updateText}
          error={
            errorKey === undefined
              ? undefined
              : t(errorKey, { min: formatSalary(0, settings) })
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button color="primary" size="full-width" onClick={submit}>
          {t('salary.continue')}
        </Button>
        {!hasSalary && (
          <>
            <Button
              color="secondary"
              size="full-width"
              onClick={openFilePicker}
            >
              {t('salary.importJson')}
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
            {t('salary.addBudgets')}
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
            {t('common.seeResult')}
          </Button>
        )}
      </div>
    </div>
  );
}
