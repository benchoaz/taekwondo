---
name: Apex Discipline
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#5e3f3a'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#936e68'
  outline-variant: '#e9bcb5'
  surface-tint: '#c00500'
  primary: '#b30400'
  on-primary: '#ffffff'
  primary-container: '#e10600'
  on-primary-container: '#fff2f0'
  inverse-primary: '#ffb4a8'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#705d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a900'
  on-tertiary-container: '#4c3f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410100'
  on-primary-fixed-variant: '#930300'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffe16d'
  tertiary-fixed-dim: '#e9c400'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#544600'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Poppins
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Poppins
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style

The design system embodies the "Elite Martial Artist" persona: disciplined, powerful, and technologically advanced. It targets high-performance athletes and premium academy members who value tradition fused with modern excellence. 

The aesthetic is **Modern 2026 Glassmorphism**, characterized by hyper-refined frosted surfaces, vibrant background accents, and high-energy motion. It avoids the "static" feel of traditional sports sites by utilizing depth, light-refraction effects, and fluid transitions that mimic the explosive yet controlled movements of Taekwondo. The emotional response is one of aspiration, precision, and prestige.

## Colors

The palette is rooted in the "Taekwondo Red" (#E10600), representing energy and passion. This is balanced by "Dark Navy" (#0F172A), which provides a foundation of professional authority and depth. "Gold" (#FFD700) is reserved for achievement, premium status, and accentuation.

**Color Application:**
- **Primary Red:** Used for critical calls to action, active states, and brand-heavy motifs.
- **Dark Navy:** Primary text, deep backgrounds, and structural hierarchy.
- **Gold:** Badges, achievement icons, and "Elite" tier UI elements.
- **Surface:** The background uses #F8FAFC, but interactive containers utilize semi-transparent glass layers to maintain a sense of lightness and depth.

## Typography

The typography strategy pairs the geometric strength of **Poppins** with the surgical clarity of **Inter**. 

- **Headlines:** Set in Poppins Bold/ExtraBold. Use tight tracking for display sizes to create an "impactful" look similar to athletic editorial layouts.
- **Body:** Inter provides maximum legibility for technical instructions and curriculum details.
- **Labels:** Small caps and increased letter spacing are used for metadata and category tags to emphasize the premium, organized nature of the platform.

## Layout & Spacing

This design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The spacing philosophy is "Airy & Athletic," using generous vertical margins to prevent the UI from feeling cluttered.

- **Breakpoints:** Mobile (under 640px), Tablet (640px-1024px), Desktop (1024px+).
- **Rhythm:** All spacing is based on a 4px baseline, with components typically using 16px (stack-md) or 24px internal padding.
- **Containers:** Content is housed in 1280px max-width containers centered on the screen, ensuring readability on ultra-wide monitors.

## Elevation & Depth

The design system uses a multi-layered depth model to create its premium feel:

1.  **The Canvas:** #F8FAFC with subtle mesh gradients in the corners (Primary Red and Secondary Navy at 5% opacity).
2.  **The Glass Layer:** Cards and panels use `backdrop-filter: blur(20px)` and a white 70% opacity fill.
3.  **Shadows:** Shadows are "Soft-Atmospheric." Instead of black, they use a tinted Navy (#0F172A) at very low opacity (5-8%) with a large spread (30px-40px).
4.  **The Border:** Elements are defined by a 1px "Inner Glow" stroke—a white semi-transparent border that simulates the edge of a glass pane.

## Shapes

The shape language is defined by large, friendly, yet structured radii.

- **Cards:** Fixed at **20px** to provide a modern, high-end tech aesthetic.
- **Buttons:** Slightly sharper at **12px** to imply more "precision" and "action."
- **Inputs:** Match the button radius for consistency.
- **Decorative Elements:** Use perfectly circular shapes for avatars and floating achievement badges to contrast the rectangular grid.

## Components

### Buttons
- **Primary:** Gradient fill (Red to Dark Red), white text, subtle "hover lift" animation.
- **Secondary:** Glass background with a Navy 1px border and Navy text.
- **Ghost:** No background, Red text, becomes semi-opaque Red on hover.

### Cards
- **Premium Card:** 20px radius, glassmorphism background, 1px white inner stroke, and a "Soft-Atmospheric" shadow. On hover, the card should scale slightly (1.02x) and the shadow intensity should increase.

### Inputs & Form Fields
- Fields use a solid white background to ensure text contrast, but maintain the 12px corner radius. Focus states use a 2px Red ring with a soft glow effect.

### Chips & Badges
- Used for "Belt Level" or "Course Category." Use high-contrast combinations (e.g., Black Belt = Navy background / White text; Gold Tier = Gold background / Navy text).

### Animations (Framer Motion Guidance)
- **Entrance:** Staggered "Fade-in Slide-up" (y: 20 -> 0) for list items.
- **Transitions:** Use "Spring" physics (stiffness: 300, damping: 30) for a snappy, high-performance feel.
- **Interactions:** Tap/Click states should provide immediate haptic-style visual feedback (scale: 0.98).

### Progress Indicators
- Linear progress bars for "Curriculum Completion" use a dual-tone Red gradient with a glowing tip to simulate energy and momentum.