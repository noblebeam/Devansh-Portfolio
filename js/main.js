/* Page behaviour for index.html:
   1. mounts the waving poster intro as the hero (js/waving-portfolio.js);
   2. scrolls every other element in. The generator wraps each drawn element of the rebuilt
      PDF sections in <g class="rv rv-KIND" style="--i:N">; this adds .in as it comes into
      view and CSS does the motion. All-caps captions decode like the hero's labels. */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hero = document.getElementById("home");
  if (hero && window.mountWavingPortfolio) {
    window.mountWavingPortfolio(hero, {
      name: "Devansh Gupta",
      year: "2026",
      roles: ["Video Editor", "Graphic Designer"],
      lettersLeft: ["P", "F"],
      giantLetter: "O",
      lettersRight: ["RT", "LIO"],
      title: "Portfolio",
      signature: "DEV/ANSH",
      greeting: "Hi there!",
      accent: "#e52a2a", // the PDF's red
      paper: "#f4f2ec",
      ink: "#111111",
    });
  }

  // Captions keep their full length the whole time (spaces, then flickering capitals, then
  // the real letter), because each line is stretched to the PDF's exact width.
  const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function decode(el, delay) {
    const text = el.textContent;
    const start = performance.now() + delay;
    let last = 0;
    const step = (now) => {
      const t = now - start;
      if (t >= (text.length - 1) * 30 + 320) {
        el.textContent = text;
        return;
      }
      if (now - last > 45) {
        last = now;
        let s = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (t < i * 30) s += " ";
          else if (t < i * 30 + 320 && /[A-Z]/.test(ch)) s += AZ[(Math.random() * 26) | 0];
          else s += ch;
        }
        el.textContent = s;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const items = document.querySelectorAll(".page .rv");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.classList.add("in");
        io.unobserve(el);
        const i = parseInt(el.style.getPropertyValue("--i"), 10) || 0;
        el.querySelectorAll("[data-decode]").forEach((t) => decode(t, Math.min(i, 16) * 55 + 200));
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  items.forEach((el) => io.observe(el));
})();
