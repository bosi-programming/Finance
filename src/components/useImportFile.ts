import { useNavigate } from '@tanstack/react-router';
import { type ChangeEvent, type RefObject, useRef } from 'react';
import { parseImportFile } from '@/persistence/parseImportFile';
import { IMPORT_FAILED_MESSAGE, useFinanceStore } from '@/store';

export interface ImportFileControl {
  inputProps: {
    ref: RefObject<HTMLInputElement | null>;
    type: 'file';
    accept: '.json,application/json';
    hidden: true;
    'aria-label': string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  };
  openFilePicker: () => void;
}

const readText = (file: File) =>
  new Promise<string | null>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsText(file);
  });

export function useImportFile(inputLabel: string): ImportFileControl {
  const ref = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const importFile = async (file: File) => {
    const text = await readText(file);
    const state = text === null ? null : parseImportFile(text);
    if (state === null) {
      useFinanceStore.setState({ toast: IMPORT_FAILED_MESSAGE });
      return;
    }
    const replaced = await useFinanceStore.getState().replaceAll(state);
    if (replaced) {
      await navigate({ to: state.budgets.length > 0 ? '/result' : '/budgets' });
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    void importFile(file);
  };

  return {
    inputProps: {
      ref,
      type: 'file',
      accept: '.json,application/json',
      hidden: true,
      'aria-label': inputLabel,
      onChange,
    },
    openFilePicker: () => {
      ref.current?.click();
    },
  };
}
