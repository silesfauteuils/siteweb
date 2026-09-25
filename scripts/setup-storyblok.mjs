#!/usr/bin/env node

/**
 * Storyblok Setup Script
 * Creates component schemas and initial content entries via the Management API.
 *
 * Usage: node scripts/setup-storyblok.mjs
 */

import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const content = JSON.parse(readFileSync(join(__dirname, "storyblok-content.json"), "utf8"))

const SPACE_ID = "295373470112198"
const TOKEN = process.env.STORYBLOK_PERSONAL_ACCESS_TOKEN
const BASE_URL = "https://api.storyblok.com/v1"

if (!TOKEN) {
  console.error("Error: STORYBLOK_PERSONAL_ACCESS_TOKEN environment variable is required")
  process.exit(1)
}

const headers = {
  Authorization: TOKEN,
  "Content-Type": "application/json"
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function apiRequest(method, path, body = null) {
  await delay(250) // Stay under 6 req/sec
  const url = `${BASE_URL}/spaces/${SPACE_ID}/${path}`
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(url, options)
  const data = await res.json()

  if (!res.ok) {
    console.error(`API Error [${res.status}] ${path}:`, JSON.stringify(data, null, 2))
    throw new Error(`API request failed: ${res.status}`)
  }
  return data
}

// ─── Component Definitions ───────────────────────────────────────────────────

const components = [
  // ── Section Components ──
  {
    name: "hero",
    display_name: "Hero",
    is_nestable: true,
    is_root: false,
    schema: {
      badge: { type: "text" },
      heading: { type: "text" },
      subtitle: { type: "text" },
      info: { type: "richtext" },
      image: { type: "asset" },
      primary_button_text: { type: "text" },
      primary_button_link: { type: "link" },
      secondary_button_text: { type: "text" },
      secondary_button_link: { type: "text" },
    }
  },
  {
    name: "features",
    display_name: "Features",
    is_nestable: true,
    is_root: false,
    schema: {
      subtitle: { type: "text" },
      heading: { type: "text" },
      image: { type: "asset" },
      body: { type: "richtext" },
      button_text: { type: "text" },
      button_href: { type: "link" },
    }
  },
  {
    name: "stats",
    display_name: "Stats / Services",
    is_nestable: true,
    is_root: false,
    schema: {
      title: { type: "text" },
      services: {
        type: "bloks",
        component_whitelist: ["stat_service"]
      },
    }
  },
  {
    name: "stat_service",
    display_name: "Stat Service",
    is_nestable: true,
    is_root: false,
    schema: {
      text: { type: "richtext" },
    }
  },
  {
    name: "gallery",
    display_name: "Gallery",
    is_nestable: true,
    is_root: false,
    schema: {
      heading: { type: "text" },
      text: { type: "richtext" },
      items: {
        type: "bloks",
        component_whitelist: ["gallery_item"]
      },
    }
  },
  {
    name: "gallery_item",
    display_name: "Gallery Item",
    is_nestable: true,
    is_root: false,
    schema: {
      image: { type: "asset" },
      caption: { type: "text" },
    }
  },
  {
    name: "cta",
    display_name: "CTA",
    is_nestable: true,
    is_root: false,
    schema: {
      headline: { type: "text" },
      text: { type: "richtext" },
      button_text: { type: "text" },
      button_link: { type: "option", source: "internal_routes" },
    }
  },
  {
    name: "faq",
    display_name: "FAQ",
    is_nestable: true,
    is_root: false,
    schema: {
      title: { type: "text" },
      items: {
        type: "bloks",
        component_whitelist: ["faq_item"]
      },
    }
  },
  {
    name: "faq_item",
    display_name: "FAQ Item",
    is_nestable: true,
    is_root: false,
    schema: {
      question: { type: "text" },
      answer: { type: "richtext" },
    }
  },
  {
    name: "process",
    display_name: "Process",
    is_nestable: true,
    is_root: false,
    schema: {
      title: { type: "text" },
      steps: {
        type: "bloks",
        component_whitelist: ["process_step"]
      },
      outro: { type: "richtext" },
      button_text: { type: "text" },
      button_link: { type: "link" },
    }
  },
  {
    name: "process_step",
    display_name: "Process Step",
    is_nestable: true,
    is_root: false,
    schema: {
      text: { type: "textarea" },
    }
  },
  {
    name: "philosophy",
    display_name: "Philosophy",
    is_nestable: true,
    is_root: false,
    schema: {
      title: { type: "text" },
      tagline: { type: "text" },
      intro: { type: "richtext" },
      philosophy: { type: "richtext" },
      portrait: { type: "asset" },
      button_text: { type: "text" },
      button_link: { type: "option", source: "internal_routes" },
    }
  },
  {
    name: "showcase",
    display_name: "Showcase / Case Study",
    is_nestable: true,
    is_root: false,
    schema: {
      title: { type: "text" },
      tagline: { type: "text" },
      testimonial_quote: { type: "textarea" },
      testimonial_author_name: { type: "text" },
      testimonial_author_company: { type: "text" },
      body: { type: "richtext" },
      before_image: { type: "asset" },
      after_image: { type: "asset" },
    }
  },
  {
    name: "immersive",
    display_name: "Immersive",
    is_nestable: true,
    is_root: false,
    schema: {
      heading: { type: "text" },
      body: { type: "textarea" },
      main_image: { type: "asset" },
      grid_images: { type: "asset" },
    }
  },
  {
    name: "elevated",
    display_name: "Elevated",
    is_nestable: true,
    is_root: false,
    schema: {
      heading: { type: "text" },
      body: { type: "textarea" },
      images: { type: "asset" },
    }
  },
  {
    name: "amenities",
    display_name: "Amenities",
    is_nestable: true,
    is_root: false,
    schema: {
      badge: { type: "text" },
      heading: { type: "text" },
      body: { type: "richtext" },
      image: { type: "asset" },
    }
  },
  {
    name: "testimonial",
    display_name: "Testimonial",
    is_nestable: true,
    is_root: false,
    schema: {
      quote: { type: "textarea" },
      author_name: { type: "text" },
      author_company: { type: "text" },
      author_image: { type: "asset" },
      stars_image: { type: "asset" },
    }
  },
  {
    name: "explore",
    display_name: "Explore",
    is_nestable: true,
    is_root: false,
    schema: {
      heading: { type: "text" },
      cards: {
        type: "bloks",
        component_whitelist: ["explore_card"]
      },
      neighborhood: {
        type: "bloks",
        component_whitelist: ["explore_neighborhood"]
      },
    }
  },
  {
    name: "explore_card",
    display_name: "Explore Card",
    is_nestable: true,
    is_root: false,
    schema: {
      title: { type: "text" },
      image: { type: "asset" },
      href: { type: "text" },
    }
  },
  {
    name: "explore_neighborhood",
    display_name: "Explore Neighborhood",
    is_nestable: true,
    is_root: false,
    schema: {
      heading: { type: "text" },
      body: { type: "textarea" },
      button_text: { type: "text" },
      button_link: { type: "option", source: "internal_routes" },
      image: { type: "asset" },
    }
  },
  {
    name: "intro",
    display_name: "Intro / Page Header",
    is_nestable: true,
    is_root: false,
    schema: {
      heading: { type: "text" },
      subtitle: { type: "text" },
      background_image: { type: "asset" },
    }
  },
  {
    name: "contact_form",
    display_name: "Contact Form",
    is_nestable: true,
    is_root: false,
    schema: {
      description: { type: "richtext" },
    }
  },
  {
    name: "contact_gallery",
    display_name: "Contact Gallery",
    is_nestable: true,
    is_root: false,
    schema: {
      image: { type: "asset" },
    }
  },
  {
    name: "site_footer",
    display_name: "Site Footer",
    is_nestable: true,
    is_root: false,
    schema: {
      tagline: { type: "text" },
      logo: { type: "asset" },
      description: { type: "textarea" },
      menus: {
        type: "bloks",
        component_whitelist: ["footer_menu"]
      },
      copyright: { type: "text" },
      legal_links: {
        type: "bloks",
        component_whitelist: ["footer_link"]
      },
    }
  },
  {
    name: "footer_menu",
    display_name: "Footer Menu",
    is_nestable: true,
    is_root: false,
    schema: {
      title: { type: "text" },
      links: {
        type: "bloks",
        component_whitelist: ["footer_link"]
      },
    }
  },
  {
    name: "footer_link",
    display_name: "Footer Link",
    is_nestable: true,
    is_root: false,
    schema: {
      label: { type: "text" },
      href: { type: "text" },
    }
  },
  {
    name: "menu_link",
    display_name: "Menu Link",
    is_nestable: true,
    is_root: false,
    schema: {
      label: { type: "text" },
      href: { type: "text" },
    }
  },
  {
    name: "about",
    display_name: "About",
    is_nestable: true,
    is_root: false,
    schema: {
      badge: { type: "text" },
      name: { type: "text" },
      tagline: { type: "text" },
      categories: { type: "text" },
      specs: {
        type: "bloks",
        component_whitelist: ["about_spec"]
      },
      image: { type: "asset" },
      primary_button_text: { type: "text" },
      primary_button_link: { type: "option", source: "internal_routes" },
    }
  },
  {
    name: "about_spec",
    display_name: "About Spec",
    is_nestable: true,
    is_root: false,
    schema: {
      icon: { type: "text" },
      label: { type: "text" },
      value: { type: "text" },
    }
  },

  // ── Site-wide config (global story, never rendered as a page) ──
  // Holds all kinds of site-wide content: labels banner, menus, footer, etc.
  {
    name: "global",
    display_name: "Global",
    is_nestable: false,
    is_root: true,
    schema: {
      images: { type: "multiasset", filetypes: ["images"] },
      menu: {
        type: "bloks",
        component_whitelist: ["menu_link"]
      },
    }
  },

  // ── Page Component (root) ──  {
    name: "page",
    display_name: "Page",
    is_nestable: false,
    is_root: true,
    schema: {
      title: { type: "text" },
      description: { type: "text" },
      robots: { type: "text" },
      ogImage: { type: "asset" },
      ogImageAlt: { type: "text" },
      canonical: { type: "option", source: "internal_routes" },
      schema: { type: "textarea" },
      body: {
        type: "bloks",
        component_whitelist: [
          "hero", "features", "stats", "gallery", "cta", "faq",
          "process", "philosophy", "showcase", "immersive", "elevated",
          "amenities", "testimonial", "explore", "intro", "contact_form",
          "contact_gallery", "site_footer", "about"
        ]
      }
    }
  },
]

