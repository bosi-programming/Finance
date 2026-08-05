import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { router } from './router';
import './index.css';
import { RouterProvider } from '@tanstack/react-router';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
