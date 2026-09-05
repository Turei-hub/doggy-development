# Doggy Development

Website and brand assets for **Doggy Development** — a small dog-walking business on
Auckland's North Shore.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The whole public website. No build step, no dependencies, hash-based routing across four pages. |
| `admin.html` | The moderation portal. Sign in, approve or reject submitted dogs, add your own. |
| `firestore.rules` | The security rules. This is what actually guarantees nothing publishes without your say-so. |
| `firebase-config.js` | Your Firebase project details. Empty until you fill it in — see `SETUP.md`. |
| `firebase.json`, `firestore.indexes.json` | Hosting and index config for the Firebase CLI. |
| `SETUP.md` | Step-by-step first-time setup, roughly 20 minutes. |
| `brand/brand.md` | Colours, type, logo rules, contact details, and the name-availability checks. |
| `brand/logo-mark-teal.svg` | The "Good Dog" mark, master file. |
| `brand/logo-concepts.html` | The four logo concepts it was chosen from, with lockups, reversed versions and size tests. |

## Running it

The pages use ES modules, so they need to be served over HTTP — opening
`index.html` straight off the disk won't work.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Or, once the Firebase CLI is installed, `firebase serve --only hosting`.

With `firebase-config.js` still empty the site runs in demo mode: the gallery
shows six example dogs and the upload form explains it isn't connected. Every
other page works normally.

## Deploying

**Firebase Hosting** is the natural home, since the gallery already uses
Firestore — `firebase deploy`, and it's live. Commercial use is fine on the free
Spark plan.

The rest of the site is static, so Netlify or Cloudflare Pages would also serve
it. Note that **Vercel's Hobby plan is restricted to non-commercial use**, so a
business site there means the $20/month Pro plan.

## The pages

1. **Home** — hero with a photo-tile collage and a "6 dogs max" badge, sliding marquee, three service cards, the suburb list, gallery CTA.
2. **Gallery** — clients add their dog with a photo, name, breed/suburb and story.
3. **Services & Pricing** — three tiers, an add-ons table, five FAQs.
4. **About** — story, credentials, trading hours, contact.

## How the gallery works

Clients submit a dog on the gallery page. Nothing they send appears anywhere on
the site until it is approved in `admin.html`.

```
client submits  →  Firestore doc, status "pending"  →  you approve  →  live
```

The moderation is enforced by `firestore.rules` on Firebase's servers, not by the
page's JavaScript. Editing the site in a browser's dev tools, or calling the API
directly, still can't publish anything or read the pending queue. Specifically,
the rules allow the public to read only `status == "approved"` documents and to
create only `status == "pending"` ones, capped at one image under 400 KB plus
four short text fields. Changing a status is limited to your account's user ID.

Photos are compressed in the browser to well under 150 KB and stored as text
inside the Firestore document — no Cloud Storage bucket, which keeps everything
inside the free Spark plan with no credit card attached. Room for something like
8,000 dogs.

The three newest approved photos also fill the home page hero collage.

`SETUP.md` has the full first-time setup.

## Status: still a wireframe in places

Real layouts, real navigation, real contact details, and a real gallery. Still to
do before it goes live:

- **Prices are placeholders.** Every rate reads `$00`.
- **Hero photos.** The collage fills itself from approved dogs, but shows paw
  outlines until there are three.
- **The About copy is scaffolding** — right shape, not the owner's own words.

## On client photos

The submission form asks for consent with a tick box before it will send. Photos
you add yourself through the admin page skip that step, so get the client's okay
before publishing something they texted you.


## Notes for whoever builds this properly

- The `BRAND` constant at the top of the script in `index.html` fills the nav, footer and
  copyright. Change one string to rename the whole site.
- Colours are CSS custom properties on `:root`, with a full dark-theme set. Nothing is
  hardcoded in a component.
- The logo is an SVG `<symbol>` — a `<mask>` over a solid rect — so it is single-colour
  safe on any background and inherits `currentColor`.
- Fonts come from Google Fonts; everything else is inline.

## Checking the rules still hold

The moderation promise is worth being able to prove rather than trust.
`firestore.rules.test.mjs` boots the local Firestore emulator and replays every
attack and every normal action against the real rules file:

```sh
npm install
npm test
```

Run it after any change to `firestore.rules`. It never touches the live project.
