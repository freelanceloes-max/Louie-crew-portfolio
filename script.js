(function () {
  const buddy = document.getElementById("buddy");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (!buddy || prefersReduced || coarsePointer) {
    if (buddy) buddy.hidden = true;
    document.body.style.cursor = "auto";
    initReveal();
    return;
  }

  buddy.hidden = false;
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;
  const offsetX = 18;
  const offsetY = 18;

  function draw() {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    buddy.style.transform = `translate3d(${x + offsetX}px, ${y + offsetY}px, 0)`;
    requestAnimationFrame(draw);
  }

  window.addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      const nearCta = e.target.closest(".btn-gold, .cta-box, #contact");
      buddy.classList.toggle("is-near-cta", Boolean(nearCta));
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    buddy.style.opacity = "0.35";
  });

  window.addEventListener("pointerenter", () => {
    buddy.style.opacity = "1";
  });

  requestAnimationFrame(draw);
  initReveal();

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    nodes.forEach((n) => io.observe(n));
  }
})();
