/* The video player popup, used by both pages.
   Each video card is a link to its clip on Google Drive (<a class="video-link">). A plain click
   opens the clip here instead, in a player frame styled after the shadcn "player-layout"
   component: title and buttons on top, the video filling the frame. Google Drive's own player
   does the playing, because a page cannot control a Drive video from outside; its controls
   (play, seek, volume, fullscreen) are the real ones.
   Without JavaScript, or with Cmd/Ctrl/Shift/middle-click, the link still opens Drive. */
(function () {
  "use strict";

  const dialog = document.createElement("dialog");
  dialog.className = "vp";
  dialog.setAttribute("aria-label", "Video player");
  dialog.innerHTML = `
    <div class="vp-frame">
      <div class="vp-top">
        <p class="vp-title"></p>
        <a class="vp-btn vp-open" target="_blank" rel="noopener noreferrer" aria-label="Open in Google Drive">
          <span class="vp-open-text">Open in Drive</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>
        </a>
        <button class="vp-btn vp-close" type="button" aria-label="Close video">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="vp-media">
        <p class="vp-loading">Loading video…</p>
      </div>
    </div>`;
  document.body.appendChild(dialog);

  const title = dialog.querySelector(".vp-title");
  const openInDrive = dialog.querySelector(".vp-open");
  const media = dialog.querySelector(".vp-media");
  let opener = null;

  function open(link) {
    const href = link.getAttribute("href");
    const id = (href.match(/\/file\/d\/([^/?#]+)/) || [])[1];
    if (!id) return false;

    // The card's picture tells the shape: the gym reel is tall, the rest are wide.
    const img = link.querySelector("image");
    const tall = img && +img.getAttribute("height") > +img.getAttribute("width");
    dialog.classList.toggle("vp-tall", !!tall);

    title.textContent = (link.getAttribute("aria-label") || "")
      .replace(/^Watch /, "")
      .replace(/ \(opens in a new tab\)$/, "");
    openInDrive.href = href;

    const frame = document.createElement("iframe");
    frame.src = `https://drive.google.com/file/d/${id}/preview`;
    frame.title = title.textContent;
    frame.allow = "autoplay; fullscreen";
    frame.allowFullscreen = true;
    frame.addEventListener("load", () => media.classList.add("vp-ready"));
    media.classList.remove("vp-ready");
    media.querySelector("iframe")?.remove();
    media.appendChild(frame);

    opener = link;
    dialog.showModal();
    return true;
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  // Closing always stops the video: the iframe is removed, not just hidden.
  dialog.addEventListener("close", () => {
    media.querySelector("iframe")?.remove();
    if (opener) opener.focus();
    opener = null;
  });

  dialog.querySelector(".vp-close").addEventListener("click", close);
  // A click on the dark backdrop lands on the <dialog> itself, not on the frame inside it.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });

  document.addEventListener("click", (e) => {
    const link = e.target.closest && e.target.closest("a.video-link");
    if (!link || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (open(link)) e.preventDefault();
  });
})();
