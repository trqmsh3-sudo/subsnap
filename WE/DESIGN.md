# Design System Document: The Nocturnal Curator

This design system is a bespoke framework crafted for a high-end, editorial subscription management experience. It departs from the clinical rigidity of standard financial apps, opting instead for a "Nocturnal Curator" aesthetic—a sophisticated, softened dark theme that feels more like a luxury concierge than a spreadsheet.

## 1. Overview & Creative North Star
**Creative North Star: The Nocturnal Curator**
The vision for this design system is to transform mundane financial tracking into a calm, rhythmic experience. We achieve "High-End Editorial" status by prioritizing intentional asymmetry, generous whitespace, and a departure from standard structural lines. We do not use boxes to contain content; we use light and depth to cradle it. 

The layout should feel "curated"—utilizing overlapping elements and a dramatic typographic scale to guide the eye through the subscription lifecycle with authoritative grace.

## 2. Colors & Tonal Architecture
The palette is rooted in deep slates and electric soft cyans, creating a secure yet modern environment.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning or containment. Boundaries must be defined through:
1.  **Background Color Shifts:** Placing a `surface-container-low` element against a `surface` background.
2.  **Tonal Transitions:** Using subtle shifts in the surface-container tiers to imply a beginning and an end.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials. 
*   **Base:** `surface` (#0b1326) – The canvas.
*   **Sections:** `surface-container-low` (#131b2e) – Broad content groupings.
*   **Elements:** `surface-container-high` (#222a3e) – Interaction points and cards.
*   **Nesting:** To create "inner depth," place a `surface-container-lowest` (#060d20) element inside a `surface-container` to create a "recessed" well for data or secondary inputs.

### The "Glass & Gradient" Rule
To elevate the experience above "generic dark mode," apply Glassmorphism to floating elements (Navigation bars, Action sheets).
*   **Backdrop Blur:** 12px to 20px.
*   **Color:** `surface_variant` (#2d3449) at 60% opacity.
*   **Signature Textures:** Use a subtle linear gradient for primary CTAs: `primary` (#69ffe9) to `primary_container` (#44e2cd) at a 135-degree angle. This provides a "glow" that flat colors cannot replicate.

## 3. Typography: The Editorial Voice
We use **Inter** exclusively, relying on its neutral weight to provide a sense of security while using scale to provide personality.

*   **Display Scale:** Use `display-lg` (3.5rem) and `display-md` (2.75rem) for total spend or high-level insights. These should have a slight negative letter-spacing (-0.02em) to feel "tight" and premium.
*   **The Contrast Principle:** Pair `headline-sm` (1.5rem) with `label-md` (0.75rem) in uppercase with wide letter-spacing (+0.1em). This contrast between large, heavy titles and tiny, spaced-out labels creates the high-fashion editorial look.
*   **Functional Body:** `body-md` (0.875rem) is the workhorse for subscription details, ensuring high legibility against the deep slate backgrounds.

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders are replaced by a layering principle that mimics natural ambient light.

*   **Layering Principle:** Stacking tiers creates organic lift. A card should be `surface-container-highest` sitting on a `surface-container-low` section. No shadow is needed; the shift in luminosity is the cue.
*   **Ambient Shadows:** For floating elements (Modals, FABs), use a diffused, tinted shadow.
    *   **Blur:** 24px - 40px.
    *   **Color:** Use `on_background` (#dbe2fd) at 6% opacity. This creates a "glow" rather than a "drop shadow," making the element feel light.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-glare environments), use the **Ghost Border**: `outline-variant` (#3c4a47) at **15% opacity**. Never use a 100% opaque border.

## 5. Components
### Buttons
*   **Primary:** Rounded `full`. Gradient fill (`primary` to `primary_container`). Text color: `on_primary` (#003731).
*   **Secondary:** Rounded `full`. Surface: `secondary_container` (#534070). No border.
*   **Tertiary:** No background. Text color: `primary`. 

### Input Fields
Avoid the "boxed-in" look.
*   **Style:** Use a `surface-container-high` background with a `xl` (1.5rem) rounded corner.
*   **Focus:** Transition the background to `surface-container-highest` and add a "Ghost Border" of 20% `primary`.

### Cards & Lists
*   **Forbid Dividers:** Do not use lines to separate list items. Use 16px - 24px of vertical whitespace or alternating `surface-container` tiers.
*   **Subscription Card:** A `surface-container-high` card with an `xl` corner radius. Use `secondary_fixed_dim` (#d4bcf5) for icon accents to provide a "soft" feel.

### Specialized App Components
*   **The "Spending Pulse":** A custom progress bar using `primary` for the fill and `surface-container-highest` for the track. Add a soft outer glow to the fill using a 4px blur of the `primary` color.
*   **The "Subscription Chip":** Small, glassmorphic chips for status (Active, Paused, Trial). Use `tertiary_container` (#b7cdf1) with 40% opacity and a backdrop blur.

## 6. Do's and Don'ts

### Do:
*   **Do** embrace negative space. If a screen feels crowded, increase the spacing between tiers.
*   **Do** use asymmetrical layouts for dashboards. A large "Total Spend" display on the left with a smaller "Next Due" on the right creates visual interest.
*   **Do** use the `secondary` (#d4bcf5) lavender tones for "friendly" touchpoints like trial reminders or help text.

### Don't:
*   **Don't** use pure black (#000000). Always use `surface` (#0b1326) to maintain the "softened" dark theme.
*   **Don't** use aggressive reds for errors. Use the `error` (#ffb4ab) token, which is a desaturated, professional coral that signals caution without inducing panic.
*   **Don't** use 1px dividers. If you need to separate content, use a 4px-8px "gap" or a shift in surface color.