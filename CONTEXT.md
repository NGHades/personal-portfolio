# Personal Portfolio

Richie's personal portfolio site: a small set of pages showcasing who he is, his projects, an evergreen personal log, and a playful visitor-facing drawing game.

## Language

**Visitor Gallery**:
The nav page where a visitor draws on a canvas; a CNN (`sketch-oracle`) guesses the noun class of the drawing, which is combined with a randomly chosen adjective into a Drawing Name (e.g. "Generous Zebra"). Each submission is saved to a public gallery other visitors can browse, and any entry can be flagged by a visitor for review. Distinct from Send Me a Message — no contact or messaging happens here.
_Avoid_: Visitor section (ambiguous — could mean this or Send Me a Message), Art Gallery

**Visitor Card**:
One Visitor Gallery submission as it appears to other visitors: the drawing itself on the left side of the card, plus its Drawing Name, the sequential visitor number it was issued ("No. 007"), and the date issued. Cards are rendered as textured planes in a three.js scene that visitors can drag around and click to bring forward.
_Avoid_: Gallery entry, tile, thumbnail

**Drawing Name**:
The [random adjective] + [sketch-oracle-guessed noun] label generated for a Visitor Gallery submission (e.g. "Generous Zebra"). The noun always comes from `sketch-oracle`'s fixed, benign category vocabulary.
_Avoid_: Result, label, title

**sketch-oracle**:
Richie's existing CNN, currently a Python/TensorFlow model, that classifies a sketch into one of a fixed set of ~100 common object nouns (Quick Draw-style categories). Powers the Visitor Gallery's guess step.

**Send Me a Message**:
A private contact feature styled as a post-it note. A visitor writes a message plus their contact info; it's emailed directly to Richie with no persistent storage — not a public wall, and not visible or reactable by other visitors.
_Avoid_: Guestbook, message wall, visitor board

**Things I Learned**:
An evergreen, non-technical log page. Replaces the earlier "Now" idea — there is no separate Now page. A horizontal rail of week cards, newest first; the Watched/Rewatched and On Repeat (music) subsections were dropped.
_Avoid_: Now page, blog

**Projects**:
A grid of simple cards (title, short description, tech tags, link out to GitHub/live demo). No dedicated case-study pages.
_Avoid_: Case study, portfolio piece

**Nav (final)**:
About Me, Projects, Things I Learned, Visitor Gallery, Resume. No Home entry — the hero is part of About Me. Resume downloads the PDF rather than pointing at a section; Send Me a Message is the closing section but has no nav entry.
