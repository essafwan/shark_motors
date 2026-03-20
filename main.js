'use strict';

/* ── NAVBAR ── */
const navbar = document.querySelector('.navbar');
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ── ACTIVE LINK ── */
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === page) link.classList.add('active');
});

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── COMPTEURS ANIMÉS ── */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const update = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ── OPEN/FERMÉ ── */
const badge = document.querySelector('.open-badge');
if (badge) {
  const hours = [
    { open: '10:00', close: '18:00', closed: false }, // Lun
    { open: '10:00', close: '18:00', closed: false },
    { open: '10:00', close: '18:00', closed: false },
    { open: '10:00', close: '18:00', closed: false },
    { open: '10:00', close: '18:00', closed: false },
    { open: '10:00', close: '18:00', closed: false }, // Sam
    { closed: true },                                  // Dim
  ];
  const now = new Date();
  const jsDay = now.getDay(); // 0=dim
  const idx = jsDay === 0 ? 6 : jsDay - 1;
  const today = hours[idx];
  let isOpen = false;
  if (!today.closed) {
    const [oh, om] = today.open.split(':').map(Number);
    const [ch, cm] = today.close.split(':').map(Number);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    isOpen = nowMin >= oh * 60 + om && nowMin < ch * 60 + cm;
  }
  badge.classList.toggle('closed', !isOpen);
  badge.querySelector('.badge-text').textContent = isOpen ? 'Ouvert maintenant' : 'Actuellement fermé';
}

/* ── ANNÉE FOOTER ── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
