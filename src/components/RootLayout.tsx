import { Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toast, ToastContainer } from 'bosi-design-system/react';
import { AppNavigation } from '@/components/AppNavigation';
import { useFinanceStore } from '@/store';

export function RootLayout() {
  const toast = useFinanceStore((state) => state.toast);
  const clearToast = useFinanceStore((state) => state.clearToast);

  return (
    <>
      <AppNavigation />
      <main className="dark:bg-background-on-dark bg-background-on-light flex min-h-screen w-screen flex-col items-center px-5 pt-5 md:pt-20 lg:justify-center lg:p-0">
        <Outlet />
      </main>
      {toast !== null && (
        <ToastContainer>
          <Toast message={toast} onClose={clearToast} closeLabel="Close" />
        </ToastContainer>
      )}
      <TanStackRouterDevtools />
    </>
  );
}
