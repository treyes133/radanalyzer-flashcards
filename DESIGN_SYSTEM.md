# RadAnalyzer Design System

Use this document as the canonical reference when building or reskinning any RadAnalyzer sub-project (Flashcards, USG Screening, etc.) to ensure visual consistency with the main site.

---

## Brand Identity

- **Company:** RadAnalyzer
- **Tagline:** AI tools for vets, designed by vets
- **Logo:** `/images/logos/radanalyzer-icon.png` (rounded square icon)
- **Favicon:** Same logo, used at 32x32

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Navy** | `#0f1729` | Primary text, dark backgrounds, headers |
| **Teal** | `#2aa8a4` | Primary accent, CTAs, links, highlights |
| **Slate Blue** | `#47556e` | Secondary text, descriptions, muted content |

### Extended Scales

```
Navy Scale:
  50: #f0f2f7   100: #d9dde8   200: #b3bbcf   300: #8d99b7
  400: #67779e   500: #475585   600: #38436a   700: #2a3250
  800: #1b2135   900: #0f1729

Teal Scale:
  50: #edfaf9   100: #d0f2f1   200: #a1e5e3   300: #72d8d4
  400: #43cbc6   500: #2aa8a4   600: #228a87   700: #196c6a
  800: #114e4d   900: #083030

Slate Blue Scale:
  50: #f2f4f7   100: #dde1e9   200: #bbc3d3   300: #99a5bd
  400: #7787a7   500: #5a6d8d   600: #47556e   700: #364054
  800: #252c39   900: #13171f
```

### Semantic Usage

- **Backgrounds:** White (`#ffffff`), `gray-50` (`#f9fafb`), Navy (`#0f1729`)
- **Positive/Success:** `emerald-600` / `emerald-100`
- **Negative/Error:** `red-600` / `red-100`
- **Warning/Pilot:** `amber-700` / `amber-100`
- **Card borders:** `gray-100` or `teal/20` on hover

### CSS Custom Properties

```css
:root {
  --navy: #0f1729;
  --teal: #2aa8a4;
  --slate-blue: #47556e;
}
```

---

## Typography

### Font Stack

```css
font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
```

**Google Fonts import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');
```

### Type Scale

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| H1 (Hero) | `text-4xl sm:text-5xl lg:text-6xl` | 700 (bold) | White (on dark) or Navy |
| H2 (Section) | `text-3xl sm:text-4xl` | 700 (bold) | Navy |
| H3 (Card title) | `text-xl` or `text-2xl` | 700 (bold) | Navy |
| Body | `text-base` or `text-lg` | 400 (regular) | Navy |
| Secondary text | `text-sm` | 400 | Slate Blue |
| Small/Caption | `text-xs` | 500 (medium) | Slate Blue or `gray-400` |
| Badge | `text-xs` | 600 (semibold) | Teal on `teal/10` bg |

---

## Spacing & Layout

```css
/* Section padding */
.section-padding: px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24

/* Container */
.container-max: max-w-7xl mx-auto

/* Common gaps */
Cards grid: gap-8
Form fields: space-y-4
Sections: space-y-16 lg:space-y-24
```

---

## Components

### Buttons

Three button variants, all `rounded-full` with `active:scale-95`:

```css
/* Primary — teal background, white text */
.btn-primary {
  @apply inline-flex items-center justify-center px-6 py-3 rounded-full
         bg-teal text-white font-semibold text-sm
         transition-all duration-300
         hover:bg-teal-600 hover:shadow-lg hover:shadow-teal/20
         active:scale-95;
}

/* Secondary — navy outline, fills on hover */
.btn-secondary {
  @apply inline-flex items-center justify-center px-6 py-3 rounded-full
         border-2 border-navy text-navy font-semibold text-sm
         transition-all duration-300
         hover:bg-navy hover:text-white
         active:scale-95;
}

/* Outline — teal outline, fills on hover */
.btn-outline {
  @apply inline-flex items-center justify-center px-6 py-3 rounded-full
         border-2 border-teal text-teal font-semibold text-sm
         transition-all duration-300
         hover:bg-teal hover:text-white hover:shadow-lg hover:shadow-teal/20
         active:scale-95;
}
```

### Cards

```css
/* Standard card */
bg-white rounded-2xl p-8 shadow-sm border border-gray-100

/* Card with hover lift */
bg-white rounded-2xl p-8 shadow-sm border border-gray-100 card-hover
/* card-hover adds translateY(-4px) on hover with spring easing */

/* Card hover border highlight */
hover:border-teal/20 hover:shadow-xl transition-all duration-300
```

### Form Inputs

```css
/* Text/number input */
w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-navy
focus:outline-none focus:ring-2 focus:ring-teal

/* Range slider */
Styled with teal accent color

/* Select */
Same as text input + bg-white
```

### Badges

```css
/* Teal badge */
inline-block bg-teal/10 text-teal text-xs font-semibold px-3 py-1 rounded-full

/* Status badges (amber for pilot, etc.) */
bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full
```

---

## Backgrounds & Textures

### Hero / Dark Sections

```css
/* Navy gradient hero */
bg-gradient-to-br from-navy via-navy-800 to-navy

/* Radial gradient overlay (subtle teal glow) */
bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]
from-teal/10 via-transparent to-transparent

/* Teal CTA gradient */
bg-gradient-to-br from-teal to-teal-700
```

### Grain Texture

Add to dark sections for subtle texture. Requires `position: relative` on parent and `overflow-hidden`.

```css
.grain::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

### Glow Orbs (decorative)

Floating background elements on dark sections:

