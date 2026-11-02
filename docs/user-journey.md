# User journey

This document maps the end-to-end flow a user follows to enter a salary, manage budgets, and review the allocation result.

## Routes

- `/` — redirects to `/salary`.
- `/salary` — salary input.
- `/budgets` — budget CRUD.
- `/result` — allocation preview.

## Entry and salary flow

```mermaid
flowchart TD
    Start([User opens app at /]) --> Salary[/salary]
    Salary --> EnterSalary[Enter salary]
    Salary --> ImportJSON[Import JSON]
    EnterSalary --> SaveSalary[Save salary]
    ImportJSON --> SaveSalary
    SaveSalary --> Budgets[/budgets]
    Salary --> EditSalary[Edit salary]
    EditSalary --> SaveSalary
    Salary --> HasBudgets{budgets exist?}
    HasBudgets -->|yes| GoToResult[See result]
    HasBudgets -->|no| AddBudgets[Add budgets]
    GoToResult --> Result[/result]
    AddBudgets --> Budgets
```

- `/` always redirects to `/salary`, with or without stored data.
- `/salary` shows two primary actions:
  - enter salary manually;
  - import JSON from the existing CLI migration or from other time user was on site
- Salary input is required and must be a non-negative number.
- After saving salary, the user is redirected to `/budgets`.
- `/salary` remains editable later.
- With a saved salary and budgets, `/salary` shows a secondary "See result" CTA to `/result`.
- With a saved salary and no budgets, `/salary` shows a secondary "Add budgets" CTA to `/budgets`.
- With no saved salary, `/salary` shows neither CTA. A salary of `0` counts as saved.
- Importing JSON replaces salary and budgets and redirects to `/result` or `/budgets` depending on whether budgets are present.

## Budget CRUD flow

```mermaid
flowchart TD
    Budgets[/budgets] --> List[List budgets grouped by category]
    List --> Add[Add budget]
    List --> Edit[Edit budget]
    List --> Delete[Delete budget]
    Add --> Form[Name, category, value]
    Edit --> Form
    Form --> Category{Category}
    Category -->|existing| SelectCategory[Select from dropdown]
    Category -->|new| CreateCategory[Enter category name and type]
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
- Add budget: name, category, value. A budget takes its type (fixed or percentage) from its category.
- Category selector:
  - dropdown of existing categories;
  - "New category" option reveals a required category name and a type (fixed or percentage) that the category keeps.
- Edit and delete actions are available per budget.
- A category exists only while it holds a budget. With no budgets left, `/budgets` shows its empty state.
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
- Redirect guards, see [redirect rules](#redirect-rules):
  - no salary -> redirect to `/salary`;
  - no budgets -> redirect to `/budgets`.
- `/result` never renders without a salary and at least one budget.
- The screen shows:
  - salary;
  - budgets grouped by category;
  - per-category totals;
  - remaining amount;
  - error Toast if percentage sum > 100%;
  - warning banner if fixed sum > salary.
- With an error, the screen shows only the salary, the Toast, any warning banner and the CTA.
- The error Toast shows when the page opens and again when budgets change while the sum stays above 100%. Once closed it stays closed until then. It also closes when the sum drops to 100% or less, and when the user leaves `/result`.
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
- Nav items stay enabled on every route. On a blocked route a click follows the [redirect rules](#redirect-rules).
- Export is disabled until a salary exists, since there is nothing to export before it. Import stays enabled on every route.
- Import is also offered as a CTA on `/salary` for first-visit users. Export is in the top-level nav only.

## Import, export, and CLI migration

- Export JSON writes the current salary and budgets to a file.
- Import JSON reads a file and replaces salary and budgets.
- The existing CLI export can be imported after mapping its schema to the app schema.
  - CLI fixed categories (personal, business, subscriptions, fixed investments) map to fixed budgets with user-defined categories.
  - CLI percentage categories (investments, leisure) map to percentage budgets with user-defined categories.
  - The user can re-categorize after import, through budget CRUD.
- After import, the app redirects to `/result` if budgets are present, otherwise to `/budgets`.
- A rejected file shows "Import failed. Your data was not changed." and the user stays on the route. `data-schema.md` lists what fails.
- The app asks for no confirmation before it replaces data.
- Choosing the same file again runs a second import. Cancelling the file dialog does nothing.
- Export stays disabled until a salary is saved.

## Redirect rules

| From       | Condition                     | Redirect to                     |
| ---------- | ----------------------------- | ------------------------------- |
| `/`        | always                        | `/salary`                       |
| `/budgets` | no salary                     | `/salary`                       |
| `/result`  | no salary                     | `/salary`                       |
| `/result`  | salary saved, no budgets      | `/budgets`                      |
| `/salary`  | salary saved, budgets present | "See result" CTA to `/result`   |
| `/salary`  | salary saved, no budgets      | "Add budgets" CTA to `/budgets` |

- Guards run in each route's `beforeLoad` in `src/router.tsx`, before the page renders. The rules live in the pure function `routeRedirect` in `src/domain/routing/routeRedirect.ts`.
- They apply to a direct load, a reload, a nav link click and `navigate()` alike.
- `/result` checks the salary rule first: no salary and no budgets goes straight to `/salary`.
- A salary of `0` counts as saved. Only a missing salary triggers the salary rule.
- The router mounts only after `PersistenceGate` reads stored data, so a reload with stored data stays on the current route.
- History:
  - a redirect replaces the blocked entry, so Back does not return to the blocked route;
  - on a direct load or reload, a redirect adds no history entry;
  - a nav link click pushes its entry before the guard runs. When the redirect target is the current page, for example clicking Result on `/salary` with no salary, history gains a duplicate entry and Back stays on the same page once.
- Guards do not react to store changes while a page is open, such as another tab clearing data. The next navigation applies them.

## State-to-UI mapping

| State                 | UI on `/budgets`  | UI on `/result`      |
| --------------------- | ----------------- | -------------------- |
| Valid                 | list + totals     | allocation breakdown |
| Percentage sum > 100% | error Toast       | error Toast          |
| Fixed sum > salary    | warning banner    | warning banner       |
| Remaining > 0         | remaining preview | remaining amount     |
