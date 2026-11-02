import { Outlet, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toast, ToastContainer } from 'bosi-design-system/react';
import { useEffect, useRef } from 'react';
import { AppNavigation } from '@/components/AppNavigation';
import { useSelfRedirectBlock } from '@/components/useSelfRedirectBlock';
import { useFinanceStore } from '@/store';

export function RootLayout() {
  const toast = useFinanceStore((state) => state.toast);
  const clearToast = useFinanceStore((state) => state.clearToast);
  const pathname = useLocation({ select: (location) => location.pathname });
  const mainRef = useRef<HTMLElement | null>(null);
  useSelfRedirectBlock();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      mainRef.current?.focus();
    }
  }, [pathname]);

  return (
    <>
      <AppNavigation />
      <main
        ref={mainRef}
        tabIndex={-1}
        className="dark:bg-background-on-dark bg-background-on-light flex min-h-screen w-screen flex-col items-center px-5 pt-5 outline-none md:pt-20 lg:justify-center lg:p-0"
      >
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
