# Tihar & Chhath — An interactive description

An interactive, scroll-driven website that takes you through the Nepali festivals of Tihar and Chhath, painted in the Mithila folk-art style with bold outlines, marigold yellows, crimson reds and indigo blues. Each section is a festival day you can participate in, with background music that shifts between tracks as you scroll.

---

## Features

- **Scroll-driven navigation** — each section is a full-page festival day with snap scrolling
- **Interactive illustrations** — feed the crow, feed the dog, apply tika to the cow, light the diya, complete the mandala, bless a brother with seven colours, give dakshina to Deusi singers, and offer arghya to the sun
- **Mithila art style** — SVG illustrations drawn with the palette and line weight of Madhubani/Mithila folk painting
- **Section-aware audio** — Tihar dhun plays across Tihar pages, Deusi-Bhailo song plays on the Deusi section, Chhath tune plays on both Chhath pages; all loop infinitely
- **Deusi intensity** — the Deusi track gets progressively louder each time dakshina is given, up to 2x the base volume
- **Sound on/off toggle** — a small button lets the user mute and unmute without losing their place
- **Falling petals** — ambient petals drift down in festival colours matching the current section
- **String lights** — decorative bulbs line the top of every Tihar page
- **Scroll progress bar** — a thin bar at the top of the page tracks how far through the scroll the user is
- **Page dot navigation** — dots on the right side allow jumping between sections
- **Scroll reveal animations** — illustrations fade in as they enter the viewport
- **Reduced motion support** — all animations respect `prefers-reduced-motion`

---

## Pages

| Section | Festival Day |
|---|---|
| Start | Hero / intro |
| Kaag Tihar | Day 1 — the crow |
| Kukur Tihar | Day 2 — the dog |
| Gai Puja | Day 3 morning — the cow |
| Laxmi Puja | Day 3 evening — the diya |
| Mha Puja | Day 4 — the mandala |
| Bhai Tika | Day 5 — siblings |
| Deusi-Bhailo | Nights of Laxmi Puja and Bhai Tika |
| Sandhya Arghya | Chhath Day 3 — evening offering |
| Usha Arghya | Chhath Day 4 — morning offering |

---

## Project Structure

```
/
├── index.html       # All markup and SVG illustrations
├── style.css        # All styles, Mithila palette, animations
├── script.js        # All interactivity and audio logic
└── audio/
    ├── tihar.mp3    # Plays on all Tihar sections
    ├── deusi.mp3    # Plays on the Deusi-Bhailo section
    └── chhath.mp3   # Plays on both Chhath sections
```

---

## Audio Setup

The site expects three MP3 files in an `audio/` folder at the project root. Without them the site works fully — only the music is silent.

Place your files as:
```
audio/tihar.mp3
audio/deusi.mp3
audio/chhath.mp3
```

Audio starts automatically on the first user interaction (click, scroll, or keypress) to satisfy browser autoplay policies. It then switches and crossfades between tracks as the user scrolls between sections.

---

## Running Locally

Opening `index.html` directly as a `file://` URL may block audio in some browsers. Use a local server instead:

```bash
# Node
npx serve .

# Python
python3 -m http.server
```

Then open `http://localhost:3000` (or whichever port is shown).

---

## Deployment

The site is a single set of static files with no build step. Deploy by uploading the folder to any static host.

For **Vercel via GitHub**: push all files including the `audio/` folder to your repository. Confirm the folder appears in GitHub before deploying — git does not track empty folders, and `.gitignore` rules for `*.mp3` will silently exclude the files.

---

## Fonts

Loaded from Google Fonts:

- **Yatra One** — headings, festival labels
- **Mukta** — body text, buttons

---

## Colour Palette

| Name | Hex | Used for |
|---|---|---|
| Crimson | `#800020` | Primary accent, headings |
| Marigold | `#E1AD01` | Gold highlights, sun |
| Indigo | `#2B2A6B` | Crow, clothing |
| Saffron | `#e8590c` | Secondary accent |
| Scarlet | `#c8102e` | Tika, clothing |
| Ink | `#1a1210` | Outlines |
| Paper | `#FDFBF7` | Background fills |
