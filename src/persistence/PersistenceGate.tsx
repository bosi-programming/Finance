import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { type ReactNode, useEffect, useState } from 'react';
import { isFresh, readCurrent } from '@/persistence/sync';
import { STORAGE_FAILED_MESSAGE, useFinanceStore } from '@/store';

const PENDING = { status: 'pending' } as const;

const hasIndexedDB = () => Boolean(Dexie.dependencies.indexedDB);

export function PersistenceGate({ children }: { children: ReactNode }) {
  const [storageAvailable] = useState(hasIndexedDB);
  const [open, setOpen] = useState(!storageAvailable);
  const result = useLiveQuery(readCurrent, [], PENDING);

  useEffect(() => {
    if (!storageAvailable) {
      useFinanceStore.setState({ toast: STORAGE_FAILED_MESSAGE });
    }
  }, [storageAvailable]);

  useEffect(() => {
    if (result.status === 'pending') {
      return;
    }
    if (result.status === 'failed') {
      useFinanceStore.setState({ toast: STORAGE_FAILED_MESSAGE });
    } else if (isFresh(result)) {
      useFinanceStore.getState().hydrate(result.row);
    }
    setOpen(true);
  }, [result]);

  return open ? children : null;
}
