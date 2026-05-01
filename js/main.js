/**
 * main.js — Page Transition Demo Orchestrator
 */

import { createTransition } from "./transitions/create-transition.js";

// ── Constants ────────────────────────────────────────────────
const TOTAL = 50;

/** Human-readable name shown in the label for each transition */
const NAMES = [
  "Drift In",          //  1
  "Rise Up",           //  2
  "Slide Left",        //  3
  "Drop Down",         //  4
  "Unshutter",         //  5
  "Iris Expand",       //  6
  "Split Center",      //  7
  "Blind Expand",      //  8
  "Flicker Wipe",      //  9
  "Pull Through",      // 10
  "Corner Iris",       // 11
  "Scale Bloom",       // 12
  "Poly Reveal",       // 13
  "Bottom Lift",       // 14
  "Curtain Down",      // 15
  "Top-Right Iris",    // 16
  "Overlay Wipe",      // 17
  "Top Slice",         // 18
  "Scale Mask",        // 19
  "Flash Sweep",       // 20
  "Diagonal Slash",    // 21
  "Twin Curtain",      // 22
  "Ripple Burst",      // 23
  "Page Curl",         // 24
  "Depth Push",        // 25
  "Cascade Drop",      // 26
  "Glitch Slam",       // 27
  "Prism Slide",       // 28
  "Elastic Gate",      // 29
  "Grand Finale",      // 30
  "Cinematic Bars",    // 31
  "Hexagon Expand",    // 32
  "Venetian Blinds",   // 33
  "Diagonal Stagger",  // 34
  "Cross Split",       // 35
  "Shutter Twist",     // 36
  "Diamond Sweep",     // 37
  "Accordion Fold",    // 38
  "Center Pinch",      // 39
  "Orbital Sweep",     // 40
  "Glitch Slice",      // 41
  "Triangle Unfold",   // 42
  "Elastic Drop",      // 43
  "The Void",          // 44
  "Double Door Sweep", // 45
  "Ripple Offset",     // 46
  "Skewed Blocks",     // 47
  "Iris Blink",        // 48
  "Sawtooth Wipe",     // 49
  "The Masterpiece",   // 50
];

// ── DOM refs ─────────────────────────────────────────────────
const grid            = document.querySelector("#transition-grid");
const previewStage    = document.querySelector("#preview-stage");
const fullscreenBtn   = document.querySelector("#fullscreen-btn");
const labelIndex      = document.querySelector("#label-index");
const labelName       = document.querySelector("#label-name");
const tlBtnPlay       = document.querySelector("#tl-btn-play");
const tlBtnRev        = document.querySelector("#tl-btn-rev");
const toggleBtn       = document.querySelector("#toggle-carousel-btn");
const carouselOverlay = document.querySelector("#carousel-overlay");
const carouselBackdrop= document.querySelector("#carousel-backdrop");
const docBtn          = document.querySelector("#doc-btn");
const docLightbox     = document.querySelector("#doc-lightbox");
const docClose        = document.querySelector("#doc-close");
const docBackdrop     = document.querySelector("#doc-backdrop");

if (!grid || !previewStage || !tlBtnPlay || !tlBtnRev) {
  throw new Error("Required nodes missing: check DOM IDs");
}

// ── State ────────────────────────────────────────────────────
/** @type {{ play:Function, reverse:Function, kill:Function, isPlaying:boolean }|null} */
let activeCtrl      = null;
let activeIndex     = null;   // 1-based
let activeDirection = "play"; // "play" | "reverse"

// ── Card builder ─────────────────────────────────────────────
function buildCards() {
  const frag = document.createDocumentFragment();

  for (let i = 1; i <= TOTAL; i++) {
    const btn = document.createElement("button");
    btn.className = "card";
    btn.type      = "button";
    btn.role      = "listitem";
    btn.id        = `card-${i}`;
    btn.dataset.transition = `T${i}`;
    btn.setAttribute("aria-label", `Play transition ${i}: ${NAMES[i - 1]}`);
    btn.textContent = NAMES[i - 1] || `Transition ${i}`;
    frag.appendChild(btn);
  }

  grid.appendChild(frag);
}

// ── UI Toggles ───────────────────────────────────────────────
function toggleCarousel(forceState) {
  const isActive = typeof forceState === "boolean" 
    ? forceState 
    : !carouselOverlay.classList.contains("is-active");
  
  carouselOverlay.classList.toggle("is-active", isActive);
  toggleBtn.setAttribute("aria-expanded", String(isActive));
}

