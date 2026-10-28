(function () {
  const stage = document.getElementById("buddy-stage");
  const head = document.getElementById("head");
  const pupilL = document.getElementById("pupil-l");
  const pupilR = document.getElementById("pupil-r");
  const hint = document.getElementById("look-hint");
  const eyelids = document.querySelectorAll(".eyelid");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initReveal();

  if (!stage || !head || !pupilL || !pupilR) return;

  const eyeHome = { l: { x: 138, y: 132 }, r: { x: 182, y: 132 } };
  const maxPupil = 5.5;
  const maxHeadDeg = 18;

  let target = { x: 0, y: 0 };
  let current = { x: 0, y: 0 };
  let headRot = 0;
  let targetRot = 0;
  let autoLook = 0;
  let lastMove = performance.now();
  let blinking = false;
  let userDriven = true;

  function stageCenter() {
    const r = stage.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.38 };
  }

  function applyLook(clientX, clientY, label, fromUser) {
    const c = stageCenter();
    const dx = clientX - c.x;
    const dy = clientY - c.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const intensity = Math.min(1, dist / 280);
    target.x = nx * maxPupil * intensity;
    target.y = ny * maxPupil * intensity;
    targetRot = Math.max(-maxHeadDeg, Math.min(maxHeadDeg, (dx / 18) * intensity));
    if (hint && label) hint.textContent = label;
    if (fromUser) {
      userDriven = true;
      lastMove = performance.now();
      stage.dataset.state = "tracking";
    } else {
      stage.dataset.state = "idle";
    }
  }

  function lookLabel(dx, dy) {
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (Math.hypot(dx, dy) < 40) return "Looking at you";
    if (a > -22.5 && a <= 22.5) return "Looking right";
    if (a > 22.5 && a <= 67.5) return "Looking down-right";
    if (a > 67.5 && a <= 112.5) return "Looking down";
    if (a > 112.5 && a <= 157.5) return "Looking down-left";
    if (a > 157.5 || a <= -157.5) return "Looking left";
    if (a > -157.5 && a <= -112.5) return "Looking up-left";
    if (a > -112.5 && a <= -67.5) return "Looking up";
    return "Looking up-right";
  }

  function onPointer(e) {
    const c = stageCenter();
    applyLook(e.clientX, e.clientY, lookLabel(e.clientX - c.x, e.clientY - c.y), true);
  }

  function blink() {
    if (prefersReduced || blinking) return;
    blinking = true;
    eyelids.forEach((el) => {
      el.style.transition = "opacity 0.08s ease";
      el.style.opacity = "1";
    });
    setTimeout(() => {
      eyelids.forEach((el) => {
        el.style.opacity = "0";
      });
      blinking = false;
    }, 120);
  }

  function tick(now) {
    if (!prefersReduced) {
      if (now - lastMove > 1800) {
        userDriven = false;
        autoLook += 0.018;
        const c = stageCenter();
        const ax = c.x + Math.sin(autoLook) * 90;
        const ay = c.y + Math.cos(autoLook * 0.7) * 40;
        applyLook(ax, ay, "Idle look", false);
      }

      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;
      headRot += (targetRot - headRot) * 0.12;

      pupilL.setAttribute("cx", String(eyeHome.l.x + current.x));
      pupilL.setAttribute("cy", String(eyeHome.l.y + current.y));
      pupilR.setAttribute("cx", String(eyeHome.r.x + current.x));
      pupilR.setAttribute("cy", String(eyeHome.r.y + current.y));
      head.setAttribute("transform", `rotate(${headRot.toFixed(2)} 160 128)`);
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("pointermove", onPointer, { passive: true });
  const boot = stageCenter();
  applyLook(boot.x + 60, boot.y - 20, "Looking…", true);

  if (!prefersReduced) {
    setInterval(blink, 3200 + Math.random() * 1800);
    setTimeout(blink, 900);
  }

  requestAnimationFrame(tick);

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
