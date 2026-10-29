(function () {
  const stage = document.getElementById("buddy-stage");
  const frame = document.getElementById("buddy-frame");
  const hint = document.getElementById("look-hint");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initReveal();
  if (!stage || !frame) return;

  const FRAMES = {
    center: "assets/buddy/center.jpg",
    up: "assets/buddy/up.jpg",
    "up-right": "assets/buddy/up-right.jpg",
    right: "assets/buddy/right.jpg",
    "down-right": "assets/buddy/down-right.jpg",
    down: "assets/buddy/down.jpg",
    "down-left": "assets/buddy/down-left.jpg",
    left: "assets/buddy/left.jpg",
    "up-left": "assets/buddy/up-left.jpg",
    blink: "assets/buddy/blink.jpg",
    idle: "assets/buddy/idle.jpg",
  };

  // preload
  Object.values(FRAMES).forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  let currentKey = "center";
  let lastMove = performance.now();
  let blinking = false;
  let autoLook = 0;
  let pendingKey = "center";

  function stageCenter() {
    const r = stage.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.42 };
  }

  function lookKeyFromPointer(clientX, clientY) {
    const c = stageCenter();
    const dx = clientX - c.x;
    const dy = clientY - c.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 48) return "center";
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (a > -22.5 && a <= 22.5) return "right";
    if (a > 22.5 && a <= 67.5) return "down-right";
    if (a > 67.5 && a <= 112.5) return "down";
    if (a > 112.5 && a <= 157.5) return "down-left";
    if (a > 157.5 || a <= -157.5) return "left";
    if (a > -157.5 && a <= -112.5) return "up-left";
    if (a > -112.5 && a <= -67.5) return "up";
    return "up-right";
  }

  function labelFor(key) {
    const map = {
      center: "Looking at you",
      up: "Looking up",
      "up-right": "Looking up-right",
      right: "Looking right",
      "down-right": "Looking down-right",
      down: "Looking down",
      "down-left": "Looking down-left",
      left: "Looking left",
      "up-left": "Looking up-left",
      blink: "Blink",
      idle: "Idle look",
    };
    return map[key] || "Looking…";
  }

  function setFrame(key, fromUser) {
    if (!FRAMES[key] || blinking) {
      pendingKey = key;
      return;
    }
    if (key === currentKey) return;
    currentKey = key;
    frame.src = FRAMES[key];
    stage.dataset.look = key;
    if (hint) hint.textContent = labelFor(key);
    if (fromUser) {
      lastMove = performance.now();
      stage.dataset.state = "tracking";
    } else {
      stage.dataset.state = "idle";
    }
  }

  function onPointer(e) {
    setFrame(lookKeyFromPointer(e.clientX, e.clientY), true);
  }

  function blink() {
    if (prefersReduced || blinking) return;
    blinking = true;
    const prev = currentKey === "blink" ? "center" : currentKey;
    frame.src = FRAMES.blink;
    stage.dataset.look = "blink";
    if (hint) hint.textContent = "Blink";
    setTimeout(() => {
      blinking = false;
      currentKey = "";
      setFrame(pendingKey || prev, false);
    }, 140);
  }

  function tick(now) {
    if (!prefersReduced && now - lastMove > 1800) {
      autoLook += 0.02;
      const c = stageCenter();
      const ax = c.x + Math.sin(autoLook) * 110;
      const ay = c.y + Math.cos(autoLook * 0.65) * 55;
      setFrame(lookKeyFromPointer(ax, ay), false);
      if (hint && stage.dataset.state === "idle") hint.textContent = "Idle look";
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("pointermove", onPointer, { passive: true });
  setFrame("center", true);

  if (!prefersReduced) {
    setInterval(blink, 3400 + Math.random() * 1600);
    setTimeout(blink, 1100);
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
