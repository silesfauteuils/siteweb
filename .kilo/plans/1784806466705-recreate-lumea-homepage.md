# Plan: Recreate Lumea Homepage in Astro

## Goal
Recreate https://lumea-eco.webflow.io as hardcoded Astro components in `src/components/hardcoded/`. Each `<section>` inside the page's `<section class="sections">` wrapper becomes one `.astro` component. Content is separated from layout via a frontmatter `content` object. Global design tokens are extracted into a Tailwind theme in `src/styles/global.css`.

## Out of Scope
- Hamburger menu, navigation, and any menu-related Lottie/animations are skipped entirely.
- `src/components/hardcoded/` components are static/presentational only; they are **not** registered in Storyblok.

## Theme (`src/styles/global.css`)
Extracted from live Lumea CSS (`lumea-eco.webflow.shared.57ab8de69.min.css`):

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-background: white;
  --color-background-warm: #fbf8f7;
  --color-foreground: #31190b;
  --color-muted: #3b3b3b;
  --color-muted-light: #f0ebea;
  --color-accent: #5869fc;
  --color-accent-secondary: #b3fc6a;
  --font-heading: "Instrument Serif", sans-serif;
  --font-body: "Onest", sans-serif;
}
```

Utility mappings: `text-foreground`, `text-muted`, `text-accent`, `bg-background`, `bg-background-warm`, `font-heading`, `font-body`.

## File Structure
```
src/components/hardcoded/
  hero.astro
  stats.astro
  about.astro
  immersive.astro
  features.astro
  elevated.astro
  amenities.astro
  testimonial.astro
  gallery.astro
  explore.astro
  siteFooter.astro

src/pages/index.astro
```

## Content Object Pattern
Each component receives data via props:

```astro
---
interface Props { content: Content }
const { content } = Astro.props
---
<section>
  <h2>{content.heading}</h2>
  <img src={content.images.main} alt={content.images.mainAlt} />
  <a href={content.buttons.primary.href}>{content.buttons.primary.text}</a>
</section>
```

Shared interfaces: `ContentImage { src, alt }`, `ContentButton { text, href, variant }`, `ContentIcon { src, alt }`.

## Section Inventory (from lumea-eco.webflow.io)
1. **Hero** — headline, subheadline, dual CTAs, scroll indicator, background image
2. **PropertyHighlight** — name, badge stats, main image, specs grid (beds/baths/size/penthouse/price)
3. **Stats** — Year Built, Residences, Apt Sizes (3-column stat grid)
4. **Immersive** — heading, body text, full-width image, 3-column image grid
5. **Features** — heading, side-by-side image + text
6. **InteriorFeatures** — heading, body text, main image, smart-home note
7. **Elevated** — full-width image, heading, body text, CTA
8. **Amenities** — heading, body text, 2-column image with nav badge
9. **Testimonial** — quote text, 5-star rating, author image, name, company
10. **Gallery** — heading, 3-image grid with captions
11. **Explore** — heading, 2 cards (Amenities + Availability/Residences), Neighborhood block with image and CTA
12. **SiteFooter** — logo, nav links, social links, copyright, badge CTAs

## Animation Strategy (GSAP + ScrollTrigger)
No menu/Lottie. Use the existing GSAP + ScrollTrigger + Lenis stack already in `Layout.astro`.

Recreated patterns:
- `fadeInUp` / `fadeInLeft` / `fadeInRight` / `scaleIn` — opacity + transform reveals
- `staggerFadeIn` — same as `fadeInUp` with 0.15s stagger
- `parallax` — `yPercent` tied to scroll progress

Augment each component's `content` interface:
```astro
interface ContentAnimation {
  target?: string
  trigger?: string
  type: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'staggerFadeIn' | 'parallax'
  duration?: number
  start?: string  // e.g. 'top 80%'
}
```

Optional: components may expose `animations?: ContentAnimation[]`.

## Image Strategy
Download essential images to `public/images/lumea/` from the Webflow CDN for a self-contained build. Also add `cdn.prod.website-files.com` to ` Astro.image.remotePatterns` as a fallback.

## Pages
- Create `src/pages/index.astro` to assemble and render all 12 hardcoded sections.
- `src/pages/[...slug].astro` remains unchanged for existing Storyblok pages.

## Implementation Order
1. `src/styles/global.css` — add `@theme` block
2. `astro.config.mjs` — add CDN remote pattern
3. `public/images/lumea/` — download images
4. Rewrite `src/components/hardcoded/hero.astro` — content object + GSAP
5. Create remaining 10 components in `src/components/hardcoded/`
6. Create `src/pages/index.astro`
7. Remove hardcoded `<Hero />` from `src/pages/[...slug].astro` to avoid double-rendering on home route

## Validation
- `src/pages/index.astro` renders all 12 sections without console errors
- GSAP animations trigger on scroll for hero + at least 2 other components
- `npm run build` and `npm run preview` succeed
- No menu/nav/hamburger references remain in the home page
