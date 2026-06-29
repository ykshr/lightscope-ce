## 2026-06-29 - Hidden Screen Reader Labels for Radix Primitive Scroll Buttons
**Learning:** Radix Primitive `ScrollUpButton` and `ScrollDownButton` in Shadcn UI Select component use `<CaretUpIcon>` and `<CaretDownIcon>` without any text, meaning they lack screen reader accessible names.
**Action:** Always verify icon-only buttons from third-party or primitive libraries, and add an internal `<span className="sr-only">[Action Description]</span>` if no other `aria-label` or accessible name exists.
