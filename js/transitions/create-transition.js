const transitionEngineUtils = window.TransitionUtils;

// ── Stripe helper ──────────────────────────────────────────────────────────
function makeStripes(container, n, color = "#030409", direction = "row") {
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    position:"absolute", inset:"0", display:"flex", flexDirection: direction,
    zIndex:"10", pointerEvents:"none", overflow:"hidden"
  });
  const stripes = Array.from({ length: n }, () => {
    const s = document.createElement("div");
    Object.assign(s.style, {
      flex:"1", background: color,
      transform:"translateZ(0)", backfaceVisibility:"hidden"
    });
    wrap.appendChild(s);
    return s;
  });
  container.appendChild(wrap);
  return { wrap, stripes };
}

// ── Grid helper (mosaic / pixel / checkerboard effects) ────────────────────
function makeGrid(container, rows, cols, color = "#030409") {
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    position:"absolute", inset:"0", display:"grid",
    gridTemplateRows:`repeat(${rows}, 1fr)`,
    gridTemplateColumns:`repeat(${cols}, 1fr)`,
    zIndex:"10", pointerEvents:"none", overflow:"hidden"
  });
  const cells = [];
  for (let i = 0; i < rows * cols; i++) {
    const c = document.createElement("div");
    Object.assign(c.style, {
      background: color,
      transform:"translateZ(0)", backfaceVisibility:"hidden"
    });
    wrap.appendChild(c);
    cells.push(c);
  }
  container.appendChild(wrap);
  return { wrap, cells };
}

// ── Wave-front polygon helper ──────────────────────────────────────────────
// Builds a polygon whose leading edge is a sine wave. `front` is the wave's
// horizontal position as a fraction of the viewport (may exceed 0..1 to sit
// fully off-screen). The point count is fixed, so fromTo() morphs stay
// reverse-safe.
// NOTE: values are rounded to integers — GSAP's complex-string interpolation
// fails to tick-render long decimal polygons (it freezes then snaps), while
// integer polygons interpolate perfectly. Visually identical at this scale.
function wavePoly(front, amp = 9, teeth = 8) {
  const pts = ["0% 0%"];
  for (let i = 0; i <= teeth; i++) {
    const y = Math.round((i / teeth) * 100);
    const x = Math.round(front * 100 + Math.sin((i / teeth) * Math.PI * 2) * amp);
    pts.push(`${x}% ${y}%`);
  }
  pts.push("0% 100%");
  return `polygon(${pts.join(", ")})`;
}

