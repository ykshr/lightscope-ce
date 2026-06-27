# shadcn/ui Component Update Report

This report documents the status of shadcn/ui components evaluated for an update to the latest version. Our primary goal is maintaining safety, API consistency, styling, accessibility, and visual stability while retaining local project customizations.

## Updated Components

The following components were safely updated. The updates primarily involved the addition of `"use client"` directives or safe HTML `data-*` attributes without modifying actual styling, logic, or markup structure.

* **input-group.tsx**: Safe update applied (added `"use client"`).
* **label.tsx**: Safe update applied (added `"use client"`).
* **separator.tsx**: Safe update applied (added `"use client"`).
* **sheet.tsx**: Safe update applied (added `"use client"`).
* **spinner.tsx**: Safe update applied (added `data-slot="spinner"`, retained `role` and `aria-label`).
* **tabs.tsx**: Safe update applied (added safe attribute-based spacing utilities for icons).

**Risk Assessment:** Low

## Skipped Components

The following components were explicitly skipped either because they had no updates or the upstream changes conflicted with local customizations, visual formatting, or memory guardrails.

### Components with no updates available:
* accordion.tsx
* avatar.tsx
* badge.tsx
* button-group.tsx
* button.tsx
* command.tsx
* dropdown-menu.tsx
* input.tsx
* pagination.tsx
* scroll-area.tsx
* select.tsx
* skeleton.tsx
* textarea.tsx

### Components with skipped updates:

#### Component: calendar.tsx
* **Status**: Skipped
* **Reason**: Local customizations detected & Behavioral changes detected.
* **Changes**: Upstream transitioned to `react-day-picker` v10 APIs. This change breaks local integrations utilizing `react-day-picker` v8/v9, custom styling arrays (`table` instead of `month_grid`), and usage of `@phosphor-icons/react` components.
* **Risk Assessment**: High

#### Component: card.tsx
* **Status**: Skipped
* **Reason**: Visual/layout changes detected.
* **Changes**: Upstream replaced hardcoded padding values (`p-4` to `p-(--card-spacing)`) using a CSS variable system that would drastically change margins/layouts if the application isn't completely structured for these variables.
* **Risk Assessment**: Medium

#### Component: chart.tsx
* **Status**: Skipped
* **Reason**: Local customizations detected.
* **Changes**: The local repository includes `sanitizeCSSIdentifier` and `sanitizeCSSValue` methods to mitigate XSS vulnerabilities. Upstream removed these sanitization functions. Skipping to strictly adhere to security instructions.
* **Risk Assessment**: High

#### Component: dialog.tsx
* **Status**: Skipped
* **Reason**: Visual/layout changes detected.
* **Changes**: Upstream removed `font-heading` from the `DialogTitle`, changing typography layout globally.
* **Risk Assessment**: Low

#### Component: drawer.tsx
* **Status**: Skipped
* **Reason**: Visual/layout changes detected.
* **Changes**: Upstream removed `font-heading` from the `DrawerTitle`.
* **Risk Assessment**: Low

#### Component: field.tsx
* **Status**: Skipped
* **Reason**: Visual/layout changes detected.
* **Changes**: Upstream removed the `leading-snug` utility class from the Label, modifying line height sizing globally.
* **Risk Assessment**: Low

#### Component: popover.tsx
* **Status**: Skipped
* **Reason**: Visual/layout changes detected.
* **Changes**: Upstream removed `font-heading` from the `PopoverTitle`.
* **Risk Assessment**: Low

#### Component: sidebar.tsx
* **Status**: Skipped
* **Reason**: Local customizations detected.
* **Changes**: Upstream removed `data-testid="sidebar-trigger"` locally used for testing. Upstream also changed how sidebar-border colors are applied from `hsl(var(--sidebar-border))` to `var(--sidebar-border)`.
* **Risk Assessment**: Medium

#### Component: table.tsx
* **Status**: Skipped
* **Reason**: Local customizations detected.
* **Changes**: The repository utilizes testing IDs such as `data-testid="ranking-table"` and `data-testid="ranking-table-row"`. Upstream removes these identifiers.
* **Risk Assessment**: Medium

#### Component: tooltip.tsx
* **Status**: Skipped
* **Reason**: Behavioral changes detected.
* **Changes**: Upstream removed the `"use client"` directive.
* **Risk Assessment**: Medium
