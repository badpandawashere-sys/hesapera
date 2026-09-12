---
name: Hesapera Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006243'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d57'
  on-tertiary-container: '#bdffdc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  numeric-display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  numeric-result:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  space-4xl: 6rem
  container-max: 1440px
  gutter-desktop: 1.5rem
  gutter-mobile: 1rem
---

## Brand & Style

This design system embodies the rigor of modern financial engineering combined with the immediate clarity of high-performance utility tools. It bridges computational authority and frictionless usability. The emotional tone is deliberate, objective, and deeply trustworthy—evoking the surgical precision of quantitative interfaces alongside the approachability of top-tier modern web software.

The visual direction follows a **Corporate / Modern Precision** philosophy:
- **Structural Integrity**: Uncompromising grid discipline, razor-sharp edge alignment, and intentional whitespace establish instant credibility.
- **Cognitive Clarity**: High typographic contrast ensures complex mathematical formulas, financial inputs, and computed outputs are parsed instantaneously without cognitive drag.
- **Refined Tactility**: Interactive elements leverage micro-transitions, subtle focus rings, and soft depth cues, delivering tactile responsiveness without visual clutter.

## Colors

The palette is engineered for prolonged analytical work, featuring crisp tonal surfaces, authoritative darks, and high-clarity functional accents.

- **Primary Interactive Accent (`#2563EB`)**: Royal precision blue driving focus states, call-to-action triggers, active calculator modes, and dynamic data visualizations.
- **Secondary Corporate Brand (`#0F172A`)**: Deep midnight slate anchoring structural headers, primary text, prominent icon anchors, and high-emphasis display states.
- **Tertiary Status Accent (`#059669`)**: Subtle emerald dedicated to calculation results, positive delta indicators, solved states, and verification indicators.
- **Neutral Core (`#64748B`)**: Balanced slate delivering accessible secondary descriptions, input metadata, parameter units, and structural divider outlines.

### Surface Architecture
- **App Canvas**: `#F8FAFC` to `#F9FBFC` for an ultra-clean, glare-reducing architectural plane.
- **Card Surface**: Pure `#FFFFFF` layered against the canvas to create clear computational cards.
- **Structural Borders**: `#E2E8F0` applied at thin weights for crisp definition.
- **Muted Backdrops**: `#F1F5F9` for read-only outputs, hotkey badges, and unselected pill chips.

## Typography

The typographic hierarchy pairs the geometric clarity of **Plus Jakarta Sans** for structural headers with the neutral readability of **Inter** for calculations, data density, and inputs.

- **Tabular Numerals**: All numerical computation readouts, metric deltas, currency symbols, and real-time input fields must enforce `font-variant-numeric: tabular-nums lining-nums`. This prevents layout shifts during active user input.
- **Hierarchy Scaling**: Hero and calculation headers utilize tight, negative letter spacing to project authority, while metadata labels, unit tags, and hotkey combinations use expanded tracking with uppercase transformations for scannability.

## Layout & Spacing

This design system uses an **8px linear scale** tailored for high-density financial layouts and uncluttered utility discovery.

### Grid Architecture
- **Desktop (1440px target)**: 12-column symmetrical layout centered within a max-width container of 1440px. Gutters are fixed at 24px (`1.5rem`) with responsive page margins of 48px to 64px (`3rem` to `4rem`).
- **Tablet (768px – 1024px)**: 8-column layout with 20px gutters and 32px margins. Calculator views transition into unified two-column flows (Inputs on left, Output sticky on right).
- **Mobile (< 768px)**: 4-column fluid layout with 16px (`1rem`) gutters and 16px outer safety margins. Output panels collapse beneath input parameters as sticky bottom action sheets.

### Spatial Discipline
- **Micro Spacing (`0.25rem` – `0.75rem`)**: Applied to tag chips, hotkey icons, input unit badges, and internal card headers.
- **Macro Spacing (`1.5rem` – `3rem`)**: Applied to card interior padding, tool category sections, and dashboard widget groupings.

