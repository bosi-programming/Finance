# Design system

This doc maps the Penpot design system to the `bosi-design-system` React components used in the app.

## Penpot source

- File: `Bosi Design System`.
- URL: https://design.penpot.app/#/workspace?team-id=8b1c6e78-ea22-8156-8008-61d7f9f2ee2b&file-id=8b1c6e78-ea22-8156-8008-61e5fa7aa3d2&page-id=070f0ada-0f65-8077-8008-61d74971d29b
- Components: `Button`, `IconButton`, `Card`, `Paper`, `Typography`, `Input`, `Selector`, `Banner`, `Toast`, `Modal`, `Navigation`, `NavItem`, plus the `Trash`, `Pencil`, `ChevronDown` and `Close` icons.
- Publish the file as a Penpot library (`File → Publish library`) to reuse the components in other projects.

## Tokens

### Colors

| Token | Hex | Usage |
| --- | --- | --- |
| `background-on-light` | `#fdf5e5` | light page background |
| `background-on-dark` | `#1e2d2f` | dark page background |
| `primary-on-light` | `#246347` | primary headings/CTA on light |
| `primary-on-dark` | `#81d8d0` | primary headings/CTA on dark |
| `secondary-on-light` | `#df6da9` | secondary accent on light |
| `secondary-on-dark` | `#e791bf` | secondary accent on dark |
| `black` | `#2f3032` | body text on light |
| `white` | `#ffffff` | body text on dark |
| `gray-15` | `#212529` | strong dark backgrounds |
| `gray-68` | `#aeaeae` | muted text/borders |
| `gray-93` | `#eeeeee` | light backgrounds |
| `success` | `#14662d` | positive actions |
| `warning` | `#c2530a` | warning states |
| `error` | `#741427` | errors / destructive actions |
| `error-on-dark` | `#ff6467` | error text and borders on dark |
| `info` | `#3a5683` | neutral actions |
| `emerald` | `#0d9263` | focus rings / highlights |
| `peach` | `#f7dba7` | soft accent |
| `nav-background-on-light` | `#e8e1d3` | light nav background |
| `nav-background-on-dark` | `#2e4649` | dark nav background |
| `overlay` | `rgb(0 0 0 / 0.5)` | Modal backdrop |

### Typography

| Token | Size | Weight | Usage |
| --- | --- | --- | --- |
| `h1` | 2.5rem | 700 | page title |
| `h2` | 2rem | 800 | section title |
| `h3` | 1.5rem | 700 | card title |
| `h4` | 1.25rem | 700 | sub-section |
| `body` | 1rem | 400 | body text |
| `details` | 0.875rem | 400 | captions, hints, errors |

Font: Roboto (400, 700, 800), with `ui-sans-serif, system-ui, sans-serif` as fallback.

### Shadows

| Token | Value |
| --- | --- |
| `shadow-paper` | `4px 4px 4px 0 rgb(0 0 0 / 0.25)` |
| `shadow-paper-dark` | `4px 4px 4px 0 rgb(255 255 255 / 0.25)` |

### Spacing

Use Tailwind's default spacing scale.

### Breakpoints

Use Tailwind defaults:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Components

All components come from `bosi-design-system`.

### Typography

- Props: `size`, `color`, `as`, `className`.
- Sizes: `body`, `h1`, `h2`, `h3`, `h4`, `details`.
- Colors: `default`, `primary`, `secondary`, `error`.
- Default `as` is inferred from `size`.
- Use for every text element; never hardcode text sizes.
- Penpot: `Typography` variant component with properties `Color` (Default, Primary, Secondary, Error), `Size` (details, body, h4, h3, h2, h1), `Theme` (Light, Dark).

### Button

- Props: `color`, `action`, `size`, `className`, `disabled`.
- `action` takes precedence over `color`.
- Actions: `error`, `warning`, `success`, `info`.
- Colors: `default`, `primary`, `secondary`.
- Sizes: `small`, `medium`, `full-width`.
- Penpot: `Button` variant component with properties `Theme` (`Light`, `Dark`), `action` (`none`, `error`, `warning`, `success`, `info`), `color` (`Default`, `primary`, `secondary`), `size` (`medium`, `small`, `fullWidth`), `State` (`Default`, `Disabled`). 48 variants total.
- Usage:
  - Primary CTA: `Button color="primary" size="medium"`.
  - Destructive: `Button action="error"`.
  - Form submit: `Button color="primary" size="full-width"`.

### Input

- Props: `name`, `value`, `setValue`, `label`, `placeholder`, `error`, `type`, `required`, `disabled`.
- Use for salary, budget names, and amounts.
- Pass `type="number"` for numeric inputs. Currency fields use `type="text"` so they can show `$` and commas.
- Use the `error` prop for validation messages.
- Penpot: `Input` variant component with properties `State` (Default, Filled, Error, Disabled) and `Theme` (Light, Dark).

