(function () {
  const STORAGE_KEY = "ifrs-junior-progress";

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function toast(message) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  // Mark complete button (on module pages)
  document.querySelectorAll("[data-mark-complete]").forEach((btn) => {
    const moduleId = btn.dataset.markComplete;
    const progress = loadProgress();
    const isDone = !!progress[moduleId];
    setBtnState(btn, isDone);

    btn.addEventListener("click", () => {
      const p = loadProgress();
      if (p[moduleId]) {
        delete p[moduleId];
        saveProgress(p);
        setBtnState(btn, false);
        toast("Marked as not complete");
      } else {
        p[moduleId] = { completedAt: new Date().toISOString() };
        saveProgress(p);
        setBtnState(btn, true);
        toast("Module marked complete");
      }
    });
  });

  function setBtnState(btn, done) {
    if (done) {
      btn.textContent = "✓ Completed (click to undo)";
      btn.classList.remove("primary");
      btn.classList.add("done");
    } else {
      btn.textContent = "Mark module complete";
      btn.classList.add("primary");
      btn.classList.remove("done");
    }
  }

  // Reflect progress on the landing page module cards
  document.querySelectorAll("[data-module-card]").forEach((card) => {
    const id = card.dataset.moduleCard;
    const progress = loadProgress();
    if (progress[id]) {
      const badge = card.querySelector(".badge");
      if (badge && !badge.classList.contains("soon")) {
        badge.textContent = "Completed";
        badge.classList.remove("available");
        badge.classList.add("complete");
      }
    }
  });

  // QR code rendering — encodes current page URL by default,
  // or a `data-qr` override if set. Uses vendored qrcode-generator library.
  document.querySelectorAll(".qr-code").forEach((el) => {
    if (typeof qrcode !== "function") return;
    const url = el.dataset.qr || window.location.href;
    try {
      const qr = qrcode(0, "M");
      qr.addData(url);
      qr.make();
      el.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
      const svg = el.querySelector("svg");
      if (svg) {
        svg.setAttribute("width", "110");
        svg.setAttribute("height", "110");
        svg.style.display = "block";
      }
    } catch (e) {
      el.textContent = "QR could not be generated.";
    }
  });

  // Copy YouTube links button
  document.querySelectorAll("[data-copy-links]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const links = btn.dataset.copyLinks
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)
        .join("\n");
      try {
        await navigator.clipboard.writeText(links);
        toast("YouTube links copied — paste into NotebookLM");
      } catch {
        toast("Copy failed — select manually");
      }
    });
  });
})();