// ─── Create Components ───────────────────────────────────────────────────────

async function createComponents() {
  console.log("\n📦 Creating components...")

  // First, get existing components
  const existing = await apiRequest("GET", "components")
  const existingNames = new Set(existing.components?.map(c => c.name) || [])

  for (const comp of components) {
    if (existingNames.has(comp.name)) {
      console.log(`  ⏭  ${comp.name} (already exists, skipping)`)
      continue
    }

    try {
      await apiRequest("POST", "components", { component: comp })
      console.log(`  ✅ ${comp.name}`)
    } catch (err) {
      console.error(`  ❌ ${comp.name}: ${err.message}`)
    }
  }
}

// ─── Create Content Entries ──────────────────────────────────────────────────

async function createStory(slug, name, storyContent) {
  // Check if story already exists
  try {
    const existing = await apiRequest("GET", `stories?by_slugs=${slug}`)
    const found = existing.stories?.find((s) => {
      // Match by slug from the full_slug field
      return s.full_slug === slug || s.slug === slug
    })
    if (found) {
      console.log(`  ⏭  ${slug} (already exists, updating...)`)
      await apiRequest("PUT", `stories/${found.id}`, {
        story: { content: storyContent, name }
      })
      console.log(`  ✅ ${slug} (updated)`)
      return
    }
  } catch {
    // Story doesn't exist, create it
  }

  try {
    await apiRequest("POST", "stories", {
      story: {
        slug,
        name,
        content: storyContent,
      }
    })
    console.log(`  ✅ ${slug}`)
  } catch (err) {
    console.error(`  ❌ ${slug}: ${err.message}`)
  }
}

async function createContentEntries() {
  console.log("\n📄 Creating content entries...")

  const storyNames = {
    "global": "Global",
    "home": "Accueil",
    "contact": "Contact",
    "mentions-legales": "Mentions Légales",
    "politique-de-confidentialite": "Politique de Confidentialité",
  }

  for (const [slug, storyContent] of Object.entries(content)) {
    await createStory(slug, storyNames[slug] || slug, storyContent)
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Setting up Storyblok...")
  console.log(`   Space ID: ${SPACE_ID}`)

  await createComponents()
  await createContentEntries()

  console.log("\n✨ Setup complete!")
  console.log("\nNext steps:")
  console.log("  1. Go to https://app.storyblok.com to verify components and content")
  console.log("  2. Run 'npm run dev' to test the site")
  console.log("  3. Use the Storyblok Visual Editor to edit content")
}

main().catch(console.error)