### Selector

- Props: `name`, `value`, `onChange`, `options`, `label`, `placeholder`, `error`, `required`, `disabled`, `onAddNew`, `addNewLabel`.
- `onChange` receives `{ target: { name, value } }`.
- Pass `onAddNew` to show a row such as `+ Add new category` at the end of the menu.
- Use for fixed/percentage type selection or any short enum.
- Penpot: `Selector` variant component with properties `State` (Default, Filled, Open, Error, Disabled) and `Theme` (Light, Dark).

### Card

- Props: `title`, `content`, `actions`, `className`.
- Fixed size on desktop: `270px` width.
- Use for summary tiles.

### Paper

- Props: `children`, `isCard`, `className`.
- Use as a generic bordered/shadowed container, including the rows of the result breakdown.
- Apply padding manually via `className` unless `isCard`.

### IconButton

- Props: `action` (`delete`, `edit`), `aria-label` (required), and button attributes.
- Size: 44x44.
- Penpot: `IconButton` variant component with properties `Action` and `Theme`.

### Banner

- Props: `type` (`error`, `warning`, `info`), `children`, `className`.
- Use for warnings in page state, such as fixed budgets above the salary.
- Penpot: `Banner` variant component with properties `Type` and `Theme`.

### Toast

- `Toast` props: `message`, `onClose`, `closeLabel`. Only the error type exists for now.
- Wrap Toasts in `ToastContainer`, which holds them at the top on mobile and top right on desktop.
- Use for errors, in page state or from an action, such as a percentage sum above 100 or a failed JSON import.
- A Toast does not close by time. It closes with its button or a click outside, and that click also reaches the page.
- Penpot: `Toast` variant component with properties `Type`, `Viewport` and `Theme`.

### Modal

- Props: `open`, `title`, `children`, `actions`, `onClose`.
- Pass Cancel first in `actions`: `Button action="error"`, then `Button color="primary"` for Confirm. On mobile, Confirm moves above Cancel.
- Esc and a click on the backdrop call `onClose`.
- Penpot: `Modal` variant component with properties `Viewport` and `Theme`.

### Navigation

- `Navigation` props: `leftItems`, `rightItems`, `title`, `className`, and `nav` attributes such as `aria-label`.
- `NavItem` props: `active`, and anchor attributes. With a router, pass `href` and an `onClick` that navigates.
- Actions: `Button color="primary" size="small"`.
- Penpot: `Navigation` (`Viewport`, `Theme`) and `NavItem` (`State`, `Theme`) variant components.

## Dark mode

- Toggle `dark` on the root element.
- Components switch automatically via `dark:` variants.
- Page background: `dark:bg-background-on-dark bg-background-on-light`.

## Validation patterns

- Use `Input` and `Selector` `error` props for field-level errors.
- Use `Toast` for errors, in page state or from an action, and `Banner` for warnings in page state.
- Percentage sum > 100: show `Toast`. It shows again when the page opens or the budgets change while the sum stays above 100.
- Fixed sum > salary: show `Banner type="warning"`.
- Remaining amount: show a row in the breakdown, with no `Banner`.
- Failed JSON import: show `Toast`.

## Responsive patterns

- Mobile first: default styles target mobile.
- Use `md:` for tablet/desktop adjustments.
- Forms: single column on mobile, max width `md:w-[400px]` centered on desktop.
- Cards: `w-full` on mobile, `md:w-[270px]` on desktop.
- Buttons: `size="full-width"` on mobile, `size="medium"` on desktop if needed.

## Application integration

Requirements for how the app consumes the design system (ENG-4).

- All app UI renders `bosi-design-system` components only: Typography, Paper,
  Button, IconButton, Input, Selector, Card, Banner, Toast, Modal, Navigation,
  NavItem. No bespoke text styling or component markup. Two exceptions, for
  what the design system has no component for: the hidden
  `<input type="file">` behind the Import buttons, which never renders, and
  unstyled `<div>` wrappers that only stack children (`flex flex-col gap-*`)
  or catch `onBlur` around an `Input`, which has no `onBlur` prop.
- Import components from the package's React entry. The package's CSS entry
  is not published and must never be imported.
- Styles are generated by the app's Tailwind build, which scans the package
  for the component class names it uses.
- Design tokens are defined once in the app stylesheet and must match the
  token tables above.
- Theming needs no provider. Light is the default; dark mode is the `dark`
  class on the root element.
- Each route renders a page component built from the primitives — at minimum
  a Typography heading inside a Paper container.
- Every page ships a Storybook story under the `Pages` group, so the UI is
  browsable without running the app.

## Storybook

- Storybook (react-vite) is the UI development surface.
- Run locally with `pnpm storybook`; ship a static build with
  `pnpm build-storybook`.
- Stories are colocated with their page source — one story per page
  (Home, Salary, Budgets, Result).
