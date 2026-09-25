// @ts-check
// TODO View .env
import { defineConfig } from 'astro/config';
import { loadEnv } from "vite";

import { storyblok } from '@storyblok/astro';
import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';
import favicons from 'astro-favicons'; //TODO Change favicon.svg in public/


import tailwindcss from "@tailwindcss/vite";


const env = loadEnv('', process.cwd(), '');

// Env vars are strings — "false" is truthy, so compare explicitly.
// Vercel dashboard vars come via process.env, local dev via .env file.
const IS_PREVIEW = (process.env.IS_PREVIEW ?? env.IS_PREVIEW ?? "true") === "true";

// https://astro.build/config
export default defineConfig({
  //TODO Change url
  site: 'https://www.exemple.fr',

  // Preview (Storyblok visual editor + draft content) needs SSR.
  // Production (published content) is fully static, except /api/* routes.
  output: IS_PREVIEW ? "server" : "static",

  integrations: [storyblok({
      accessToken: env.STORYBLOK_DELIVERY_API_TOKEN,
      apiOptions: {
        region: 'eu',
      },
      components: {
        page: "components/storyblok/Page",
        hero: "components/storyblok/Hero",
        features: "components/storyblok/Features",
        stats: "components/storyblok/Stats",
        gallery: "components/storyblok/Gallery",
        cta: "components/storyblok/Cta",
        faq: "components/storyblok/Faq",
        process: "components/storyblok/Process",
        philosophy: "components/storyblok/Philosophy",
        showcase: "components/storyblok/Showcase",
        immersive: "components/storyblok/Immersive",
        elevated: "components/storyblok/Elevated",
        amenities: "components/storyblok/Amenities",
        testimonial: "components/storyblok/Testimonial",
        explore: "components/storyblok/Explore",
        intro: "components/storyblok/Intro",
        contact_form: "components/storyblok/ContactForm",
        contact_gallery: "components/storyblok/ContactGallery",
        site_footer: "components/storyblok/SiteFooter",
        about: "components/storyblok/About",
      },
      enableFallbackComponent: true,
      customFallbackComponent: "components/storyblok/Fallback",
      bridge: true,
    }),sitemap(), favicons()],

  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: true,
    imagesConfig: {
      minimumCacheTTL: 86400,
      // NOTE: Astro <Image> `widths` must match these sizes exactly —
      // the Vercel adapter drops any other width (single-entry srcset).
      sizes: [48, 96, 256, 300, 720, 1080, 1560, 1920, 2560],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "a.storyblok.com",
          pathname: `/f/${env.STORYBLOK_SPACE_ID}/**`,
        },
        {
          protocol: "https",
          hostname: "cdn.prod.website-files.com",
          pathname: "/**",
        },
      ],
    },
  }),

  image: {
    // Default image service (sharp) — required for <Image> optimization.
    // Remote Storyblok/Webflow images are allowed below and optimized
    // at build time (static) or via Vercel Image Optimization (server).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
        pathname: `/f/${env.STORYBLOK_SPACE_ID}/**`,
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
        pathname: "/**",
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});