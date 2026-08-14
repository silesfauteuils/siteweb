# Plan: Contact page with intro section and Resend-powered form

## Context
- `contact.astro` imports non-existent `Title` and `Contact` components and renders an empty section.
- No `src/components/hardcoded/intro.astro` exists.
- No API routes or email service exist.
- Project uses `@astrojs/vercel` adapter.
- **Critical**: `astro.config.mjs` sets `output: env.IS_PREVIEW ? "server" : "static"`. In production (`IS_PREVIEW=false`), the site is built as static, which means API routes under `src/pages/api/` are **not included** in the build output. This would break the form in production.

## Decisions Made

### SSR Output Mode
- **Change `astro.config.mjs` to always use `output: "server"`** when deployed with the Vercel adapter. Vercel natively supports SSR, and the contact form requires a server-side endpoint. The static mode was likely used for SSG pages, but for this site with API routes, SSR is required.

### Form Component Location
- Keep the form **inline in `contact.astro`** rather than creating a separate component. The form is page-specific and doesn't need reuse. This matches the simpler pattern of other pages.

### Instructions Text Rendering
- Use `whitespace-pre-line` CSS on the instructions paragraph to preserve intentional line breaks from the user's text.

### Styling Consistency
- The contact page must visually match the index page conventions used across all sections:
  - Section wrapper: `bg-background` with `py-16 md:py-24` vertical padding
  - Container: `max-w-7xl mx-auto px-6`
  - Two-column layout: `grid grid-cols-1 lg:grid-cols-2 gap-12`
  - Headings: `font-heading text-4xl md:text-5xl text-foreground`
  - Body copy: `text-muted` or `text-foreground` at `text-lg` for readability
  - Form inputs: border `border-foreground/10`, focus ring using accent color, consistent padding and rounded corners matching the site's warm aesthetic
  - Submit button: follow CTA button conventions used on the index page (primary action styling)

### Attachment Handling
- In the API route, read the uploaded file as `ArrayBuffer`, convert to `Buffer`, and pass to Resend's `attachments` array as `{ filename, content }`.

## Changes

### 1. Install dependency
Add `resend` to `package.json` dependencies.

### 2. Update `.env`
Add new keys:
- `RESEND_API_KEY` — Resend API key
- `OWNER_EMAIL` — email address of the site owner (recipient of the form submission)
- `SITE_URL` — site URL for Resend tracking/branding

### 3. Update `astro.config.mjs`
Change:
```js
output: env.IS_PREVIEW ? "server" : "static",
```
to:
```js
output: "server",
```

### 4. Create `src/components/hardcoded/intro.astro`
New component following existing conventions (`content` prop, TypeScript interface, `data-animate` with `opacity-0`, Tailwind classes matching other components).

Props:
```ts
interface Props {
  content: {
    heading: string
    subtitle: string
    animations?: ContentAnimation[]
  }
}
```

Template:
- `<section id="contact-intro" class="py-16 md:py-24 bg-background">`
- `<div class="max-w-7xl mx-auto px-6">`
- `<h1 class="font-heading text-4xl md:text-5xl text-foreground mb-4" data-animate="fadeInUp" data-delay="0">` for heading
- `<p class="text-muted text-lg md:text-xl" data-animate="fadeInUp" data-delay="0.1">` for subtitle
- Initial state: `opacity-0` on both elements, animated by Layout script

### 5. Update `src/pages/contact.astro`
- Remove imports of non-existent `Title` and `Contact` components.
- Import new `Intro` component.
- Render `<Intro>` with:
  - `heading`: "Demander un devis : estimation gratuite sur photo de votre restauration d’assises"
  - `subtitle`: "Votre projet de restauration de siège mérite une attention sur mesure."
- Render a two-column layout:
  ```html
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
    <!-- Left: instructions -->
    <!-- Right: form -->
  </div>
  ```
- **Left column**: `<p class="text-muted whitespace-pre-line">` with the instructions text.
- **Right column**: `<form>` with fields:
  - `nom` (text, required)
  - `prénom` (text, required)
  - `téléphone` (tel)
  - `email` (email, required)
  - `ville de résidence` (text)
  - `message` (textarea, required)
  - `pièce jointe` (file input, accept="image/*,.pdf")
- Submit button: "Envoyer ma demande"
- Client-side JS: intercept submit, build `FormData`, POST to `/api/contact`, show success/error message inline, disable button during submission.

### 6. Create `src/pages/api/contact.ts`
POST-only endpoint.

Logic:
1. Guard: reject non-POST with `new Response(null, { status: 405 })`.
2. Parse `Astro.request.formData()`.
3. Validate required fields (`nom`, `prénom`, `email`, `message`); return 400 with error list if missing.
4. Validate email format with simple regex.
5. Enforce file limits: max 10 MB, allowed types `image/*` and `application/pdf`.
6. Read attachment as base64 if present.
7. Call `resend.emails.send()` with:
   - `from`: `"onboarding@resend.dev"` (Resend's default testing sender)
   - `to`: `[OWNER_EMAIL]`
   - `replyTo`: submitter email
   - `subject`: `"Nouvelle demande de devis – ${nom} ${prénom}"`
   - `text`: formatted body with all form fields
   - `attachments`: `[{ filename: file.name, content: Buffer }]` if file present
8. On success: return `new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } })`.
9. On failure: return `new Response(JSON.stringify({ ok: false, error: message }), { status: 500, headers: { "Content-Type": "application/json" } })`.

### 7. SEO
Keep existing `seo` object in `contact.astro`.

## Validation
- Run `npm run build` to verify no compile errors.
- In preview mode, test the SSR API route by submitting the form locally.
- Verify email delivery with a Resend test send.

## Notes
- `OWNER_EMAIL` and `RESEND_API_KEY` must be configured in Vercel environment variables for production.
- The sender is `onboarding@resend.dev` (Resend's default testing address), so no domain verification is needed for testing. For production, configure a custom verified domain in Resend and update the `from` address accordingly.
- `SITE_URL` is recommended by Resend for tracking and branding.
