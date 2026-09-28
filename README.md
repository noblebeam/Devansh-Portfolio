# Devansh Gupta — portfolio

A static website: open `index.html` in any browser (double-click it). No install, no build step,
and no internet connection needed — every font, image and script is inside this folder.

## Pages

| File | What it is |
|---|---|
| `index.html` | The animated site. The hero is the waving poster intro; every other section is the rebuilt PDF, with each element animating in as you scroll. |
| `pdf-recreation.html` | The same PDF rebuild with no animation — a faithful static copy of the Canva PDF, kept for comparison. |

### The hero (index.html)

A red-on-paper poster: letters storm across the screen, "PORTFOLIO" rolls in like a slot machine,
the name and roles decode, the dice slide in, and a hand-drawn character rises and waves.

- Hover a letter to re-roll it.
- Hover or click the character to make it wave (its eyes follow the pointer).
- Click a die to roll it; click the paper to throw letters.
- Click the round "DEV / ANSH" signature to replay the intro.
- With "Reduce motion" turned on in the system settings, everything appears without animation.

## Folders

| Path | What it is |
|---|---|
| `js/waving-portfolio.js` | The hero: a plain-JavaScript port of the React `waving-portfolio-landing` component. Draws everything itself. |
| `js/main.js` | Starts the hero with Devansh's details and runs the scroll-in animation. |
| `css/styles.css` | Fonts, page layout and the scroll-in animation. |
| `css/waving-portfolio.css` | The hero's styles and keyframes. |
| `assets/img/` | Photos, thumbnails and app icons taken from the PDF. |
| `assets/fonts/` | Self-hosted fonts (from Google Fonts, SIL Open Font License 1.1). Anton and Alex Brush are the PDF's own; Fraunces, DM Sans and Archivo Expanded stand in for Arsenica, TT Commons Pro and Horizon, which are licensed fonts. |

## Known limits

- Below the hero, the sections are laid out like the PDF and scale with the window, so on a phone they shrink rather than reflow. (The hero itself adapts to phones.)
- The portrait in the PDF is only 310×304 px, so it looks soft on large screens.
- The three "My Creativity" pieces are phone screenshots, and the video projects are still frames — real clips would let the cards play.
- The diagonal toolbar in the PDF's hero (now only in `pdf-recreation.html`) is a screenshot from another creator's video; replace it before the site is shown to anyone.
