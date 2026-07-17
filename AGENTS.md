- **Stack:** React 19, TypeScript 5.9, Vite 7, TailwindCSS 4.
- **Design System:** `bosi-design-system`.
- **Testing:** Vitest, React Testing Library, Playwright.

## Project

- FE-only budget-based finance app.
- User creates budgets with fixed dollar amounts or percentages.
- Salary input -> subtract fixed budgets -> distribute remaining across percentage budgets.
- If percentage budgets sum to >100 -> show error.
- If fixed budgets exceed salary -> show warning.
- Any unallocated amount after percentage distribution -> show as **Remaining**.
- Persistence: `localStorage` + JSON import/export.
- v0 design starts from scratch; multiple routes.

## v0 Architecture Decisions

- **Routing:** React Router v7.
- **State:** Zustand.
