import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PersistenceGate } from '@/persistence/PersistenceGate';
import { persist } from '@/persistence/sync';
import { configureStorage } from '@/store';
import { router } from './router';
import './index.css';
import { RouterProvider } from '@tanstack/react-router';

configureStorage({ persist });

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistenceGate>
      <RouterProvider router={router} />
    </PersistenceGate>
  </StrictMode>,
);
