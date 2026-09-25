# Portfolio Website — Upstatement Variant Design Doc

Experimental redesign on the `upstatement-design` branch. It restyles the portfolio after [upstatement.com](https://upstatement.com/)'s homepage, which `design.md` already lists as a general studio-site reference. **Scope is visual only:** sections, domain terms (`CONTEXT.md`), and architecture (`docs/adr/`) stay as they are. This doc covers only what changes compared with `design.md`. Anything not mentioned here carries over from that doc.

Values below were read from upstatement.com's live HTML and `main.css` on 2026-09-25. They're a snapshot of the site as it was then, not a spec that will stay current.

---

## What Upstatement's homepage does

Summarized so this branch can be judged against the reference without reopening the site.

- **Theme:** `theme-black`. Pure black `#000` page, white `#fff` text, and a single gray (`#858585`) for secondary text. Hairline borders are `hsla(0,0%,100%,.2)`. No accent color in the chrome: color comes only from photography, plus one hover animation (see Motion).
- **Two typefaces, strict roles:**
  - **Rizoma** (light serif, weight 300 only, with italic) is for every display line: the hero, `h1`, and client names. It's never bold. `strong`/`b` inside headlines are forced back to 300.
  - **Diatype** (variable grotesk, 200–1000) is for everything else: nav, body, lists, labels. The body weight is an unusual **380**, lighter than regular.
- **Hero:** a centered serif statement, *"Brand Through Digital™"*, max-width 1100px. Size is `calc(19px + 3.16vw)`, capped at 68px, with line-height 1.05 and tracking -0.01em. The real `<h1>` is visually hidden, so the statement itself is decorative type. A big 8–16vh gap sits below it.
- **Nav:** logo (an SVG wordmark) pinned top-left and sticky. Three plain text links on the top-right (*About · Work · Contact*) at body size, with no pill, background or underline. Below 768px they collapse into a hamburger menu.
- **Case-study teases:** one large tease followed by smaller ones in a grid. Each is a 16:9 photo with a **second image that swaps in on hover**, captioned with a *"Client: One-line pitch"* format ("Nike: A global digital brand reset").
- **"We are / We build" columns:** a 1/3 + 2/3 split. On the left is a bold (700) small list header. On the right is plain Diatype copy or a plain list of services.
- **Featured clients:** client names set as huge Rizoma words (up to 54px), underlined at 1.5px thickness with `text-underline-offset: .1em`. Hovering one **dims every other name to 20% opacity**, and quotes and photos are placed between the names.
- **Numbered index links:** "About 01. · Work 02. · Blog 03." Each is a large link paired with a photo, where the number acts as a quiet suffix.
- **Footer:** a hairline top border and a 1/3 + 2/3 column split. It holds a site nav, a utility nav and a social row (plain text links, not icon chips).
- **Motion:** each block fades and rises into view on scroll (`js--sr-item`). The main easing curve is `cubic-bezier(.215,.61,.355,1)` (easeOutCubic), with `cubic-bezier(.16,1,.3,1)` (easeOutExpo) for larger moves. A playful hover effect cycles a background through four pastels over 5s: `#ff8d9c → #d7e6cc → #70ace8 → #f2d7bb`.
- **Layout:** page gutters are 20px below 768px and 40px above. Breakpoints: 600 / 768 / 1070 / 1400 / 1550. Radii: 7 / 14 / 28px. Type scales fluidly with `calc(px + vw)` and is capped with a fixed px value at 1400px or wider.

---

## Mapping it onto this portfolio

### Tone shift

The current design is "personal scrapbook": a tilted photo, confetti, handwritten captions, a post-it. Upstatement is "editorial studio": restraint, big serif type, and photos doing the talking. This variant tests whether the portfolio reads better that way. The rule is **keep the personality in the copy and the interactive pieces (Visitor Gallery, post-it); take it out of the chrome.**

### Nav Bar

- Drop the floating glass pill. The logo mark sits top-left and becomes sticky, as on Upstatement. The links sit top-right as plain Diatype-style text with no container.
- Labels are unchanged: **About Me · Projects · Things I Learned · Visitor Gallery · Resume**. Five links is two more than Upstatement fits. If they wrap before 1070px, collapse to a hamburger from 1070px down instead of 768px.
- Active state: full white. Inactive: `#858585`. Scroll-spy behavior is unchanged.
- Resume stays the one action link, marked with a trailing `↓`. It loses the lavender (there's no accent color in this variant), so the arrow alone signals the difference.

### About Me (hero)

- Replace the left-text/right-tilted-photo layout with Upstatement's **centered serif statement**. The tagline becomes the hero line in Rizoma-style light serif, e.g. *"I chase pretty things — sunsets mostly."* It's centered, max-width about 1100px, and sized fluidly up to 68px.
- The heading stays **"Hi, I'm Richie."** as the real `<h1>` and remains visible. Unlike Upstatement, don't use a visually-hidden h1: this is a personal site and the name should be readable. Set it small above the statement, like the current eyebrow.
- Put the photo **full-bleed and upright** under the statement, as a 16:9 hero image in the tease style. Its "hover swap" can be a second sunset photo.
- The bio moves into a **"About / I am" 1/3 + 2/3 column block** below the photo: a bold small label on the left, plain body copy on the right. "Based in Orange County, CA" lives here.
- **Dropped in this variant:** tilted photo, handwritten caption, confetti squares, lavender anchor dot.

### Projects

- Use Upstatement's **tease pattern** instead of plain cards. The first project gets a large tease; the rest are smaller teases in a two-column grid below 1070px and three columns above it.
- Each tease has a 16:9 screenshot, a hover-swap second screenshot, and the caption in *"Project: One-line pitch"* form. Examples: *"DermCat: …"*, *"rag-for-neanderthals: …"*, *"Frogodoro: …"*.
- Tech tags become a single gray (`#858585`) line under the caption, not chips.
- Links to GitHub and the live demo stay. The whole tease is the demo link, and GitHub is a secondary text link.
- Any project without a second screenshot simply doesn't swap on hover. That's fine.

### Things I Learned

- The weekly rail's behavior is unchanged (horizontal scroll, newest first, one card per arrow press).
- Restyle the cards to match Upstatement: `--c-bg-light` `#1f1f1f` fill, 14px radius, and a hairline border instead of the current card chrome. Week labels in Diatype bold, entries in regular body weight.
- The "Things I *learned*." heading keeps the serif-with-italic device, which Rizoma light + italic fits naturally.

### Visitor Gallery

- The functionality is unchanged: canvas, sketch-oracle, Drawing Name, stroke replay, flag button.
- Borrow the **featured-clients treatment** for recent Drawing Names. Set them as large underlined serif words ("Generous Zebra"). Hovering one dims the others to 20% and previews that Visitor Card.
- This is the variant's best chance to keep playfulness: use the **4-pastel `colorPalette` hover cycle** on the draw/submit button.

### Send Me a Message

- **Keep the post-it.** It's an object, not chrome, and it's the page's signature interaction. It sits centered on the black page like a photo does on Upstatement.
- The section heading above it switches to the Rizoma-style serif.

### Footer

- Swap the charcoal icon chips for Upstatement's **plain text social row**: Email · GitHub · LinkedIn. Text labels also mean the `aria-label` workaround isn't needed.
- Hairline top border, 1/3 + 2/3 split: "Connect *with me*" in serif on the left, links on the right.

### Numbered section index (optional)

Upstatement's "About 01. · Work 02. · Blog 03." index could close the page above the footer as a second way into the sections. It's only worth trying if the page feels long. It's not in the first pass.

---

## Tokens

### Color

| Token | Value | Usage |
|---|---|---|
| `--c-bg` | `#000` | Page background (replaces near-black `#0D0D0D`–`#141414` **and** the dot-grid texture) |
| `--c-bg-light` | `#1f1f1f` | Cards, rail, input backgrounds |
| `--c-text` | `#fff` | Headlines, body, active nav |
| `--c-text-light` | `#858585` | Secondary text, inactive nav, tags, dates |
| `--c-border` | `hsla(0,0%,100%,.2)` | Hairlines: footer rule, card borders |
| Pastel cycle | `#ff8d9c`, `#d7e6cc`, `#70ace8`, `#f2d7bb` | Hover animation only (Visitor Gallery CTA) |
| Post-it yellow / ink navy | unchanged from `design.md` | Post-it only |

**Removed:** lavender as the functional accent, and all five confetti pastels. Focus rings become **white** on black (21:1) and stay ink navy on the post-it.

### Type

Diatype and Rizoma are commercial fonts (Dinamo and a paid foundry respectively) and are **not** licensed for reuse here. Use free stand-ins from Google Fonts:

| Role | Upstatement | Stand-in to try | Notes |
|---|---|---|---|
| Display serif | Rizoma 300 + italic | **Newsreader** 300 / 300 italic (fallback: Fraunces 300) | Needs a real light weight plus a true italic for the "Things I *learned*." device |
| Body grotesk | Diatype variable, body at 380 | **Inter** variable, body at 380 | Inter's variable axis supports the in-between 380 weight directly |

Scale (fluid until 1400px, fixed from then on):

| Role | Size | Line-height | Tracking |
|---|---|---|---|
| Hero statement | `clamp(30px, calc(19px + 3.16vw), 68px)` | 1.05 | -0.01em |
| h2 / big names | `clamp(32px, calc(27.9px + 1.68vw), 54px)` | 1.0 | -0.01em |
| Body / nav | `clamp(16px, calc(13px + .5vw), 20px)` | 1.3 | normal |
| Small / meta | `clamp(14px, calc(12.5px + .25vw), 16px)` | 1.3 | normal |

### Spacing, radius, motion

- Gutters: 20px below 768px, 40px from 768px up. Section gap: `clamp(80px, 16vh, 160px)`.
- Radii: `--radius-sm: 7px`, `--radius: 14px`, `--radius-lg: 28px`.
- Easing: `--ease-out: cubic-bezier(.215,.61,.355,1)` for fades and hovers; `--ease-out-expo: cubic-bezier(.16,1,.3,1)` for the scroll reveal's rise.
- Scroll reveal: a 24px rise plus a fade over about 600ms, triggered once per block by IntersectionObserver. Under `prefers-reduced-motion`, blocks appear with no movement and the pastel hover cycle doesn't run.

---

## Open questions

1. **Does the pure-black editorial look suit a personal site, or does it read as a studio?** This is the whole point of the branch. Compare it side by side with `main` before deciding.
2. **Photo supply:** the tease pattern depends on good 16:9 images, two per project for the hover swap. Are there enough project screenshots and sunset photos to fill it?
3. **Keep any confetti?** One option is to reintroduce the old pastels only as the hover cycle, replacing Upstatement's four colors, so the variant still feels like Richie's.
4. **Nav fit:** five labels, one of them three words long ("Things I Learned"). Check whether it wraps between 768 and 1070px before choosing where the hamburger breakpoint goes.
