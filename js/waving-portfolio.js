/* Waving Portfolio Landing — a plain-JavaScript port of the React component
   `waving-portfolio-landing.tsx`, so it runs on this static site with no framework.

   A red-on-paper poster: a storm of condensed capitals streams across the screen and
   shutters away, every letter of the headline rolls into place like a slot reel, the
   giant shared letter lands last and the poster thumps. Then the rules draw, the labels
   decode, the dice corners slide in, and a hand-inked character rises from behind the
   baseline, raises an arm, waves, and leans into the pose.

   Hover a letter and it re-rolls. Hover or click the character and it waves back (its
   eyes follow the pointer). Click the dice to roll them, click the paper to throw
   letters, click the signature to replay the whole intro. Everything is drawn here —
   no fonts, images or packages load. The styles are in css/waving-portfolio.css.

   usage: mountWavingPortfolio(hostElement, { name, year, roles, ... })            */
(function () {
  "use strict";

  const SVGNS = "http://www.w3.org/2000/svg";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // Parse SVG markup into a single SVG element (innerHTML on an <svg> parses as SVG).
  function svgFrag(markup) {
    const holder = document.createElementNS(SVGNS, "svg");
    holder.innerHTML = markup;
    return holder.firstElementChild;
  }

  // #region glyphs
  // Monoline condensed capitals, drawn as centre-line paths and stroked with square caps,
  // so every letter fills its [0, w] x [0, h] box exactly at any stroke weight. Round
  // letters are stadiums, like the poster face they mimic.
  const WIDE = { A: 1.04, M: 1.3, N: 1.04, Q: 1.02, V: 1.04, W: 1.44, X: 1.02 };

  function glyphWidth(ch, w, s) {
    if (ch === "I") return s;
    if (ch === " ") return w * 0.5;
    return w * (WIDE[ch] ?? 1);
  }

  function glyphPath(ch, w, h, s) {
    const i = s / 2;
    const x0 = i;
    const x1 = w - i;
    const y0 = i;
    const y1 = h - i;
    const xm = w / 2;
    const ym = h / 2;
    const bw = x1 - x0;
    const bh = y1 - y0;
    const r = bw / 2;
    const c = Math.min(bw * 0.62, bh / 4);
    const q = (...parts) => parts.map((p) => (typeof p === "number" ? String(Math.round(p * 10) / 10) : p)).join(" ");
    const arc = (rad, sweep, x, y) => q("A", rad, rad, 0, 0, sweep, x, y);
    const stadium = q("M", x0, y0 + r) + arc(r, 1, x1, y0 + r) + q("L", x1, y1 - r) + arc(r, 1, x0, y1 - r) + "Z";
    const open = q("M", x1, y0 + r) + arc(r, 0, x0, y0 + r) + q("L", x0, y1 - r) + arc(r, 0, x1, y1 - r);
    const bowl = (yb) => {
      const k = Math.min(c, (yb - y0) / 2);
      return q("M", x0, y1, "L", x0, y0, "L", x1 - k, y0) + arc(k, 1, x1, y0 + k) + q("L", x1, yb - k) + arc(k, 1, x1 - k, yb) + q("L", x0, yb);
    };
    switch (ch) {
      case "A": {
        const ay = y0 + bh * 0.64;
        const t = (y1 - ay) / bh;
        return q("M", x0, y1, "L", xm, y0, "L", x1, y1, "M", x0 + (xm - x0) * t, ay, "L", x1 - (x1 - xm) * t, ay);
      }
      case "B": {
        const yb = y0 + bh * 0.47;
        const xt = x1 - s * 0.4;
        const ct = Math.min(c, (yb - y0) / 2, xt - x0);
        const cb = Math.min(c, (y1 - yb) / 2, bw);
        return (
          q("M", x0, yb, "L", xt - ct, yb) + arc(ct, 0, xt, yb - ct) + q("L", xt, y0 + ct) + arc(ct, 0, xt - ct, y0) +
          q("L", x0, y0, "L", x0, y1, "L", x1 - cb, y1) + arc(cb, 0, x1, y1 - cb) + q("L", x1, yb + cb) + arc(cb, 0, x1 - cb, yb) +
          q("L", x0, yb)
        );
      }
      case "C":
        return open;
      case "D": {
        const k = Math.min(bw * 0.75, bh / 2);
        return q("M", x0, y0, "L", x1 - k, y0) + arc(k, 1, x1, y0 + k) + q("L", x1, y1 - k) + arc(k, 1, x1 - k, y1) + q("L", x0, y1) + "Z";
      }
      case "E":
        return q("M", x1, y0, "L", x0, y0, "L", x0, y1, "L", x1, y1, "M", x0, ym, "L", x1 - bw * 0.12, ym);
      case "F":
        return q("M", x1, y0, "L", x0, y0, "L", x0, y1, "M", x0, ym - bh * 0.02, "L", x1 - bw * 0.12, ym - bh * 0.02);
      case "G":
        return open + q("L", x1, ym + bh * 0.04, "L", xm, ym + bh * 0.04);
      case "H":
        return q("M", x0, y0, "L", x0, y1, "M", x1, y0, "L", x1, y1, "M", x0, ym, "L", x1, ym);
      case "I":
        return q("M", xm, y0, "L", xm, y1);
      case "J":
        return q("M", x1, y0, "L", x1, y1 - r) + arc(r, 1, x0, y1 - r) + q("L", x0, y1 - r - bh * 0.06);
      case "K":
        return q("M", x0, y0, "L", x0, y1, "M", x1, y0, "L", x0, y0 + bh * 0.62, "M", x0 + bw * 0.28, y0 + bh * 0.47, "L", x1, y1);
      case "L":
        return q("M", x0, y0, "L", x0, y1, "L", x1, y1);
      case "M":
        return q("M", x0, y1, "L", x0, y0, "L", xm, y0 + bh * 0.55, "L", x1, y0, "L", x1, y1);
      case "N":
        return q("M", x0, y1, "L", x0, y0, "L", x1, y1, "L", x1, y0);
      case "O":
        return stadium;
      case "P":
        return bowl(y0 + bh * 0.52);
      case "Q":
        return stadium + q("M", xm + bw * 0.1, y1 - bh * 0.16, "L", x1 + s * 0.2, y1 + s * 0.3);
      case "R":
        return bowl(y0 + bh * 0.5) + q("M", x0 + bw * 0.42, y0 + bh * 0.5, "L", x1, y1);
      case "S":
        return q("M", x1, y0 + r) + arc(r, 0, x0, y0 + r) + q("C", x0, ym - bh * 0.02, x1, ym + bh * 0.02, x1, y1 - r) + arc(r, 1, x0, y1 - r);
      case "T":
        return q("M", x0, y0, "L", x1, y0, "M", xm, y0, "L", xm, y1);
      case "U":
        return q("M", x0, y0, "L", x0, y1 - r) + arc(r, 0, x1, y1 - r) + q("L", x1, y0);
      case "V":
        return q("M", x0, y0, "L", xm, y1, "L", x1, y0);
      case "W": {
        const k = bw * 0.24;
        return q("M", x0, y0, "L", x0 + k, y1, "L", xm, y0 + bh * 0.3, "L", x1 - k, y1, "L", x1, y0);
      }
      case "X":
        return q("M", x0, y0, "L", x1, y1, "M", x1, y0, "L", x0, y1);
      case "Y":
        return q("M", x0, y0, "L", xm, ym - bh * 0.04, "L", x1, y0, "M", xm, ym - bh * 0.04, "L", xm, y1);
      case "Z":
        return q("M", x0, y0, "L", x1, y0, "L", x0, y1, "L", x1, y1);
      default:
        return "";
    }
  }
  // #endregion glyphs

  // #region layout
  // The poster reads as two rows sharing one giant letter:  P [O] RT / F [O] LIO.
  // Left rows hug the giant letter, right rows start after the character's gap.
  const LH = 230; // letter height
  const LW = 115; // base letter width
  const LS = 22; // stroke
  const LGAP = 30; // letter spacing
  const ROWGAP = 20;
  const GW = 220; // giant letter base width
  const GS = 42; // giant stroke
  const MARGIN = 100;
  const CHAR_GAP = 520; // room between the giant letter and the right rows
  const TOP = 100;

  const cleanRow = (s) => s.toUpperCase().replace(/[^A-Z ]/g, "").trim();

  function rowWidth(str) {
    let t = 0;
    [...str].forEach((ch, i) => {
      t += glyphWidth(ch, LW, LS) + (i ? LGAP : 0);
    });
    return t;
  }

  function layoutPoster(left, giant, right, compact) {
    // Tall containers get a tighter gap and a smaller character, so the poster can fill
    // a phone's width instead of floating in the middle.
    const margin = compact ? 30 : MARGIN;
    const charGap = compact ? 390 : CHAR_GAP;
    const charScale = compact ? 0.84 : 1;
    const l = [cleanRow(left[0] || ""), cleanRow(left[1] || "")];
    const r = [cleanRow(right[0] || ""), cleanRow(right[1] || "")];
    const g = cleanRow(giant).replace(/ /g, "").slice(0, 1) || "O";
    const lw = Math.max(rowWidth(l[0]), rowWidth(l[1]));
    const rw = Math.max(rowWidth(r[0]), rowWidth(r[1]));
    const cells = [];
    const place = (str, xStart, row) => {
      let x = xStart;
      for (const ch of str) {
        const w = glyphWidth(ch, LW, LS);
        if (ch !== " ") cells.push({ ch, x, y: TOP + row * (LH + ROWGAP), w, h: LH, s: LS, row, giant: false });
        x += w + LGAP;
      }
    };
    l.forEach((row, i) => place(row, margin + lw - rowWidth(row), i));
    const gx = margin + lw + (lw ? LGAP : 0);
    const gw = g === "I" ? GS : GW * (WIDE[g] ?? 1);
    const gapStart = gx + gw;
    const rx = gapStart + charGap;
    r.forEach((row, i) => place(row, rx, i));
    cells.push({ ch: g, x: gx, y: TOP, w: gw, h: LH * 2 + ROWGAP, s: GS, row: 0, giant: true });
    const width = rx + rw + margin;
    return { cells, width, height: 700, margin, charScale, gapStart, charX: gapStart + charGap * 0.36, bottom: TOP + LH * 2 + ROWGAP };
  }
  // #endregion layout

  const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const LABEL = 30; // label font size, poster units
  const labelWidth = (s) => s.length * LABEL * 0.72;

  // Intro timeline, ms. The CSS carries the same beats.
  const SCRAMBLE_AT = 2650;
  const WAVE_AT = 4950;
  const READY_AT = 7000;
  const WAVE_MS = 1500;

  // Letters arrive one by one, each flickering through random capitals before it settles.
  function scramble(el, text, startAt, active) {
    cancelAnimationFrame(el._wplRaf || 0);
    if (!active) {
      el.textContent = text;
      return;
    }
    el.textContent = "";
    let last = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const t = now - t0 - startAt;
      if (t >= (text.length - 1) * 30 + 320) {
        el.textContent = text;
        return;
      }
      if (t >= 0 && now - last > 45) {
        last = now;
        let s = "";
        for (let i = 0; i < text.length && t >= i * 30; i++) {
          const ch = text[i];
          s += ch === " " || t > i * 30 + 320 ? ch : AZ[(Math.random() * 26) | 0];
        }
        el.textContent = s;
      }
      el._wplRaf = requestAnimationFrame(tick);
    };
    el._wplRaf = requestAnimationFrame(tick);
  }

  function pips(n) {
    const m = {
      1: [[0, 0]],
      2: [[-1, -1], [1, 1]],
      3: [[-1, -1], [0, 0], [1, 1]],
      4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
      5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
      6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
    };
    return m[n] || m[1];
  }

  function ruleSVG(a, b, y, mid, delay, color) {
    if (b - a < 40) return "";
    const dots = mid ? [a, (a + b) / 2, b] : [a, b];
    return (
      `<g><path class="wpl-draw" pathLength="1" d="M ${a} ${y} L ${b} ${y}" stroke="${color}" stroke-width="3" style="animation-delay:${delay}s"/>` +
      dots.map((x, k) => `<circle class="wpl-dot" cx="${x}" cy="${y}" r="6.5" fill="${color}" style="animation-delay:${delay + k * 0.35}s"/>`).join("") +
      "</g>"
    );
  }

  // One headline letter: its real glyph plus a column of random capitals stacked above it,
  // which slides down through a window like a slot reel and stops on the real one.
  function reelSVG(c, i, roll, intro, delay, color) {
    const pitch = c.h + c.s * 2 + 24;
    const n = roll > 0 ? 6 : c.giant ? 14 : 10;
    const base = c.giant ? GW : LW;
    const rolling = intro || roll > 0;
    let reel = "";
    if (rolling) {
      for (let k = 1; k < n; k++) {
        const ch = AZ[Math.floor(hash(i * 131 + roll * 977 + k * 53) * 26)];
        const w = Math.min(glyphWidth(ch, base, c.s), c.w * 1.25);
        reel += `<path transform="translate(${(c.w - w) / 2} ${-k * pitch})" d="${glyphPath(ch, w, c.h, c.s)}"/>`;
      }
    }
    const style = `--dist:${(n - 1) * pitch}px;--delay:${roll > 0 ? 0 : delay}s;--dur:${roll > 0 ? "0.7s" : c.giant ? "0.85s" : "1s"}`;
    return (
      `<g class="wpl-reel${rolling ? " is-rolling" : ""}" style="${style}" fill="none" stroke="${color}" stroke-width="${c.s}" stroke-linecap="square" stroke-miterlimit="4">` +
      `<path d="${glyphPath(c.ch, c.w, c.h, c.s)}"/>${reel}</g>`
    );
  }

  function cellSVG(c, i, roll, intro, delay, color) {
    const pad = c.s;
    return (
      `<g class="wpl-cell${c.giant ? " wpl-giant" : ""}" data-i="${i}">` +
      `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="transparent"/>` +
      `<svg x="${c.x - pad}" y="${c.y - pad}" width="${c.w + pad * 2}" height="${c.h + pad * 2}" viewBox="${-pad} ${-pad} ${c.w + pad * 2} ${c.h + pad * 2}" overflow="hidden">` +
      reelSVG(c, i, roll, intro, delay, color) +
      "</svg></g>"
    );
  }

  function signatureSVG(lines, color) {
    const H = 26;
    const S = 3.6;
    const G = 4;
    const rows = lines.map((line) => {
      const chars = [...line.replace(/[^A-Z ]/g, "")];
      let x = 0;
      const items = chars.map((ch) => {
        const w = glyphWidth(ch, 15, S);
        const it = { ch, x, w };
        x += w + G;
        return it;
      });
      return { items, width: Math.max(0, x - G) };
    });
    const widest = Math.max(1, ...rows.map((r) => r.width));
    const k = Math.min(1, 80 / widest);
    const ys = rows.length > 1 ? [30, 66] : [48];
    let n = 0;
    let out =
      '<svg viewBox="-10 -18 140 140" aria-hidden="true">' +
      `<path class="wpl-draw" pathLength="1" d="M 60 8 C 96 6 116 30 114 62 C 112 96 88 114 58 112 C 26 110 6 88 8 58 C 10 28 30 10 66 12" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" style="animation-delay:3s"/>`;
    rows.forEach((row, ri) => {
      out += `<g transform="translate(${60 - (row.width * k) / 2} ${ys[ri] - (H * k) / 2}) scale(${k})">`;
      row.items.forEach((it) => {
        const j = n++;
        const rot = (hash(j * 7 + 3) - 0.5) * 16;
        const dy = (hash(j * 11 + 5) - 0.5) * 5;
        out += `<path class="wpl-draw" pathLength="1" transform="translate(${it.x} ${dy}) rotate(${rot} ${it.w / 2} ${H / 2})" d="${glyphPath(it.ch, it.w, H, S)}" fill="none" stroke="${color}" stroke-width="${S}" stroke-linecap="round" stroke-linejoin="round" style="animation-delay:${3.2 + j * 0.07}s"/>`;
      });
      out += "</g>";
    });
    ["M 110 2 L 118 -8", "M 118 16 L 130 11", "M 100 -2 L 101 -14"].forEach((d, i) => {
      out += `<path class="wpl-draw wpl-spark" pathLength="1" d="${d}" stroke="${color}" stroke-width="4" stroke-linecap="round" style="animation-delay:${3.8 + i * 0.08}s"/>`;
    });
    return out + "</svg>";
  }

  // #region character
  // Local frame 0 0 460 600; the bottom edge is the baseline the character rises from.
  // Rig pivots (mirrored in the CSS transform-origins): tilt/breathe at the feet
  // (205, 600), shoulder (288, 248), elbow (348, 346), wrist (392, 216), neck (203, 200).
  function characterSVG(ink, paper, shirtId) {
    const torso =
      "M 120 240 C 134 222 166 213 202 213 C 240 213 272 221 290 238 C 300 285 298 345 292 392 C 288 440 288 478 290 520 L 120 520 C 120 478 118 440 114 392 C 108 345 108 285 120 240 Z";
    const limb = (d, w) =>
      `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w + 8}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="${paper}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const fingers = ["M 388 170 L 380 116", "M 399 166 L 399 106", "M 410 168 L 418 112", "M 419 178 L 434 136", "M 382 192 L 352 170"];
    const specks = Array.from({ length: 64 }, (_, k) => [110 + hash(k * 3.1) * 190, 215 + hash(k * 5.7 + 1) * 305, 1 + hash(k * 9.3 + 2) * 1.8]);
    return `<g class="wpl-rise"><g class="wpl-tilt"><g class="wpl-breathe">
<path d="M 128 505 L 286 505 L 294 640 L 120 640 Z" fill="${ink}"/>
<path d="M 206 548 L 208 640" stroke="${paper}" stroke-width="3"/>
<path d="M 184 158 L 184 226 L 222 226 L 222 158 Z" fill="${paper}" stroke="${ink}" stroke-width="4"/>
<clipPath id="${shirtId}"><path d="${torso}"/></clipPath>
<path d="${torso}" fill="${ink}"/>
<g clip-path="url(#${shirtId})" fill="${paper}" opacity="0.8">${specks.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
<path d="M 178 216 L 203 262 L 228 216 Z" fill="${paper}"/>
<path d="M 168 218 L 180 252 L 200 267 M 238 218 L 226 252 L 206 267" fill="none" stroke="${paper}" stroke-width="3" stroke-linejoin="round"/>
<path d="M 203 280 L 203 505" stroke="${paper}" stroke-width="6" stroke-linecap="round" stroke-dasharray="0 36"/>
<path d="M 122 512 C 160 518 250 518 288 512" fill="none" stroke="${paper}" stroke-width="3"/>
${limb("M 118 384 C 140 410 168 428 194 438", 30)}
<circle cx="204" cy="440" r="24" fill="${ink}"/>
<circle cx="204" cy="440" r="20" fill="${paper}"/>
<path d="M 206 426 C 214 430 218 438 216 448 M 196 446 C 202 452 210 454 216 450" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
<path d="M 124 250 C 110 300 106 345 112 382" fill="none" stroke="${ink}" stroke-width="50" stroke-linecap="round"/>
<path d="M 144 282 C 136 320 134 350 138 376" fill="none" stroke="${paper}" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 90 380 C 102 394 126 396 140 386" fill="none" stroke="${paper}" stroke-width="2.5" stroke-linecap="round"/>
<g class="wpl-uarm"><g class="wpl-farm">
${limb("M 350 350 L 392 214", 30)}
<path d="M 381 252 L 387 233" stroke="${ink}" stroke-width="40"/>
<circle cx="384" cy="243" r="8" fill="${paper}" stroke="${ink}" stroke-width="3"/>
<g class="wpl-hand">
<ellipse cx="400" cy="180" rx="31" ry="35" fill="${ink}" transform="rotate(12 400 180)"/>
${fingers.map((d) => `<path d="${d}" stroke="${ink}" stroke-width="24" stroke-linecap="round"/>`).join("")}
<ellipse cx="400" cy="180" rx="27" ry="31" fill="${paper}" transform="rotate(12 400 180)"/>
${fingers.map((d) => `<path d="${d}" stroke="${paper}" stroke-width="16" stroke-linecap="round"/>`).join("")}
<path d="M 392 196 C 400 202 410 200 416 192 M 394 150 L 394 164 M 405 148 L 405 162" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
</g></g>
<path d="M 288 250 C 312 280 330 310 344 340" fill="none" stroke="${ink}" stroke-width="50" stroke-linecap="round"/>
<path d="M 282 294 C 296 316 306 334 314 350" fill="none" stroke="${paper}" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 318 344 Q 342 356 364 324" fill="none" stroke="${paper}" stroke-width="2.5" stroke-linecap="round"/>
</g>
<g class="wpl-head"><g class="wpl-look">
<ellipse cx="158" cy="118" rx="12" ry="18" fill="${paper}" stroke="${ink}" stroke-width="4"/>
<path d="M 156 110 C 162 112 162 124 156 126" fill="none" stroke="${ink}" stroke-width="2.5"/>
<path d="M 160 92 C 158 142 172 180 206 184 C 240 182 258 150 258 100 C 258 64 236 46 208 46 C 180 46 162 64 160 92 Z" fill="${paper}" stroke="${ink}" stroke-width="4"/>
<path d="M 154 108 C 146 70 156 30 196 18 C 232 8 276 16 284 44 C 288 60 278 72 264 72 C 250 62 226 60 206 66 C 186 72 172 86 168 110 Z" fill="${ink}"/>
<path d="M 160 94 L 166 126 L 173 104 Z" fill="${ink}"/>
<path d="M 196 30 C 220 22 250 24 266 38 M 190 44 C 210 36 236 38 250 46" fill="none" stroke="${paper}" stroke-width="2.5" stroke-linecap="round"/>
<g class="wpl-brows"><path d="M 176 88 C 184 84 194 84 202 87 M 218 87 C 226 84 238 84 246 88" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/></g>
<g class="wpl-eyes"><g class="wpl-pupils"><circle cx="189" cy="110" r="4.4" fill="${ink}"/><circle cx="232" cy="110" r="4.4" fill="${ink}"/></g></g>
<path class="wpl-happy" d="M 182 113 Q 189 104 196 113 M 225 113 Q 232 104 239 113" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>
<path d="M 172 102 L 160 100 M 206 105 C 209 101 211 101 214 105" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
<rect x="172" y="96" width="34" height="26" rx="5" fill="none" stroke="${ink}" stroke-width="4.5"/>
<rect x="214" y="96" width="36" height="26" rx="5" fill="none" stroke="${ink}" stroke-width="4.5"/>
<path d="M 214 118 C 211 132 206 142 214 146 C 219 148 224 146 226 143" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>
<path class="wpl-smile" d="M 196 158 C 206 166 222 166 234 156" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>
<path class="wpl-grin" d="M 195 156 C 206 174 226 172 236 154 Z" fill="${ink}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
<path d="M 238 150 C 241 153 241 157 239 160" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
</g></g>
</g></g></g>`;
  }
  // #endregion character

  function mountWavingPortfolio(host, options) {
    const o = Object.assign(
      {
        name: "Kedhareswer",
        year: "2026",
        roles: ["Graphic Designer", "Illustrator"],
        lettersLeft: ["P", "F"],
        giantLetter: "O",
        lettersRight: ["RT", "LIO"],
        title: "Portfolio",
        signature: "",
        greeting: "Hi there!",
        accent: "#e5262c",
        paper: "#f6f4f0",
        ink: "#141414",
        intro: true,
        height: "100svh",
      },
      options || {},
    );
    const { accent, paper, ink } = o;
    const uid = "wpl-" + Math.random().toString(36).slice(2, 8);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    let ready = !o.intro;
    let waving = false;
    let rolls = [];
    const dice = [2, 1];
    const diceSpin = [0, 0];
    let compact = false;
    let L = null;
    let frame = 0;
    let introTimers = [];
    const lastRoll = [];
    const playing = () => o.intro && !reduced;
    const later = (fn, ms) => setTimeout(fn, ms);

    const nameU = o.name.toUpperCase();
    const yearU = o.year.toUpperCase();
    const roleL = (o.roles[0] || "").toUpperCase();
    const roleR = (o.roles[1] || "").toUpperCase();
    const sig = o.signature
      ? o.signature.toUpperCase().split("/").slice(0, 2)
      : (() => {
          const first = (o.name.trim().split(/\s+/)[0] || "").toUpperCase().replace(/[^A-Z]/g, "");
          const cut = Math.ceil(first.length / 2);
          return first.length > 3 ? [first.slice(0, cut), first.slice(cut)] : [first];
        })();

    const root = document.createElement("div");
    root.className = "wpl-root";
    root.style.height = o.height;
    root.style.setProperty("--wpl-accent", accent);
    root.style.setProperty("--wpl-paper", paper);
    root.style.setProperty("--wpl-ink", ink);
    root.innerHTML =
      `<h2 class="wpl-sr">${esc(o.title)}</h2>` +
      `<p class="wpl-sr">${esc(o.name)}, ${esc(o.roles.filter(Boolean).join(" and "))}, ${esc(o.year)}</p>` +
      '<div class="wpl-stage"></div>';
    host.appendChild(root);
    let stage = root.querySelector(".wpl-stage");

    const letters = () => L.cells.map((c) => c.ch).join("") || "ABC";
    const charBox = () => {
      const k = L.charScale;
      return { k, left: L.charX - 205 * k };
    };

    function bubbleSVG() {
      const { k, left } = charBox();
      const bw = o.greeting.length * 19 + 48;
      const bx = left + 372 * k;
      return (
        '<g class="wpl-bubble" aria-hidden="true">' +
        `<path d="M ${bx} 20 h ${bw} v 56 h ${-(bw - 34)} l -30 22 l 6 -22 h -10 Z" fill="${paper}" stroke="${accent}" stroke-width="4" stroke-linejoin="round"/>` +
        `<text class="wpl-label wpl-bubble-text" x="${bx + bw / 2}" y="58" text-anchor="middle">${esc(o.greeting.toUpperCase())}</text></g>`
      );
    }

    function stormHTML() {
      const pool = letters() + letters() + AZ;
      let out = '<div class="wpl-storm" aria-hidden="true">';
      for (let row = 0; row < 7; row++) {
        let x = 0;
        const half = [];
        for (let k = 0; k < 34; k++) {
          const ch = pool[Math.floor(hash(row * 97 + k * 13) * pool.length)];
          const w = glyphWidth(ch, 62, 12);
          half.push({ ch, x, w });
          x += w + 26;
        }
        const span = x;
        const dir = row % 2 ? "r" : "l";
        let glyphs = "";
        [0, span].forEach((off) =>
          half.forEach((g) => {
            const d = glyphPath(g.ch, g.w, 140, 12);
            const hollow = row % 3 !== 0;
            glyphs +=
              `<g transform="translate(${off + g.x} 0)"><path d="${d}" stroke="${row % 3 === 2 ? ink : accent}" stroke-width="12"/>` +
              (hollow ? `<path d="${d}" stroke="${paper}" stroke-width="5"/>` : "") +
              "</g>";
          }),
        );
        out +=
          `<div class="wpl-srow" data-dir="${dir}" style="animation-delay:${row * 0.04}s, ${1.25 + row * 0.06}s">` +
          `<svg class="wpl-strip" data-dir="${dir}" viewBox="0 -6 ${span * 2} 152" style="animation-duration:${4.6 + (row % 3) * 1.5}s" fill="none" stroke-linecap="square" stroke-miterlimit="4">` +
          glyphs +
          "</svg></div>";
      }
      return out + "</div>";
    }

    function pipsSVG(k) {
      return (
        `<g class="wpl-pips${diceSpin[k] ? " is-rolled" : ""}"><rect x="10" y="8" width="76" height="76" fill="none"/>` +
        pips(dice[k]).map(([px, py]) => `<circle cx="${48 + px * 20}" cy="${46 + py * 20}" r="7.5" fill="${paper}"/>`).join("") +
        "</g>"
      );
    }

    function cornerHTML(k) {
      return (
        `<button type="button" class="wpl-corner ${k ? "wpl-corner-r" : "wpl-corner-l"}" data-die="${k}" aria-label="Roll the dice, showing ${dice[k]}">` +
        '<svg viewBox="0 0 170 170" aria-hidden="true">' +
        [108, 124, 140].map((v) => `<path d="M 0 ${v} L ${v} ${v} L ${v} 0" fill="none" stroke="${accent}" stroke-width="2"/>`).join("") +
        `<rect x="0" y="0" width="92" height="92" fill="${accent}"/>` +
        pipsSVG(k) +
        "</svg></button>"
      );
    }

    function posterSVG(intro) {
      const { k, left } = charBox();
      const nameEnd = L.margin + labelWidth(nameU) + 26;
      const yearStart = L.width - L.margin - labelWidth(yearU) - 26;
      const roleLEnd = L.margin + labelWidth(roleL) + 26;
      const roleRStart = L.width - L.margin - labelWidth(roleR) - 26;
      const cells = L.cells
        .map((c, i) => cellSVG(c, i, rolls[i] || 0, intro, c.giant ? 1.75 : 1 + (c.x / L.width) * 0.55 + c.row * 0.1, accent))
        .join("");
      return (
        `<svg class="wpl-poster" viewBox="0 0 ${L.width} ${L.height}" preserveAspectRatio="xMidYMid meet">` +
        '<g class="wpl-par-lines" aria-hidden="true">' +
        `<text class="wpl-label" data-label="name" x="${L.margin}" y="73"></text>` +
        `<text class="wpl-label" data-label="year" x="${L.width - L.margin}" y="73" text-anchor="end"></text>` +
        ruleSVG(nameEnd, yearStart, 62, true, 2.55, accent) +
        `<text class="wpl-label" data-label="roleL" x="${L.margin}" y="663"></text>` +
        `<text class="wpl-label" data-label="roleR" x="${L.width - L.margin}" y="663" text-anchor="end"></text>` +
        ruleSVG(roleLEnd, roleRStart, 652, false, 2.75, accent) +
        "</g>" +
        `<g class="wpl-par-letters" aria-hidden="true">${cells}</g>` +
        '<g class="wpl-par-char">' +
        `<svg x="${left}" y="${605 - 600 * k}" width="${460 * k}" height="${600 * k}" viewBox="0 0 460 600" overflow="hidden">` +
        `<g class="wpl-char${waving ? " is-waving" : ""}" role="button" tabindex="0" aria-label="Wave hello">${characterSVG(ink, paper, uid + "-shirt")}</g>` +
        "</svg></g>" +
        (waving ? bubbleSVG() : "") +
        "</svg>"
      );
    }

    function render() {
      const box = root.getBoundingClientRect();
      if (box.width && box.height) compact = box.width / box.height < 0.9;
      L = layoutPoster(o.lettersLeft, o.giantLetter, o.lettersRight, compact);
      const intro = playing() && !ready;
      root.dataset.intro = !o.intro ? "off" : ready ? "done" : "on";
      const fresh = document.createElement("div");
      fresh.className = "wpl-stage";
      fresh.innerHTML =
        posterSVG(intro) +
        (intro ? stormHTML() : "") +
        cornerHTML(0) +
        cornerHTML(1) +
        `<button type="button" class="wpl-sign" aria-label="${playing() ? "Replay the intro" : "Wave again"}">${signatureSVG(sig, accent)}</button>`;
      stage.replaceWith(fresh);
      stage = fresh;
      wire();
      const labels = { name: [nameU, SCRAMBLE_AT], year: [yearU, SCRAMBLE_AT + 250], roleL: [roleL, SCRAMBLE_AT + 150], roleR: [roleR, SCRAMBLE_AT + 400] };
      stage.querySelectorAll("[data-label]").forEach((el) => {
        const [text, at] = labels[el.dataset.label];
        scramble(el, text, at, intro);
      });
    }

    function wire() {
      stage.querySelectorAll(".wpl-cell").forEach((g) => g.addEventListener("pointerenter", () => reroll(+g.dataset.i)));
      const ch = stage.querySelector(".wpl-char");
      ch.addEventListener("pointerenter", (e) => {
        if (ready && e.pointerType !== "touch") wave();
      });
      ch.addEventListener("click", wave);
      ch.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          wave();
        }
      });
      stage.querySelectorAll(".wpl-corner").forEach((b) => b.addEventListener("click", () => rollDie(+b.dataset.die)));
      stage.querySelector(".wpl-sign").addEventListener("click", replay);
    }

    function wave() {
      if (waving) return;
      waving = true;
      stage.querySelector(".wpl-char")?.classList.add("is-waving");
      stage.querySelector(".wpl-poster")?.appendChild(svgFrag(bubbleSVG()));
      later(() => {
        waving = false;
        stage.querySelector(".wpl-char")?.classList.remove("is-waving");
        stage.querySelector(".wpl-bubble")?.remove();
      }, WAVE_MS);
    }

    function reroll(i) {
      if (!ready || reduced) return;
      const now = performance.now();
      if (now - (lastRoll[i] || 0) < 750) return;
      lastRoll[i] = now;
      rolls[i] = (rolls[i] || 0) + 1;
      const win = stage.querySelector(`.wpl-cell[data-i="${i}"] > svg`);
      if (win) win.innerHTML = reelSVG(L.cells[i], i, rolls[i], false, 0, accent);
    }

    function rollDie(k) {
      let v = dice[k];
      while (v === dice[k]) v = 1 + ((Math.random() * 6) | 0);
      dice[k] = v;
      diceSpin[k] += 1;
      const btn = stage.querySelector(`.wpl-corner[data-die="${k}"]`);
      btn.setAttribute("aria-label", "Roll the dice, showing " + v);
      btn.querySelector(".wpl-pips").replaceWith(svgFrag(pipsSVG(k)));
    }

    function startIntro() {
      introTimers.forEach(clearTimeout);
      introTimers = [];
      ready = !playing();
      render();
      if (!playing()) return;
      introTimers.push(later(wave, WAVE_AT));
      introTimers.push(
        later(() => {
          ready = true;
          root.dataset.intro = "done";
          stage.querySelector(".wpl-storm")?.remove();
        }, READY_AT),
      );
    }

    function replay() {
      rolls = [];
      lastRoll.length = 0;
      root.querySelectorAll(".wpl-burst").forEach((b) => b.remove());
      waving = false;
      if (playing()) startIntro();
      else wave();
    }

    // Pointer parallax, plus the character's eyes and head following the cursor.
    root.addEventListener("pointermove", (e) => {
      if (reduced || e.pointerType === "touch") return;
      const px = e.clientX;
      const py = e.clientY;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = root.getBoundingClientRect();
        const kk = (v, d) => Math.max(-1, Math.min(1, v / d));
        root.style.setProperty("--wpl-mx", (((px - r.left) / r.width) * 2 - 1).toFixed(3));
        root.style.setProperty("--wpl-my", (((py - r.top) / r.height) * 2 - 1).toFixed(3));
        const head = stage.querySelector(".wpl-head");
        if (!head) return;
        const h = head.getBoundingClientRect();
        const dx = px - (h.left + h.width / 2);
        const dy = py - (h.top + h.height / 2);
        root.style.setProperty("--wpl-ex", (kk(dx, 260) * 4.5).toFixed(2));
        root.style.setProperty("--wpl-ey", (kk(dy, 260) * 3.5).toFixed(2));
        root.style.setProperty("--wpl-hr", (kk(dx, 700) * 7).toFixed(2));
      });
    });

    root.addEventListener("pointerleave", () => {
      for (const v of ["--wpl-mx", "--wpl-my", "--wpl-ex", "--wpl-ey", "--wpl-hr"]) root.style.setProperty(v, "0");
    });

    // Click the paper to throw a burst of letters.
    root.addEventListener("pointerdown", (e) => {
      if (reduced) return;
      if (e.target.closest("button,.wpl-char,.wpl-cell")) return;
      const r = root.getBoundingClientRect();
      const pool = letters();
      let bits = "";
      for (let n = 0; n < 10; n++) {
        const a = (n / 10) * Math.PI * 2 + Math.random() * 0.5;
        const d = 50 + Math.random() * 90;
        const ch = pool[(Math.random() * pool.length) | 0];
        bits +=
          `<svg class="wpl-bit" viewBox="-3 -3 26 38" style="--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 24}px;--rot:${(Math.random() - 0.5) * 260}deg">` +
          `<path d="${glyphPath(ch, glyphWidth(ch, 14, 3.4), 32, 3.4)}" fill="none" stroke="${n % 3 ? accent : ink}" stroke-width="3.4" stroke-linecap="square"/></svg>`;
      }
      const burst = document.createElement("div");
      burst.className = "wpl-burst";
      burst.setAttribute("aria-hidden", "true");
      burst.style.left = e.clientX - r.left + "px";
      burst.style.top = e.clientY - r.top + "px";
      burst.innerHTML = bits;
      root.appendChild(burst);
      const all = root.querySelectorAll(".wpl-burst");
      if (all.length > 6) all[0].remove();
      later(() => burst.remove(), 1100);
    });

    mq.addEventListener("change", () => {
      reduced = mq.matches;
      startIntro();
    });

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (width && height && width / height < 0.9 !== compact) render();
      }).observe(root);
    }

    startIntro();
    return { replay, wave };
  }

  window.mountWavingPortfolio = mountWavingPortfolio;
})();
