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
  - a `remaining` line, whether positive, 0 or negative.
- `remaining` is not assigned to any category; it is a separate line.
- Each percentage allocation is rounded to cents.
- When percentages sum to exactly 100%, the rounding leftover goes to the largest percentage budget (the first if tied), and `remaining` is 0, even with a negative remainder.

## Validation rules

- **Error**: `sum(percentage percentages) > 100%`.
  - The plan is invalid. Percentage allocations cannot be computed as requested.
  - UI must show an error Toast and block the allocation preview.
  - The sum is rounded to 8 decimal digits before the check, so float noise such as `0.01 + 70.68 + 29.31` is not an error and `100.004` is.
- **Warning**: `fixedTotal > salary`.
  - Fixed budgets already exceed the salary; the remainder is negative.
  - UI must show a warning. Percentage allocations are computed as negative values, but the primary feedback is that fixed budgets are too high.
  - Both values are compared in cents, so fixed budgets equal to the salary give no warning.
- **Remaining**: `remaining > 0` when `sum(percentage percentages) < 100%`, and 0 when the sum is 100%.
  - These are valid states, not errors.
  - UI must display `remaining` as an explicit line in every state that shows the breakdown, as `$0` or `-$500` when it is 0 or negative.

## Numeric examples

### Valid plan with remaining

- Salary: 5000
- Fixed budgets: Rent 2000 (Housing)
- Percentage budgets: Travel 60% (Hobbies), Savings 30% (Savings)
- `fixedTotal` = 2000
- `remainder` = 5000 - 2000 = 3000
- Travel allocation = 3000 \* 0.60 = 1800
- Savings allocation = 3000 \* 0.30 = 900
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
- Travel allocation = -1000 \* 0.50 = -500

Result:

- warning shown: `Fixed budgets exceed the salary by $1,000.`
- Housing: Rent 6000 -> total 6000
- Hobbies: Travel -500 -> total -500
- Remaining: -500

### Error: percentages exceed 100%

- Salary: 5000
- Fixed budgets: Rent 2000 (Housing)
- Percentage budgets: Travel 60% (Hobbies), Savings 50% (Savings)
- `sum(percentage percentages)` = 110% > 100% -> error.
- UI shows error Toast: `Percentages sum to 110% — must be 100% or less.`
- No allocation is shown. `allocateBudgets` still returns the amounts; the UI hides them when `error` is set.

## Impact on design

- Budgets are grouped by category in the UI.
- Each category shows its total amount.
- Allocation screen must show three possible states:
  - normal breakdown with category totals and a `Remaining` row;
  - warning banner when fixed budgets exceed salary;
  - error Toast when percentage budgets exceed 100%, with no breakdown.
- `Remaining` is visible in every state that shows the breakdown, whatever its value.

## Impact on engineering

- The calculation is a pure function.
- Input: `salary` (number) + `budgets` (array of `{ id, name, type, value, category }`).
- Output: `{ allocations: [...], categoryTotals: Record<category, number>, remaining: number, error: string | null, warning: string | null }`.
- No side effects, no persistence, no UI logic inside the calculation.
- Validation order:
  1. Error check for percentage sum > 100%.
  2. Warning check for fixed sum > salary.
  3. Compute allocations, category totals, and remaining.
