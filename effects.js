'use strict';

/* ══════════════════════════════════════════════════════════════
   EFFECTS.JS — Particules, Spotlight, Hover 3D
══════════════════════════════════════════════════════════════ */

/* ── 1. CURSOR SPOTLIGHT ── */
(function initSpotlight() {
  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9998;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,194,82,0.07) 0%, transparent 65%);
    transform: translate(-50%, -50%);
    transition: opacity 0.4s ease;
    opacity: 0;
    top: 0; left: 0;
  `;
  document.body.appendChild(spotlight);

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    spotlight.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });

  function animateSpotlight() {
    // Lerp fluide
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    spotlight.style.left = currentX + 'px';
    spotlight.style.top  = currentY + 'px';
    raf = requestAnimationFrame(animateSpotlight);
  }
  animateSpotlight();
})();


/* ── 2. PARTICULES DORÉES FLOTTANTES ── */
(function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.6;
  `;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 38;
  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.4 + 0.4,
    speedX: (Math.random() - 0.5) * 0.35,
    speedY: -(Math.random() * 0.4 + 0.15),
    opacity: Math.random() * 0.5 + 0.1,
    pulse: Math.random() * Math.PI * 2,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.pulse += 0.018;
      p.x += p.speedX;
      p.y += p.speedY;

      // Reset quand sort en haut
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;

      const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 194, 82, ${currentOpacity})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();


/* ── 3. HOVER 3D SUR LES CARDS ── */
(function initCard3D() {
  const SELECTORS = '.svc-item, .piece-card, .service-card, .why-feature, .stat-card, .testi-card';
  const INTENSITY = 8; // degrés max de rotation

  function applyTo(el) {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      el.style.transform = `
        translateY(-5px)
        rotateX(${-dy * INTENSITY}deg)
        rotateY(${dx * INTENSITY}deg)
        scale(1.02)
      `;
      el.style.transition = 'transform 0.1s ease, border-color 0.3s ease, box-shadow 0.3s ease';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.4s ease, border-color 0.3s ease, box-shadow 0.3s ease';
    });
  }

  // Observer pour appliquer aux éléments qui arrivent via tab switch
  const observer = new MutationObserver(() => {
    document.querySelectorAll(SELECTORS).forEach(el => {
      if (!el.dataset.has3d) {
        el.dataset.has3d = '1';
        el.style.transformStyle = 'preserve-3d';
        applyTo(el);
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Appliquer aux éléments déjà présents
  document.querySelectorAll(SELECTORS).forEach(el => {
    el.dataset.has3d = '1';
    el.style.transformStyle = 'preserve-3d';
    applyTo(el);
  });
})();


/* ── 4. LIGNE ACCENT ANIMÉE SOUS LE TITRE DE PAGE ── */
(function initTitleUnderline() {
  document.querySelectorAll('.page-hero-title, .section-title').forEach(title => {
    // Wrap le span accent avec une animation
    const spans = title.querySelectorAll('span');
    spans.forEach(span => {
      span.style.position = 'relative';
      span.style.display  = 'inline-block';

      const line = document.createElement('span');
      line.style.cssText = `
        position: absolute;
        bottom: -4px;
        left: 0;
        height: 3px;
        width: 100%;
        background: linear-gradient(90deg, #e8c252, #f0d070, #c9a83e);
        border-radius: 2px;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      span.appendChild(line);

      // Trigger quand visible
      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setTimeout(() => { line.style.transform = 'scaleX(1)'; }, 200);
          io.unobserve(span);
        }
      }, { threshold: 0.5 });
      io.observe(span);
    });
  });
})();


/* ── 5. SCROLL PROGRESS BAR ── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    width: 0%;
    background: linear-gradient(90deg, #e8c252, #f0d070);
    z-index: 9999;
    transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(232,194,82,0.6);
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.body.scrollHeight - window.innerHeight;
    bar.style.width = (scrolled / max * 100) + '%';
  }, { passive: true });
})();


/* ── 6. GLOW HOVER SUR LES CARTES (border lumineuse qui suit le curseur) ── */
(function initCardGlow() {
  document.querySelectorAll('.svc-item, .piece-card, .service-card, .contact-block, .stat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--gx', x + '%');
      card.style.setProperty('--gy', y + '%');
    });
  });

  // Injecter le CSS pour le glow dynamique
  const style = document.createElement('style');
  style.textContent = `
    .svc-item, .piece-card, .service-card, .contact-block, .stat-card {
      --gx: 50%; --gy: 50%;
    }
    .svc-item:hover, .piece-card:hover, .service-card:hover, .stat-card:hover {
      background: radial-gradient(circle at var(--gx) var(--gy), rgba(232,194,82,0.07) 0%, var(--black-card) 60%) !important;
    }
  `;
  document.head.appendChild(style);
})();
