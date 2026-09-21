# Portfolio Website — Design Doc

Source notes: `Obsidian-Notes/Projects/Portfolio Website.md`. Architecture decisions referenced here are recorded in full in `docs/adr/`. Domain terms (Visitor Gallery, Drawing Name, Send Me a Message, etc.) are defined in `CONTEXT.md` — this doc assumes that vocabulary.

## Requirements

Original ask:

- Home
- About
- Projects
- Now
- Things I Learned
- Visitor section

Finalized nav (after design review): **Home · About Me · Projects · Things I Learned · Visitor Gallery · Resume**. No separate "Now" page — folded into Things I Learned, which is deliberately non-technical.

### Inspiration

- [Wall of Portfolios](https://www.wallofportfolios.in/?company=All) — reference gallery, specifically [Aditya Sadhukhan's portfolio](https://www.wallofportfolios.in/portfolios/aditya-sadhukhan/) for the Home and About Me layout.
- [Megan Yap's visitor gallery](https://meganyap.me/visitor-gallery) — origin of the Visitor Gallery idea: an AI model guessing what a visitor drew, on a drawable canvas.
- Light/dark mode toggle concept from notes ("pixel army attacks each component to turn it to the dark side or light side") — **considered and dropped**: the site is single-theme (dark only, see Color Palette below), so there's no toggle to animate.
- [joseph.cv](https://joseph.cv/) — liked the library/archive feel and overall structural scheme.
- [daniel.pizza](https://www.daniel.pizza/) — liked the color choices.
- [kwon.nyc/about](https://kwon.nyc/about/) — has a blog, injects a lot of personality; also runs a `/now` page (see [nownownow.com](https://nownownow.com/about)) — the "Now" page idea from this reference was ultimately not carried into the requirements.
- [dhrumil.ca](https://dhrumil.ca/) — has a "Things I Learned" page ([dhrumil.ca/today](https://dhrumil.ca/today)).
- [upstatement.com](https://upstatement.com/) — general studio-site reference.

---

## Technical Architecture

- **Frontend:** Vite + React + TypeScript SPA. No Next.js/SSR — the site is shared primarily via direct link (resume, LinkedIn, email), not discovered via search, so SEO isn't a driver worth the added complexity.
- **Backend:** Supabase (Postgres + Edge Functions) — the only backend the site needs.
- **Visitor Gallery inference:** `sketch-oracle`'s existing quantized `.tflite` model runs client-side in the browser via a WASM TFLite/LiteRT runtime. No server-side model hosting. See [ADR 0001](docs/adr/0001-client-side-sketch-oracle-inference.md).
- **Writes:** Both the Visitor Gallery submission and the Send Me a Message email go through a Supabase Edge Function rather than a direct client insert, so submissions can be rate-limited. See [ADR 0002](docs/adr/0002-edge-function-gated-writes.md).

## Home

![Home nav bar](docs/design-assets/home-nav-bar.png)

- Persistent top nav bar: logo mark on the left, nav links centered-right (**Home · About Me · Projects · Things I Learned · Visitor Gallery · Resume** — literal labels, not the "Work/Play" shorthand shown in the reference image).
- No theme toggle — the reference's moon icon doesn't carry over, since the site has one theme.
- Active link is bolded/full-brightness white; inactive links sit in a dimmer gray so the current section is obvious at a glance.
- Nav bar floats as a pill with slightly rounded corners against the near-black page background — reads as a translucent dark glass bar.
- Reference layout: [Aditya Sadhukhan's portfolio](https://www.wallofportfolios.in/portfolios/aditya-sadhukhan/).

## About Me

![About Me inspiration](docs/design-assets/about-me-inspo.png)

- Copy: "A bit about who I am... A designer by day, photographer when I can get away with it." — playful, personal tone rather than a resume-style bio.
- Content to adapt for Richie: like pretty things (sunsets, chases them when possible), based in Orange County, CA.
- Layout: large serif/display headline on the left, short supporting paragraph below it, tilted photo on the right (like a physical photo dropped on a desk), with a handwritten-style caption ("it's a pleasure to meet you!") floating next to the photo.
- Decorative confetti of small solid-color squares scattered around the photo — a lightweight, non-literal way to bring the palette into the layout.
- Small solid accent dot near the top-left of the section as a visual anchor — use the lavender accent (see Color Palette), not the orange shown in the reference image.
- Reference layout: same [Aditya Sadhukhan portfolio](https://www.wallofportfolios.in/portfolios/aditya-sadhukhan/).

## Projects

Simple cards, not case studies — title, one-line description, tech tags, links out to GitHub/live demo. Initial project list:

- DermCat
- rag-for-neanderthals
- Frogodoro

Styling borrows the same dark background + accent-square language used in Home/About.

## Things I Learned

Non-technical, evergreen log page. Format inspiration: [dhrumil.ca/today](https://dhrumil.ca/today).

### Watched, Rewatched

- Movie-poster row, capped at 4 shown at a time with a "MORE →" link to expand.

### Music (On Repeat)

![Music and movies section](docs/design-assets/music-movie-section.png)

- "Watched, *rewatched*." and "On *repeat*." headings — large serif display type with the second word italicized for rhythm/personality.
- Movies shown as a horizontal row of poster thumbnails (4 visible), each with a small "+" affordance in the corner, title underneath in a plain sans caption.
- Music shown as scattered vinyl records and album-art squares laid out at slight rotations (physical, tactile, "stuff on a desk" feel) rather than a clean grid.
- Track/artist credit set in a small letter-spaced monospace caption under the vinyl.
- **Palette note:** the reference image shows this section on a warm cream background — that's dropped (see Color Palette). This section sits on the same near-black background as the rest of the site; the poster/album art itself still carries its own natural color, which is fine — that's content, not a theme accent.

## Visitor Gallery

New nav page, not present in the original design pass — added after design review.

- Visitor draws on a canvas.
- `sketch-oracle` (a CNN Richie already built, guessing from a fixed ~100-word benign object vocabulary — airplane, cat, star, etc.) classifies the sketch, entirely client-side.
- The guessed noun is combined with a random adjective into a **Drawing Name** (e.g. "Generous Zebra") and shown to the visitor.
- The drawing is submitted as **stroke data** (not a flat image) via a Supabase Edge Function — this lets the gallery replay the drawing being drawn as a short animation, rather than showing a static thumbnail.
- Submissions land in a **public, browsable gallery** — other visitors can see past Drawing Names and watch them redraw.
- Each gallery entry has a lightweight **flag/report button** as a moderation backstop, since the drawn image (not just the guessed label) is visible to other visitors and the label alone can never be offensive.
- The Edge Function rate-limits submissions per visitor to deter spam.

## Send Me a Message

![Post-it note style](docs/design-assets/post-it-note-style.png)

- Private only — the post-it is just the interface, not a public wall. No other visitor ever sees a submitted note.
- Visitor writes a message with contact info underneath; submitting sends Richie an email via a Supabase Edge Function. No database, no admin inbox — email is the only record.
- Visual: sticky/post-it paper background, slightly rotated, drop shadow to feel physically stacked. Message text in a handwritten-style font, dark navy ink color.
- The reference image's heart/reply icons don't carry over functionally — there's nothing public to like or reply to. Replace with a simple submit + "sent" confirmation state.
- Contact info needs its own line, distinct from the message body, so replies are possible.

## Bottom Bar (Footer)

![Connect with me icons](docs/design-assets/connect-with-me-icons.png)

- "Connect with me" heading in a serif italic font rendered with a subtle multi-color gradient (lavender → pink) rather than a flat color — a small signature moment for the footer, and a functional reuse of the two pastel accents rather than a one-off gradient.
- Row of square, rounded-corner icon chips (dark charcoal fill) for: X/Twitter, Instagram, LinkedIn, Behance, GitHub, plus one more (asterisk/link icon) — icons are white/off-white glyphs on the dark chip.
- Confirmed required links from notes: Email, GitHub, LinkedIn (extend with the others shown in the reference if desired).

---

## Color Palette

The site is **single-theme: dark only**, throughout every section (including Music/Movies and Send Me a Message, which the original reference images showed on a lighter/warmer background). No light mode, no theme toggle. Pastel "confetti" squares are the only color accents, layered on the dark base.

### Core neutrals

| Swatch | Hex (approx.) | Usage | Why |
|---|---|---|---|
| Near-black | `#0D0D0D` – `#141414` | Every section's background, site-wide | Reads as premium/editorial rather than flat pure black (`#000`); keeps enough warmth that photos and colored accents don't look harsh against it; used consistently instead of switching to a lighter background per section. |
| Sticky-note yellow | `#FDF6D8` – `#FBEFA0` | Post-it note background only | A literal object color (a real sticky note), not a theme accent — it's a small, isolated element sitting on the dark page, not a full light section. |
| Ink navy | `#1F2A44` | Post-it note text | High contrast on yellow paper while avoiding harsh pure black, consistent with a ballpoint-pen look. |
| Off-white / light gray text | `#D9D9D9` – `#A0A0A0` | Body copy & inactive nav links | Keeps hierarchy: full white for headlines/active state, dimmed gray for secondary/inactive content. |

### Accent colors

| Swatch | Hex (approx.) | Usage | Why |
|---|---|---|---|
| Lavender / periwinkle | `#B7A9F0` | Functional accent: handwritten captions, footer gradient start, links/buttons/active states, About Me anchor dot | Promoted to the site's one functional accent (replacing the rejected orange) — it already does double duty across the reference images (handwritten note, footer gradient), so it reads as already "Richie's" color rather than an arbitrary pick. |
| Soft pink | `#F5A9C4` – `#F4B6C2` | Confetti squares, footer gradient end | Pairs with lavender for the gradient headline; pastel enough to sit on the dark background without competing with content. |
| Mint green | `#A8E6C1` | Confetti squares | Rounds out the pastel trio (pink/lavender/mint) used purely decoratively — no functional meaning, just texture. |
| Slate blue-gray | `#8A9BA8` | Confetti squares | A muted, cooler pastel that keeps the confetti from feeling too candy-colored against the near-black background. |
| Dusty mauve / tan | `#C9A88A`, `#B08CA0` | Confetti squares | Rounds out an earthy sub-set of the palette — pairs with the photo tones in About Me (jacket, skin tones, snow scene) so the decoration doesn't fight the photo. |

**Dropped from the original pass:** the orange anchor-dot accent and the terracotta/warm-red accent tied to a cream "paper" section — both rejected in design review in favor of staying fully dark with lavender as the one functional accent.

### Notes on the palette

- The confetti pastels (pink, mint, lavender, slate, mauve) are intentionally desaturated so no single one competes with photography or reads as a "brand color." Use them only as small square accents, never as large fills.
- Lavender is the *only* color used functionally (links, buttons, active/hover states) — everything else in the accent set stays decorative-only, so interactive elements stay visually consistent across the site.
- The footer's lavender→pink gradient text ties the two pastel accents together functionally, so the palette feels intentional rather than random confetti.
- Real content (album art, movie posters, the About Me photo) naturally carries its own full color — that's expected and not something to suppress; the "no orange/terracotta/cream" rule is about the *theme's* chosen accents, not about desaturating photography or licensed artwork.
