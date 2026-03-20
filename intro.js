'use strict';

/* ══════════════════════════════════════════════════════════════
   INTRO.JS — Animation d'introduction Shark Motors
   Ne se lance qu'une fois par session (sessionStorage)
══════════════════════════════════════════════════════════════ */

(function () {

  // ── Ne relancer qu'une fois par session ──
  // Commenter la ligne ci-dessous pour tester à chaque rechargement
  if (sessionStorage.getItem('shark-intro-done')) return;

  // ── Masquer le body pendant le chargement ──
  document.documentElement.style.overflow = 'hidden';

  /* ══════════════════════════════
     STYLES INJECTÉS
  ══════════════════════════════ */
  const css = `
    #shark-intro {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #0d0e11;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: 'Bebas Neue', Impact, sans-serif;
    }

    /* ── Canvas eau ── */
    #shark-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    /* ── Contenu central ── */
    #shark-intro-content {
      position: relative;
      z-index: 2;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    /* ── Logo SVG ── */
    #intro-logo {
      width: 90px;
      height: 90px;
      opacity: 0;
      transform: scale(0.5);
      transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      filter: drop-shadow(0 0 20px rgba(232,194,82,0.8));
    }
    #intro-logo.show {
      opacity: 1;
      transform: scale(1);
    }

    /* ── Texte typé ── */
    #intro-title {
      font-size: clamp(3rem, 8vw, 6rem);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #f2f4f8;
      line-height: 1;
      min-height: 1.1em;
    }
    #intro-title .gold { color: #e8c252; }
    #intro-cursor {
      display: inline-block;
      width: 3px;
      height: 0.85em;
      background: #e8c252;
      margin-left: 4px;
      vertical-align: middle;
      animation: blink 0.7s step-end infinite;
    }
    @keyframes blink {
      0%,100% { opacity: 1; }
      50%      { opacity: 0; }
    }

    /* ── Tagline ── */
    #intro-tag {
      font-family: 'Barlow Condensed', Arial Narrow, sans-serif;
      font-size: clamp(0.7rem, 1.5vw, 0.9rem);
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: #8892a4;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    #intro-tag.show { opacity: 1; transform: none; }

    /* ── Barre de progression ── */
    #intro-progress-wrap {
      width: clamp(180px, 30vw, 320px);
      height: 2px;
      background: rgba(255,255,255,0.06);
      border-radius: 99px;
      overflow: hidden;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    #intro-progress-wrap.show { opacity: 1; }
    #intro-progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #c9a83e, #e8c252, #f0d070);
      border-radius: 99px;
      transition: width 0.05s linear;
      box-shadow: 0 0 10px rgba(232,194,82,0.6);
    }

    /* ── Pourcentage ── */
    #intro-percent {
      font-family: 'Barlow Condensed', Arial Narrow, sans-serif;
      font-size: 11px;
      letter-spacing: 0.2em;
      color: #e8c252;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    #intro-percent.show { opacity: 1; }

    /* ══ ANIMATION SORTIE — MORSURE / DÉCHIRURE ══ */
    #shark-top, #shark-bottom {
      position: absolute;
      left: 0; right: 0;
      height: 50%;
      background: #0d0e11;
      z-index: 10;
      transition: transform 0.7s cubic-bezier(0.76, 0, 0.24, 1);
    }
    #shark-top    { top: 0;  clip-path: polygon(0 0, 100% 0, 100% 85%, 94% 100%, 88% 85%, 82% 100%, 76% 85%, 70% 100%, 64% 85%, 58% 100%, 52% 85%, 46% 100%, 40% 85%, 34% 100%, 28% 85%, 22% 100%, 16% 85%, 10% 100%, 4% 85%, 0 100%); }
    #shark-bottom { bottom: 0; clip-path: polygon(0 15%, 4% 0, 10% 15%, 16% 0, 22% 15%, 28% 0, 34% 15%, 40% 0, 46% 15%, 52% 0, 58% 15%, 64% 0, 70% 15%, 76% 0, 82% 15%, 88% 0, 94% 15%, 100% 0, 100% 100%, 0 100%); }
    #shark-top.bite    { transform: translateY(-100%); }
    #shark-bottom.bite { transform: translateY(100%); }

    /* ── Ligne rouge sang ── */
    #intro-blood-line {
      position: absolute;
      top: 50%;
      left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #e8c252, #fff, #e8c252, transparent);
      transform: scaleX(0);
      transform-origin: center;
      z-index: 11;
      box-shadow: 0 0 20px rgba(232,194,82,0.8);
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ══════════════════════════
     HTML DE L'INTRO
  ══════════════════════════ */
  const intro = document.createElement('div');
  intro.id = 'shark-intro';
  intro.innerHTML = `
    <canvas id="shark-canvas"></canvas>

    <div id="shark-intro-content">
      <!-- Logo requin SVG -->
      <svg id="intro-logo" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Corps -->
        <path d="M6 44 C12 34 22 30 40 32 C58 34 70 38 74 44 C70 50 58 54 40 54 C22 54 12 50 6 44Z"
              fill="rgba(232,194,82,0.12)" stroke="#e8c252" stroke-width="1.5"/>
        <!-- Aileron dorsal -->
        <path d="M36 32 L30 14 L50 32"
              fill="rgba(232,194,82,0.18)" stroke="#e8c252" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Aileron pectoral -->
        <path d="M28 44 L18 52 L32 48" fill="rgba(232,194,82,0.1)" stroke="#e8c252" stroke-width="1.2"/>
        <!-- Queue -->
        <path d="M70 42 L78 34 M70 46 L78 54" stroke="#e8c252" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Oeil -->
        <circle cx="20" cy="43" r="2.5" fill="#e8c252"/>
        <circle cx="20" cy="43" r="1" fill="#0d0e11"/>
        <!-- Dents -->
        <path d="M12 46 L15 44 L18 46.5 L21 44 L24 46.5 L27 44 L30 46"
              stroke="#e8c252" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <!-- Ouïes -->
        <path d="M16 40 Q17 44 16 48" stroke="#e8c252" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      </svg>

      <div id="intro-title"><span id="intro-typed"></span><span id="intro-cursor"></span></div>

      <div id="intro-tag">Garage Spécialiste · Molenbeek-Saint-Jean</div>

      <div id="intro-progress-wrap">
        <div id="intro-progress-bar"></div>
      </div>
      <div id="intro-percent">0%</div>
    </div>

    <!-- Panneaux dents de requin pour la sortie -->
    <div id="shark-top"></div>
    <div id="shark-bottom"></div>
    <div id="intro-blood-line"></div>
  `;
  document.body.prepend(intro);

  /* ══════════════════════════
     CANVAS — EAU & REQUIN
  ══════════════════════════ */
  const canvas = document.getElementById('shark-canvas');
  const ctx    = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Vagues
  const waves = [
    { y: 0.55, speed: 0.012, amp: 18, phase: 0,    color: 'rgba(232,194,82,0.06)' },
    { y: 0.58, speed: 0.008, amp: 24, phase: 1,    color: 'rgba(232,194,82,0.04)' },
    { y: 0.52, speed: 0.018, amp: 12, phase: 2.5,  color: 'rgba(255,255,255,0.02)' },
  ];

  // Bulles
  const bubbles = Array.from({ length: 25 }, () => ({
    x: Math.random(), y: 0.5 + Math.random() * 0.4,
    r: Math.random() * 3 + 1,
    speed: Math.random() * 0.003 + 0.001,
    opacity: Math.random() * 0.3 + 0.05,
    wobble: Math.random() * Math.PI * 2,
  }));

  // Requin animé qui traverse l'écran
  let sharkX    = -0.25;   // position en % de la largeur
  let sharkDir  = 1;
  const SHARK_Y = 0.48;    // hauteur fixe (% de l'écran)
  let sharkWobble = 0;

  function drawWaves(t) {
    waves.forEach(w => {
      w.phase += w.speed;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * w.y);
      for (let x = 0; x <= canvas.width; x += 4) {
        const y = canvas.height * w.y + Math.sin(x * 0.012 + w.phase) * w.amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = w.color;
      ctx.fill();
    });
  }

  function drawBubbles() {
    bubbles.forEach(b => {
      b.y -= b.speed;
      b.wobble += 0.04;
      b.x += Math.sin(b.wobble) * 0.0003;
      if (b.y < 0.4) { b.y = 0.95; b.x = Math.random(); }

      ctx.beginPath();
      ctx.arc(b.x * canvas.width, b.y * canvas.height, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232,194,82,${b.opacity})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
  }

  function drawShark(px, py, dir, wobble) {
    const w = Math.min(canvas.width * 0.18, 180);
    const h = w * 0.45;
    const x = px * canvas.width;
    const y = py * canvas.height + Math.sin(wobble) * 6;

    ctx.save();
    ctx.translate(x, y);
    if (dir < 0) ctx.scale(-1, 1);

    // Ombre douce
    ctx.shadowColor = 'rgba(232,194,82,0.25)';
    ctx.shadowBlur  = 20;

    // Corps
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.5, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232,194,82,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,194,82,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Aileron dorsal
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, -h * 0.38);
    ctx.lineTo(-w * 0.2,  -h * 1.0);
    ctx.lineTo( w * 0.18, -h * 0.38);
    ctx.closePath();
    ctx.fillStyle = 'rgba(232,194,82,0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,194,82,0.7)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Queue
    ctx.beginPath();
    ctx.moveTo(w * 0.45, 0);
    ctx.lineTo(w * 0.7, -h * 0.5);
    ctx.moveTo(w * 0.45, 0);
    ctx.lineTo(w * 0.7,  h * 0.5);
    ctx.strokeStyle = 'rgba(232,194,82,0.7)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Aileron pectoral
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, h * 0.1);
    ctx.lineTo(-w * 0.28, h * 0.55);
    ctx.lineTo( w * 0.1,  h * 0.3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(232,194,82,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,194,82,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Œil
    ctx.beginPath();
    ctx.arc(-w * 0.28, -h * 0.05, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c252';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-w * 0.28, -h * 0.05, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0d0e11';
    ctx.fill();

    // Dents
    const teethX = -w * 0.45;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(teethX + i * (w * 0.055), h * 0.15);
      ctx.lineTo(teethX + i * (w * 0.055) + w * 0.025, h * 0.35);
      ctx.lineTo(teethX + i * (w * 0.055) + w * 0.055, h * 0.15);
      ctx.strokeStyle = 'rgba(232,194,82,0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  let animRunning = true;
  let lastTime = 0;

  function loop(t) {
    if (!animRunning) return;
    const dt = t - lastTime;
    lastTime = t;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawWaves(t);
    drawBubbles();

    // Requin avance
    sharkWobble += 0.05;
    sharkX      += sharkDir * 0.0022;

    if (sharkX > 1.25)  { sharkDir = -1; }
    if (sharkX < -0.25) { sharkDir =  1; }

    drawShark(sharkX, SHARK_Y, sharkDir, sharkWobble);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ══════════════════════════
     SÉQUENCE ANIMATION
  ══════════════════════════ */
  const typed    = document.getElementById('intro-typed');
  const logoEl   = document.getElementById('intro-logo');
  const tagEl    = document.getElementById('intro-tag');
  const progWrap = document.getElementById('intro-progress-wrap');
  const progBar  = document.getElementById('intro-progress-bar');
  const pct      = document.getElementById('intro-percent');

  const TEXT_PARTS = [
    { text: 'SHARK ', gold: false },
    { text: 'MOTORS', gold: true },
  ];
  const FULL_TEXT = 'SHARK MOTORS';

  let progress = 0;

  // Étape 1 — logo apparaît
  setTimeout(() => {
    logoEl.classList.add('show');
  }, 200);

  // Étape 2 — typing du texte
  setTimeout(() => {
    progWrap.classList.add('show');
    pct.classList.add('show');

    let charIdx = 0;

    function typeNext() {
      if (charIdx >= FULL_TEXT.length) {
        // Tagline
        setTimeout(() => tagEl.classList.add('show'), 200);
        return;
      }

      const char = FULL_TEXT[charIdx];
      charIdx++;
      const isGold = charIdx > 6; // "SHARK " = 6 chars

      typed.innerHTML =
        `<span>${FULL_TEXT.slice(0, 6)}</span>` +
        (charIdx > 6 ? `<span class="gold">${FULL_TEXT.slice(6, charIdx)}</span>` : '');

      // Avancer la barre de progression proportionnellement
      progress = Math.min(progress + 100 / FULL_TEXT.length, 70);
      progBar.style.width = progress + '%';
      pct.textContent = Math.round(progress) + '%';

      const delay = char === ' ' ? 80 : 60 + Math.random() * 60;
      setTimeout(typeNext, delay);
    }

    typeNext();
  }, 700);

  // Étape 3 — compléter la barre
  setTimeout(() => {
    let p = progress;
    const fill = setInterval(() => {
      p = Math.min(p + 2, 100);
      progBar.style.width = p + '%';
      pct.textContent = Math.round(p) + '%';
      if (p >= 100) {
        clearInterval(fill);
        pct.textContent = '100%';
        // Lancer la sortie
        setTimeout(exitIntro, 300);
      }
    }, 18);
  }, 2200);

  /* ══════════════════════════
     SORTIE — MORSURE
  ══════════════════════════ */
  function exitIntro() {
    const bloodLine = document.getElementById('intro-blood-line');
    const top       = document.getElementById('shark-top');
    const bottom    = document.getElementById('shark-bottom');

    // 1. Flash de la ligne
    bloodLine.style.transition = 'transform 0.3s ease';
    bloodLine.style.transform  = 'scaleX(1)';

    setTimeout(() => {
      // 2. Les deux panneaux dents s'écartent
      top.classList.add('bite');
      bottom.classList.add('bite');
    }, 200);

    setTimeout(() => {
      // 3. Nettoyer
      animRunning = false;
      intro.remove();
      styleEl.remove();
      document.documentElement.style.overflow = '';
      sessionStorage.setItem('shark-intro-done', '1');
    }, 1000);
  }

})();