// ── Timeline factory ───────────────────────────────────────────────────────
function buildTimeline(id, nodes, container) {
  const { bg, accent, overlay, mask, contentItems, tags } = nodes;
  const cleanups = [];

  const tl = gsap.timeline({ paused: true, defaults: { duration: 0.9, ease: "power3.out", force3D: true } });

  const stdContent = (t = 0.22) => {
    tl.add(() => {
      const isForward = tl.timeScale() > 0;
      const title = document.querySelector('.title');
      const copy = document.querySelector('.copy');
      const eyebrow = document.querySelector('.eyebrow');
      if (title && copy && eyebrow) {
        if (isForward) {
          eyebrow.textContent = "Awwwards-Grade Architecture";
          title.innerHTML = "Seamless Page Load,<br>Dynamic Content Swap";
          copy.textContent = "The transition layer successfully obscured the viewport, allowing the application to inject new DOM states invisibly. Reverse to go back.";
        } else {
          eyebrow.textContent = "Page Transition Plugin Demo";
          title.innerHTML = "Full Screen, Page transition,<br>GSAP Timelines";
          copy.innerHTML = "Every card triggers a unique transition with a consistent API: <code>play</code>, <code>reverse</code>, <code>kill</code>.";
        }
      }
    }, Math.max(0, t - 0.05));

    tl.fromTo(contentItems, { yPercent: 12, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: "expo.out" }, t);
    tl.fromTo(tags, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.04, duration: 0.5, ease: "back.out(1.8)" }, t + 0.12);
  };

  // Accent helper — safe opacity-only to avoid mix-blend-mode distortion
  const accentFade = (t = 0) => tl.fromTo(accent, { opacity: 0 }, { opacity: 0.78, duration: 1.0 }, t);

  switch (id) {

    // ── 1 · Drift In ───────────────────────────────────────────────────────
    case 1:
      tl.fromTo(mask, { clipPath:"inset(0 100% 0 0)" }, { clipPath:"inset(0 0% 0 0)", duration:0.92, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1.18, xPercent:4 }, { scale:1, xPercent:0, duration:1.2, ease:"expo.out" }, 0);
      accentFade(0.1); stdContent(0.28);
      break;

    // ── 2 · Rise Up ───────────────────────────────────────────────────────
    case 2:
      tl.fromTo(mask, { clipPath:"inset(0 0 100% 0)" }, { clipPath:"inset(0 0 0% 0)", duration:0.95, ease:"expo.inOut" }, 0)
        .fromTo(bg, { yPercent:22, scale:1.1 }, { yPercent:0, scale:1, duration:1.15, ease:"power4.out" }, 0.04);
      accentFade(0.1); stdContent(0.3);
      break;

    // ── 3 · Slide Left ────────────────────────────────────────────────────
    case 3:
      tl.fromTo(mask, { clipPath:"inset(0 0 0 100%)" }, { clipPath:"inset(0 0 0 0%)", duration:0.9, ease:"power4.inOut" }, 0)
        .fromTo(bg, { rotation:-2, xPercent:6, scale:1.06 }, { rotation:0, xPercent:0, scale:1, duration:1.1, ease:"expo.out" }, 0.02);
      accentFade(0.08);
      tl.fromTo(contentItems, { xPercent:-18, opacity:0 }, { xPercent:0, opacity:1, stagger:0.07, duration:0.7 }, 0.26);
      tl.fromTo(tags, { xPercent:14, opacity:0 }, { xPercent:0, opacity:1, stagger:0.05, duration:0.44 }, 0.38);
      break;

    // ── 4 · Drop Down ─────────────────────────────────────────────────────
    case 4:
      tl.fromTo(mask, { clipPath:"inset(100% 0 0 0)" }, { clipPath:"inset(0% 0 0 0)", duration:0.88, ease:"expo.inOut" }, 0)
        .fromTo(bg, { yPercent:-18, scale:1.07 }, { yPercent:0, scale:1, duration:1.08, ease:"power4.out" }, 0.04);
      accentFade(0.08); stdContent(0.28);
      break;

    // ── 5 · Unshutter ─────────────────────────────────────────────────────
    case 5: {
      const { wrap, stripes } = makeStripes(container, 8);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { scaleX:0, transformOrigin:"left center" });
      tl.to(stripes, { scaleX:1, duration:0.45, stagger:0.05, ease:"power3.inOut" }, 0)
        .set(stripes, { transformOrigin:"right center" })
        .to(stripes, { scaleX:0, duration:0.45, stagger:0.05, ease:"power3.inOut" })
        .fromTo(bg, { scale:0.94 }, { scale:1, duration:1, ease:"expo.out" }, 0.5);
      accentFade(0.6); stdContent(0.65);
      break;
    }

    // ── 6 · Iris Expand ───────────────────────────────────────────────────
    case 6:
      tl.fromTo(mask, { clipPath:"circle(0% at 50% 50%)" }, { clipPath:"circle(150% at 50% 50%)", duration:0.95, ease:"expo.out" }, 0)
        .fromTo(bg, { scale:1.18, rotation:1.2 }, { scale:1, rotation:0, duration:1.12, ease:"power4.out" }, 0.04);
      accentFade(0.08); stdContent(0.26);
      break;

    // ── 7 · Split Center ──────────────────────────────────────────────────
    case 7:
      tl.fromTo(mask, { clipPath:"inset(0 50% 0 50%)" }, { clipPath:"inset(0 0% 0 0%)", duration:0.9, ease:"power4.inOut" }, 0)
        .fromTo(bg, { xPercent:-8 }, { xPercent:0, duration:1, ease:"expo.out" }, 0.02);
      accentFade(0.06); stdContent(0.28);
      break;

    // ── 8 · Blind Expand ──────────────────────────────────────────────────
    case 8:
      tl.fromTo(mask, { clipPath:"polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)" },
                       { clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration:0.9, ease:"power4.inOut" }, 0)
        .fromTo(bg, { yPercent:10, rotation:-0.8 }, { yPercent:0, rotation:0, duration:1.04, ease:"expo.out" }, 0.03);
      accentFade(0.06); stdContent(0.28);
      break;

    // ── 9 · Flicker Wipe ──────────────────────────────────────────────────
    case 9:
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:0.65, ease:"power2.inOut" }, 0)
        .to(mask, { opacity:0.15, duration:0.12 }, 0.68)
        .to(mask, { opacity:1,    duration:0.12 }, 0.82)
        .to(mask, { opacity:0.2,  duration:0.1  }, 0.96)
        .to(mask, { opacity:1,    duration:0.14 }, 1.08)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.1);
      accentFade(0.2); stdContent(0.32);
      break;

    // ── 10 · Pull Through ─────────────────────────────────────────────────
    case 10:
      tl.fromTo(mask, { clipPath:"inset(0 0 0 100%)" }, { clipPath:"inset(0 0 0 0%)", duration:0.9, ease:"power4.inOut" }, 0)
        .fromTo(bg, { xPercent:-14, scale:1.08 }, { xPercent:0, scale:1, duration:1.08, ease:"expo.out" }, 0.04);
      accentFade(0.1);
      tl.fromTo(contentItems, { yPercent:18, opacity:0, rotate:0.5 }, { yPercent:0, opacity:1, rotate:0, stagger:0.06, duration:0.68 }, 0.25);
      tl.fromTo(tags, { yPercent:12, opacity:0 }, { yPercent:0, opacity:1, stagger:0.04, duration:0.44 }, 0.36);
      break;

    // ── 11 · Corner Iris ──────────────────────────────────────────────────
    case 11:
      tl.fromTo(mask, { clipPath:"circle(0% at 15% 85%)" }, { clipPath:"circle(160% at 15% 85%)", duration:0.95, ease:"expo.out" }, 0)
        .fromTo(bg, { xPercent:6, yPercent:-6 }, { xPercent:0, yPercent:0, duration:1.06, ease:"power4.out" }, 0.05);
      accentFade(0.1); stdContent(0.28);
      break;

    // ── 12 · Scale Bloom ──────────────────────────────────────────────────
    case 12:
      tl.fromTo(mask, { clipPath:"inset(0% 0% 100% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:0.9, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1.16 }, { scale:1, duration:1.14, ease:"power4.out" }, 0.06);
      accentFade(0.08);
      tl.fromTo(contentItems, { yPercent:26, opacity:0 }, { yPercent:0, opacity:1, stagger:0.06, duration:0.72, ease:"power4.out" }, 0.3);
      tl.fromTo(tags, { scale:1.14, opacity:0 }, { scale:1, opacity:1, stagger:0.04, duration:0.46 }, 0.42);
      break;

    // ── 13 · Poly Reveal ──────────────────────────────────────────────────
    case 13:
      tl.fromTo(mask, { clipPath:"polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)" },
                       { clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration:0.9, ease:"power4.inOut" }, 0)
        .fromTo(bg, { rotation:1.5, scale:1.06 }, { rotation:0, scale:1, duration:1.06, ease:"expo.out" }, 0.04);
      accentFade(0.08); stdContent(0.28);
      break;

    // ── 14 · Bottom Lift ──────────────────────────────────────────────────
    case 14:
      tl.fromTo(mask, { clipPath:"inset(100% 0% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:0.9, ease:"expo.inOut" }, 0)
        .fromTo(bg, { yPercent:-20, rotation:-1.1 }, { yPercent:0, rotation:0, duration:1.1, ease:"power4.out" }, 0.02);
      accentFade(0.06);
      tl.fromTo(contentItems, { xPercent:20, opacity:0 }, { xPercent:0, opacity:1, stagger:0.06, duration:0.68 }, 0.28);
      tl.fromTo(tags, { xPercent:-14, opacity:0 }, { xPercent:0, opacity:1, stagger:0.04, duration:0.44 }, 0.4);
      break;

    // ── 15 · Curtain Down ─────────────────────────────────────────────────
    case 15: {
      const { wrap, stripes } = makeStripes(container, 6);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { scaleY:0, transformOrigin:"top center" });
      tl.to(stripes, { scaleY:1, duration:0.5, stagger:0.06, ease:"power3.inOut" }, 0)
        .set(stripes, { transformOrigin:"bottom center" })
        .to(stripes, { scaleY:0, duration:0.5, stagger:0.06, ease:"power3.inOut" })
        .fromTo(bg, { yPercent:14, scale:1.06 }, { yPercent:0, scale:1, duration:1.05, ease:"expo.out" }, 0.6);
      accentFade(0.7); stdContent(0.75);
      break;
    }

    // ── 16 · Top-Right Iris ───────────────────────────────────────────────
    case 16:
      tl.fromTo(mask, { clipPath:"circle(0% at 85% 15%)" }, { clipPath:"circle(160% at 85% 15%)", duration:0.95, ease:"expo.out" }, 0)
        .fromTo(bg, { scale:1.12, xPercent:-5 }, { scale:1, xPercent:0, duration:1.05, ease:"power4.out" }, 0.06);
      accentFade(0.08); stdContent(0.28);
      break;

    // ── 17 · Overlay Wipe ─────────────────────────────────────────────────
    case 17:
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:0.84, ease:"expo.inOut" }, 0)
        .fromTo(overlay, { opacity:0 }, { opacity:1, duration:0.72 }, 0.1)
        .fromTo(bg, { xPercent:10, scale:1.03 }, { xPercent:0, scale:1, duration:0.98, ease:"power4.out" }, 0.05);
      accentFade(0.08); stdContent(0.28);
      break;

    // ── 18 · Top Slice ────────────────────────────────────────────────────
    case 18:
      tl.fromTo(mask, { clipPath:"polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
                       { clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration:0.9, ease:"expo.inOut" }, 0)
        .fromTo(bg, { yPercent:18, scale:1.07 }, { yPercent:0, scale:1, duration:1.1, ease:"power4.out" }, 0.02);
      accentFade(0.08);
      tl.fromTo(contentItems, { yPercent:-20, opacity:0 }, { yPercent:0, opacity:1, stagger:0.06, duration:0.64 }, 0.28);
      tl.fromTo(tags, { yPercent:16, opacity:0 }, { yPercent:0, opacity:1, stagger:0.04, duration:0.44 }, 0.4);
      break;

    // ── 19 · Scale Mask ───────────────────────────────────────────────────
    case 19:
      gsap.set(mask, { clipPath:"inset(0% 0% 0% 0%)", scale:1 });
      tl.to(mask, { scale:0, duration:0.9, ease:"power4.inOut", transformOrigin:"50% 50%" }, 0)
        .fromTo(bg, { scale:0.88 }, { scale:1, duration:1.05, ease:"expo.out" }, 0.08);
      accentFade(0.1); stdContent(0.3);
      break;

    // ── 20 · Flash Sweep ──────────────────────────────────────────────────
    case 20:
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:0.62, ease:"power2.inOut" }, 0)
        .to(mask, { clipPath:"inset(0% 0% 0% 100%)", duration:0.55, ease:"power2.inOut" }, 0.64)
        .fromTo(bg, { scale:1.14, rotation:0.8 }, { scale:1, rotation:0, duration:1.08, ease:"expo.out" }, 0.06);
      accentFade(0.12);
      tl.fromTo(contentItems, { yPercent:28, opacity:0 }, { yPercent:0, opacity:1, stagger:0.05, duration:0.68 }, 0.32);
      tl.fromTo(tags, { scale:0.82, opacity:0 }, { scale:1, opacity:1, stagger:0.035, duration:0.46 }, 0.46);
      break;

    // ── 21 · Diagonal Slash ───────────────────────────────────────────────
    case 21:
      tl.fromTo(mask, { clipPath:"polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
                       { clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration:0.92, ease:"power4.inOut" }, 0)
        .fromTo(bg, { xPercent:8, rotation:1.5 }, { xPercent:0, rotation:0, duration:1.12, ease:"expo.out" }, 0.04);
      accentFade(0.1); stdContent(0.28);
      break;

    // ── 22 · Twin Curtain ─────────────────────────────────────────────────
    case 22: {
      const { wrap, stripes } = makeStripes(container, 2);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes[0], { scaleX:0, transformOrigin:"left center" });
      gsap.set(stripes[1], { scaleX:0, transformOrigin:"right center" });
      tl.to(stripes, { scaleX:1, duration:0.5, stagger:0.1, ease:"power3.inOut" }, 0)
        .set(stripes[0], { transformOrigin:"right center" })
        .set(stripes[1], { transformOrigin:"left center" })
        .to(stripes, { scaleX:0, duration:0.5, stagger:0.1, ease:"power3.inOut" })
        .fromTo(bg, { scale:0.96 }, { scale:1, duration:1, ease:"expo.out" }, 0.6);
      accentFade(0.7); stdContent(0.75);
      break;
    }

    // ── 23 · Ripple Burst ─────────────────────────────────────────────────
    case 23:
      tl.fromTo(mask, { clipPath:"circle(0% at 50% 50%)" }, { clipPath:"circle(150% at 50% 50%)", duration:1.1, ease:"elastic.out(0.9,0.6)" }, 0)
        .fromTo(bg, { scale:1.22 }, { scale:1, duration:1.3, ease:"elastic.out(0.8,0.5)" }, 0);
      accentFade(0.12); stdContent(0.32);
      break;

    // ── 24 · Page Curl ────────────────────────────────────────────────────
    case 24:
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:1.0, ease:"power4.inOut" }, 0)
        .fromTo(bg, { skewX:4, xPercent:6, scale:1.04 }, { skewX:0, xPercent:0, scale:1, duration:1.1, ease:"expo.out" }, 0.04);
      accentFade(0.1);
      tl.fromTo(contentItems, { xPercent:-12, skewX:-3, opacity:0 }, { xPercent:0, skewX:0, opacity:1, stagger:0.06, duration:0.7 }, 0.26);
      tl.fromTo(tags, { scale:0.9, opacity:0 }, { scale:1, opacity:1, stagger:0.04, duration:0.44, ease:"back.out(1.6)" }, 0.4);
      break;

    // ── 25 · Depth Push ───────────────────────────────────────────────────
    case 25:
      tl.fromTo(mask, { clipPath:"inset(0% 0% 0% 0%)", scale:1.5, opacity:0 }, { scale:1, opacity:1, duration:0.95, ease:"expo.out" }, 0)
        .fromTo(bg, { scale:0.8, opacity:0.4 }, { scale:1, opacity:1, duration:1.1, ease:"power4.out" }, 0.04);
      accentFade(0.1); stdContent(0.28);
      break;

    // ── 26 · Cascade Drop ─────────────────────────────────────────────────
    case 26: {
      const { wrap, stripes } = makeStripes(container, 10);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { yPercent:-100 }, { yPercent:0, duration:0.7, stagger:0.05, ease:"power4.out" }, 0)
        .to(stripes, { yPercent:100, duration:0.6, stagger:0.05, ease:"power4.in" }, 0.75)
        .fromTo(bg, { scale:1.08 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.08);
      accentFade(0.5); stdContent(0.7);
      break;
    }

    // ── 27 · Glitch Slam ──────────────────────────────────────────────────
    case 27:
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:0.55, ease:"power4.inOut" }, 0)
        .fromTo(bg, { xPercent:18 }, { xPercent:0, duration:0.18, ease:"power4.out" }, 0)
        .to(bg, { xPercent:-8, duration:0.1 }, 0.18)
        .to(bg, { xPercent:4, duration:0.08 }, 0.28)
        .to(bg, { xPercent:0, duration:0.12, ease:"power3.out" }, 0.36);
      accentFade(0.4); stdContent(0.42);
      break;

    // ── 28 · Prism Slide ──────────────────────────────────────────────────
    case 28: {
      const { wrap, stripes } = makeStripes(container, 5, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { xPercent: (i) => (i % 2 === 0 ? -110 : 110) }, { xPercent:0, duration:0.8, stagger:0.07, ease:"expo.inOut" }, 0)
        .to(stripes, { xPercent:(i) => (i % 2 === 0 ? 110 : -110), duration:0.7, stagger:0.07, ease:"expo.in" }, 0.85)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.05);
      accentFade(0.2); stdContent(0.6);
      break;
    }

    // ── 29 · Elastic Gate ─────────────────────────────────────────────────
    case 29:
      tl.fromTo(mask, { clipPath:"inset(0% 50% 0% 50%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:1.2, ease:"elastic.out(1,0.55)" }, 0)
        .fromTo(bg, { scale:1.08 }, { scale:1, duration:1.3, ease:"elastic.out(0.9,0.6)" }, 0);
      accentFade(0.14); stdContent(0.3);
      break;

    // ── 30 · Grand Finale ─────────────────────────────────────────────────
    case 30: {
      const { wrap, stripes } = makeStripes(container, 12);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { yPercent: (i) => (i % 2 === 0 ? -110 : 110) }, { yPercent:0, duration:0.55, stagger:0.04, ease:"power4.out" }, 0)
        .to(stripes, { yPercent:(i) => (i % 2 === 0 ? 110 : -110), duration:0.55, stagger:0.04, ease:"power4.in" }, 0.75)
        .fromTo(bg, { scale:1.22, rotation:2 }, { scale:1, rotation:0, duration:1.4, ease:"expo.out" }, 0.1);
      accentFade(0.6);
      tl.fromTo(contentItems, { scale:0.8, opacity:0 }, { scale:1, opacity:1, stagger:0.07, duration:0.8, ease:"back.out(1.8)" }, 0.82);
      tl.fromTo(tags, { yPercent:24, opacity:0 }, { yPercent:0, opacity:1, stagger:0.05, duration:0.5, ease:"power3.out" }, 1.0);
      break;
    }

    // ── 31 · Cinematic Bars ───────────────────────────────────────────────
    case 31: {
      const { wrap, stripes } = makeStripes(container, 2, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes[0], { yPercent:-100 }, { yPercent:0, duration:0.6, ease:"expo.out" }, 0)
        .fromTo(stripes[1], { yPercent:100 }, { yPercent:0, duration:0.6, ease:"expo.out" }, 0)
        .to(stripes, { scaleY:0, duration:0.6, ease:"expo.inOut" }, 0.8)
        .fromTo(bg, { scale:1.1, filter:"blur(8px)" }, { scale:1, filter:"blur(0px)", duration:1.4, ease:"expo.out" }, 0.4);
      accentFade(0.8); stdContent(1.0);
      break;
    }

    // ── 32 · Hexagon Expand ───────────────────────────────────────────────
    case 32:
      tl.fromTo(mask, { clipPath:"polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)" },
                       { clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", duration:0.7, ease:"power4.inOut" }, 0)
        .to(mask, { clipPath:"polygon(50% -50%, 150% 25%, 150% 75%, 50% 150%, -50% 75%, -50% 25%)", duration:0.7, ease:"power4.inOut" }, 0.7)
        .fromTo(bg, { scale:1.2, rotation:5 }, { scale:1, rotation:0, duration:1.4, ease:"expo.out" }, 0.1);
      accentFade(0.7); stdContent(0.8);
      break;

    // ── 33 · Venetian Blinds ──────────────────────────────────────────────
    case 33: {
      const { wrap, stripes } = makeStripes(container, 14, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 800 });
      tl.fromTo(stripes, { rotationX:-90, transformOrigin:"50% 50%", scaleY:1.02, opacity:0 }, { rotationX:0, scaleY:1.02, opacity:1, duration:0.6, stagger:0.04, ease:"back.out(1.2)" }, 0)
        .to(stripes, { rotationX:90, opacity:0, duration:0.5, stagger:0.04, ease:"power3.in" }, 0.8)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.9);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 34 · Diagonal Stagger ─────────────────────────────────────────────
    case 34: {
      const { wrap, stripes } = makeStripes(container, 6, "#030409");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { rotation:45, scale:3 });
      tl.fromTo(stripes, { xPercent:-600 }, { xPercent:0, duration:0.7, stagger:0.06, ease:"expo.out" }, 0)
        .to(stripes, { xPercent:600, duration:0.7, stagger:0.06, ease:"expo.in" }, 0.8)
        .fromTo(bg, { scale:1.15, rotation:-5 }, { scale:1, rotation:0, duration:1.3, ease:"expo.out" }, 0.9);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 35 · Cross Split ──────────────────────────────────────────────────
    case 35:
      tl.fromTo(mask, { clipPath:"polygon(50% 0%, 50% 0%, 50% 50%, 100% 50%, 100% 50%, 50% 50%, 50% 100%, 50% 100%, 50% 50%, 0% 50%, 0% 50%, 50% 50%)" },
                       { clipPath:"polygon(0% 0%, 100% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 100%, 0% 100%, 0% 100%, 0% 100%, 0% 0%, 0% 0%)", duration:1.0, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.2, ease:"power4.out" }, 0.1);
      accentFade(0.1); stdContent(0.3);
      break;

    // ── 36 · Shutter Twist ────────────────────────────────────────────────
    case 36: {
      const { wrap, stripes } = makeStripes(container, 8);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 1000 });
      tl.fromTo(stripes, { scaleX:0, rotationY:-90 }, { scaleX:1, rotationY:0, duration:0.6, stagger:0.05, ease:"power4.out" }, 0)
        .to(stripes, { scaleX:0, rotationY:90, duration:0.6, stagger:0.05, ease:"power4.in" }, 0.8)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.9);
      accentFade(0.9); stdContent(1.0);
      break;
    }

    // ── 37 · Diamond Sweep ────────────────────────────────────────────────
    case 37:
      tl.fromTo(mask, { clipPath:"polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)" },
                       { clipPath:"polygon(-50% 50%, 50% -50%, 150% 50%, 50% 150%)", duration:0.8, ease:"power4.inOut" }, 0)
        .to(mask, { clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration:0.6, ease:"power4.out" }, 0.8)
        .fromTo(bg, { xPercent:-10, scale:1.1 }, { xPercent:0, scale:1, duration:1.3, ease:"expo.out" }, 0.1);
      accentFade(0.3); stdContent(0.5);
      break;

    // ── 38 · Accordion Fold ───────────────────────────────────────────────
    case 38: {
      const { wrap, stripes } = makeStripes(container, 6, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { scaleY:0, transformOrigin:(i) => (i % 2 === 0 ? "top center" : "bottom center") }, { scaleY:1, duration:0.5, stagger:0.06, ease:"power3.inOut" }, 0)
        .set(stripes, { transformOrigin:(i) => (i % 2 === 0 ? "bottom center" : "top center") })
        .to(stripes, { scaleY:0, duration:0.5, stagger:0.06, ease:"power3.inOut" }, 0.8)
        .fromTo(bg, { scale:1.06 }, { scale:1, duration:1.1, ease:"power4.out" }, 0.9);
      accentFade(0.9); stdContent(1.0);
      break;
    }

    // ── 39 · Center Pinch ─────────────────────────────────────────────────
    case 39:
      tl.fromTo(mask, { clipPath:"inset(50% 50% 50% 50%)" }, { clipPath:"inset(0% 50% 0% 50%)", duration:0.6, ease:"expo.inOut" }, 0)
        .to(mask, { clipPath:"inset(0% 0% 0% 0%)", duration:0.7, ease:"elastic.out(1,0.6)" }, 0.6)
        .fromTo(bg, { scale:1.2 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.6);
      accentFade(0.6); stdContent(0.7);
      break;

    // ── 40 · Orbital Sweep ────────────────────────────────────────────────
    case 40:
      tl.fromTo(mask, { clipPath:"circle(0% at 0% 0%)" }, { clipPath:"circle(150% at 100% 100%)", duration:1.2, ease:"power4.inOut" }, 0)
        .fromTo(bg, { scale:1.15, xPercent:-5, yPercent:-5 }, { scale:1, xPercent:0, yPercent:0, duration:1.3, ease:"expo.out" }, 0.1);
      accentFade(0.2); stdContent(0.4);
      break;

    // ── 41 · Glitch Slice ─────────────────────────────────────────────────
    case 41: {
      const { wrap, stripes } = makeStripes(container, 5, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { xPercent:(i) => (i % 2 === 0 ? -110 : 110) }, { xPercent:0, duration:0.4, stagger:0.05, ease:"steps(4)" }, 0)
        .to(stripes, { xPercent:(i) => (i % 2 === 0 ? 110 : -110), duration:0.4, stagger:0.05, ease:"steps(4)" }, 0.7)
        .fromTo(bg, { scale:1.05 }, { scale:1, duration:1.0, ease:"expo.out" }, 0.8);
      accentFade(0.8); stdContent(0.9);
      break;
    }

    // ── 42 · Triangle Unfold ──────────────────────────────────────────────
    case 42:
      tl.fromTo(mask, { clipPath:"polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)" },
                       { clipPath:"polygon(0% 0%, 100% 0%, 100% 0%, 50% 100%, 0% 0%)", duration:0.7, ease:"power4.inOut" }, 0)
        .to(mask, { clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 100%)", duration:0.6, ease:"power3.out" }, 0.7)
        .fromTo(bg, { yPercent:-10, scale:1.1 }, { yPercent:0, scale:1, duration:1.2, ease:"expo.out" }, 0.1);
      accentFade(0.2); stdContent(0.4);
      break;

    // ── 43 · Elastic Drop ─────────────────────────────────────────────────
    case 43:
      tl.fromTo(mask, { clipPath:"inset(0% 0% 100% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:1.4, ease:"bounce.out" }, 0)
        .fromTo(bg, { yPercent:-15 }, { yPercent:0, duration:1.4, ease:"bounce.out" }, 0);
      accentFade(0.2); stdContent(0.4);
      break;

    // ── 44 · The Void ─────────────────────────────────────────────────────
    case 44:
      gsap.set(mask, { transformOrigin: "50% 50%" });
      tl.fromTo(mask, { clipPath:"inset(50% 50% 50% 50%)", rotation: 90, scale:0 }, 
                       { clipPath:"inset(-10% -10% -10% -10%)", rotation: 0, scale:1, duration:1.2, ease:"expo.inOut" }, 0)
        .fromTo(bg, { opacity:0 }, { opacity:0, duration:1.2 }, 0);
      accentFade(0.8); stdContent(0.9);
      break;

    // ── 45 · Double Door Sweep ────────────────────────────────────────────
    case 45: {
      const { wrap, stripes } = makeStripes(container, 2, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes[0], { xPercent:-100 }, { xPercent:0, duration:0.6, ease:"power4.out" }, 0)
        .fromTo(stripes[1], { xPercent:100 }, { xPercent:0, duration:0.6, ease:"power4.out" }, 0)
        .to(stripes[0], { yPercent:-100, duration:0.6, ease:"power4.in" }, 0.8)
        .to(stripes[1], { yPercent:100, duration:0.6, ease:"power4.in" }, 0.8)
        .fromTo(bg, { scale:1.15 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.9);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 46 · Ripple Offset ────────────────────────────────────────────────
    case 46: {
      const { wrap, stripes } = makeStripes(container, 10, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { scaleY:0, transformOrigin:"50% 50%" }, { scaleY:1.05, duration:0.6, stagger:{ amount:0.4, from:"center" }, ease:"expo.out" }, 0)
        .to(stripes, { scaleY:0, duration:0.5, stagger:{ amount:0.4, from:"edges" }, ease:"power3.in" }, 0.8)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.9);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 47 · Skewed Blocks ────────────────────────────────────────────────
    case 47: {
      const { wrap, stripes } = makeStripes(container, 6);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { yPercent:-120, skewY:-15 }, { yPercent:0, skewY:0, duration:0.6, stagger:0.05, ease:"back.out(1.2)" }, 0)
        .to(stripes, { yPercent:120, skewY:15, duration:0.6, stagger:0.05, ease:"power4.in" }, 0.8)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.9);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 48 · Iris Blink ───────────────────────────────────────────────────
    case 48:
      tl.fromTo(mask, { clipPath:"circle(0% at 50% 50%)" }, { clipPath:"circle(80% at 50% 50%)", duration:0.4, ease:"expo.in" }, 0)
        .to(mask, { clipPath:"circle(0% at 50% 50%)", duration:0.3, ease:"power4.out" }, 0.4)
        .to(mask, { clipPath:"circle(150% at 50% 50%)", duration:1.0, ease:"expo.out" }, 0.7)
        .fromTo(bg, { opacity:0 }, { opacity:0, duration:1.7 }, 0);
      accentFade(0.7); stdContent(0.9);
      break;

    // ── 49 · Sawtooth Wipe ────────────────────────────────────────────────
    case 49:
      tl.fromTo(mask, { clipPath:"polygon(0% 0%, 0% 0%, 0% 25%, 0% 50%, 0% 75%, 0% 100%, 0% 100%, 0% 100%, 0% 0%)" },
                       { clipPath:"polygon(120% 0%, 120% 0%, 150% 25%, 120% 50%, 150% 75%, 120% 100%, 120% 100%, 0% 100%, 0% 0%)", duration:1.2, ease:"power3.inOut" }, 0)
        .fromTo(bg, { xPercent:5 }, { xPercent:0, duration:1.2, ease:"expo.out" }, 0);
      accentFade(0.4); stdContent(0.6);
      break;

    // ── 50 · The Masterpiece ──────────────────────────────────────────────
    case 50: {
      const { wrap, stripes } = makeStripes(container, 10, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 1200 });
      tl.fromTo(stripes, { scaleX:0, rotationY:90, z:-500 }, { scaleX:1, rotationY:0, z:0, duration:0.7, stagger:0.04, ease:"back.out(1.4)" }, 0)
        .to(stripes, { scaleX:0, rotationY:-90, z:500, duration:0.6, stagger:0.04, ease:"power4.in" }, 1.0)
        .fromTo(bg, { scale:1.4, rotation:-4, filter:"blur(12px)" }, { scale:1, rotation:0, filter:"blur(0px)", duration:1.8, ease:"expo.out" }, 1.1);
      accentFade(1.1);
      tl.fromTo(contentItems, { yPercent:30, scale:0.9, opacity:0 }, { yPercent:0, scale:1, opacity:1, stagger:0.08, duration:1.0, ease:"expo.out" }, 1.3);
      tl.fromTo(tags, { yPercent:-20, opacity:0 }, { yPercent:0, opacity:1, stagger:0.05, duration:0.6, ease:"back.out(1.5)" }, 1.6);
      break;
    }

    // ── 51 · Tidal Wave ───────────────────────────────────────────────────
    case 51:
      tl.fromTo(mask, { clipPath: wavePoly(-0.18) }, { clipPath: wavePoly(1.18), duration:1.15, ease:"power3.inOut" }, 0)
        .fromTo(bg, { xPercent:-6, scale:1.1 }, { xPercent:0, scale:1, duration:1.3, ease:"expo.out" }, 0.1);
      accentFade(0.2); stdContent(0.4);
      break;

    // ── 52 · Pixel Storm ──────────────────────────────────────────────────
    case 52: {
      const { wrap, cells } = makeGrid(container, 6, 8);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(cells, { scale:0, opacity:0 }, { scale:1, opacity:1, duration:0.5, stagger:{ amount:0.6, from:"random" }, ease:"power3.out" }, 0)
        .to(cells, { scale:0, opacity:0, duration:0.5, stagger:{ amount:0.5, from:"edges" }, ease:"power3.in" }, 0.9)
        .fromTo(bg, { scale:1.15 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.2);
      accentFade(0.9); stdContent(1.0);
      break;
    }

    // ── 53 · Paper Fold ───────────────────────────────────────────────────
    case 53:
      tl.fromTo(mask, { clipPath:"inset(100% 0% 0% 0%)", skewX:8 }, { clipPath:"inset(0% 0% 0% 0%)", skewX:0, duration:1.0, ease:"expo.inOut" }, 0)
        .fromTo(bg, { yPercent:12, scale:1.08 }, { yPercent:0, scale:1, duration:1.2, ease:"expo.out" }, 0.1);
      accentFade(0.2); stdContent(0.4);
      break;

    // ── 54 · Cyclone Iris ─────────────────────────────────────────────────
    case 54:
      gsap.set(mask, { transformOrigin:"50% 50%" });
      tl.fromTo(mask, { clipPath:"circle(0% at 50% 50%)", rotation:-120 }, { clipPath:"circle(142% at 50% 50%)", rotation:0, duration:1.3, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1.25 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.1);
      accentFade(0.3); stdContent(0.5);
      break;

    // ── 55 · Quadrant Bloom ──────────────────────────────────────────────
    case 55: {
      const { wrap, cells } = makeGrid(container, 2, 2);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(cells, { transformOrigin:(i) => ["0% 0%", "100% 0%", "0% 100%", "100% 100%"][i] });
      tl.fromTo(cells, { scale:0 }, { scale:1, duration:0.7, stagger:0.08, ease:"back.out(1.4)" }, 0)
        .to(cells, { scale:0, duration:0.6, stagger:{ amount:0.3, from:"center" }, ease:"power4.in" }, 0.9)
        .fromTo(bg, { scale:1.15 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.2);
      accentFade(0.9); stdContent(1.0);
      break;
    }

    // ── 56 · Jelly Wipe ───────────────────────────────────────────────────
    case 56: {
      const { wrap, stripes } = makeStripes(container, 1, "#9CEC5B", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:1.0, ease:"expo.inOut" }, 0)
        .fromTo(stripes, { xPercent:-100, skewX:-16 }, { xPercent:0, skewX:0, duration:1.15, ease:"elastic.out(1,0.5)" }, 0.06)
        .to(stripes, { xPercent:100, skewX:16, duration:0.7, ease:"power4.in" }, 1.05)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.3);
      accentFade(0.3); stdContent(0.5);
      break;
    }

    // ── 57 · Venetian Spin ────────────────────────────────────────────────
    case 57: {
      const { wrap, stripes } = makeStripes(container, 10, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 900 });
      tl.fromTo(stripes, { rotationY:90, opacity:0 }, { rotationY:0, opacity:1, duration:0.6, stagger:0.05, ease:"back.out(1.3)" }, 0)
        .to(stripes, { rotationY:-90, opacity:0, duration:0.5, stagger:0.05, ease:"power3.in" }, 0.85)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.9);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 58 · Domino Fall ──────────────────────────────────────────────────
    case 58: {
      const { wrap, stripes } = makeStripes(container, 12);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 800 });
      gsap.set(stripes, { transformOrigin:"50% 100%" });
      tl.fromTo(stripes, { rotationX:-90, opacity:0 }, { rotationX:0, opacity:1, duration:0.55, stagger:0.045, ease:"power3.out" }, 0)
        .to(stripes, { rotationX:90, opacity:0, duration:0.5, stagger:0.045, ease:"power3.in" }, 0.85)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.9);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 59 · Ink Drop ─────────────────────────────────────────────────────
    case 59:
      tl.fromTo(mask, { clipPath:"circle(0% at 50% 50%)", filter:"blur(14px)" }, { clipPath:"circle(142% at 50% 50%)", filter:"blur(0px)", duration:1.2, ease:"power3.inOut" }, 0)
        .fromTo(bg, { scale:1.18 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.1);
      accentFade(0.3); stdContent(0.5);
      break;

    // ── 60 · Shatter ─────────────────────────────────────────────────────
    case 60: {
      const { wrap, cells } = makeGrid(container, 4, 6);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(cells, { scale:0, rotation:(i) => (i % 2 ? 25 : -25) }, { scale:1, rotation:0, duration:0.6, stagger:{ amount:0.5, from:"center" }, ease:"back.out(1.5)" }, 0)
        .to(cells, { scale:0, yPercent:(i) => (i % 2 ? 60 : -60), opacity:0, duration:0.6, stagger:{ amount:0.4, from:"edges" }, ease:"power3.in" }, 0.95)
        .fromTo(bg, { scale:1.2 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(1.0); stdContent(1.1);
      break;
    }

    // ── 61 · Liquid Pour ──────────────────────────────────────────────────
    case 61: {
      const { wrap, stripes } = makeStripes(container, 1, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { transformOrigin:"50% 0%" });
      tl.fromTo(stripes, { scaleY:0 }, { scaleY:1, duration:0.9, ease:"elastic.out(1,0.55)" }, 0)
        .to(stripes, { scaleY:0, transformOrigin:"50% 100%", duration:0.7, ease:"power4.inOut" }, 1.0)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.3);
      accentFade(0.4); stdContent(0.6);
      break;
    }

    // ── 62 · Zoom Tunnel ──────────────────────────────────────────────────
    case 62:
      tl.fromTo(mask, { clipPath:"circle(0% at 50% 50%)" }, { clipPath:"circle(142% at 50% 50%)", duration:1.5, ease:"power2.inOut" }, 0)
        .fromTo(bg, { scale:1 }, { scale:1.4, duration:0.75, ease:"power3.in" }, 0)
        .to(bg, { scale:1, duration:0.75, ease:"power3.out" }, 0.75);
      accentFade(0.4); stdContent(0.6);
      break;

    // ── 63 · Flip Book ────────────────────────────────────────────────────
    case 63: {
      const { wrap, stripes } = makeStripes(container, 2);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 1200 });
      gsap.set(stripes[0], { transformOrigin:"100% 50%" });
      gsap.set(stripes[1], { transformOrigin:"0% 50%" });
      tl.fromTo(stripes[0], { rotationY:-100, opacity:0 }, { rotationY:0, opacity:1, duration:0.8, ease:"power4.out" }, 0)
        .fromTo(stripes[1], { rotationY:100, opacity:0 }, { rotationY:0, opacity:1, duration:0.8, ease:"power4.out" }, 0)
        .to(stripes, { rotationY:(i) => (i === 0 ? 100 : -100), opacity:0, duration:0.7, ease:"power4.in" }, 1.0)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.4);
      accentFade(1.0); stdContent(1.1);
      break;
    }

    // ── 64 · Neon Slash ───────────────────────────────────────────────────
    case 64:
      tl.fromTo(mask, { clipPath:"polygon(0% 45%, 100% 45%, 100% 55%, 0% 55%)", filter:"drop-shadow(0 0 0px rgba(156,236,91,0))" },
                       { clipPath:"polygon(0% -10%, 100% -10%, 100% 110%, 0% 110%)", filter:"drop-shadow(0 0 26px rgba(156,236,91,0.9))", duration:1.0, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.1);
      accentFade(0.3); stdContent(0.5);
      break;

    // ── 65 · Gravity Drop ─────────────────────────────────────────────────
    case 65: {
      const { wrap, stripes } = makeStripes(container, 8, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { yPercent:-120 }, { yPercent:0, duration:0.8, stagger:0.06, ease:"bounce.out" }, 0)
        .to(stripes, { yPercent:120, duration:0.6, stagger:0.06, ease:"power4.in" }, 1.0)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(1.0); stdContent(1.1);
      break;
    }

    // ── 66 · Split Horizon ────────────────────────────────────────────────
    case 66:
      tl.fromTo(mask, { clipPath:"polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)" },
                       { clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration:1.0, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1.15 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.1);
      accentFade(0.2); stdContent(0.4);
      break;

    // ── 67 · Spiral In ────────────────────────────────────────────────────
    case 67:
      gsap.set(mask, { transformOrigin:"50% 50%" });
      tl.fromTo(mask, { clipPath:"inset(50% 50% 50% 50%)", rotation:180, scale:0.2 },
                       { clipPath:"inset(0% 0% 0% 0%)", rotation:0, scale:1, duration:1.3, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1.2 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.1);
      accentFade(0.3); stdContent(0.5);
      break;

    // ── 68 · Mosaic Flip ──────────────────────────────────────────────────
    case 68: {
      const { wrap, cells } = makeGrid(container, 4, 6);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 1000 });
      tl.fromTo(cells, { rotationY:90, opacity:0 }, { rotationY:0, opacity:1, duration:0.6, stagger:{ amount:0.5, from:"center" }, ease:"back.out(1.4)" }, 0)
        .to(cells, { rotationY:-90, opacity:0, duration:0.5, stagger:{ amount:0.4, from:"edges" }, ease:"power3.in" }, 0.95)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(1.0); stdContent(1.1);
      break;
    }

    // ── 69 · Smoke Veil ───────────────────────────────────────────────────
    case 69:
      tl.fromTo(mask, { clipPath:"inset(0% 0% 100% 0%)", filter:"blur(18px)" },
                       { clipPath:"inset(0% 0% 0% 0%)", filter:"blur(0px)", duration:1.4, ease:"power2.inOut" }, 0)
        .fromTo(bg, { yPercent:-8, scale:1.06 }, { yPercent:0, scale:1, duration:1.5, ease:"expo.out" }, 0);
      accentFade(0.5); stdContent(0.7);
      break;

    // ── 70 · Rubber Band ──────────────────────────────────────────────────
    case 70: {
      const { wrap, stripes } = makeStripes(container, 1, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { transformOrigin:"0% 50%" });
      tl.fromTo(stripes, { scaleX:0 }, { scaleX:1, duration:0.9, ease:"elastic.out(1,0.45)" }, 0)
        .to(stripes, { scaleX:0, transformOrigin:"100% 50%", duration:0.7, ease:"power4.inOut" }, 1.0)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.3);
      accentFade(0.5); stdContent(0.7);
      break;
    }

    // ── 71 · Crossfade Zoom ───────────────────────────────────────────────
    case 71:
      tl.fromTo(mask, { clipPath:"inset(0% 0% 0% 0%)", opacity:0 }, { opacity:1, duration:0.9, ease:"power2.inOut" }, 0)
        .fromTo(bg, { scale:1.3 }, { scale:1, duration:1.6, ease:"expo.out" }, 0);
      accentFade(0.3); stdContent(0.5);
      break;

    // ── 72 · Twist Cascade ────────────────────────────────────────────────
    case 72: {
      const { wrap, stripes } = makeStripes(container, 7, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { xPercent:(i) => (i % 2 ? -120 : 120), skewX:(i) => (i % 2 ? 20 : -20) }, { xPercent:0, skewX:0, duration:0.7, stagger:0.06, ease:"expo.out" }, 0)
        .to(stripes, { xPercent:(i) => (i % 2 ? 120 : -120), skewX:(i) => (i % 2 ? -20 : 20), duration:0.6, stagger:0.06, ease:"power4.in" }, 0.9)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.3);
      accentFade(0.9); stdContent(1.0);
      break;
    }

    // ── 73 · Pendulum ─────────────────────────────────────────────────────
    case 73: {
      const { wrap, stripes } = makeStripes(container, 1, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { transformOrigin:"50% 0%" });
      tl.fromTo(stripes, { rotation:-95 }, { rotation:0, duration:1.0, ease:"power4.out" }, 0)
        .to(stripes, { rotation:95, duration:0.8, ease:"power4.in" }, 1.1)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(0.5); stdContent(0.7);
      break;
    }

    // ── 74 · Checkerboard ─────────────────────────────────────────────────
    case 74: {
      const { wrap, cells } = makeGrid(container, 8, 8);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(cells, { scale:0, opacity:0 }, { scale:1, opacity:1, duration:0.45, stagger:{ amount:0.7, grid:[8,8], from:"center" }, ease:"power2.out" }, 0)
        .to(cells, { scale:0, opacity:0, duration:0.45, stagger:{ amount:0.6, grid:[8,8], from:"edges" }, ease:"power2.in" }, 1.0)
        .fromTo(bg, { scale:1.15 }, { scale:1, duration:1.5, ease:"expo.out" }, 0.3);
      accentFade(1.0); stdContent(1.1);
      break;
    }

    // ── 75 · Black Hole ───────────────────────────────────────────────────
    case 75: {
      const { wrap, stripes } = makeStripes(container, 1, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { transformOrigin:"50% 50%" });
      tl.fromTo(stripes, { scale:0, rotation:-200 }, { scale:1.6, rotation:0, duration:1.2, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1.3, rotation:5 }, { scale:1, rotation:0, duration:1.4, ease:"expo.out" }, 0.1);
      accentFade(0.3); stdContent(0.5);
      break;
    }

    // ── 76 · Slide Stack ──────────────────────────────────────────────────
    case 76: {
      const panels = ["#030409", "#9CEC5B", "#1a1d26"].map((color, k) => {
        const p = document.createElement("div");
        Object.assign(p.style, {
          position:"absolute", left:"0", right:"0", top:`${k * 14}px`, bottom:`${-k * 14}px`,
          background: color, zIndex:String(10 + k), pointerEvents:"none",
          transform:"translateZ(0)", backfaceVisibility:"hidden"
        });
        container.appendChild(p);
        return p;
      });
      cleanups.push(() => panels.forEach((p) => { if(p.parentNode) container.removeChild(p); }));
      tl.fromTo(panels, { xPercent:-110 }, { xPercent:0, duration:0.7, stagger:0.12, ease:"expo.out" }, 0)
        .to(panels, { xPercent:110, duration:0.7, stagger:0.12, ease:"expo.in" }, 1.05)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(1.05); stdContent(1.15);
      break;
    }

    // ── 77 · Echo Trail ───────────────────────────────────────────────────
    case 77: {
      const { wrap, stripes } = makeStripes(container, 3, "#030409");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { opacity:0.3 });
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:1.0, ease:"expo.inOut" }, 0)
        .fromTo(stripes, { xPercent:-115 }, { xPercent:0, duration:1.0, stagger:0.1, ease:"expo.inOut" }, 0.1)
        .to(stripes, { xPercent:115, duration:0.7, stagger:0.08, ease:"expo.in" }, 1.0)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(0.4); stdContent(0.6);
      break;
    }

    // ── 78 · Diagonal Fold ────────────────────────────────────────────────
    case 78:
      tl.fromTo(mask, { clipPath:"polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)" },
                       { clipPath:"polygon(0% 0%, 120% 0%, 120% 120%, 0% 120%)", duration:0.9, ease:"expo.inOut" }, 0)
        .to(mask, { clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration:0.5, ease:"power3.out" }, 0.9)
        .fromTo(bg, { scale:1.15, rotation:-3 }, { scale:1, rotation:0, duration:1.4, ease:"expo.out" }, 0.1);
      accentFade(0.4); stdContent(0.6);
      break;

    // ── 79 · Meteor Strike ────────────────────────────────────────────────
    case 79: {
      const { wrap, stripes } = makeStripes(container, 1, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { skewX:-18 });
      tl.fromTo(stripes, { xPercent:130, yPercent:-130 }, { xPercent:9, yPercent:9, duration:0.7, ease:"expo.in" }, 0)
        .to(stripes, { xPercent:0, yPercent:0, skewX:0, duration:0.3, ease:"power4.out" }, 0.7)
        .to(stripes, { xPercent:-130, yPercent:-130, skewX:-18, duration:0.7, ease:"expo.in" }, 1.2)
        .fromTo(bg, { scale:1.18, xPercent:3 }, { scale:1, xPercent:0, duration:1.5, ease:"expo.out" }, 0.2);
      accentFade(0.5); stdContent(0.7);
      break;
    }

    // ── 80 · Grand Overture ───────────────────────────────────────────────
    case 80: {
      const { wrap, stripes } = makeStripes(container, 12);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 1400 });
      tl.fromTo(stripes, { scaleY:0, rotationX:-80, transformOrigin:"50% 50%" }, { scaleY:1, rotationX:0, duration:0.8, stagger:{ amount:0.55, from:"center" }, ease:"back.out(1.4)" }, 0)
        .to(stripes, { scaleY:0, rotationX:80, duration:0.7, stagger:{ amount:0.45, from:"edges" }, ease:"power4.in" }, 1.2)
        .fromTo(bg, { scale:1.5, filter:"blur(14px)" }, { scale:1, filter:"blur(0px)", duration:2.0, ease:"expo.out" }, 0.3);
      accentFade(1.2);
      tl.fromTo(contentItems, { yPercent:40, opacity:0 }, { yPercent:0, opacity:1, stagger:0.08, duration:0.9, ease:"expo.out" }, 1.4);
      tl.fromTo(tags, { scale:0.8, opacity:0 }, { scale:1, opacity:1, stagger:0.05, duration:0.5, ease:"back.out(1.6)" }, 1.6);
      break;
    }

    // ── 81 · Aurora Veil ──────────────────────────────────────────────────
    case 81: {
      const { wrap, stripes } = makeStripes(container, 4, "#9CEC5B", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:1.0, ease:"expo.inOut" }, 0)
        .fromTo(stripes, { xPercent:-120, skewX:-12, opacity:0 }, { xPercent:0, skewX:0, opacity:0.55, duration:0.9, stagger:0.1, ease:"expo.out" }, 0.05)
        .to(stripes, { xPercent:120, skewX:12, opacity:0, duration:0.8, stagger:0.1, ease:"expo.in" }, 1.0)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.5, ease:"expo.out" }, 0.2);
      accentFade(0.3); stdContent(0.5);
      break;
    }

    // ── 82 · Origami Fold ─────────────────────────────────────────────────
    case 82: {
      const { wrap, stripes } = makeStripes(container, 8);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 1000 });
      gsap.set(stripes, { transformOrigin:(i) => (i % 2 ? "50% 0%" : "50% 100%") });
      tl.fromTo(stripes, { rotationX:(i) => (i % 2 ? -90 : 90), opacity:0 }, { rotationX:0, opacity:1, duration:0.6, stagger:0.05, ease:"power3.out" }, 0)
        .to(stripes, { rotationX:(i) => (i % 2 ? 90 : -90), opacity:0, duration:0.55, stagger:0.05, ease:"power3.in" }, 0.9)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.3);
      accentFade(0.9); stdContent(1.0);
      break;
    }

    // ── 83 · Waterfall ────────────────────────────────────────────────────
    case 83: {
      const { wrap, stripes } = makeStripes(container, 10);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { transformOrigin:"50% 0%" });
      tl.fromTo(stripes, { scaleY:0 }, { scaleY:1, duration:0.7, stagger:0.06, ease:"power3.out" }, 0)
        .to(stripes, { yPercent:110, duration:0.7, stagger:0.06, ease:"power3.in" }, 0.95)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 84 · Kaleidoscope ─────────────────────────────────────────────────
    case 84: {
      const { wrap, cells } = makeGrid(container, 3, 3);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(cells, { scale:0, rotation:90 }, { scale:1, rotation:0, duration:0.6, stagger:{ amount:0.5, from:"center" }, ease:"back.out(1.6)" }, 0)
        .to(cells, { scale:0, rotation:-90, duration:0.55, stagger:{ amount:0.45, from:"edges" }, ease:"power3.in" }, 0.95)
        .fromTo(bg, { scale:1.15 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(1.0); stdContent(1.1);
      break;
    }

    // ── 85 · Paper Shredder ────────────────────────────────────────────────
    case 85: {
      const { wrap, stripes } = makeStripes(container, 16);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { yPercent:-110, x:(i) => ((i % 3) - 1) * 14 }, { yPercent:0, x:0, duration:0.6, stagger:{ amount:0.5, from:"random" }, ease:"power3.out" }, 0)
        .to(stripes, { yPercent:110, x:(i) => (i % 2 ? 20 : -20), duration:0.6, stagger:{ amount:0.4, from:"random" }, ease:"power3.in" }, 0.9)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.3);
      accentFade(0.9); stdContent(1.0);
      break;
    }

    // ── 86 · Light Leak ───────────────────────────────────────────────────
    case 86:
      tl.fromTo(accent, { xPercent:-60, scale:1.6, filter:"blur(30px)", opacity:0 }, { xPercent:60, opacity:0.85, duration:1.1, ease:"power2.inOut" }, 0)
        .fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:1.0, ease:"expo.inOut" }, 0.1)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.2);
      stdContent(0.5);
      break;

    // ── 87 · Venetian Horizon ──────────────────────────────────────────────
    case 87: {
      const { wrap, stripes } = makeStripes(container, 8, "#030409", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 900 });
      tl.fromTo(stripes, { rotationX:90, opacity:0 }, { rotationX:0, opacity:1, duration:0.6, stagger:0.05, ease:"back.out(1.3)" }, 0)
        .to(stripes, { rotationX:-90, opacity:0, duration:0.5, stagger:0.05, ease:"power3.in" }, 0.85)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.2, ease:"expo.out" }, 0.9);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 88 · Bubble Rise ──────────────────────────────────────────────────
    case 88: {
      const { wrap, cells } = makeGrid(container, 5, 5);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(cells, { borderRadius:"50%" });
      tl.fromTo(cells, { scale:0 }, { scale:1, duration:0.5, stagger:{ amount:0.6, from:"random" }, ease:"back.out(2)" }, 0)
        .to(cells, { yPercent:-40, scale:0.2, opacity:0, duration:0.7, stagger:{ amount:0.5, from:"random" }, ease:"power2.in" }, 0.9)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(1.0); stdContent(1.1);
      break;
    }

    // ── 89 · Diamond Storm ────────────────────────────────────────────────
    case 89:
      gsap.set(mask, { transformOrigin:"50% 50%" });
      tl.fromTo(mask, { clipPath:"polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)", rotation:45 },
                       { clipPath:"polygon(50% -60%, 160% 50%, 50% 160%, -60% 50%)", rotation:0, duration:1.2, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1.2, rotation:-6 }, { scale:1, rotation:0, duration:1.4, ease:"expo.out" }, 0.1);
      accentFade(0.3); stdContent(0.5);
      break;

    // ── 90 · Echo Zoom ────────────────────────────────────────────────────
    case 90:
      tl.fromTo(mask, { clipPath:"inset(40% 40% 40% 40%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:1.2, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scale:1 }, { scale:1.18, duration:0.35, ease:"power2.in" }, 0)
        .to(bg, { scale:1.05, duration:0.25, ease:"power2.out" }, 0.35)
        .to(bg, { scale:1.18, duration:0.25, ease:"power2.in" }, 0.6)
        .to(bg, { scale:1, duration:0.5, ease:"expo.out" }, 0.85);
      accentFade(0.3); stdContent(0.5);
      break;

    // ── 91 · Laser Grid ───────────────────────────────────────────────────
    case 91: {
      const lines = [20, 50, 80].map((top) => {
        const l = document.createElement("div");
        Object.assign(l.style, {
          position:"absolute", left:"0", right:"0", top:top + "%", height:"3px",
          background:"#9CEC5B", boxShadow:"0 0 18px 4px rgba(156,236,91,0.8)",
          zIndex:"10", pointerEvents:"none",
        });
        container.appendChild(l);
        return l;
      });
      cleanups.push(() => lines.forEach((l) => { if(l.parentNode) container.removeChild(l); }));
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:1.0, ease:"expo.inOut" }, 0)
        .fromTo(lines, { xPercent:-110 }, { xPercent:0, duration:0.8, stagger:0.12, ease:"expo.out" }, 0.1)
        .to(lines, { xPercent:110, duration:0.6, stagger:0.1, ease:"expo.in" }, 1.0)
        .fromTo(bg, { scale:1.1 }, { scale:1, duration:1.3, ease:"expo.out" }, 0.3);
      accentFade(0.4); stdContent(0.6);
      break;
    }

    // ── 92 · Fold Out ─────────────────────────────────────────────────────
    case 92: {
      const wrap = document.createElement("div");
      Object.assign(wrap.style, { position:"absolute", inset:"0", zIndex:"10", pointerEvents:"none", perspective:"1000px", overflow:"hidden" });
      container.appendChild(wrap);
      const halves = [0, 1].map((k) => {
        const h = document.createElement("div");
        Object.assign(h.style, {
          position:"absolute", left:"0", right:"0",
          top: k === 0 ? "0" : "50%", height:"50%",
          background:"#030409",
          transform:"translateZ(0)", backfaceVisibility:"hidden",
        });
        wrap.appendChild(h);
        return h;
      });
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(halves[0], { transformOrigin:"50% 0%" });
      gsap.set(halves[1], { transformOrigin:"50% 100%" });
      tl.fromTo(halves, { scaleY:0 }, { scaleY:1, duration:0.7, ease:"expo.out" }, 0)
        .to(halves[0], { rotationX:75, opacity:0, duration:0.7, ease:"power3.in" }, 0.95)
        .to(halves[1], { rotationX:-75, opacity:0, duration:0.7, ease:"power3.in" }, 0.95)
        .fromTo(bg, { scale:1.15 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(0.9); stdContent(1.1);
      break;
    }

    // ── 93 · Ink Splash ───────────────────────────────────────────────────
    case 93: {
      const { wrap, cells } = makeGrid(container, 6, 6);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(cells, { scale:0, rotation:() => gsap.utils.random(-90, 90) }, { scale:1, rotation:0, duration:0.55, stagger:{ amount:0.6, from:"random" }, ease:"back.out(1.5)" }, 0)
        .to(cells, { scale:0, rotation:() => gsap.utils.random(-120, 120), opacity:0, duration:0.5, stagger:{ amount:0.5, from:"random" }, ease:"power3.in" }, 0.95)
        .fromTo(bg, { scale:1.15 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(1.0); stdContent(1.1);
      break;
    }

    // ── 94 · Time Warp ────────────────────────────────────────────────────
    case 94:
      tl.fromTo(mask, { clipPath:"inset(0% 45% 0% 45%)", skewX:25 }, { clipPath:"inset(0% 0% 0% 0%)", skewX:0, duration:1.1, ease:"expo.inOut" }, 0)
        .fromTo(bg, { scaleX:1.4, scaleY:0.9, filter:"blur(6px)" }, { scaleX:1, scaleY:1, filter:"blur(0px)", duration:1.3, ease:"expo.out" }, 0.1);
      accentFade(0.3); stdContent(0.5);
      break;

    // ── 95 · Static Burst ─────────────────────────────────────────────────
    case 95:
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:0.9, ease:"steps(7)" }, 0)
        .fromTo(bg, { x:0 }, { x:24, duration:0.09, repeat:9, yoyo:true, ease:"steps(1)" }, 0)
        .fromTo(bg, { scale:1.05 }, { scale:1, duration:1.0, ease:"expo.out" }, 0.9);
      accentFade(0.4); stdContent(0.6);
      break;

    // ── 96 · Glacier ──────────────────────────────────────────────────────
    case 96: {
      const { wrap, stripes } = makeStripes(container, 3, "#1a1d26", "column");
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      tl.fromTo(stripes, { yPercent:-110 }, { yPercent:0, duration:1.4, stagger:0.25, ease:"power4.inOut" }, 0)
        .to(stripes, { yPercent:110, duration:1.2, stagger:0.2, ease:"power4.inOut" }, 1.8)
        .fromTo(bg, { scale:1.08 }, { scale:1, duration:2.4, ease:"expo.out" }, 0.4);
      accentFade(1.6); stdContent(1.8);
      break;
    }

    // ── 97 · Prism Burst ──────────────────────────────────────────────────
    case 97: {
      const { wrap, stripes } = makeStripes(container, 10);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(stripes, { transformOrigin:"50% 50%" });
      tl.fromTo(stripes, { scaleY:0 }, { scaleY:1, duration:0.7, stagger:{ amount:0.5, from:"center" }, ease:"expo.out" }, 0)
        .to(stripes, { scaleY:0, duration:0.6, stagger:{ amount:0.4, from:"edges" }, ease:"power3.in" }, 1.0)
        .fromTo(bg, { scale:1.12 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.3);
      accentFade(1.0); stdContent(1.1);
      break;
    }

    // ── 98 · Night Drive ──────────────────────────────────────────────────
    case 98:
      tl.fromTo(mask, { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", duration:0.9, ease:"expo.inOut" }, 0)
        .fromTo(bg, { xPercent:-14, scale:1.1, skewX:-8 }, { xPercent:0, scale:1, skewX:0, duration:1.4, ease:"expo.out" }, 0.05);
      accentFade(0.2); stdContent(0.4);
      break;

    // ── 99 · Bloom Rings ──────────────────────────────────────────────────
    case 99: {
      const rings = [30, 90, 150].map((size) => {
        const r = document.createElement("div");
        Object.assign(r.style, {
          position:"absolute", left:"50%", top:"50%",
          width:size + "vmin", height:size + "vmin",
          marginLeft:(-size / 2) + "vmin", marginTop:(-size / 2) + "vmin",
          border:"3px solid #9CEC5B", borderRadius:"50%",
          zIndex:"10", pointerEvents:"none",
        });
        container.appendChild(r);
        return r;
      });
      cleanups.push(() => rings.forEach((r) => { if(r.parentNode) container.removeChild(r); }));
      tl.fromTo(rings, { scale:0, opacity:1 }, { scale:4, opacity:0, duration:1.2, stagger:0.18, ease:"expo.out" }, 0)
        .fromTo(mask, { clipPath:"circle(0% at 50% 50%)" }, { clipPath:"circle(142% at 50% 50%)", duration:1.1, ease:"expo.inOut" }, 0.15)
        .fromTo(bg, { scale:1.15 }, { scale:1, duration:1.4, ease:"expo.out" }, 0.2);
      accentFade(0.3); stdContent(0.5);
      break;
    }

    // ── 100 · Apotheosis ──────────────────────────────────────────────────
    case 100: {
      const { wrap, stripes } = makeStripes(container, 16);
      cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });
      gsap.set(wrap, { perspective: 1400 });
      gsap.set(mask, { transformOrigin:"50% 50%" });
      tl.fromTo(stripes, { scaleY:0, rotationX:-70 }, { scaleY:1, rotationX:0, duration:0.8, stagger:{ amount:0.6, from:"center" }, ease:"back.out(1.3)" }, 0)
        .fromTo(mask, { clipPath:"inset(50% 50% 50% 50%)", rotation:120 }, { clipPath:"inset(0% 0% 0% 0%)", rotation:0, duration:1.4, ease:"expo.inOut" }, 0.5)
        .to(stripes, { scaleY:0, rotationX:70, duration:0.7, stagger:{ amount:0.5, from:"edges" }, ease:"power4.in" }, 1.3)
        .fromTo(bg, { scale:1.4, filter:"blur(12px)" }, { scale:1, filter:"blur(0px)", duration:2.0, ease:"expo.out" }, 0.4);
      accentFade(1.3);
      tl.fromTo(contentItems, { yPercent:40, opacity:0 }, { yPercent:0, opacity:1, stagger:0.08, duration:0.9, ease:"expo.out" }, 1.5);
      tl.fromTo(tags, { scale:0.8, opacity:0 }, { scale:1, opacity:1, stagger:0.05, duration:0.5, ease:"back.out(1.6)" }, 1.7);
      break;
    }


  }

  return { tl, cleanups };
}

// ── Public factory ─────────────────────────────────────────────────────────
function createTransition(container, options = {}) {
  const id    = options.id ?? 1;
  const nodes = transitionEngineUtils.collectNodes(container);
  transitionEngineUtils.setBaseState(nodes);

  if (transitionEngineUtils.prefersReducedMotion()) {
    return transitionEngineUtils.createNoMotionController(
      () => gsap.set(nodes.mask, { clipPath:"inset(0 0 0 0)", opacity:1 }),
      () => gsap.set(nodes.mask, { clipPath:"inset(0 100% 0 0)" })
    );
  }

  let { tl, cleanups } = buildTimeline(id, nodes, container);

  return {
    play()    { tl?.timeScale(1).play(); },
    reverse() { tl?.timeScale(1).reverse(); },
    kill()    { 
      tl?.kill(); 
      tl = null; 
      cleanups.forEach(fn => fn());
    },
    get isPlaying() { return tl ? tl.isActive() : false; },
  };
}

window.PageTransitions = { createTransition };
