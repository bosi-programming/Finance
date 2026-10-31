# Data schema & persistence spec

This document defines the JSON shape and persistence contract for the Finance FE v0 app.

## Source of truth

TypeScript interfaces are declared in `src/types/budget.ts`. The schemas below are the human-readable version of those types.

## Budget schema

```typescript
export type BudgetType = 'fixed' | 'percentage';

export interface Budget {
  id: string;
  name: string;
  type: BudgetType;
  value: number;
  category: string;
}
```

- `id`: stable identifier for the budget.
- `name`: user-facing label.
- `type`: `fixed` for absolute amounts, `percentage` for ratios of the remainder.
- `value`: amount in dollars when `type === "fixed"`; percentage in percent when `type === "percentage"`.
- `category`: user-defined grouping label.

## Salary schema

```typescript
export interface Salary {
  amount: number;
}
```

In the stored app state, salary is saved as a plain number:

```typescript
export interface AppState {
  version: 'v0';
  salary: number;
  budgets: Budget[];
}
```

- `amount`: non-negative salary value.
- `version`: app state schema version.

## Allocation result schema

```typescript
export interface BudgetAllocationItem extends Budget {
  amount: number;
}

export type CategoryTotals = Record<string, number>;

export interface AllocationResult {
  salary: number;
  fixedTotal: number;
  percentageTotal: number;
  remainder: number;
  remaining: number;
  allocations: BudgetAllocationItem[];
  categoryTotals: CategoryTotals;
  error: string | null;
  warning: string | null;
}
```

- `salary`: input salary.
- `fixedTotal`: sum of all fixed budget values.
- `percentageTotal`: sum of all computed percentage allocations.
- `remainder`: `salary - fixedTotal`.
- `remaining`: `remainder - percentageTotal`.
- `allocations`: each budget paired with its final allocated amount.
- `categoryTotals`: sum of allocated amounts per category.
- `error`: non-null when percentage budgets sum to more than 100%.
- `warning`: non-null when fixed budgets exceed salary.

## localStorage

- Key: `finance-fe-v0`
- Value: serialized `AppState` JSON.
- Example: `localStorage.setItem("finance-fe-v0", JSON.stringify(state))`.

## JSON import/export format

The exported file is exactly the `AppState` object:

```json
{
  "version": "v0",
  "salary": 5000,
  "budgets": [
    { "id": "1", "name": "Rent", "type": "fixed", "value": 2000, "category": "Housing" },
    { "id": "2", "name": "Travel", "type": "percentage", "value": 60, "category": "Hobbies" },
    { "id": "3", "name": "Savings", "type": "percentage", "value": 30, "category": "Savings" }
  ]
}
```

Importing JSON replaces the current `AppState` in memory and `localStorage`.

## CLI migration

The app accepts a JSON export from the existing CLI tool. The CLI groups are mapped to fixed or percentage budgets with user-defined categories:

| CLI group             | App type   | App default category |
| --------------------- | ---------- | -------------------- |
| `CONTAS_PESSOAIS`     | fixed      | `personal`           |
| `CONTAS_DA_EMPRESA`   | fixed      | `business`           |
| `ASSINATURAS`         | fixed      | `subscriptions`      |
| `INVESTIMENTOS_FIXOS` | fixed      | `fixed investments`  |
| `INVESTIMENTOS`       | percentage | `investments`        |
| `LAZER`               | percentage | `leisure`            |

Legacy export shape:

```typescript
export interface LegacyCliExport {
  salary?: number;
  fixed?: {
    personal?: number;
    business?: number;
    subscriptions?: number;
    fixedInvestments?: number;
  };
  percentage?: {
    investments?: number;
    leisure?: number;
  };
}
```

Each group value becomes one budget with a default category. The user can re-categorize during import or later.

## Remaining

- `remaining` is always part of `AllocationResult`.
- The UI shows the value as `Remaining` in every state that shows the breakdown, including `$0` and negative values such as `-$500`.

## Sample files

- `samples/app-state-valid.json`
- `samples/app-state-warning.json`
- `samples/app-state-error.json`
- `samples/legacy-cli-export.json`

## Related docs

- `budget-domain-model.md` — allocation rules.
- `user-journey.md` — routes, flows, and import/export behavior.
- `v0.md` — v0 scope, persistence, and architecture.
