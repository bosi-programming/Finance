import { useBlocker } from '@tanstack/react-router';
import { routeRedirect } from '@/domain/routing/routeRedirect';
import type { GuardedPath } from '@/domain/routing/routeRedirect';
import { useFinanceStore } from '@/store';

function isGuardedPath(pathname: string): pathname is GuardedPath {
  return pathname === '/budgets' || pathname === '/result';
}

export function useSelfRedirectBlock() {
  useBlocker({
    shouldBlockFn: ({ current, next }) => {
      if (!isGuardedPath(next.pathname)) {
        return false;
      }
      const { salary, budgets } = useFinanceStore.getState();
      return (
        routeRedirect(next.pathname, { salary, budgets }) === current.pathname
      );
    },
    withResolver: false,
    enableBeforeUnload: false,
  });
}
