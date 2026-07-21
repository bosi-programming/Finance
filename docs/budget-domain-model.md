# Budget domain model & calculation rules

This document defines how a salary and a set of budgets become a per-budget allocation.

## Budget types

- Every budget is one of two types:
  - **Fixed budget**: an absolute amount that is subtracted from the salary first.
  - **Percentage budget**: a ratio that consumes whatever is left after all fixed budgets are subtracted.
- A budget has a name, a type, a value, and a category.
  - `type` is `fixed` or `percentage`.
  - `value` is amount for fixed, percentage for percentage.
  - `category` is a user-created label used to group budgets in the UI.
- The order of budgets does not matter. Fixed budgets are always subtracted before percentage budgets are calculated.
- Categories may contain both fixed and percentage budgets.
- A category total is the sum of all final amounts inside that category.

## Allocation pipeline

- `fixedTotal` = sum of all fixed budget amounts.
- `remainder` = salary - `fixedTotal`.
- For each percentage budget: `allocation = remainder * percentage`.
- `percentageTotal` = sum of all percentage allocations.
- `remaining` = `remainder` - `percentageTotal`.
- The final result contains:
  - each fixed budget with its original amount;
  - each percentage budget with its computed allocation;
  - a per-category total: sum of fixed amounts + percentage allocations inside that category;
  - a `remaining` line when `remaining > 0`.
- `remaining` is not assigned to any category; it is a separate line.

## Validation rules

- **Error**: `sum(percentage percentages) > 100%`.
  - The plan is invalid. Percentage allocations cannot be computed as requested.
  - UI must show an error message and block the allocation preview.
- **Warning**: `fixedTotal > salary`.
  - Fixed budgets already exceed the salary; the remainder is negative.
  - UI must show a warning. Percentage allocations are computed as negative values, but the primary feedback is that fixed budgets are too high.
- **Remaining**: `remaining > 0` when `sum(percentage percentages) < 100%`.
  - This is a valid state, not an error.
  - UI must display `remaining` as an explicit line.

## Numeric examples

### Valid plan with remaining

- Salary: 5000
- Fixed budgets: Rent 2000 (Housing)
- Percentage budgets: Travel 60% (Hobbies), Savings 30% (Savings)
- `fixedTotal` = 2000
- `remainder` = 5000 - 2000 = 3000
- Travel allocation = 3000 * 0.60 = 1800
- Savings allocation = 3000 * 0.30 = 900
- `percentageTotal` = 2700
- `remaining` = 3000 - 2700 = 300

Result:
- Housing: Rent 2000 -> total 2000
- Hobbies: Travel 1800 -> total 1800
- Savings: Savings 900 -> total 900
- Remaining: 300

### Warning: fixed exceeds salary

- Salary: 5000
- Fixed budgets: Rent 6000 (Housing)
- Percentage budgets: Travel 50% (Hobbies)
- `fixedTotal` = 6000 > 5000 -> warning.
- `remainder` = -1000
- Travel allocation = -1000 * 0.50 = -500

Result:
- warning shown
- Housing: Rent 6000 -> total 6000
- Hobbies: Travel -500 -> total -500
- Remaining: -500

### Error: percentages exceed 100%

- Salary: 5000
- Fixed budgets: Rent 2000 (Housing)
- Percentage budgets: Travel 60% (Hobbies), Savings 50% (Savings)
- `sum(percentage percentages)` = 110% > 100% -> error.
- UI shows error: percentage budgets cannot exceed 100%.
- No allocation is computed.

## Impact on design

- Budgets are grouped by category in the UI.
- Each category shows its total amount.
- Allocation screen must show three possible states:
  - normal breakdown with category totals and a `Remaining` row;
  - warning banner when fixed budgets exceed salary;
  - error banner when percentage budgets exceed 100%.
- `Remaining` is always visible when it is positive, even if the user is not in an error or warning state.

## Impact on engineering

- The calculation is a pure function.
- Input: `salary` (number) + `budgets` (array of `{ id, name, type, value, category }`).
- Output: `{ allocations: [...], categoryTotals: Record<category, number>, remaining: number, error: string | null, warning: string | null }`.
- No side effects, no persistence, no UI logic inside the calculation.
- Validation order:
  1. Error check for percentage sum > 100%.
  2. Warning check for fixed sum > salary.
  3. Compute allocations, category totals, and remaining.
