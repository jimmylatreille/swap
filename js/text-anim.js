function loadtext() {
	gsap.registerPlugin(ScrollTrigger);

// Split text into spans
let typeSplit = new SplitType("[text-split]", {
	types: "words, chars",
	tagName: "span"
});

function createScrollTrigger(triggerElement, timeline) {
	ScrollTrigger.create({
		trigger: triggerElement,
		start: "top bottom",
		onLeaveBack: () => {
			timeline.progress(0);
			timeline.pause();
		}
	});
	ScrollTrigger.create({
		trigger: triggerElement,
		start: "top 60%",
		onEnter: () => timeline.play()
	});
}

// transition text
$("[words-slide-up]").each(function (index) {
	let tl = gsap.timeline({ paused: true });
	tl.from($(this).find(".word"), { opacity: 0, yPercent: 100, duration: 0.6, ease: "back.out(2)", stagger: { amount: 0.5 } });
	createScrollTrigger($(this), tl);
});

$("[letters-fade-in]").each(function (index) {
	let tl = gsap.timeline({ paused: true });
	tl.from($(this).find(".char"), { opacity: 0, duration: 0.5, ease: "power1.out", stagger: { amount: 0.8 } });
	createScrollTrigger($(this), tl);
});

$("[words-slide-from-right]").each(function (index) {
	let tl = gsap.timeline({ paused: true });
	tl.from($(this).find(".word"), { opacity: 0, x: "1em", duration: 0.8, ease: "power2.out", stagger: { amount: 0.2 } });
	createScrollTrigger($(this), tl);
});

$("[letters-slide-up]").each(function (index) {
	let tl = gsap.timeline({ paused: true });
	tl.from($(this).find(".char"), { opacity: 0, yPercent: 100, duration: 0.2, ease: "power1.out", stagger: { amount: 0.6 } });
	createScrollTrigger($(this), tl);
});

$("[letters-fade-in-random]").each(function (index) {
	let tl = gsap.timeline({ paused: true });
	tl.from($(this).find(".char"), { opacity: 0, duration: 0.05, ease: "power1.out", stagger: { amount: 0.4, from: "random" } });
	createScrollTrigger($(this), tl);
});

$("[scrub-each-word]").each(function (index) {
	let tl = gsap.timeline({
		scrollTrigger: {
			trigger: $(this),
			start: "top 90%",
			end: "top center",
			scrub: true
		}
	});
	tl.from($(this).find(".word"), { opacity: 0.2, duration: 0.2, ease: "power1.out", stagger: { each: 0.4 } });
});

// Avoid flash of unstyled content
gsap.set("[text-split]", { opacity: 1 });
}