```css
/* Small glow */
<div class="absolute top-20 left-10 w-72 h-72 bg-teal/5 rounded-full blur-3xl animate-glow-pulse" />

/* Large glow with delay */
<div class="absolute bottom-10 right-20 w-96 h-96 bg-teal/3 rounded-full blur-3xl animate-glow-pulse"
     style="animation-delay: 1.5s" />
```

---

## Effects & Utilities

### Glow

```css
/* Standard glow */
.glow-teal {
  box-shadow: 0 0 20px rgba(42, 168, 164, 0.15),
              0 0 60px rgba(42, 168, 164, 0.05);
}

/* Large glow */
.glow-teal-lg {
  box-shadow: 0 0 30px rgba(42, 168, 164, 0.2),
              0 0 80px rgba(42, 168, 164, 0.08);
}
```

### Gradient Text

```css
.text-gradient-teal {
  background: linear-gradient(135deg, #2aa8a4 0%, #43cbc6 50%, #72d8d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Animated Underline

For navigation links and footer links:

```css
.animated-underline {
  position: relative;
}
.animated-underline::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #2aa8a4;
  transition: width 0.3s ease;
}
.animated-underline:hover::after {
  width: 100%;
}
```

---

## Animations

### Library

**Framer Motion v11** — used for all scroll-triggered and interaction animations.

```bash
npm install framer-motion@^11
```

### Tailwind Keyframes

Add to `tailwind.config` under `theme.extend`:

```js
keyframes: {
  'gradient-x': {
    '0%, 100%': { 'background-position': '0% 50%' },
    '50%': { 'background-position': '100% 50%' },
  },
  'float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  'glow-pulse': {
    '0%, 100%': { opacity: '0.4' },
    '50%': { opacity: '0.8' },
  },
},
animation: {
  'gradient-x': 'gradient-x 6s ease infinite',
  'float': 'float 6s ease-in-out infinite',
  'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
},
```

### Animation Components

These are the reusable animation wrappers. Copy from `src/components/motion/` or recreate:

#### FadeIn

Scroll-triggered fade with directional offset. Used on section headings, content blocks.

```tsx
<FadeIn direction="up" delay={0.1}>
  <h2>Section Title</h2>
</FadeIn>
```

Props: `direction` (up/down/left/right/none), `delay`, `duration`, `once`, `amount`

- Default easing: `[0.25, 0.4, 0.25, 1]`
- Default offset: 40px
- Default duration: 0.6s
- Triggers at 20% visibility

#### StaggerChildren + StaggerItem

Staggers child elements on scroll. Used for card grids, lists.

```tsx
<StaggerChildren className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
  <StaggerItem><Card /></StaggerItem>
  <StaggerItem><Card /></StaggerItem>
  <StaggerItem><Card /></StaggerItem>
</StaggerChildren>
```

- Default stagger: 0.1s between items
- Child animation: fade up 30px over 0.5s

#### AnimatedText

Word-by-word text reveal for hero headings.

```tsx
<AnimatedText
  text="AI tools for vets, designed by vets"
  as="h1"
  className="text-5xl font-bold text-white"
/>
```

- 0.06s delay between words
- Each word fades up 20px over 0.4s

#### CountUp

Animated number counter triggered on scroll.

```tsx
<CountUp target={20} suffix="s" prefix="<" />
```

#### ParallaxImage

Subtle parallax scroll on images.

```tsx
<ParallaxImage src="/hero.jpg" alt="Hero" speed={0.15} priority />
```

### Interaction Patterns

#### Button Hover/Tap

```tsx
<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  <button className="btn-primary">Click me</button>
</motion.div>
```

#### Card Hover Lift

CSS-based (no JS needed):

```css
.card-hover {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
}
```

#### Icon Glow on Hover

```html
<div class="group">
  <div class="w-14 h-14 bg-teal/10 rounded-xl group-hover:bg-teal/20 group-hover:glow-teal transition-all">
    <!-- icon -->
  </div>
</div>
```

#### Modal Enter/Exit

```tsx
<AnimatePresence>
  {visible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

#### Banner Slide-Up

```tsx
<AnimatePresence>
  {visible && (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {/* banner content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Header Scroll Behavior

Header transitions from transparent to frosted glass on scroll:

```tsx
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 20);
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Classes:
// Not scrolled: bg-white/60 backdrop-blur-sm
// Scrolled:     bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100
```

---

## Page Structure Conventions

### Hero Section (dark)

```
section.relative.bg-gradient-to-br.from-navy.via-navy-800.to-navy.overflow-hidden.grain
  div.absolute (radial gradient overlay)
  div.absolute (glow orb 1, animate-glow-pulse)
  div.absolute (glow orb 2, animate-glow-pulse, delayed)
  div.container-max.section-padding.relative
    content...
```

### Content Section (light)

```
section.section-padding(.bg-gray-50 for alternating)
  div.container-max
    FadeIn > heading
    FadeIn > subtitle
    StaggerChildren > grid of StaggerItem > cards
```

### CTA Section (teal gradient)

```
section.section-padding.bg-gradient-to-br.from-teal.to-teal-700.relative.overflow-hidden
  div.absolute.inset-0.grain
  div.absolute (blur orb)
  div.container-max.text-center.relative
    FadeIn > heading
    FadeIn > description
    FadeIn > buttons with motion.div hover/tap
```

---

## Responsive Breakpoints

Follow Tailwind defaults:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Mobile-first approach: base styles for mobile, override with `sm:`, `md:`, `lg:`.

---

## Accessibility

- All interactive elements have `aria-label` where text isn't visible
- Tab navigation: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- Reduced motion: Framer Motion respects `prefers-reduced-motion` by default
- Focus states: `focus:outline-none focus:ring-2 focus:ring-teal` on inputs
- Color contrast: Navy on white and white on navy both pass WCAG AA
