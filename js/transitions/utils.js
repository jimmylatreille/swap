/**
 * utils.js — Shared utilities for transition modules
 */

/** Returns true if the user prefers reduced motion */
function transitionUtilsPrefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Creates a no-motion controller for reduced-motion users.
 * Instantly snaps to the end-state without animation.
 * @param {Function} snapFn - Called on play() to set the final visual state
 * @param {Function} [resetFn] - Called on reverse() to reset to neutral state
 */
function transitionUtilsCreateNoMotionController(snapFn, resetFn) {
  return {
    play()    { snapFn?.(); },
    reverse() { resetFn?.(); },
    kill()    {},
    get isPlaying() { return false; },
  };
}

/**
 * Collects all required DOM nodes from the preview stage.
 * Throws early if any critical node is absent.
 * @param {Element} container
 */
function transitionUtilsCollectNodes(container) {
  const nodes = {
    bg:           container.querySelector(".layer-bg"),
    accent:       container.querySelector(".layer-accent"),
    overlay:      container.querySelector(".layer-overlay"),
    mask:         container.querySelector(".layer-mask"),
    contentItems: [...container.querySelectorAll(".preview-content > *")],
    tags:         [...container.querySelectorAll(".preview-tags span")],
  };

  if (!nodes.bg || !nodes.mask) {
    throw new Error("createTransition: .layer-bg or .layer-mask not found inside container.");
  }

  return nodes;
}

/**
 * Resets all transition layer properties to their neutral / resting state.
 *
 * Avoids `clearProps:"all"` which causes a one-frame render flash.
 * Instead, every animated property is explicitly reset to its CSS default.
 *
 * @param {ReturnType<collectNodes>} nodes
 */
function transitionUtilsSetBaseState(nodes) {
  const { bg, accent, overlay, mask, contentItems, tags } = nodes;

  // Kill any in-flight tweens first so set() values win immediately
  gsap.killTweensOf([bg, accent, overlay, mask, ...contentItems, ...tags]);

  gsap.set(bg, {
    xPercent: 0, yPercent: 0, x: 0, y: 0,
    scale: 1, rotation: 0, skewX: 0, skewY: 0,
    opacity: 1,
    transformOrigin: "50% 50%",
  });

  gsap.set(accent, {
    xPercent: 0, yPercent: 0, x: 0, y: 0,
    scale: 1, rotation: 0, skewX: 0, skewY: 0,
    opacity: 0.78,
    transformOrigin: "50% 50%",
  });

  gsap.set(overlay, {
    opacity: 1, scale: 1, x: 0, y: 0,
  });

  gsap.set(mask, {
    // Default: mask hides content from the right (fully hidden)
    clipPath: "inset(0 100% 0 0)",
    opacity: 1, scale: 1,
    transformOrigin: "50% 50%",
  });

  gsap.set(contentItems, {
    xPercent: 0, yPercent: 0, x: 0, y: 0,
    opacity: 1, rotation: 0, skewX: 0,
    scale: 1,
  });

  gsap.set(tags, {
    scale: 1, opacity: 1,
    xPercent: 0, yPercent: 0,
  });
}

window.TransitionUtils = {
  prefersReducedMotion: transitionUtilsPrefersReducedMotion,
  createNoMotionController: transitionUtilsCreateNoMotionController,
  collectNodes: transitionUtilsCollectNodes,
  setBaseState: transitionUtilsSetBaseState,
};