// ── Label updater ─────────────────────────────────────────────
function setLabel(index) {
  if (index === null) {
    labelIndex.textContent = "—";
    labelName.textContent  = "Select a transition";
    tlBtnPlay.disabled = true;
    tlBtnRev.disabled  = true;
  } else {
    labelIndex.textContent = `T${String(index).padStart(2, "0")}`;
    labelName.textContent  = NAMES[index - 1] ?? `Transition ${index}`;
    tlBtnPlay.disabled = false;
    tlBtnRev.disabled  = false;
  }
}

// ── Active card style ─────────────────────────────────────────
function clearActiveCards() {
  grid.querySelectorAll(".card.is-active").forEach((c) => c.classList.remove("is-active"));
}

// ── Transition state machine ──────────────────────────────────
function killActive() {
  if (activeCtrl) {
    activeCtrl.kill();
    activeCtrl      = null;
    activeIndex     = null;
    activeDirection = "play";
  }
}

function runTransition(index, cardEl) {
  const isSame = activeIndex === index;

  if (!isSame) {
    killActive();
    activeCtrl      = createTransition(previewStage, { id: index });
    activeIndex     = index;
    activeDirection = "play";
    activeCtrl.play();
    return;
  }

  if (!activeCtrl) {
    activeCtrl      = createTransition(previewStage, { id: index });
    activeDirection = "play";
    activeCtrl.play();
    return;
  }

  if (activeDirection === "play") {
    activeCtrl.reverse();
    activeDirection = "reverse";
  } else {
    activeCtrl.play();
    activeDirection = "play";
  }
}

// ── Click handler ─────────────────────────────────────────────
function onGridClick(event) {
  const target = event.target.closest("button.card");
  if (!target) return;

  // The dataset contains "T1", so we slice off the "T"
  const indexStr = target.dataset.transition.replace(/\D/g, "");
  const index = Number(indexStr);
  
  if (!Number.isFinite(index) || index < 1 || index > TOTAL) return;

  clearActiveCards();
  target.classList.add("is-active");
  setLabel(index);
  
  // Close the carousel after selection
  toggleCarousel(false);
  
  runTransition(index, target);
}

// ── Fullscreen toggle ─────────────────────────────────────────
function onFullscreenClick() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen({ navigationUI: "hide" })
      .catch((err) => console.warn("Fullscreen request failed:", err.message));
  } else {
    document.exitFullscreen();
  }
}

function onFullscreenChange() {
  const active = !!document.fullscreenElement;
  fullscreenBtn.classList.toggle("is-fullscreen", active);
  fullscreenBtn.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
}

// ── Documentation lightbox ───────────────────────────────
function toggleDoc(forceState) {
  const willOpen = typeof forceState === "boolean"
    ? forceState
    : !docLightbox.classList.contains("is-open");
  docLightbox.classList.toggle("is-open", willOpen);
  docLightbox.setAttribute("aria-hidden", String(!willOpen));
}

// ── Keyboard accessibility ────────────────────────────────────
function onKeyDown(event) {
  if (event.key === "Escape") {
    if (docLightbox.classList.contains("is-open")) {
      toggleDoc(false);
    } else if (carouselOverlay.classList.contains("is-active")) {
      toggleCarousel(false);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
}

// ── Boot ──────────────────────────────────────────────────────
buildCards();
setLabel(null);

grid.addEventListener("click", onGridClick);

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => toggleCarousel());
}
if (carouselBackdrop) {
  carouselBackdrop.addEventListener("click", () => toggleCarousel(false));
}

// ── Label Button Controls ─────────────────────────────────────
tlBtnPlay.addEventListener("click", () => {
  if (activeCtrl) {
    activeDirection = "play";
    activeCtrl.play();
  }
});

tlBtnRev.addEventListener("click", () => {
  if (activeCtrl) {
    activeDirection = "reverse";
    activeCtrl.reverse();
  }
});

if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", onFullscreenClick);
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);
}

document.addEventListener("keydown", onKeyDown);

// ── Documentation lightbox events ────────────────────────
if (docBtn)      docBtn.addEventListener("click", () => toggleDoc());
if (docClose)    docClose.addEventListener("click", () => toggleDoc(false));
if (docBackdrop) docBackdrop.addEventListener("click", () => toggleDoc(false));

// ── Doc nav tab switching ─────────────────────────────────
if (docLightbox) {
  docLightbox.querySelectorAll(".doc-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      // update active nav
      docLightbox.querySelectorAll(".doc-nav-item").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      // update active section
      docLightbox.querySelectorAll(".doc-section").forEach((s) => s.classList.remove("is-active"));
      const target = docLightbox.querySelector(`#doc-${section}`);
      if (target) target.classList.add("is-active");
    });
  });
}
