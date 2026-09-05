# Doggy Development — brand basics

Dog walking, Auckland North Shore.

## Name

**Doggy Development.** Confirmed September 2026.

### Name availability — checked 5 September 2026

| Check | Result |
|---|---|
| NZ Companies Register | ✅ No registered company by this name |
| NZBN register | ✅ No match (the same search returns ~20 other `DOGGY` businesses, so it was working) |
| IPONZ trade mark register | ✅ No mark "Doggy Development", and none confusingly close |
| Domains: `doggydevelopment.co.nz` / `.nz` / `.com` / `doggy-development.co.nz` | ✅ All unregistered |
| Instagram `@doggydevelopment` | ⚠️ Taken — a small dog-training account |
| Instagram `@doggydevelopmentnz` / `@doggydevelopment.nz` | ✅ Both free |
| Facebook `/doggydevelopment` | ❓ Inconclusive from outside |
| US business with the exact name | ⚠️ A dog trainer in Kirkland, Washington, on `doggy.dev` |

**IPONZ detail.** Trade Mark Check returned 148 marks, narrowed to 113 in classes 41
(education, entertainment, sports) and 44 (care for humans and animals). No exact or
near-identical match. The nearest is `DOGGY` (case 1323912) — *pending*, and covering
class 5 food supplements rather than dog services, so not an obstacle. This is a
knock-out search, not a formal clearance opinion.

**Caveat.** New Zealand has no business-name register for sole traders, and the NZBN
register only lists entities that have a number. Most dog walkers trade as sole traders,
so a clear search proves no *registered entity* holds the name — not that nobody is using it.

## Logo

**"Good Dog"** — a dog's face built from five shapes: two folded ears, a head, a chin and a
nose, with the eyes and nose knocked out. Chosen from four concepts (see
`logo-concepts.html` in this folder) because it reads as a character rather than a symbol,
and because it is the only one of the four that isn't a paw print.

The master is `logo-mark-teal.svg`. In the website it lives as the `#logo` SVG symbol —
a `<mask>` over a solid rect, so it renders in a single colour on any background and
inherits `currentColor`.

- Clear space: one ear-height on all sides.
- Minimum size: 20px on screen, 8mm in print.
- Never gradient, shadowed, outlined, stretched, or recoloured beyond teal / pine / white.

## Colours

| Name | Hex | Use |
|---|---|---|
| Harbour teal | `#0F8F80` | Primary — logo, buttons, accents |
| Deep pine | `#0F2420` | Text, one-colour print |
| Coral | `#D9552A` | Accent only; never the logo |
| Sea mist | `#F5F8F6` | Page background |

Dark theme swaps teal to `#3FC9B6` and the ground to `#0C1613`.

## Type

- **Bricolage Grotesque** — display, headings, wordmark (ExtraBold, tracking −0.035em)
- **Figtree** — body text
- **IBM Plex Mono** — prices, trading hours, labels, the marquee

All three are free on Google Fonts.

## Contact

- **Phone** 022 451 7725
- **Email** milner.turei@gmail.com

A branded address (`hello@doggydevelopment.co.nz`) is worth setting up once the domain is
registered; the Gmail address stays as the fallback.

## Wordmark lockup

Two lines: "Doggy" in deep pine over "Development" in teal, set in Bricolage Grotesque
ExtraBold. In `index.html` the `BRAND` constant at the top of the script fills every
instance — nav bar, mobile drawer, footer and copyright line.