## Elevation & Depth

Visual hierarchy is maintained through subtle, cool-toned ambient shadows and delicate low-contrast outlines rather than heavy physical drop shadows.

- **Level 0 (Flat Canvas)**: `#F8FAFC` base level without shadow.
- **Level 1 (Resting Cards & Inputs)**: `#FFFFFF` card surface wrapped in a 1px solid border (`#E2E8F0`), accompanied by an ultra-diffused shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Card Hover & Dropdowns)**: Interactive cards elevate on hover with a smooth 150ms transition, dropping a deeper blue-tinted shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`, with the border tinting to `#CBD5E1`.
- **Level 3 (Sticky Computation Bars & Modals)**: Floated navigation and active computation summaries utilize: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The design system employs a **Rounded (`2`)** shape language, balancing corporate precision with modern digital accessibility.

- **Base Radius (8px / `0.5rem`)**: Standard for computational form inputs, action buttons, dropdown panels, and utility chips.
- **Large Radius (16px / `1rem`)**: Applied to primary content cards, calculator interface containers, and search popovers.
- **Extra-Large Radius (24px / `1.5rem`)**: Reserved for primary featured comparison cards and modal containers.
- **Full Radius (Pill)**: Exclusively allocated to keyboard shortcut tags (`⌘K`), quick-filter category chips, and calculation status badges.

## Components

### Buttons
- **Primary**: Background `#2563EB`, text `#FFFFFF`, font weight 600. On hover, background shifts to `#1D4ED8`. Subtle inward box-shadow for a clean click state.
- **Secondary / Outline**: Background `#FFFFFF`, 1px border `#E2E8F0`, text `#0F172A`. On hover, background shifts to `#F8FAFC` with border `#CBD5E1`.
- **Ghost**: Background transparent, text `#64748B`. On hover, text shifts to `#0F172A` with background `#F1F5F9`.

### Form Inputs & Fields
- **Container**: Crisp `#FFFFFF` surface with a 1px border `#E2E8F0`. 44px min-height for clean desktop and touch interaction.
- **Typography**: Inter Regular 15px with tabular numbers. Labels placed above with `label-md` in `#0F172A` and muted `#64748B` descriptor text.
- **Active / Focus**: Ring of 2px `#2563EB` offset by 2px white outline. Border shifts directly to `#2563EB`.
- **Unit Affixes**: Monospaced/tabular unit indicators (e.g., `$`, `€`, `%`, `mo`) anchored on the right in `#64748B` with a subtle divider.

### Search Input & Quick Pill Tags
- **Command Search Bar**: Large (48px height) `#FFFFFF` surface with search icon in `#64748B`, hotkey indicator (`⌘K` or `Ctrl+K`) enclosed in a pill badge with `#F1F5F9` fill and `#CBD5E1` border.
- **Filter Pills**: Flexible horizontal row. Unselected pills feature `#F1F5F9` background, `#64748B` text, and zero border. Selected state turns `#0F172A` with `#FFFFFF` text.

### Calculator & Category Cards
- **Standard Calculator Card**: Pure `#FFFFFF` surface, Level 1 elevation, 16px internal padding. Features a category micro-badge, concise title, brief description, and a subtle directional arrow cue (`→`) that translates 4px to the right on card hover.
- **Featured / Premium Calculator Card**: Highlighted with an ultra-thin top border accent in `#2563EB`. Accompanied by inline preview parameter sliders or default preset toggles.
- **Category Micro-Cards**: Compact structural boxes featuring a 36px icon container with a 10% opacity tint of `#2563EB`, paired with title and count metadata.

### Results & Data Indicators
- **Positive / Result Display**: Clean container filled with `#F0FDF4`, 1px border in `#BBF7D0`, displaying outputs with `numeric-result` typography in `#059669`.
- **Checkboxes & Radios**: Standard 18px square/circle with 1.5px border `#CBD5E1`. On check, `#2563EB` fill with clean white interior icon.