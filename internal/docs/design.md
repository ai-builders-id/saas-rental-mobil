# Design System — Aplikasi Tracking Mobil Rental

## Based on Nuxt UI 4 + Tailwind CSS v4

---

## 1. Design Philosophy

- **Professional & Trustworthy** — Clean, organized, data-rich interfaces
- **Mobile-First** — Owner accesses dashboard from phone
- **Data-Dense** — Fleet status, revenue, utilization at a glance
- **Dark Mode Ready** — Reduce eye strain for long operational hours
- **Indonesian Context** — Warm, approachable color palette

---

## 2. Brand Colors

### Primary Palette

| Token | Hex (Light) | Hex (Dark) | Usage |
|-------|-------------|------------|-------|
| `primary-50` | `#EFF6FF` | `#172554` | Background |
| `primary-100` | `#DBEAFE` | `#1E3A5F` | Hover background |
| `primary-200` | `#BFDBFE` | `#264D7A` | Selected background |
| `primary-300` | `#93C5FD` | `#31689E` | Border |
| `primary-400` | `#60A5FA` | `#3B82F6` | Active |
| **`primary-500`** | **`#3B82F6`** | **`#60A5FA`** | **Main brand color** |
| `primary-600` | `#2563EB` | `#93C5FD` | Hover |
| `primary-700` | `#1D4ED8` | `#BFDBFE` | Active |
| `primary-800` | `#1E40AF` | `#DBEAFE` | Text on color |
| `primary-900` | `#1E3A8A` | `#EFF6FF` | Text on color |

### Semantic Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| **success** | `#16A34A` | `#22C55E` | Available vehicle, payment success |
| **warning** | `#F59E0B` | `#FBBF24` | Maintenance due, pending payment |
| **error** | `#DC2626` | `#EF4444` | Overdue, vehicle stolen |
| **info** | `#3B82F6` | `#60A5FA` | General information |
| **neutral** | slate | slate | Text, borders, backgrounds |

### Fleet Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| AVAILABLE | success | `#16A34A` |
| BOOKED | info | `#3B82F6` |
| ON_RENT | warning | `#F59E0B` |
| MAINTENANCE | error | `#DC2626` |
| INSPECTION | neutral-400 | `#9CA3AF` |

---

## 3. Typography

### Font Family
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 0.75rem | 1rem | 400 | Labels, metadata |
| `text-sm` | 0.875rem | 1.25rem | 400 | Body small, table cells |
| `text-base` | 1rem | 1.5rem | 400 | Body text |
| `text-lg` | 1.125rem | 1.75rem | 500 | Lead text |
| `text-xl` | 1.25rem | 1.75rem | 600 | Small headings |
| `text-2xl` | 1.5rem | 2rem | 700 | Section headings |
| `text-3xl` | 1.875rem | 2.25rem | 700 | Page headings |

---

## 4. Spacing & Layout

### Grid System
- Container: `max-w-7xl` (80rem)
- Sidebar: 64px (collapsed), 256px (expanded)
- Content: flexible remainder
- Gap: `gap-4` (16px) default, `gap-6` (24px) for sections

### Card System
```css
--ui-radius: 0.5rem;  /* 8px rounded corners */
```

Card anatomy:
```
┌─────────────────────────────┐
│           Header            │  padding: p-4
├─────────────────────────────┤
│                             │
│          Content            │  padding: p-4
│                             │
├─────────────────────────────┤
│          Footer             │  padding: p-4, border-t
└─────────────────────────────┘
```

---

## 5. Component Patterns

### Dashboard Layout
```
┌──────┬─────────────────────────────────────┐
│      │            Top Bar                   │
│ Side │  Breadcrumb | Search | Notif | User  │
│ Bar  ├─────────────────────────────────────┤
│      │                                     │
│      │          Page Content                │
│      │  ┌──────┐ ┌──────┐ ┌──────┐        │
│      │  │ Card │ │ Card │ │ Card │        │
│      │  └──────┘ └──────┘ └──────┘        │
│      │  ┌──────────────────────────┐      │
│      │  │                          │      │
│      │  │    Table / Chart         │      │
│      │  │                          │      │
│      │  └──────────────────────────┘      │
│      │                                     │
└──────┴─────────────────────────────────────┘
```

### Navigation
- **Sidebar:** Primary navigation — collapsible, icons + labels
- **Top bar:** Contextual actions, search, user menu
- **Breadcrumb:** Page hierarchy (auto-generated from route)

### Data Tables
- Sortable columns
- Pagination (25, 50, 100 per page)
- Row actions dropdown
- Bulk select
- Search/filter per column
- Status badges with semantic colors

### Form Elements
- Labels above inputs (stacked layout)
- Inline validation on blur
- Submit button: full-width on mobile, auto-width on desktop
- File upload: drag & drop zone

---

## 6. Dark Mode

### Implementation
- `@nuxtjs/color-mode` (bundled with Nuxt UI 4)
- `.dark` class toggle on `<html>`
- Persisted in localStorage
- Options: Light | Dark | System

### Color Adjustments
- Background: white → neutral-900
- Cards: neutral-50 → neutral-800
- Text: neutral-900 → neutral-100
- Borders: neutral-200 → neutral-700
- Shadows: reduced opacity in dark mode

---

## 7. Responsive Breakpoints

| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Large screens |

### Sidebar Behavior
- Mobile (< md): Hidden, hamburger toggle, overlay
- Desktop: Always visible, collapsible via toggle

---

## 8. Design Token Implementation

### CSS Variables in `app/assets/css/main.css`
```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

@theme {
  --color-fleet-available: #16A34A;
  --color-fleet-booked: #3B82F6;
  --color-fleet-rented: #F59E0B;
  --color-fleet-maintenance: #DC2626;
  --color-fleet-inspection: #9CA3AF;
}

:root {
  --ui-radius: 0.5rem;
}
```

### Runtime Config in `app/app.config.ts`
```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate',
    },
  },
})
```
