/* ── BACKGROUND PARTICLES ───────────────────────── */
(function spawnParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'bg-particle';
    const size = 1.5 + Math.random() * 2.5;
    const op   = 0.15 + Math.random() * 0.35;
    p.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      --op:${op};
      animation-delay:${Math.random()*9}s;
      animation-duration:${5 + Math.random()*9}s;
    `;
    container.appendChild(p);
  }
})();

/* ── SCROLL REVEAL ──────────────────────────────── */
const revealEls = document.querySelectorAll('[data-reveal]');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || '0', 10);
    el.style.setProperty('--reveal-delay', delay + 'ms');
    // Force reflow so delay applies even for first-paint
    void el.offsetHeight;
    el.classList.add('revealed');
    revealObs.unobserve(el);
  });
}, { threshold: 0.10, rootMargin: '0px 0px -36px 0px' });

revealEls.forEach(el => revealObs.observe(el));

/* ── GRID STAGGER (cards within grids) ─────────── */
document.querySelectorAll('.projects-grid, .showcase-grid').forEach(grid => {
  grid.querySelectorAll('[data-reveal]').forEach((card, i) => {
    const base  = parseInt(card.dataset.delay || '0', 10);
    const extra = i * 90;
    card.dataset.delay = String(base + extra);
  });
});

/* ── COUNTER ANIMATION ──────────────────────────── */
function runCounter(el) {
  const end      = parseInt(el.dataset.count, 10);
  const duration = 1500;
  const start    = performance.now();
  function tick(now) {
    const t    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
    el.textContent = Math.round(ease * end);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObs = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  entry.target.querySelectorAll('[data-count]').forEach(runCounter);
  counterObs.unobserve(entry.target);
}, { threshold: 0.6 });

const miniStats = document.querySelector('.mini-stats');
if (miniStats) counterObs.observe(miniStats);

/* ── PROGRESS BAR ───────────────────────────────── */
const progFill = document.querySelector('.prog-fill');
if (progFill) {
  const target = progFill.dataset.width + '%';
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    progFill.style.width = target;
  }, { threshold: 0.5 }).observe(progFill);
}

/* ── SMOOTH 3D TILT ON PROFILE FRAME ───────────── */
const pfStage = document.getElementById('pfStage');
let tiltX = 0, tiltY = 0;
let targetTiltX = 0, targetTiltY = 0;
let tiltRAF = null;

function lerpTilt() {
  tiltX += (targetTiltX - tiltX) * 0.07;
  tiltY += (targetTiltY - tiltY) * 0.07;
  if (pfStage) {
    pfStage.style.transform =
      `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)` +
      ` translateY(${-Math.abs(tiltX + tiltY) * 0.4}px)`;
  }
  tiltRAF = requestAnimationFrame(lerpTilt);
}
lerpTilt();

document.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx; // -1 → +1
  const dy = (e.clientY - cy) / cy;
  targetTiltX = dy * -9;   // max ±9° pitch
  targetTiltY = dx *  8;   // max ±8° yaw
}, { passive: true });

// Reset tilt when mouse leaves window
document.addEventListener('mouseleave', () => {
  targetTiltX = 0; targetTiltY = 0;
});

/* ── SCROLL PARALLAX ────────────────────────────── */
const blob1 = document.querySelector('.b1');
const blob2 = document.querySelector('.b2');
const blob3 = document.querySelector('.b3');
const hvGlow = document.querySelector('.hv-glow');

let scrollY = 0, rafPending = false;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      if (blob1) blob1.style.transform = `translateY(${scrollY * 0.14}px)`;
      if (blob2) blob2.style.transform = `translateY(${-scrollY * 0.10}px)`;
      if (blob3) blob3.style.transform = `translateY(${scrollY * 0.07}px)`;
      if (hvGlow) hvGlow.style.transform = `translateY(${scrollY * 0.05}px)`;
      rafPending = false;
    });
  }
}, { passive: true });

/* ── NAV ACTIVE LINK ────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)
      );
    }
  });
}, { threshold: 0.4 }).observe(...sections, sections); // observe each

sections.forEach(s => {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      navLinks.forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === `#${s.id}`)
      );
    }
  }, { threshold: 0.4 }).observe(s);
});

/* ── PROJECT CARD INTERACTIVE TILT ─────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  let cx = 0, cy = 0, tX = 0, tY = 0, raf = null;

  function lerp() {
    tX += (cx - tX) * 0.10;
    tY += (cy - tY) * 0.10;
    card.style.transform = `perspective(700px) rotateX(${tY}deg) rotateY(${tX}deg) translateY(-10px)`;
    raf = requestAnimationFrame(lerp);
  }

  card.addEventListener('mouseenter', () => {
    if (!raf) lerp();
  });

  card.addEventListener('mousemove', (e) => {
    const r  = card.getBoundingClientRect();
    const x  = (e.clientX - r.left)  / r.width  - 0.5;  // -0.5 → 0.5
    const y  = (e.clientY - r.top)   / r.height - 0.5;
    cx = x * 10;   // max ±5° yaw
    cy = -y * 8;   // max ±4° pitch
  });

  card.addEventListener('mouseleave', () => {
    cancelAnimationFrame(raf); raf = null;
    cx = 0; cy = 0;
    card.style.transform = '';
    card.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1)';
    setTimeout(() => { card.style.transition = ''; }, 460);
  });
});

/* ── NAV SCROLL TINT ────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) {
    nav.style.background = window.scrollY > 40
      ? 'rgba(2,8,24,0.92)'
      : 'rgba(2,8,24,0.70)';
  }
}, { passive: true });
