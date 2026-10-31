# User journey

This document maps the end-to-end flow a user follows to enter a salary, manage budgets, and review the allocation result.

## Routes

- `/salary` — salary input.
- `/budgets` — budget CRUD.
- `/result` — allocation preview.

## Entry and salary flow

```mermaid
flowchart TD
    Start([User opens app]) --> HasSalary{salary exists?}
    HasSalary -->|yes| HasBudgets{budgets exist?}
    HasSalary -->|no| Salary[/salary]
    HasBudgets -->|yes| Result[/result]
    HasBudgets -->|no| Budgets[/budgets]
    Salary --> EnterSalary[Enter salary]
    Salary --> ImportJSON[Import JSON]
    EnterSalary --> SaveSalary[Save salary]
    ImportJSON --> SaveSalary
    SaveSalary --> Budgets
    Salary --> EditSalary[Edit salary]
    EditSalary --> SaveSalary
    Salary --> GoToResult[Go to result]
    GoToResult --> Result
```

- First visit lands on `/salary`.
- `/salary` shows two primary actions:
  - enter salary manually;
  - import JSON from the existing CLI migration or from other time user was on site
- Salary input is required and must be a non-negative number.
- After saving salary, the user is redirected to `/budgets`.
- `/salary` remains editable later.
- If budgets already exist, `/salary` shows a secondary CTA to `/result`.
- Importing JSON replaces salary and budgets and redirects to `/result` or `/budgets` depending on whether budgets are present.

## Budget CRUD flow

```mermaid
flowchart TD
    Budgets[/budgets] --> List[List budgets grouped by category]
    List --> Add[Add budget]
    List --> Edit[Edit budget]
    List --> Delete[Delete budget]
    Add --> Form[Name, type, value, category]
    Edit --> Form
    Form --> Category{Category}
    Category -->|existing| SelectCategory[Select from dropdown]
    Category -->|new| CreateCategory[Enter new category name]
    SelectCategory --> SaveBudget[Save budget]
    CreateCategory --> SaveBudget
    SaveBudget --> Validate
    Delete --> Validate
    Validate --> LiveError{percentage sum > 100%}
    Validate --> LiveWarning{fixed sum > salary}
    LiveError -->|yes| ShowError[Show error on /budgets]
    LiveWarning -->|yes| ShowWarning[Show warning on /budgets]
    ShowError --> CTA{See result}
    ShowWarning --> CTA
    CTA -->|valid| Result[/result]
    CTA -->|invalid| ShowError
```

- `/budgets` lists existing budgets grouped by category.
- Add budget: name, type (fixed or percentage), value, category.
- Category selector:
  - dropdown of existing categories;
  - "Add new category" option with a required category name.
- Edit and delete actions are available per budget.
- Empty categories remain visible if all budgets inside them were deleted.
- Validation feedback appears live on `/budgets`:
  - error if percentage sum > 100%;
  - warning if fixed sum > salary.
- The same validation is enforced when the user clicks the "See result" CTA.
- If the plan is invalid, the "See result" CTA stays on `/budgets` until the error is fixed. Top-level nav and import can still open `/result`, which shows the error state.

## Result preview flow

```mermaid
flowchart TD
    Result[/result] --> Guards{Guards passed}
    Guards -->|no salary| Salary[/salary]
    Guards -->|no budgets| Budgets[/budgets]
    Guards -->|valid| RenderResult[Render allocation]
    RenderResult --> ShowFixed[Fixed budgets]
    RenderResult --> ShowPercentage[Percentage budgets]
    ShowFixed --> GroupByCategory[Group by category]
    ShowPercentage --> GroupByCategory
    GroupByCategory --> CategoryTotals[Show category totals]
    CategoryTotals --> Remaining[Show remaining]
    RenderResult --> ErrorState{percentage sum > 100%}
    RenderResult --> WarningState{fixed sum > salary}
    ErrorState -->|yes| ShowResultError[Show error Toast, hide allocation]
    WarningState -->|yes| ShowResultWarning[Show warning banner]
    ShowResultError --> EditBudgets[Edit budgets]
    ShowResultWarning --> EditBudgets
    EditBudgets --> Budgets
```

- `/result` displays the allocation breakdown.
- Redirect guards:
  - no salary -> redirect to `/salary`;
  - no budgets -> redirect to `/budgets`.
- The screen shows:
  - salary;
  - budgets grouped by category;
  - per-category totals;
  - remaining amount;
  - error Toast if percentage sum > 100%;
  - warning banner if fixed sum > salary.
- With an error, the screen shows only the salary, the Toast, any warning banner and the CTA.
- A CTA returns to `/budgets` to edit the plan.

## Navigation flow

```mermaid
flowchart LR
    Nav[Top-level nav] --> SalaryLink[/salary]
    Nav --> BudgetsLink[/budgets]
    Nav --> ResultLink[/result]
    Nav --> ImportExport[Import / Export JSON]
```

- Top-level navigation is visible on all routes.
- Nav items: Salary, Budgets, Result.
- Active route is highlighted.
- Import and Export JSON actions are available in the top-level nav.
- Import/export is also offered as a CTA on `/salary` for first-visit users.

## Import, export, and CLI migration

- Export JSON writes the current salary and budgets to a file.
- Import JSON reads a file and replaces salary and budgets.
- The existing CLI export can be imported after mapping its schema to the app schema.
  - CLI fixed categories (personal, business, subscriptions, fixed investments) map to fixed budgets with user-defined categories.
  - CLI percentage categories (investments, leisure) map to percentage budgets with user-defined categories.
  - The user can re-categorize during import or after.
- After import, the app redirects to `/result` if budgets are present, otherwise to `/budgets`.

## Redirect rules

| From       | Condition                     | Redirect to       |
| ---------- | ----------------------------- | ----------------- |
| `/budgets` | no salary                     | `/salary`         |
| `/result`  | no salary                     | `/salary`         |
| `/result`  | no budgets                    | `/budgets`        |
| `/salary`  | salary saved, budgets present | CTA to `/result`  |
| `/salary`  | salary saved, no budgets      | CTA to `/budgets` |

## State-to-UI mapping

| State                 | UI on `/budgets`  | UI on `/result`      |
| --------------------- | ----------------- | -------------------- |
| Valid                 | list + totals     | allocation breakdown |
| Percentage sum > 100% | error banner      | error banner         |
| Fixed sum > salary    | warning banner    | warning banner       |
| Remaining > 0         | remaining preview | remaining amount     |
