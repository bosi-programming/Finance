# Design system

This doc maps the Penpot design system to the `bosi-design-system` React components used in the app.

## Penpot source

- File: `Página Pessoal (copy)` (rename to `Bosi Design System` in the Penpot UI).
- URL: https://design.penpot.app/#/workspace?team-id=8b1c6e78-ea22-8156-8008-61d7f9f2ee2b&file-id=8b1c6e78-ea22-8156-8008-61e5fa7aa3d2&page-id=070f0ada-0f65-8077-8008-61d74971d29b
- Components: `Button`, `Card`, `Paper`, `Typography`, `Input`, `Selector`.
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
| `info` | `#3a5683` | neutral actions |
| `emerald` | `#0d9263` | focus rings / highlights |
| `peach` | `#f7dba7` | soft accent |
| `nav-background-on-light` | `#e8e1d3` | light nav background |
| `nav-background-on-dark` | `#2e4649` | dark nav background |

### Typography

| Token | Size | Weight | Usage |
| --- | --- | --- | --- |
| `h1` | 2.5rem | 700 | page title |
| `h2` | 2rem | 800 | section title |
| `h3` | 1.5rem | 700 | card title |
| `h4` | 1.25rem | 700 | sub-section |
| `body` | 1rem | 400 | body text |
| `details` | 0.875rem | 400 | captions, hints, errors |

Font: Tailwind default sans stack.

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
- Penpot: `Button` variant component with properties `Theme` (`onLight`, `onDark`), `action` (`none`, `error`, `warning`, `success`, `info`), `color` (`Default`, `primary`, `secondary`), `size` (`medium`, `small`, `fullWidth`). 24 variants total. `disabled` is a React prop, not yet a Penpot variant.
- Usage:
  - Primary CTA: `Button color="primary" size="medium"`.
  - Destructive: `Button action="error"`.
  - Form submit: `Button color="primary" size="full-width"`.

### Input

- Props: `name`, `value`, `setValue`, `label`, `placeholder`, `error`, `type`, `required`, `disabled`.
- Use for salary, budget names, and amounts.
- Pass `type="number"` for numeric inputs.
- Use the `error` prop for validation messages.
- Penpot: `Input` variant component with property `State` (Default, Error).

### Selector

- Props: `name`, `value`, `onChange`, `options`, `label`, `placeholder`, `error`, `required`.
- Use for fixed/percentage type selection or any short enum.
- Penpot: `Selector` variant component with property `State` (Default, Error).

### Card

- Props: `title`, `content`, `actions`, `className`.
- Fixed size on desktop: `270px` width.
- Use for summary tiles and the result breakdown.

### Paper

- Props: `children`, `isCard`, `className`.
- Use as a generic bordered/shadowed container.
- Apply padding manually via `className` unless `isCard`.

## Dark mode

- Toggle `dark` on the root element.
- Components switch automatically via `dark:` variants.
- Page background: `dark:bg-background-on-dark bg-background-on-light`.

## Validation patterns

- Use `Input` and `Selector` `error` props for field-level errors.
- Use `Typography color="error" size="details"` for inline alert text.
- Percentage sum > 100: show error `Typography` above the list.
- Fixed sum > salary: show warning `Typography`.
- Remaining amount > 0: show info `Typography`.

## Responsive patterns

- Mobile first: default styles target mobile.
- Use `md:` for tablet/desktop adjustments.
- Forms: single column on mobile, max width `md:w-[400px]` centered on desktop.
- Cards: `w-full` on mobile, `md:w-[270px]` on desktop.
- Buttons: `size="full-width"` on mobile, `size="medium"` on desktop if needed.
