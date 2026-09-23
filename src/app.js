import { getSermons, upsertSermon } from './data/sermons.js';
import { getEvents, saveEvents } from './data/events.js';
import { getPreachers, savePreachers } from './data/preachers.js';
import { seasons } from './data/seasons.js';
import { topics } from './data/topics.js';
import { getDailyVerses, saveDailyVerses, getVerseForDate } from './data/dailyVerse.js';
import { getLeadershipTeam, saveLeadershipTeam } from './data/leadership.js';
import { getPartners, savePartners } from './data/partners.js';
import { getConversations, saveConversations, extractVideoId, ytThumb } from './data/conversations.js';
import { addSubscriber } from './data/subscribers.js';
import { getReflectionsForDate, addReflection, toggleLikeReflection } from './data/reflections.js';

// ─── Dynamic store getters — always return fresh data from localStorage ─────────────
const sermons    = () => getSermons();
const events     = () => getEvents();
const preachers  = () => getPreachers();
const scheduledDailyVerses = () => getDailyVerses();
const leadership = () => getLeadershipTeam();
const partners   = () => getPartners();
const conversations = () => getConversations();


let activeView = 'home';
let activeSeasonChip = 'all';
let currentCarouselIndex = 0;
let pendingPrayers = [
  { id: 'pr-1', name: 'Sarah M.', email: 'sarah@example.com', urgency: 'Health & Healing', msg: 'Please pray for my mother recovering from surgery.', status: 'New', date: '2026-08-22' },
  { id: 'pr-2', name: 'David K.', email: 'david@example.com', urgency: 'Family', msg: 'Praying for guidance and peace during a difficult season.', status: 'New', date: '2026-08-23' }
];

// Admin Auth
const VALID_PASSWORDS = ['Serm0n$26', 'Serm0n', 'sermon2026'];
let adminAuthenticated = false;

// SVG helpers
const svgPlay   = `<svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
const svgShare  = `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;
const svgClock  = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const svgBook   = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;

export function getTodayDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatVerseDate(dateStr) {
  try {
    if (!dateStr) return '';
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0])) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (_) {}
  return dateStr;
}

export function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
window.escapeHtml = escapeHtml;

window.toggleBioExpand = function(btn, e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const wrap = btn.closest('.card-bio-wrap');
  if (!wrap) return;
  const isExpanded = wrap.classList.toggle('is-expanded');
  wrap.classList.toggle('is-clamped', !isExpanded);
  btn.textContent = isExpanded ? 'Show less' : 'Read full bio';
  btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
};

// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  animateLogoTitle();
  setupScrollReveal();
  setupHeaderScroll();
  setupNavigation();
  setupExploreDropdown();
  setupMobileDrawer();
  setupHeroCtas();
  setupHeroAmbientEffects();
  setupFooterWater();
  setupPromoVideo();
  setupPersistentMiniPlayer();
  setupScriptureCardGenerator();
  setupSermonFilters();
  setupDailyVerse();
  setupPrayerForm();
  setupNewsletterForm();
  setupGeneralContactForm();
  setupAdminPortal();
  setupAboutTabs();
  setupConversationsView();
  setupCommunityReflections();

  renderHomeSermons();
  filterAndRenderSermons();
  renderSeasonsHub();
  renderTopicsHub();
  renderPreachersHub();
  renderConversationsHub();
  renderEventsGrid();
  renderCommunityReflections();
  renderAdminPreachersList();
  renderAboutTeamRoster();
  renderAboutPartners();
  updateFooterSocialLinks();

  // ─── Real-time Cloud Data Sync Listeners ─────────────────────────────────
  const refreshAllUI = () => {
    renderHomeSermons();
    filterAndRenderSermons();
    renderSeasonsHub();
    renderTopicsHub();
    renderPreachersHub();
    renderConversationsHub();
    renderEventsGrid();
    renderAboutTeamRoster();
    renderAboutPartners();
    populateDropdownFilterOptions();
    renderDailyVerse();
    updateFooterSocialLinks();
    updateHeroStats();
  };

  const updateHeroStats = () => {
    const counter = document.getElementById('homePreachersCount');
    if (counter) {
      const list = preachers();
      if (list && list.length) {
        counter.textContent = `${list.length}+`;
      }
    }
    const missionSermonsEl = document.getElementById('missionSermonsCount');
    if (missionSermonsEl) {
      const list = sermons();
      if (list && list.length) {
        const count = Math.max(50, list.length);
        missionSermonsEl.textContent = `${count}+`;
      }
    }
  };
  updateHeroStats();

  window.addEventListener('storage', refreshAllUI);
  window.addEventListener('2ms:sermons:updated', refreshAllUI);
  window.addEventListener('2ms:preachers:updated', refreshAllUI);
  window.addEventListener('2ms:verses:updated', refreshAllUI);
  window.addEventListener('2ms:events:updated', refreshAllUI);
  window.addEventListener('2ms:leadership:updated', refreshAllUI);
  window.addEventListener('2ms:partners:updated', refreshAllUI);
  window.addEventListener('2ms:conversations:updated', refreshAllUI);
});

// ─── LOGO TITLE ANIMATION ─────────────────────────────────────────────────────
function animateLogoTitle() {
  const el = document.getElementById('animatedLogoTitle');
  if (!el) return;

  const text   = '2-Minute Sermon';
  const words  = text.split(' ');
  let baseDelay = 120; // ms before first letter
  let html = '';

  words.forEach((word, wi) => {
    // Word 0 is '2-Minute' (crimson accent), Word 1 is 'Sermon' (obsidian charcoal)
    const wordClass = wi === 0 ? 'logo-word-accent' : 'logo-word-main';
    html += `<span class="${wordClass}">`;
    [...word].forEach((ch, ci) => {
      const delay = baseDelay + (wi * word.length + ci) * 48;
      html += `<span class="letter" style="animation-delay:${delay}ms">${ch}</span>`;
    });
    html += `</span>`;
    if (wi < words.length - 1) html += '<span class="word-space"></span>';
  });

  el.innerHTML = html;
}

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal-on-scroll, .stagger-children').forEach(el => {
    observer.observe(el);
  });
}

// Re-run reveal for newly rendered grids
function observeNewCards(container) {
  if (!container) return;
  container.classList.add('stagger-children');
  // Give browser a tick to paint, then trigger
  requestAnimationFrame(() => {
    requestAnimationFrame(() => container.classList.add('revealed'));
  });
}

// ─── HEADER SCROLL SHADOW & READING PROGRESS ──────────────────────────────────
function setupHeaderScroll() {
  const header = document.getElementById('appHeader');
  const progressBar = document.getElementById('headerScrollProgress');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('scrolled', scrollY > 20);

    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, progress)).toFixed(1)}%`;
    }
  }, { passive: true });
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetView = btn.getAttribute('data-view');
      if (!targetView) return;
      // Prevent default jump for anchor links pointing to '#' or '#home'
      if (btn.tagName === 'A') {
        const href = btn.getAttribute('href');
        if (href === '#' || href === '#home') {
          e.preventDefault();
        }
      }

      if (targetView === 'admin') { window.location.href = '/admin.html'; return; }
      
      const aboutTab = btn.getAttribute('data-about-tab');
      const scrollToId = btn.getAttribute('data-scroll-to');
      const convFilter = btn.getAttribute('data-conv-filter');
      switchView(targetView);
      if (targetView === 'about' && aboutTab) {
        switchAboutTab(aboutTab);
      }
      if (targetView === 'conversations' && convFilter) {
        setTimeout(() => {
          document.querySelector(`#conversationFilterBar [data-conv-filter="${convFilter}"]`)?.click();
        }, 80);
      }
      if (scrollToId) {
        setTimeout(() => {
          const targetEl = document.getElementById(scrollToId);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }

      // Sync URL hash for browser history & back/forward buttons
      if (targetView === 'home') {
        if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '#home') {
          history.pushState(null, '', window.location.pathname);
        }
      } else {
        const newHash = '#' + (targetView === 'about' && aboutTab ? `about-${aboutTab}` : targetView);
        if (window.location.hash !== newHash) {
          history.pushState(null, '', newHash);
        }
      }

      closeDropdown();
      closeMobileDrawer();
    });
  });

  function handleRouteHash() {
    const rawHash = window.location.hash.replace('#', '');
    if (!rawHash || rawHash === 'home') {
      switchView('home');
      return;
    }

    if (rawHash.startsWith('sermon-')) {
      switchView('sermons');
      setTimeout(() => {
        openSermonModal(rawHash);
      }, 120);
      return;
    }

    if (rawHash === 'about-structure' || rawHash === 'about/structure') {
      switchView('about');
      switchAboutTab('structure');
    } else if (rawHash === 'about-team' || rawHash === 'about/who-is-who' || rawHash === 'about-who-is-who') {
      switchView('about');
      switchAboutTab('who-is-who');
    } else if (rawHash === 'about-partners' || rawHash === 'about/partners') {
      switchView('about');
      switchAboutTab('partners');
    } else if (rawHash === 'conversations' || rawHash === 'the-conversation' || rawHash === 'conversation') {
      switchView('conversations');
    } else if (document.getElementById(`view-${rawHash}`)) {
      switchView(rawHash);
    }
  }

  window.addEventListener('hashchange', handleRouteHash);
  window.addEventListener('popstate', handleRouteHash);
  if (window.location.hash) handleRouteHash();
}

const VIEW_TITLES = {
  home: '2-Minute Sermon | Short, Scripture-Rooted Messages Worldwide',
  sermons: 'All Sermons | 2-Minute Sermon',
  seasons: 'Liturgical Seasons Hub | 2-Minute Sermon',
  topics: 'Topics & Pastoral Themes | 2-Minute Sermon',
  preachers: 'Preachers Directory | 2-Minute Sermon',
  conversations: 'The Conversation | 2-Minute Sermon',
  'daily-verse': "Today's Verse | 2-Minute Sermon",
  prayers: 'Prayer Requests & Community Wall | 2-Minute Sermon',
  events: 'Upcoming Ministry Events | 2-Minute Sermon',
  about: 'About Our Ministry | 2-Minute Sermon',
  contact: 'Contact & Minister Submissions | 2-Minute Sermon'
};

export function switchView(viewId) {
  const prevView = activeView;
  activeView = viewId;
  document.body.setAttribute('data-active-view', viewId);
  const newsletterSec = document.querySelector('.newsletter-section');
  if (newsletterSec) {
    newsletterSec.style.display = (viewId === 'daily-verse' || viewId === 'contact') ? 'none' : '';
  }
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active');

    // If switching across different views, jump instantly to top so old scroll position isn't retained.
    // If staying on the same view (e.g. clicking Home while already on Home), smooth scroll.
    if (prevView && prevView !== viewId) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Always guarantee hero elements are 100% visible and correctly positioned when home is shown
    if (viewId === 'home') {
      if (typeof window.refreshHeroParticlesCanvas === 'function') {
        window.refreshHeroParticlesCanvas();
      }
      const heroContainer = target.querySelector('.hero-container');
      if (heroContainer) {
        heroContainer.style.opacity = '1';
        heroContainer.style.transform = 'translate3d(0, 0, 0)';
      }
    }

    if (VIEW_TITLES[viewId]) {
      document.title = VIEW_TITLES[viewId];
    }

    // Re-trigger scroll-reveal for elements inside newly-visible view
    setTimeout(() => {
      target.querySelectorAll('.reveal-on-scroll, .stagger-children').forEach(el => {
        el.classList.add('revealed');
      });
    }, 60);
  }

  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
  });
}
window.switchView = switchView;

// ─── DROPDOWNS ─────────────────────────────────────────────────────────────
function setupExploreDropdown() {
  document.querySelectorAll('.dropdown-wrapper').forEach(wrapper => {
    const btn = wrapper.querySelector('.dropdown-toggle');
    if (!btn) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        wrapper.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown-wrapper')) closeAllDropdowns();
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-wrapper').forEach(w => {
    w.classList.remove('open');
    w.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
  });
}
function closeDropdown() {
  closeAllDropdowns();
}

// ─── MOBILE DRAWER ────────────────────────────────────────────────────────────
function setupMobileDrawer() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    toggleBtn.classList.toggle('open', isOpen);
  });
}

function closeMobileDrawer() {
  document.getElementById('mobileDrawer')?.classList.remove('open');
  document.getElementById('mobileToggleBtn')?.classList.remove('open');
}

// ─── HERO & PROMO VIDEO ───────────────────────────────────────────────────────
const PROMO_VIDEO_ID = 'SJFqqNvTeh8';

function setupHeroCtas() {
  document.getElementById('heroPrimaryCta')?.addEventListener('click', (e) => {
    e.preventDefault();
    const latest = sermons()[0];
    if (latest) {
      openSermonModal(latest.id);
    } else {
      switchView('sermons');
    }
  });

  document.getElementById('heroSecondaryCta')?.addEventListener('click', (e) => {
    e.preventDefault();
    const dvSection = document.querySelector('.section-daily-verse-widget');
    if (dvSection) {
      dvSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      switchView('daily-verse');
    }
  });

  // Re-render when sermons, events, verses, or preachers are updated in localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === '2ms_sermons') {
      renderHomeSermons();
      filterAndRenderSermons();
    }
    if (e.key === '2ms_events') {
      renderEventsGrid();
    }
    if (e.key === '2ms_preachers') {
      renderPreachersHub();
      populateDropdownFilterOptions();
    }
    if (e.key === '2ms_verses') {
      setupDailyVerse();
    }
  });
}

// --- FOOTER FLOWING WATER CANVAS - Natural Deep Ocean Simulation ---
function setupFooterWater() {
  const footer = document.querySelector('.app-footer');
  if (!footer) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'footer-water-canvas';
  footer.insertBefore(canvas, footer.firstChild);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W = 0, H = 0;
  let t = 0, rafId = null, isVisible = true;

  function resize() {
    W = canvas.width  = footer.offsetWidth;
    H = canvas.height = footer.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // 5 natural rolling river swells: deep roasted espresso, rich mahogany, sacred sermon crimson, and molten amber
  const WAVES = [
    { yRatio: 0.20, amp: 0.038, freq: 0.85, spd: 0.18, ph: 0.0, ph2: 1.4, c0: 'rgba(28, 14, 10, 0.94)', c1: 'rgba(12, 6, 4, 0.98)' },
    { yRatio: 0.38, amp: 0.052, freq: 0.70, spd: 0.14, ph: 2.1, ph2: 0.8, c0: 'rgba(48, 20, 13, 0.92)', c1: 'rgba(18, 8, 5, 0.96)' },
    { yRatio: 0.55, amp: 0.066, freq: 0.55, spd: 0.10, ph: 4.0, ph2: 2.7, c0: 'rgba(76, 26, 16, 0.90)', c1: 'rgba(28, 11, 7, 0.95)' },
    { yRatio: 0.72, amp: 0.080, freq: 0.42, spd: 0.07, ph: 1.7, ph2: 3.9, c0: 'rgba(105, 36, 18, 0.88)', c1: 'rgba(38, 14, 8, 0.96)' },
    { yRatio: 0.87, amp: 0.092, freq: 0.34, spd: 0.05, ph: 3.2, ph2: 1.8, c0: 'rgba(138, 46, 20, 0.90)', c1: 'rgba(52, 18, 10, 0.98)' }
  ];

  // Specular caustic shimmers: radiant golden embers and candlelight glimmers drifting on the waves
  const SHIMMERS = Array.from({ length: 48 }, (_, i) => ({
    xRatio: Math.random(),
    waveIdx: i % WAVES.length,
    yOffset: (Math.random() - 0.25) * 14,
    len: 26 + Math.random() * 46,
    height: 1.5 + Math.random() * 2.0,
    speed: 0.00035 + Math.random() * 0.00065,
    pulseSpeed: 1.2 + Math.random() * 1.8,
    phase: Math.random() * Math.PI * 2,
    baseAlpha: 0.06 + Math.random() * 0.10
  }));

  function surfaceY(x, w) {
    const nx = x / (W || 1);
    const wave1 = Math.sin(nx * Math.PI * 2 * w.freq + t * w.spd + w.ph);
    const wave2 = Math.sin(nx * Math.PI * 4 * w.freq + t * w.spd * 0.7 + w.ph2) * 0.36;
    const wave3 = Math.cos(nx * Math.PI * 1.6 * w.freq - t * w.spd * 0.38) * 0.20;
    const raw = (wave1 + wave2 + wave3) / 1.56;
    return H * w.yRatio + raw * H * w.amp;
  }

  function drawWaveBody(w) {
    const SEG = Math.max(4, Math.ceil(W / 200));
    ctx.beginPath();
    ctx.moveTo(-2, H + 2);
    ctx.lineTo(-2, surfaceY(0, w));
    for (let x = 0; x <= W + SEG; x += SEG) {
      const nextX = Math.min(W + SEG, x + SEG);
      const cpX = (x + nextX) / 2;
      ctx.quadraticCurveTo(cpX, surfaceY(cpX, w), nextX, surfaceY(nextX, w));
    }
    ctx.lineTo(W + 2, H + 2);
    ctx.closePath();

    const crestY = H * (w.yRatio - w.amp);
    const grad = ctx.createLinearGradient(0, crestY, 0, H);
    grad.addColorStop(0, w.c0);
    grad.addColorStop(0.3, w.c0);
    grad.addColorStop(1, w.c1);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function drawShimmers() {
    SHIMMERS.forEach(s => {
      s.xRatio = (s.xRatio + s.speed) % 1.0;
      const x = s.xRatio * W;
      const wave = WAVES[s.waveIdx];
      const y = surfaceY(x, wave) + s.yOffset;

      const pulse = Math.sin(t * s.pulseSpeed + s.phase);
      if (pulse <= 0) return;

      const alpha = s.baseAlpha * pulse * pulse;
      if (alpha < 0.01) return;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y, s.len * 0.5, s.height, 0, 0, Math.PI * 2);
      const glint = ctx.createRadialGradient(x, y, 0, x, y, s.len * 0.5);
      glint.addColorStop(0,    `rgba(253, 224, 71, ${(alpha * 0.90).toFixed(3)})`);
      glint.addColorStop(0.45, `rgba(245, 158, 11, ${(alpha * 0.45).toFixed(3)})`);
      glint.addColorStop(1,    'rgba(180, 83, 9, 0)');
      ctx.fillStyle = glint;
      ctx.fill();
      ctx.restore();
    });
  }

  function drawFrame() {
    if (!isVisible) return;
    t += 0.0055;
    ctx.clearRect(0, 0, W, H);

    // Deep nocturnal espresso & sacred obsidian river base
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#080504');
    bg.addColorStop(0.5, '#0f0a07');
    bg.addColorStop(1,   '#180e09');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Diffuse ambient golden sunset glow
    const moonX = W * 0.5;
    const moon = ctx.createRadialGradient(moonX, H * 0.05, 0, moonX, H * 0.45, W * 0.48);
    const mA = (0.065 + Math.sin(t * 0.22) * 0.014).toFixed(3);
    moon.addColorStop(0,    `rgba(245, 158, 11, ${mA})`);
    moon.addColorStop(0.55, 'rgba(198, 40, 40, 0.020)');
    moon.addColorStop(1,    'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moon;
    ctx.fillRect(0, 0, W, H);

    // Draw waves: back to front
    WAVES.forEach(w => drawWaveBody(w));

    // Draw radiant golden caustics & embers riding the waves
    drawShimmers();

    // Soft warm golden sunset sheen band down the center
    const sheen = ctx.createLinearGradient(moonX - W * 0.25, 0, moonX + W * 0.25, 0);
    const sA = (0.040 + Math.sin(t * 0.35) * 0.014).toFixed(3);
    sheen.addColorStop(0,   'rgba(245, 158, 11, 0)');
    sheen.addColorStop(0.5, `rgba(245, 158, 11, ${sA})`);
    sheen.addColorStop(1,   'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sheen;
    const topWaveY = surfaceY(W * 0.5, WAVES[0]);
    ctx.fillRect(moonX - W * 0.25, 0, W * 0.5, topWaveY);

    rafId = requestAnimationFrame(drawFrame);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      isVisible = e.isIntersecting;
      if (isVisible && !rafId) rafId = requestAnimationFrame(drawFrame);
      else if (!isVisible && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });
  }, { threshold: 0.01 });
  obs.observe(footer);
  rafId = requestAnimationFrame(drawFrame);
}



// ─── HERO AMBIENT EFFECTS (Static image + golden lantern particles) ──────────
function setupHeroAmbientEffects() {
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;

  // ─── AMBIENT GOLDEN LIGHT PARTICLES ────────────────────────
  setupHeroParticles(heroSection, null);

  // ─── SMOOTH SCROLL PARALLAX (text container only, no video) ─
  setupHeroParallax(heroSection, null);
}

// ─── GOLDEN SUN-MOTE & LANTERN CANVAS PARTICLES ──────────────────────────────
function setupHeroParticles(heroSection, sectionObserver) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles-canvas';
  heroSection.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = heroSection.offsetWidth || window.innerWidth);
  let height = (canvas.height = heroSection.offsetHeight || 600);

  // Refined count and sizes: exactly 18 particles, 1.5px-2.7px size
  const PARTICLE_COUNT = 18;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * (width || window.innerWidth),
    y: Math.random() * (height || 600),
    radius: Math.random() * 1.2 + 1.5, // 1.5px - 2.7px
    baseAlpha: Math.random() * 0.28 + 0.16, // soft, calm transparency
    alphaSpeed: Math.random() * 0.012 + 0.006,
    alphaOffset: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.45) * 0.20,
    vy: -(Math.random() * 0.25 + 0.12), // gentle calm upward drift
    wobbleSpeed: Math.random() * 0.012 + 0.004,
    wobbleAmp: Math.random() * 0.8 + 0.3,
    color: Math.random() > 0.4 ? '251, 191, 36' : '245, 158, 11' // Amber & Gold
  }));

  const updateSize = () => {
    const w = heroSection.offsetWidth || window.innerWidth;
    const h = heroSection.offsetHeight || 600;
    if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h || width === 0)) {
      width = canvas.width = w;
      height = canvas.height = h;
      particles.forEach(p => {
        if (p.x <= 0 || p.x > width) p.x = Math.random() * width;
        if (p.y <= 0 || p.y > height) p.y = Math.random() * height;
      });
    }
  };

  window.addEventListener('resize', updateSize, { passive: true });
  window.refreshHeroParticlesCanvas = updateSize;

  let animFrameId = null;
  let isRunning = true;
  let time = 0;

  function render() {
    if (!isRunning) return;
    if (width <= 0 || height <= 0 || canvas.width === 0) {
      updateSize();
    }
    time += 0.016;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      p.y += p.vy;
      p.x += p.vx + Math.sin(time * p.wobbleSpeed + p.alphaOffset) * 0.20;

      // Wrap around edges seamlessly
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const currentAlpha = p.baseAlpha + Math.sin(time * p.alphaSpeed * 60 + p.alphaOffset) * 0.15;
      const safeAlpha = Math.max(0.08, Math.min(0.55, currentAlpha));

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 1.8);
      gradient.addColorStop(0, `rgba(${p.color}, ${safeAlpha})`);
      gradient.addColorStop(0.5, `rgba(${p.color}, ${safeAlpha * 0.45})`);
      gradient.addColorStop(1, `rgba(${p.color}, 0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    animFrameId = requestAnimationFrame(render);
  }

  // Auto-pause particle loop when hero is off-screen for 100% smooth browsing
  const particleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!isRunning) {
          isRunning = true;
          updateSize();
          animFrameId = requestAnimationFrame(render);
        }
      } else {
        isRunning = false;
        if (animFrameId) cancelAnimationFrame(animFrameId);
      }
    });
  }, { threshold: 0.05 });
  particleObserver.observe(heroSection);

  animFrameId = requestAnimationFrame(render);
}

// ─── SMOOTH HERO SCROLL PARALLAX ─────────────────────────────────────────────
function setupHeroParallax(heroSection, video) {
  const container = heroSection.querySelector('.hero-container');
  if (video) video.style.willChange = 'transform';
  if (container) container.style.willChange = 'transform, opacity';
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Only run parallax calculations when home view is actively visible
        if (activeView !== 'home') {
          ticking = false;
          return;
        }

        const scrollY = window.scrollY;
        const heroHeight = heroSection.offsetHeight;
        if (!heroHeight) {
          ticking = false;
          return;
        }

        if (scrollY <= 10) {
          // At or near top of home: guarantee 100% full opacity and origin transform
          if (container) {
            container.style.transform = 'translate3d(0, 0, 0)';
            container.style.opacity = '1';
          }
          if (video) {
            video.style.transform = 'translate3d(-50%, -50%, 0)';
          }
        } else if (scrollY <= heroHeight + 50) {
          // Subtle downward parallax on video background (0.28x speed)
          if (video) {
            const videoOffset = (scrollY * 0.28).toFixed(1);
            video.style.transform = `translate3d(-50%, calc(-50% + ${videoOffset}px), 0)`;
          }

          // Gentle fade and upward shift for hero text container
          if (container) {
            const textOffset = (scrollY * 0.14).toFixed(1);
            const opacity = Math.max(0, 1 - (scrollY / (heroHeight * 0.78)));
            container.style.transform = `translate3d(0, ${textOffset}px, 0)`;
            container.style.opacity = opacity.toFixed(2);
          }
        } else {
          if (container) {
            container.style.opacity = '0';
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ─── V2: PERSISTENT FLOATING MINI-PLAYER ("Listen While You Browse") ──────────
let currentMiniSermon = null;
let miniPlayerAudio = null;
let miniPlayerTimer = null;
let isAudioPlaying = false;
let currentPlayheadSec = 0;
let sermonTotalDuration = 120; // dynamically set per sermon

let ambientAudioCtx = null;
let ambientGain = null;
let ambientOscillators = [];

// Real YouTube Audio Bridge state
let ytAudioPlayer = null;
let isYtAudioApiReady = false;
let isYtPlayerReady = false;
let currentYtVideoId = null;
let ytProgressInterval = null;

function loadYouTubeIframeApi() {
  if (window.YT && window.YT.Player) {
    isYtAudioApiReady = true;
    return Promise.resolve(window.YT);
  }
  return new Promise((resolve) => {
    let existingTag = document.getElementById('yt-iframe-api-script');
    if (!existingTag) {
      existingTag = document.createElement('script');
      existingTag.id = 'yt-iframe-api-script';
      existingTag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(existingTag);
    }
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === 'function') prevReady();
      isYtAudioApiReady = true;
      resolve(window.YT);
    };
    if (window.YT && window.YT.Player) {
      isYtAudioApiReady = true;
      resolve(window.YT);
    }
  });
}

function handleYtPlayerStateChange(event) {
  const YT = window.YT;
  if (!YT) return;

  const player = document.getElementById('persistentMiniPlayer');
  const playBtn = document.getElementById('miniPlayerPlayBtn');
  const badgeText = document.getElementById('miniPlayerBadgeText');

  if (event.data === YT.PlayerState.PLAYING) {
    isAudioPlaying = true;
    player?.classList.add('is-playing');
    if (badgeText) badgeText.textContent = '🎧 AUDIO FROM YOUTUBE';

    if (playBtn) {
      playBtn.querySelector('.mini-icon-play').style.display = 'none';
      playBtn.querySelector('.mini-icon-pause').style.display = 'block';
    }

    try {
      const dur = ytAudioPlayer?.getDuration();
      if (dur && dur > 0 && dur < 7200) {
        sermonTotalDuration = Math.round(dur);
        const totalTimeEl = document.getElementById('miniPlayerTotalTime');
        if (totalTimeEl) totalTimeEl.textContent = formatMinSec(sermonTotalDuration);
        const durTag = document.getElementById('miniPlayerDuration');
        if (durTag) durTag.textContent = formatMinSec(sermonTotalDuration);
      }
    } catch (_) {}

    startYtProgressLoop();
  } else if (event.data === YT.PlayerState.PAUSED) {
    isAudioPlaying = false;
    player?.classList.remove('is-playing');
    if (playBtn) {
      playBtn.querySelector('.mini-icon-play').style.display = 'block';
      playBtn.querySelector('.mini-icon-pause').style.display = 'none';
    }
    stopYtProgressLoop();
  } else if (event.data === YT.PlayerState.ENDED) {
    isAudioPlaying = false;
    player?.classList.remove('is-playing');
    if (playBtn) {
      playBtn.querySelector('.mini-icon-play').style.display = 'block';
      playBtn.querySelector('.mini-icon-pause').style.display = 'none';
    }
    currentPlayheadSec = 0;
    updateMiniPlayerUI();
    stopYtProgressLoop();
  }
}

function startYtProgressLoop() {
  stopYtProgressLoop();
  ytProgressInterval = setInterval(() => {
    if (ytAudioPlayer && isAudioPlaying) {
      try {
        const cur = ytAudioPlayer.getCurrentTime();
        if (typeof cur === 'number' && !isNaN(cur)) {
          currentPlayheadSec = Math.round(cur);
          updateMiniPlayerUI();
        }
      } catch (_) {}
    }
  }, 350);
}

function stopYtProgressLoop() {
  if (ytProgressInterval) {
    clearInterval(ytProgressInterval);
    ytProgressInterval = null;
  }
}

function playYouTubeAudioBridge(videoId, startSec = 0) {
  currentYtVideoId = videoId;
  stopDevotionalAmbiance();

  loadYouTubeIframeApi().then((YT) => {
    if (!ytAudioPlayer) {
      ytAudioPlayer = new YT.Player('miniPlayerYtIframe', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start: startSec,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            isYtPlayerReady = true;
            try {
              event.target.playVideo();
            } catch (_) {}
          },
          onStateChange: handleYtPlayerStateChange,
          onError: (err) => {
            console.warn('[YouTube Audio Bridge] Player error, falling back to soothing ambiance:', err);
            startDevotionalAmbiance();
          }
        }
      });
    } else {
      try {
        ytAudioPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: startSec
        });
        ytAudioPlayer.playVideo();
      } catch (e) {
        console.warn('[YouTube Audio Bridge] Could not load video:', e);
      }
    }
  });
}

function startDevotionalAmbiance() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ambientAudioCtx) ambientAudioCtx = new AudioCtx();
    if (ambientAudioCtx.state === 'suspended') ambientAudioCtx.resume();

    stopDevotionalAmbiance();

    ambientGain = ambientAudioCtx.createGain();
    ambientGain.gain.setValueAtTime(0.001, ambientAudioCtx.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(0.06, ambientAudioCtx.currentTime + 1.2);

    const filter = ambientAudioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ambientAudioCtx.currentTime);

    // Warm sacred ambient frequencies (D major meditative chords)
    const freqs = [146.83, 220.00, 293.66];
    ambientOscillators = freqs.map(f => {
      const osc = ambientAudioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ambientAudioCtx.currentTime);
      osc.connect(filter);
      osc.start();
      return osc;
    });

    filter.connect(ambientGain);
    ambientGain.connect(ambientAudioCtx.destination);
  } catch (_) {}
}

function stopDevotionalAmbiance() {
  if (ambientGain && ambientAudioCtx) {
    try {
      ambientGain.gain.exponentialRampToValueAtTime(0.0001, ambientAudioCtx.currentTime + 0.4);
      setTimeout(() => {
        ambientOscillators.forEach(o => { try { o.stop(); o.disconnect(); } catch (_) {} });
        ambientOscillators = [];
      }, 400);
    } catch (_) {
      ambientOscillators.forEach(o => { try { o.stop(); o.disconnect(); } catch (_) {} });
      ambientOscillators = [];
    }
  }
}

export function setupPersistentMiniPlayer() {
  const player = document.getElementById('persistentMiniPlayer');
  if (!player) return;

  // Warm up the YouTube IFrame API ahead of time
  loadYouTubeIframeApi().catch(() => {});

  miniPlayerAudio = document.getElementById('miniPlayerAudio');
  const playBtn   = document.getElementById('miniPlayerPlayBtn');
  const rewindBtn = document.getElementById('miniPlayerRewindBtn');
  const fwdBtn    = document.getElementById('miniPlayerForwardBtn');
  const expandBtn = document.getElementById('miniPlayerExpandBtn');
  const closeBtn  = document.getElementById('miniPlayerCloseBtn');
  const trackBar  = document.getElementById('miniPlayerTrack');

  // Play / Pause toggle
  playBtn?.addEventListener('click', toggleMiniPlayerPlayback);

  // Rewind 15s
  rewindBtn?.addEventListener('click', () => {
    seekMiniPlayer(Math.max(0, currentPlayheadSec - 15));
  });

  // Forward 15s
  fwdBtn?.addEventListener('click', () => {
    seekMiniPlayer(Math.min(sermonTotalDuration, currentPlayheadSec + 15));
  });

  // Expand into Full Sermon Details Modal
  expandBtn?.addEventListener('click', () => {
    if (currentMiniSermon) {
      openSermonModal(currentMiniSermon.id);
    }
  });

  // Close Player
  closeBtn?.addEventListener('click', () => {
    stopMiniPlayer();
    player.hidden = true;
    player.classList.remove('is-visible', 'is-playing');
  });

  // Click on Scrubber Track
  trackBar?.addEventListener('click', (e) => {
    const rect = trackBar.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekMiniPlayer(Math.round(clickRatio * sermonTotalDuration));
  });
}

function formatMinSec(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function playSermonInMiniPlayer(sermonId) {
  const s = sermons().find(x => x.id === sermonId);
  if (!s) return;

  // If already playing this sermon, just toggle
  if (currentMiniSermon && currentMiniSermon.id === s.id && isAudioPlaying) {
    pauseMiniPlayerPlayback();
    return;
  }

  currentMiniSermon = s;
  sermonTotalDuration = s.durationSec || 120;

  const player = document.getElementById('persistentMiniPlayer');
  if (!player) return;

  // Populate metadata
  const thumb = document.getElementById('miniPlayerThumb');
  if (thumb) {
    thumb.src = s.thumbnailUrl || '/assets/logo.png';
    thumb.onerror = () => { thumb.src = '/assets/logo.png'; };
  }
  const title = document.getElementById('miniPlayerTitle');
  if (title) title.textContent = s.title;

  const preacher = document.getElementById('miniPlayerPreacher');
  if (preacher) preacher.textContent = `${s.preacherName} • ${s.scripture}`;

  const badgeText = document.getElementById('miniPlayerBadgeText');
  if (badgeText) {
    badgeText.textContent = `🎧 AUDIO FROM YOUTUBE`;
  }

  const durTag = document.getElementById('miniPlayerDuration');
  if (durTag) durTag.textContent = s.duration || '2:00';

  const totalTime = document.getElementById('miniPlayerTotalTime');
  if (totalTime) totalTime.textContent = s.duration || '2:00';

  // Reset playhead
  currentPlayheadSec = 0;
  updateMiniPlayerUI();

  // Show player with smooth entrance
  player.hidden = false;
  requestAnimationFrame(() => {
    player.classList.add('is-visible');
  });

  startMiniPlayerPlayback();
  showToast(`🎧 Audio from YouTube: ${s.title}`);
}
window.playSermonInMiniPlayer = playSermonInMiniPlayer;

export function playConversationInMiniPlayer(convId) {
  const c = conversations().find(x => String(x.id) === String(convId));
  if (!c) return;

  const virtualSermon = {
    id: `conv-${c.id}`,
    title: c.title,
    preacherName: c.panelists || 'The Conversation',
    scripture: c.scriptures || c.category || 'Panel Discussion',
    duration: c.duration || '25:00',
    durationSec: c.durationSec || 1500,
    thumbnailUrl: c.thumbnailUrl,
    youtubeEmbedId: c.youtubeEmbedId
  };

  if (currentMiniSermon && currentMiniSermon.id === virtualSermon.id && isAudioPlaying) {
    pauseMiniPlayerPlayback();
    return;
  }

  currentMiniSermon = virtualSermon;
  sermonTotalDuration = virtualSermon.durationSec;

  const player = document.getElementById('persistentMiniPlayer');
  if (!player) return;

  const thumb = document.getElementById('miniPlayerThumb');
  if (thumb) {
    thumb.src = virtualSermon.thumbnailUrl || '/assets/logo.png';
    thumb.onerror = () => { thumb.src = '/assets/logo.png'; };
  }
  const title = document.getElementById('miniPlayerTitle');
  if (title) title.textContent = virtualSermon.title;

  const preacher = document.getElementById('miniPlayerPreacher');
  if (preacher) preacher.textContent = `${virtualSermon.preacherName} • ${virtualSermon.scripture}`;

  const badgeText = document.getElementById('miniPlayerBadgeText');
  if (badgeText) {
    badgeText.textContent = `🎙️ THE CONVERSATION AUDIO`;
  }

  const durTag = document.getElementById('miniPlayerDuration');
  if (durTag) durTag.textContent = virtualSermon.duration;

  const totalTime = document.getElementById('miniPlayerTotalTime');
  if (totalTime) totalTime.textContent = virtualSermon.duration;

  currentPlayheadSec = 0;
  updateMiniPlayerUI();

  player.hidden = false;
  requestAnimationFrame(() => {
    player.classList.add('is-visible');
  });

  startMiniPlayerPlayback();
  showToast(`🎧 Audio: ${virtualSermon.title}`);
}
window.playConversationInMiniPlayer = playConversationInMiniPlayer;

function startMiniPlayerPlayback() {
  isAudioPlaying = true;
  const player = document.getElementById('persistentMiniPlayer');
  player?.classList.add('is-playing');

  const playBtn = document.getElementById('miniPlayerPlayBtn');
  if (playBtn) {
    playBtn.querySelector('.mini-icon-play').style.display = 'none';
    playBtn.querySelector('.mini-icon-pause').style.display = 'block';
  }

  // If we have a sermon with youtubeEmbedId, route audio through YouTube bridge
  const videoId = currentMiniSermon?.youtubeEmbedId;
  if (videoId) {
    if (ytAudioPlayer && currentYtVideoId === videoId) {
      try {
        ytAudioPlayer.playVideo();
      } catch (_) {
        playYouTubeAudioBridge(videoId, currentPlayheadSec);
      }
    } else {
      playYouTubeAudioBridge(videoId, currentPlayheadSec);
    }
  } else if (miniPlayerAudio && currentMiniSermon?.audioUrl) {
    miniPlayerAudio.src = currentMiniSermon.audioUrl;
    miniPlayerAudio.play().catch(() => {});
  } else {
    startDevotionalAmbiance();
  }

  // Backup fallback timer in case YouTube progress ticks are paused
  clearInterval(miniPlayerTimer);
  miniPlayerTimer = setInterval(() => {
    if (isAudioPlaying && !ytAudioPlayer) {
      currentPlayheadSec += 1;
      if (currentPlayheadSec >= sermonTotalDuration) {
        currentPlayheadSec = sermonTotalDuration;
        pauseMiniPlayerPlayback();
      }
      updateMiniPlayerUI();
    }
  }, 1000);
}

function pauseMiniPlayerPlayback() {
  isAudioPlaying = false;
  const player = document.getElementById('persistentMiniPlayer');
  player?.classList.remove('is-playing');

  const playBtn = document.getElementById('miniPlayerPlayBtn');
  if (playBtn) {
    playBtn.querySelector('.mini-icon-play').style.display = 'block';
    playBtn.querySelector('.mini-icon-pause').style.display = 'none';
  }

  if (ytAudioPlayer) {
    try {
      ytAudioPlayer.pauseVideo();
    } catch (_) {}
  }
  stopYtProgressLoop();

  if (miniPlayerAudio && !miniPlayerAudio.paused) {
    miniPlayerAudio.pause();
  }
  stopDevotionalAmbiance();
}

function toggleMiniPlayerPlayback() {
  if (isAudioPlaying) {
    pauseMiniPlayerPlayback();
  } else {
    if (currentPlayheadSec >= sermonTotalDuration) {
      currentPlayheadSec = 0;
    }
    startMiniPlayerPlayback();
  }
}

function seekMiniPlayer(targetSec) {
  currentPlayheadSec = Math.max(0, Math.min(sermonTotalDuration, targetSec));
  if (ytAudioPlayer) {
    try {
      ytAudioPlayer.seekTo(currentPlayheadSec, true);
    } catch (_) {}
  }
  if (miniPlayerAudio && miniPlayerAudio.duration) {
    miniPlayerAudio.currentTime = (currentPlayheadSec / sermonTotalDuration) * miniPlayerAudio.duration;
  }
  updateMiniPlayerUI();
}

function stopMiniPlayer() {
  pauseMiniPlayerPlayback();
  if (ytAudioPlayer) {
    try {
      ytAudioPlayer.stopVideo();
    } catch (_) {}
  }
  stopYtProgressLoop();
  clearInterval(miniPlayerTimer);
  currentPlayheadSec = 0;
  currentMiniSermon = null;
}

function updateMiniPlayerUI() {
  const curTimeEl = document.getElementById('miniPlayerCurrentTime');
  if (curTimeEl) curTimeEl.textContent = formatMinSec(currentPlayheadSec);

  const progEl = document.getElementById('miniPlayerProgress');
  if (progEl) {
    const pct = ((currentPlayheadSec / sermonTotalDuration) * 100).toFixed(1);
    progEl.style.width = `${pct}%`;
  }
}

// ─── V2: SCRIPTURE CARD GENERATOR ("Share as Image") ──────────────────────────
let activeCardVerse = null;
let userSelectedCardTheme = false;

function getDefaultSeasonalTheme() {
  return 'mountain_dawn';
}

let activeCardTheme = getDefaultSeasonalTheme();
let activeCardRatio = 'story'; // 'story' (9:16) or 'square' (1:1)
let activeCardFont  = 'inter'; // locked to Inter modern sans-serif

// Fixed font for scripture cards — clean, bold, highly legible Inter
const SCRIPTURE_FONTS = {
  inter: { family: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', style: 'normal', weight: '700' },
  lora:  { family: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', style: 'normal', weight: '700' }
};

export function setupScriptureCardGenerator() {
  const modal = document.getElementById('scriptureCardModal');
  if (!modal) return;

  // Aspect ratio switchers
  modal.querySelectorAll('.ratio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCardRatio = btn.getAttribute('data-ratio') || 'story';
      if (activeCardVerse) renderScriptureCardToCanvas(activeCardVerse, activeCardTheme, activeCardRatio, activeCardFont);
    });
  });

  // Theme switchers
  modal.querySelectorAll('.theme-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      userSelectedCardTheme = true;
      modal.querySelectorAll('.theme-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCardTheme = btn.getAttribute('data-theme') || 'mountain_dawn';
      if (activeCardVerse) renderScriptureCardToCanvas(activeCardVerse, activeCardTheme, activeCardRatio, activeCardFont);
    });
  });



  // ─── Rock-Solid Cross-Browser Download Engine ────────────────────────────────
  function triggerDirectDownload(url, filename, isBlob = false) {
    const a = document.createElement('a');
    a.style.position = 'fixed';
    a.style.left = '-9999px';
    a.style.opacity = '0';
    a.href = url;
    a.download = filename;
    // CRITICAL: NEVER set rel="noopener" on download anchors — Chrome cancels downloads!
    document.body.appendChild(a);

    // Dispatch synthetic mouse click (standard FileSaver.js approach)
    try {
      const clickEvt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      a.dispatchEvent(clickEvt);
    } catch (_) {
      a.click();
    }

    // Keep blob URL active for 2 full minutes so Chrome can finish streaming 3.5MB+ file without Network Error
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      if (isBlob) {
        setTimeout(() => {
          try { URL.revokeObjectURL(url); } catch (_) {}
        }, 120000);
      }
    }, 1000);
  }

  function downloadCanvasArtwork(canvas, filename) {
    if (!canvas) return;

    // Chrome honors the `download` attribute filename reliably with data: URLs.
    // Blob URLs can have filename stripped due to browser security policy — use as fallback.
    try {
      const dataUrl = canvas.toDataURL('image/png');
      if (dataUrl && dataUrl.length > 100) {
        triggerDirectDownload(dataUrl, filename, false);
        return;
      }
    } catch (err) {
      console.warn('toDataURL failed (canvas tainted?), trying blob:', err);
    }

    // Fallback: blob URL (may lose filename in Chrome but at least delivers the file)
    if (canvas.toBlob) {
      try {
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            const blobUrl = URL.createObjectURL(blob);
            triggerDirectDownload(blobUrl, filename, true);
          } else {
            showToast('⚠️ Could not export image. Please try again.');
          }
        }, 'image/png');
        return;
      } catch (err) {
        console.warn('toBlob also failed:', err);
      }
    }

    showToast('⚠️ Download not supported in this browser.');
  }

  function downloadDataUrlFallback(canvas, filename) {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      triggerDirectDownload(dataUrl, filename, false);
    } catch (err) {
      console.error('DataURL download failed:', err);
      // Last-resort fallback for sandboxed iframes or restricted WebViews
      try {
        const win = window.open('');
        if (win) {
          win.document.write(`<img src="${canvas.toDataURL('image/png')}" style="max-width:100%;height:auto;display:block;margin:20px auto;" alt="Scripture Card" /><p style="font-family:sans-serif;text-align:center;color:#666;">Right-click or hold down to save image.</p>`);
          win.document.title = filename;
        }
      } catch (_) {}
    }
  }

  // Native Share (Mobile Instagram / WhatsApp / System Sheet — Full Package)
  document.getElementById('cardNativeShareBtn')?.addEventListener('click', async () => {
    const canvas = document.getElementById('scriptureExportCanvas');
    if (!canvas || !activeCardVerse) return;

    const btn = document.getElementById('cardNativeShareBtn');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="loading-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span> Preparing Full Package...`;
    }

    try {
      const safeBook = (activeCardVerse.book || 'Scripture').replace(/[^a-zA-Z0-9_-]/g, '-');
      const safeRef = `${safeBook}-${activeCardVerse.chapter || '1'}_${activeCardVerse.verse || 'verse'}`.replace(/[^a-zA-Z0-9_-]/g, '-');
      const filename = `2MS-Verse-${safeRef}-${activeCardRatio}.png`;
      const url = `${window.location.origin}/#daily-verse`;

      const shareTitle = `Daily Verse: ${activeCardVerse.book} ${activeCardVerse.chapter}:${activeCardVerse.verse}`;
      const shareText = `📖 Today's Verse — ${activeCardVerse.book} ${activeCardVerse.chapter}:${activeCardVerse.verse}\n\n"${activeCardVerse.verseText}"\n\n🕊️ Reflection: ${activeCardVerse.reflection || ''}\n\n2-Minute Sermon: ${url}`;

      let sharedNatively = false;

      // 1. Try Native OS File Share (iOS Safari, Android Chrome, mobile apps)
      if (navigator.canShare && canvas.toBlob) {
        try {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          if (blob && blob.size > 0) {
            const file = new File([blob], filename, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: shareTitle,
                text: shareText,
                files: [file]
              });
              sharedNatively = true;
              showToast('Verse card shared successfully!');
            }
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            return; // User cancelled native sheet
          }
          console.warn('Native file share failed, trying text share:', err);
        }
      }

      // 2. Try Native OS Text/Link Share if file share not accepted
      if (!sharedNatively && navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: url
          });
          sharedNatively = true;
          showToast('Verse shared successfully!');
        } catch (err) {
          if (err.name === 'AbortError') {
            return;
          }
          console.warn('Native text share rejected:', err);
        }
      }

      // 3. Desktop / Browser Fallback: Automatic download of high-res image AND copy full package to clipboard!
      if (!sharedNatively) {
        downloadCanvasArtwork(canvas, filename);
        try {
          await navigator.clipboard.writeText(shareText);
          showToast('📥 Image downloaded & full scripture package copied to clipboard! (Ready to paste anywhere)');
        } catch (_) {
          showToast('📥 Scripture card downloaded in high resolution!');
        }
      }
    } catch (err) {
      console.error('Share full package error:', err);
      showToast('⚠️ Could not complete share. Please try Download.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  });

  // Download High-Res PNG
  document.getElementById('cardDownloadBtn')?.addEventListener('click', async () => {
    const canvas = document.getElementById('scriptureExportCanvas');
    if (!canvas || !activeCardVerse) return;

    const btn = document.getElementById('cardDownloadBtn');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="loading-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span> Exporting PNG...`;
    }

    try {
      const safeBook = (activeCardVerse.book || 'Scripture').replace(/[^a-zA-Z0-9_-]/g, '-');
      const safeRef = `${safeBook}-${activeCardVerse.chapter || '1'}_${activeCardVerse.verse || 'verse'}`.replace(/[^a-zA-Z0-9_-]/g, '-');
      const filename = `2MS-Verse-${safeRef}-${activeCardRatio}.png`;

      downloadCanvasArtwork(canvas, filename);
      showToast('📥 Scripture card downloaded in high resolution!');
    } catch (err) {
      console.error('Download card error:', err);
      showToast('⚠️ Could not download card. Please try again.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  });

  // Copy Image to Clipboard
  document.getElementById('cardCopyBtn')?.addEventListener('click', async () => {
    const canvas = document.getElementById('scriptureExportCanvas');
    if (!canvas || !activeCardVerse) return;

    const btn = document.getElementById('cardCopyBtn');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="loading-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span> Copying...`;
    }

    try {
      let copiedImage = false;

      if (canvas.toBlob && navigator.clipboard && window.ClipboardItem) {
        try {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          if (blob && blob.size > 0) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            copiedImage = true;
            showToast('📋 High-res image copied to clipboard! Ready to paste (Ctrl+V / Cmd+V).');
          }
        } catch (clipErr) {
          console.warn('Direct clipboard image copy unsupported:', clipErr);
        }
      }

      if (!copiedImage) {
        const shareText = `"${activeCardVerse.verseText}" — ${activeCardVerse.book} ${activeCardVerse.chapter}:${activeCardVerse.verse}\n\n${window.location.origin}/#daily-verse`;
        await navigator.clipboard.writeText(shareText);
        showToast('📋 Verse text copied to clipboard! (Image copy unsupported in this browser)');
      }
    } catch (err) {
      console.error('Clipboard copy error:', err);
      showToast('⚠️ Could not copy image. Try Download instead!');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  });

  // Close Card Modal
  document.getElementById('closeCardModalBtn')?.addEventListener('click', closeScriptureCardModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeScriptureCardModal();
  });
  modal.addEventListener('wheel', e => {
    if (e.target === modal || modal.scrollHeight <= modal.clientHeight) {
      e.preventDefault();
    }
  }, { passive: false });
  modal.addEventListener('touchmove', e => {
    if (e.target === modal || modal.scrollHeight <= modal.clientHeight) {
      e.preventDefault();
    }
  }, { passive: false });
}

let scrollLockCount = 0;
let lockedScrollY = 0;

export function lockPageScroll() {
  scrollLockCount++;
  if (scrollLockCount === 1) {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
  }
}
window.lockPageScroll = lockPageScroll;

export function unlockPageScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    const restoreY = lockedScrollY;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    window.scrollTo(0, restoreY);
  }
}
window.unlockPageScroll = unlockPageScroll;

export function openScriptureCardModal(verse) {
  activeCardVerse = verse || getVerseForDate(getTodayDateStr());
  if (!activeCardVerse) return;

  const modal = document.getElementById('scriptureCardModal');
  if (!modal) return;

  // Auto-recommend current liturgical/natural season if user hasn't explicitly chosen one
  if (!userSelectedCardTheme) {
    activeCardTheme = getDefaultSeasonalTheme();
  }

  // Synchronize UI active state on theme pills
  modal.querySelectorAll('.theme-pill').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-theme') === activeCardTheme);
  });

  lockPageScroll();
  modal.hidden = false;
  renderScriptureCardToCanvas(activeCardVerse, activeCardTheme, activeCardRatio, activeCardFont);
}
window.openScriptureCardModal = openScriptureCardModal;
window.openScriptureCardForVerse = (verse) => openScriptureCardModal(verse);

export function closeScriptureCardModal() {
  const modal = document.getElementById('scriptureCardModal');
  if (modal && !modal.hidden) {
    modal.hidden = true;
    unlockPageScroll();
  }
}
window.closeScriptureCardModal = closeScriptureCardModal;

// ─── TEMPLATE-DRIVEN LAYOUT ENGINE FOR SCRIPTURE CARDS ────────────────────────
// 6 curated, lightweight natural presets (under 120KB each via CDN) paired with
// atmospheric lighting, high-contrast typography, and procedural fallbacks.
const SCRIPTURE_CARD_TEMPLATES = {
  mountain_dawn: {
    id: 'mountain_dawn',
    name: 'Mountain Dawn',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    fallbackGrad: ['#0c1322', '#1e293b', '#064e3b', '#f59e0b'],
    safeZone: {
      story:  { xPercent: 0.10, yPercent: 0.28, widthPercent: 0.80, heightPercent: 0.44 },
      square: { xPercent: 0.08, yPercent: 0.22, widthPercent: 0.84, heightPercent: 0.54 }
    },
    accentColor: '#fbbf24',
    badgeText: '• SCRIPTURE OF THE DAY •'
  },
  living_waters: {
    id: 'living_waters',
    name: 'Living Waters',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    fallbackGrad: ['#021827', '#082f49', '#0369a1', '#38bdf8'],
    safeZone: {
      story:  { xPercent: 0.10, yPercent: 0.28, widthPercent: 0.80, heightPercent: 0.44 },
      square: { xPercent: 0.08, yPercent: 0.22, widthPercent: 0.84, heightPercent: 0.54 }
    },
    accentColor: '#38bdf8',
    badgeText: '• SCRIPTURE OF THE DAY •'
  },
  golden_woods: {
    id: 'golden_woods',
    name: 'Golden Woods',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    fallbackGrad: ['#1c0f05', '#5c2b09', '#9a3412', '#f59e0b'],
    safeZone: {
      story:  { xPercent: 0.10, yPercent: 0.28, widthPercent: 0.80, heightPercent: 0.44 },
      square: { xPercent: 0.08, yPercent: 0.22, widthPercent: 0.84, heightPercent: 0.54 }
    },
    accentColor: '#f59e0b',
    badgeText: '• SCRIPTURE OF THE DAY •'
  },
  winter_twilight: {
    id: 'winter_twilight',
    name: 'Twilight',
    imageUrl: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80',
    fallbackGrad: ['#030712', '#0f172a', '#1e1b4b', '#93c5fd'],
    safeZone: {
      story:  { xPercent: 0.10, yPercent: 0.28, widthPercent: 0.80, heightPercent: 0.44 },
      square: { xPercent: 0.08, yPercent: 0.22, widthPercent: 0.84, heightPercent: 0.54 }
    },
    accentColor: '#93c5fd',
    badgeText: '• SCRIPTURE OF THE DAY •'
  },
  starry_solitude: {
    id: 'starry_solitude',
    name: 'Starry Night',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    fallbackGrad: ['#05070c', '#0a0e18', '#111827', '#080a10'],
    safeZone: {
      story:  { xPercent: 0.10, yPercent: 0.28, widthPercent: 0.80, heightPercent: 0.44 },
      square: { xPercent: 0.08, yPercent: 0.22, widthPercent: 0.84, heightPercent: 0.54 }
    },
    accentColor: '#fde68a',
    badgeText: '• SCRIPTURE OF THE DAY •'
  },
  parchment: {
    id: 'parchment',
    name: 'Parchment',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    fallbackGrad: ['#faf4e8', '#f5ebe0', '#eedecb'],
    safeZone: {
      story:  { xPercent: 0.12, yPercent: 0.28, widthPercent: 0.76, heightPercent: 0.44 },
      square: { xPercent: 0.10, yPercent: 0.22, widthPercent: 0.80, heightPercent: 0.54 }
    },
    accentColor: '#78350f',
    badgeText: '• SCRIPTURE OF THE DAY •'
  }
};

// Aliases for backwards compatibility with any legacy bookmarks/configs
SCRIPTURE_CARD_TEMPLATES.midnight = SCRIPTURE_CARD_TEMPLATES.starry_solitude;
SCRIPTURE_CARD_TEMPLATES.dawn     = SCRIPTURE_CARD_TEMPLATES.mountain_dawn;
SCRIPTURE_CARD_TEMPLATES.emerald  = SCRIPTURE_CARD_TEMPLATES.living_waters;

const cardImageCache = {};
let logoImgCache = null;

function getCachedCardImage(url) {
  if (!url) return Promise.resolve(null);
  if (cardImageCache[url] && cardImageCache[url].complete && cardImageCache[url].naturalWidth > 0) {
    return Promise.resolve(cardImageCache[url]);
  }
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), 3000);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      cardImageCache[url] = img;
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

function getCachedLogo() {
  if (logoImgCache && logoImgCache.complete && logoImgCache.naturalWidth > 0) {
    return Promise.resolve(logoImgCache);
  }
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), 2500);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      logoImgCache = img;
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = '/assets/logo.png';
  });
}

function drawProceduralBackground(ctx, themeId, width, height) {
  if (themeId === 'parchment') {
    // Sacred Parchment: Warm antique parchment paper texture
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#fefbf3');
    bgGrad.addColorStop(0.3, '#fbf3e4');
    bgGrad.addColorStop(0.7, '#f4e5cb');
    bgGrad.addColorStop(1, '#ebd7bc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle warm center illumination
    const centerGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.65);
    centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    centerGlow.addColorStop(1, 'rgba(235, 215, 188, 0.0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    // Antique double gold/amber border
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.28)';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = 'rgba(180, 83, 9, 0.16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(44, 44, width - 88, height - 88);

    // Corner decorative accents
    const cornerOffsets = [
      [36, 36], [width - 36, 36],
      [36, height - 36], [width - 36, height - 36]
    ];
    ctx.fillStyle = 'rgba(120, 53, 15, 0.35)';
    cornerOffsets.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (themeId === 'mountain_dawn' || themeId === 'dawn') {
    // Mountain Dawn: Alpine sunrise from deep indigo to emerald valley & golden dawn
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0c1322');
    bgGrad.addColorStop(0.32, '#1e293b');
    bgGrad.addColorStop(0.62, '#064e3b');
    bgGrad.addColorStop(0.85, '#b45309');
    bgGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Radiant dawn sunrise bloom
    const dawnSun = ctx.createRadialGradient(width * 0.5, height * 0.88, 30, width * 0.5, height * 0.88, width * 0.75);
    dawnSun.addColorStop(0, 'rgba(254, 240, 138, 0.38)');
    dawnSun.addColorStop(0.55, 'rgba(245, 158, 11, 0.18)');
    dawnSun.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = dawnSun;
    ctx.fillRect(0, 0, width, height);
  } else if (themeId === 'living_waters' || themeId === 'emerald') {
    // Living Waters: Deep tranquil oceanic sapphire to coastal twilight
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#021827');
    bgGrad.addColorStop(0.35, '#082f49');
    bgGrad.addColorStop(0.70, '#0369a1');
    bgGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Oceanic horizon light bloom
    const waterGlow = ctx.createRadialGradient(width * 0.5, height * 0.52, 40, width * 0.5, height * 0.52, width * 0.7);
    waterGlow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    waterGlow.addColorStop(0.65, 'rgba(14, 165, 233, 0.08)');
    waterGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = waterGlow;
    ctx.fillRect(0, 0, width, height);
  } else if (themeId === 'golden_woods') {
    // Golden Woods: Warm autumn cedar and golden sunbeams
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1c0f05');
    bgGrad.addColorStop(0.35, '#381a07');
    bgGrad.addColorStop(0.70, '#78350f');
    bgGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Golden sunbeam canopy bloom
    const sunbeamGlow = ctx.createRadialGradient(width * 0.5, height * 0.38, 40, width * 0.5, height * 0.38, width * 0.7);
    sunbeamGlow.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
    sunbeamGlow.addColorStop(0.65, 'rgba(217, 119, 6, 0.10)');
    sunbeamGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunbeamGlow;
    ctx.fillRect(0, 0, width, height);
  } else if (themeId === 'winter_twilight') {
    // Winter Twilight: Frosted alpine indigo with quiet starlight
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(0.35, '#0f172a');
    bgGrad.addColorStop(0.70, '#1e1b4b');
    bgGrad.addColorStop(1, '#172554');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ice blue twilight bloom
    const iceGlow = ctx.createRadialGradient(width * 0.5, height * 0.42, 40, width * 0.5, height * 0.42, width * 0.7);
    iceGlow.addColorStop(0, 'rgba(147, 197, 253, 0.22)');
    iceGlow.addColorStop(0.65, 'rgba(96, 165, 250, 0.08)');
    iceGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = iceGlow;
    ctx.fillRect(0, 0, width, height);

    // Subtle frost stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    const frostPoints = [
      [width * 0.2, height * 0.15, 1.4], [width * 0.8, height * 0.18, 1.6],
      [width * 0.15, height * 0.45, 1.2], [width * 0.85, height * 0.48, 1.4],
      [width * 0.3, height * 0.82, 1.5], [width * 0.7, height * 0.85, 1.3]
    ];
    frostPoints.forEach(([fx, fy, fr]) => {
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    // Starry Solitude / Midnight Sanctuary: Rich obsidian celestial night
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#05070c');
    bgGrad.addColorStop(0.4, '#0d111a');
    bgGrad.addColorStop(0.8, '#131826');
    bgGrad.addColorStop(1, '#07090e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Celestial golden warmth
    const celestialGlow = ctx.createRadialGradient(width * 0.5, height * 0.35, 40, width * 0.5, height * 0.35, width * 0.65);
    celestialGlow.addColorStop(0, 'rgba(245, 158, 11, 0.14)');
    celestialGlow.addColorStop(0.6, 'rgba(217, 119, 6, 0.04)');
    celestialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = celestialGlow;
    ctx.fillRect(0, 0, width, height);

    // Subtle starlight accents
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    const stars = [
      [width * 0.18, height * 0.12, 1.5], [width * 0.82, height * 0.16, 1.8],
      [width * 0.25, height * 0.22, 1.2], [width * 0.74, height * 0.28, 1.4],
      [width * 0.12, height * 0.32, 1.2], [width * 0.88, height * 0.38, 1.6],
      [width * 0.32, height * 0.78, 1.3], [width * 0.68, height * 0.82, 1.5],
      [width * 0.15, height * 0.85, 1.2], [width * 0.85, height * 0.88, 1.4]
    ];
    stars.forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

function wrapCanvasText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + ' ' + word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function fitTextInSafeZone(ctx, text, maxW, maxH, minFontSize = 20, maxFontSize = 56, fontId = 'inter') {
  const fd = SCRIPTURE_FONTS[fontId] || SCRIPTURE_FONTS.inter || { family: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', style: 'normal', weight: '700' };
  let fontSize = maxFontSize;
  let lines = [];
  let lineHeight = Math.round(fontSize * 1.45);
  let totalHeight = 0;

  while (fontSize >= minFontSize) {
    ctx.font = `${fd.style} ${fd.weight} ${fontSize}px ${fd.family}`;
    lineHeight = Math.round(fontSize * 1.45);
    lines = wrapCanvasText(ctx, text, maxW);
    totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxH) {
      break;
    }
    fontSize -= 2;
  }

  return { fontSize, lines, lineHeight, totalHeight };
}

function analyzeSafeZoneLuminance(ctx, x, y, w, h) {
  try {
    const imgData = ctx.getImageData(x, y, w, h);
    const d = imgData.data;
    let totalLum = 0;
    let samples = 0;
    for (let i = 0; i < d.length; i += 16 * 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      totalLum += 0.299 * r + 0.587 * g + 0.114 * b;
      samples++;
    }
    return samples > 0 ? (totalLum / samples) : 60;
  } catch (_) {
    return 60;
  }
}

async function renderScriptureCardToCanvas(verse, themeId = 'midnight', ratio = 'story', fontId = 'lora', forcePureCanvas = false) {
  const canvas = document.getElementById('scriptureExportCanvas');
  if (!canvas || !verse) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (_) {}
  }

  const isStory = ratio === 'story';
  const width  = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width  = width;
  canvas.height = height;

  const tpl = SCRIPTURE_CARD_TEMPLATES[themeId] || SCRIPTURE_CARD_TEMPLATES.midnight;

  // 1. Paint rich procedural master base first (guaranteed clean origin)
  drawProceduralBackground(ctx, themeId, width, height);

  // If photo is enabled and not forcePureCanvas, overlay it
  if (!forcePureCanvas && tpl.imageUrl) {
    try {
      const bgImg = await getCachedCardImage(tpl.imageUrl);
      if (bgImg) {
        const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
        const targetRatio = width / height;
        let renderW, renderH, offsetX, offsetY;

        if (imgRatio > targetRatio) {
          renderH = height;
          renderW = height * imgRatio;
          offsetX = (width - renderW) / 2;
          offsetY = 0;
        } else {
          renderW = width;
          renderH = width / imgRatio;
          offsetX = 0;
          offsetY = (height - renderH) / 2;
        }
        ctx.drawImage(bgImg, offsetX, offsetY, renderW, renderH);

        const imgTint = ctx.createLinearGradient(0, 0, 0, height);
        if (themeId === 'parchment') {
          imgTint.addColorStop(0, 'rgba(250, 244, 232, 0.78)');
          imgTint.addColorStop(1, 'rgba(238, 222, 203, 0.88)');
        } else if (themeId === 'golden_woods') {
          imgTint.addColorStop(0, 'rgba(28, 15, 5, 0.65)');
          imgTint.addColorStop(0.5, 'rgba(40, 20, 8, 0.45)');
          imgTint.addColorStop(1, 'rgba(28, 15, 5, 0.78)');
        } else if (themeId === 'living_waters' || themeId === 'emerald') {
          imgTint.addColorStop(0, 'rgba(2, 24, 39, 0.64)');
          imgTint.addColorStop(0.5, 'rgba(4, 35, 58, 0.42)');
          imgTint.addColorStop(1, 'rgba(2, 24, 39, 0.78)');
        } else if (themeId === 'winter_twilight') {
          imgTint.addColorStop(0, 'rgba(3, 7, 18, 0.68)');
          imgTint.addColorStop(0.5, 'rgba(8, 15, 35, 0.46)');
          imgTint.addColorStop(1, 'rgba(3, 7, 18, 0.80)');
        } else if (themeId === 'mountain_dawn' || themeId === 'dawn') {
          imgTint.addColorStop(0, 'rgba(12, 19, 34, 0.62)');
          imgTint.addColorStop(0.5, 'rgba(18, 32, 48, 0.42)');
          imgTint.addColorStop(1, 'rgba(12, 19, 34, 0.76)');
        } else {
          // starry_solitude / midnight
          imgTint.addColorStop(0, 'rgba(5, 7, 12, 0.72)');
          imgTint.addColorStop(0.5, 'rgba(10, 14, 22, 0.52)');
          imgTint.addColorStop(1, 'rgba(5, 7, 12, 0.82)');
        }
        ctx.fillStyle = imgTint;
        ctx.fillRect(0, 0, width, height);
      }
    } catch (imgErr) {
      console.warn('Background image draw skipped, procedural base preserved:', imgErr);
    }
  }

  // 2. Define "Safe Zone" Bounding Box
  const sz = isStory ? tpl.safeZone.story : tpl.safeZone.square;
  const safeX = Math.round(width * sz.xPercent);
  const safeY = Math.round(height * sz.yPercent);
  const safeW = Math.round(width * sz.widthPercent);
  const safeH = Math.round(height * sz.heightPercent);

  // 3. Dynamic Readability Filter (Scrim Layer)
  const scrim = ctx.createRadialGradient(
    safeX + safeW / 2, safeY + safeH / 2, 40,
    safeX + safeW / 2, safeY + safeH / 2, safeW * 0.70
  );
  if (themeId === 'parchment') {
    scrim.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    scrim.addColorStop(0.7, 'rgba(255, 255, 255, 0.35)');
    scrim.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  } else {
    scrim.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
    scrim.addColorStop(0.65, 'rgba(0, 0, 0, 0.45)');
    scrim.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(safeX - 30, safeY - 30, safeW + 60, safeH + 60);

  // 4. Contrast Analysis for Text Color
  const avgLum = analyzeSafeZoneLuminance(ctx, safeX, safeY, safeW, safeH);
  const isLight = (themeId === 'parchment') || (avgLum > 135);

  const primaryTextColor = isLight ? '#1c1917' : '#ffffff';
  const accentTextColor  = isLight ? '#78350f' : tpl.accentColor;

  // 5. Header Badge Text
  const badgeY = isStory ? Math.max(80, safeY - 45) : Math.max(60, safeY - 35);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
  ctx.fillStyle = accentTextColor;
  ctx.letterSpacing = '3px';
  ctx.fillText(tpl.badgeText || '• DAILY SCRIPTURE ENCOURAGEMENT •', width / 2, badgeY);

  // 6. Auto-Scaling Font Loop for Scripture Quote (The Hero Content)
  const rawQuote = verse.verseText || verse.text || verse.quote || '';
  const quoteText = `"${rawQuote}"`;
  const maxAvailableH = safeH - 80;
  const { fontSize, lines, lineHeight, totalHeight } = fitTextInSafeZone(
    ctx, quoteText, safeW - 40, maxAvailableH, 20, isStory ? 54 : 46, fontId
  );
  const fd = SCRIPTURE_FONTS[fontId] || SCRIPTURE_FONTS.lora;

  const contentTotalH = totalHeight + 64;
  const startY = safeY + Math.max(20, Math.round((safeH - contentTotalH) / 2));

  // Set Readability Shadow on Text
  ctx.shadowColor = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = isLight ? 4 : 14;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  // Render Scripture Quote Lines
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `${fd.style} ${fd.weight} ${fontSize}px ${fd.family}`;
  ctx.fillStyle = primaryTextColor;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, startY + (i * lineHeight));
  }

  // 7. Render Scripture Reference Citation
  const book = verse.book || 'Scripture';
  const chapter = verse.chapter || '';
  const verseNum = verse.verse || '';
  const citation = chapter ? `${book} ${chapter}${verseNum ? ':' + verseNum : ''}` : book;
  const refY = startY + (lines.length * lineHeight) + 24;

  ctx.font = '700 24px "Cinzel", "Trajan Pro", Georgia, serif';
  ctx.fillStyle = accentTextColor;
  ctx.letterSpacing = '3px';
  ctx.shadowBlur = isLight ? 2 : 8;
  ctx.fillText(citation.toUpperCase(), width / 2, refY);

  // Reset shadow for clean footer logo & imprint
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 8. Logo & Footer Imprint (Logo placed at Bottom Right, not too big)
  const padX = isStory ? 60 : 44;
  const padY = isStory ? 70 : 44;
  const logoSize = isStory ? 48 : 40; // Tasteful, crisp size in bottom right!
  const logoY = height - padY - logoSize;
  const logoX = width - padX - logoSize;

  if (!forcePureCanvas) {
    try {
      const logo = await getCachedLogo();
      if (logo) {
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      }
    } catch (_) {}
  }

  // Brand Watermark at Bottom Left (Aligned with Bottom-Right Logo)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
  ctx.fillStyle = isLight ? '#78350f' : 'rgba(255, 255, 255, 0.90)';
  ctx.letterSpacing = '2px';
  ctx.fillText('2-MINUTE SERMON', padX, logoY + 4);

  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
  ctx.fillStyle = isLight ? 'rgba(120, 53, 15, 0.70)' : 'rgba(255, 255, 255, 0.60)';
  ctx.letterSpacing = '1px';
  ctx.fillText('2minutesermon.org', padX, logoY + 26);
}

async function getCanvasBlobSafely(canvas, verse, themeId, ratio, fontId = 'inter') {
  try {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (blob) return blob;
  } catch (err) {
    console.warn('Canvas toBlob failed (possible CORS/taint). Re-rendering with pure procedural canvas...', err);
  }

  // Tainted or failed: re-render canvas cleanly without external images!
  try {
    await renderScriptureCardToCanvas(verse, themeId, ratio, fontId, true /* forcePureCanvas */);
    const cleanBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    // Restore visual rendering on screen after clean export
    renderScriptureCardToCanvas(verse, themeId, ratio, fontId, false);
    if (cleanBlob) return cleanBlob;
  } catch (err2) {
    console.error('Clean canvas export failed:', err2);
  }
  return null;
}

function extractPromoVideoId(urlOrId) {
  if (!urlOrId) return PROMO_VIDEO_ID;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : PROMO_VIDEO_ID;
}

function getActivePromoVideoId() {
  const settings = getMinistrySettings();
  return extractPromoVideoId(settings.promoVideoUrl) || PROMO_VIDEO_ID;
}

function setupPromoVideo() {
  const posterWrap = document.getElementById('promoPosterWrap');
  const promoImg = posterWrap?.querySelector('.promo-poster-img');
  const videoId = getActivePromoVideoId();

  if (promoImg) {
    promoImg.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    promoImg.onerror = () => {
      promoImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };
  }

  posterWrap?.addEventListener('click', () => playPromoVideo());
  posterWrap?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playPromoVideo();
    }
  });
}

function playPromoVideo() {
  const frame = document.getElementById('promoCinemaFrame');
  const posterWrap = document.getElementById('promoPosterWrap');
  const playerWrap = document.getElementById('promoPlayerWrap');
  if (!playerWrap || !posterWrap) return;

  const videoId = getActivePromoVideoId();
  posterWrap.style.display = 'none';
  playerWrap.hidden = false;
  playerWrap.innerHTML = `
    <iframe 
      src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1" 
      title="2-Minute Sermon Promo Video" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen
      class="promo-iframe">
    </iframe>
  `;

  frame?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
window.playPromoVideo = playPromoVideo;

function renderHomeSermons() {
  const container = document.getElementById('homeSermonsGrid');
  if (!container) return;
  container.innerHTML = sermons().slice(0, 6).map(s => createSermonCardHtml(s, false)).join('');
  observeNewCards(container);
}

// ─── FAVORITES & DEVOTIONAL QUEUE ──────────────────────────────────────────
const FAVORITES_STORAGE_KEY = '2ms_favorites';
let savedFavorites = [];
try {
  savedFavorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
} catch (_) {
  savedFavorites = [];
}

export function toggleSermonFavorite(sermonId) {
  const idx = savedFavorites.indexOf(sermonId);
  if (idx > -1) {
    savedFavorites.splice(idx, 1);
    showToast('Removed from Saved Devotionals');
  } else {
    savedFavorites.push(sermonId);
    showToast('★ Saved to Your Devotional Queue');
  }
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(savedFavorites));
  } catch (_) {}
  updateFavoritesCountBadge();
  filterAndRenderSermons();
  renderHomeSermons();
}
window.toggleSermonFavorite = toggleSermonFavorite;

function updateFavoritesCountBadge() {
  const badge = document.getElementById('sermonFavCount');
  if (badge) badge.textContent = savedFavorites.length;
}

let activeDurationFilter = 'all'; // 'all', 'under1', '1to2', 'over2', 'favorites'
let activeViewMode = 'grid'; // 'grid' or 'list'

function createSermonCardHtml(s, showFavorite = true) {
  const isFav = savedFavorites.includes(s.id);
  return `
    <div class="sermon-card">
      <div class="sermon-thumb-wrap">
        ${showFavorite ? `
        <button class="sermon-card-fav-btn ${isFav ? 'is-favorited' : ''}" onclick="event.stopPropagation(); window.toggleSermonFavorite('${s.id}')" title="${isFav ? 'Remove from Saved' : 'Save to Devotional Queue'}" aria-label="Favorite sermon">
          ★
        </button>` : ''}
        <img src="${s.thumbnailUrl}" alt="${s.title}" class="sermon-thumb-img" loading="lazy"
          onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='https://img.youtube.com/vi/${s.youtubeEmbedId}/hqdefault.jpg';}else{this.onerror=null;this.src='https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80';}">
        <span class="sermon-duration-badge">${svgClock} ${s.duration}</span>
      </div>
      <div class="sermon-card-content">
        <div class="carousel-badges" style="margin-bottom:8px;">
          <span class="badge badge-season">${s.primarySeason}</span>
        </div>
        <h3 class="sermon-card-title">${s.title}</h3>
        <div class="sermon-card-meta">${s.preacherName} &bull; ${s.scripture}</div>
        <p class="sermon-card-summary">${s.summary}</p>
        <div class="sermon-card-footer">
          <button class="btn btn-primary btn-sm" onclick="window.openSermonModal('${s.id}')">
            ${svgPlay} Watch
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.playSermonInMiniPlayer('${s.id}')" title="Listen in background while you browse">
            🎧 Listen
          </button>
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.shareSermon('${s.id}')">
            ${svgShare} Share
          </button>
        </div>
      </div>
    </div>
  `;
}

function createSermonListRowHtml(s) {
  const isFav = savedFavorites.includes(s.id);
  return `
    <div class="sermon-list-row" data-sermon-id="${s.id}">
      <div class="sermon-list-left">
        <button class="sermon-list-play-btn" onclick="window.playSermonInMiniPlayer('${s.id}')" title="Listen now while you browse" aria-label="Listen to sermon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        <img src="${s.thumbnailUrl}" alt="${s.title}" class="sermon-list-thumb" loading="lazy" onerror="this.src='/assets/logo.png'">
        <div class="sermon-list-info">
          <h4 class="sermon-list-title" onclick="window.openSermonModal('${s.id}')" role="button" tabindex="0" title="View Details">${s.title}</h4>
          <div class="sermon-list-meta">
            <span><strong>${s.preacherName}</strong></span>
            <span>&bull;</span>
            <span>${s.scripture}</span>
            <span>&bull;</span>
            <span class="badge badge-season" style="font-size:0.72rem;padding:2px 8px;">${s.primarySeason}</span>
            <span>&bull;</span>
            <span>⏱️ ${s.duration}</span>
          </div>
        </div>
      </div>
      <div class="sermon-list-actions">
        <button class="sermon-fav-btn ${isFav ? 'is-favorited' : ''}" onclick="window.toggleSermonFavorite('${s.id}')" title="${isFav ? 'Remove from Saved' : 'Save to Devotional Queue'}">
          ★
        </button>
        <button class="btn btn-outline btn-sm" onclick="window.openSermonModal('${s.id}')">
          Watch
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.playSermonInMiniPlayer('${s.id}')">
          🎧 Listen
        </button>
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.shareSermon('${s.id}')" title="Share Sermon">
          ${svgShare} Share
        </button>
      </div>
    </div>
  `;
}

// ─── SERMON FILTERS & VIEWS ───────────────────────────────────────────────────
function setupSermonFilters() {
  updateFavoritesCountBadge();

  const searchInput = document.getElementById('sermonSearchInput');
  const clearBtn    = document.getElementById('searchClearBtn');

  searchInput?.addEventListener('input', e => {
    if (clearBtn) clearBtn.hidden = !e.target.value;
    filterAndRenderSermons();
  });
  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.hidden = true;
    filterAndRenderSermons();
  });

  // Duration quick filter chips
  document.querySelectorAll('.duration-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.duration-chip').forEach(b => b.classList.remove('active'));
      document.getElementById('favFilterChip')?.classList.remove('active');
      btn.classList.add('active');
      activeDurationFilter = btn.dataset.duration || 'all';
      filterAndRenderSermons();
    });
  });

  // Favorites filter chip
  const favChip = document.getElementById('favFilterChip');
  favChip?.addEventListener('click', () => {
    const isCurrentlyActive = favChip.classList.contains('active');
    document.querySelectorAll('.duration-chip').forEach(b => b.classList.remove('active'));
    if (isCurrentlyActive) {
      favChip.classList.remove('active');
      document.querySelector('.duration-chip[data-duration="all"]')?.classList.add('active');
      activeDurationFilter = 'all';
    } else {
      favChip.classList.add('active');
      activeDurationFilter = 'favorites';
    }
    filterAndRenderSermons();
  });

  // Mobile filter drawer toggle
  const toggleFiltersBtn = document.getElementById('btnToggleFilters');
  const advancedFiltersRow = document.getElementById('advancedFiltersRow');
  const mobileResetBtn = document.getElementById('mobileResetFiltersBtn');

  toggleFiltersBtn?.addEventListener('click', () => {
    const isOpen = advancedFiltersRow?.classList.toggle('is-open');
    toggleFiltersBtn.setAttribute('aria-expanded', String(!!isOpen));
  });

  mobileResetBtn?.addEventListener('click', () => {
    document.getElementById('resetFiltersBtn')?.click();
  });

  // View Mode Switcher (Grid vs Audio List)
  const gridBtn = document.getElementById('viewModeGridBtn');
  const listBtn = document.getElementById('viewModeListBtn');
  gridBtn?.addEventListener('click', () => {
    activeViewMode = 'grid';
    gridBtn.classList.add('active');
    listBtn?.classList.remove('active');
    filterAndRenderSermons();
  });
  listBtn?.addEventListener('click', () => {
    activeViewMode = 'list';
    listBtn.classList.add('active');
    gridBtn?.classList.remove('active');
    filterAndRenderSermons();
  });

  ['filterTopic','filterPreacher','filterScripture','filterSort'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', filterAndRenderSermons);
  });

  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.hidden = true;
    ['filterTopic','filterPreacher','filterScripture'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = 'all';
    });
    const sort = document.getElementById('filterSort');
    if (sort) sort.value = 'newest';
    activeSeasonChip = 'all';
    activeDurationFilter = 'all';
    document.querySelectorAll('.duration-chip').forEach(b => b.classList.remove('active'));
    document.querySelector('.duration-chip[data-duration="all"]')?.classList.add('active');
    document.getElementById('favFilterChip')?.classList.remove('active');
    renderSeasonChips();
    filterAndRenderSermons();
  });

  renderSeasonChips();
}

function renderSeasonChips() {
  const c = document.getElementById('seasonChipsContainer');
  if (!c) return;
  c.innerHTML = seasons.map(s => `
    <button class="chip ${s.slug === activeSeasonChip ? 'active' : ''}" onclick="window.selectSeasonChip('${s.slug}')">
      ${s.name}
    </button>`).join('');
}

export function selectSeasonChip(slug) {
  activeSeasonChip = slug;
  renderSeasonChips();
  filterAndRenderSermons();
}
window.selectSeasonChip = selectSeasonChip;

function populateDropdownFilterOptions() {
  const topicSel   = document.getElementById('filterTopic');
  const preachSel  = document.getElementById('filterPreacher');
  const adminPre   = document.getElementById('adminPreacher');
  const adminSea   = document.getElementById('adminSeason');
  const scriptSel  = document.getElementById('filterScripture');

  if (topicSel)
    topicSel.innerHTML = `<option value="all">All Topics</option>` +
      topics.map(t => `<option value="${t.name}">${t.name}</option>`).join('');

  if (preachSel)
    preachSel.innerHTML = `<option value="all">All Preachers</option>` +
      preachers().map(p => `<option value="${p.name}">${p.name}</option>`).join('');

  if (scriptSel) {
    const prevVal = scriptSel.value || 'all';
    const books = Array.from(new Set(sermons().map(s => s.scriptureBook).filter(Boolean))).sort();
    scriptSel.innerHTML = `<option value="all">All Scripture Books</option>` +
      books.map(b => `<option value="${b}">${b}</option>`).join('');
    if (books.includes(prevVal)) {
      scriptSel.value = prevVal;
    }
  }

  if (adminPre)
    adminPre.innerHTML = preachers().map(p => `<option value="${p.name}">${p.name}</option>`).join('');

  if (adminSea)
    adminSea.innerHTML = seasons.filter(s => s.slug !== 'all')
      .map(s => `<option value="${s.name}">${s.name}</option>`).join('');
}

function filterAndRenderSermons() {
  const search     = (document.getElementById('sermonSearchInput')?.value || '').toLowerCase().trim();
  const topic      = document.getElementById('filterTopic')?.value || 'all';
  const preacher   = document.getElementById('filterPreacher')?.value || 'all';
  const scripture  = document.getElementById('filterScripture')?.value || 'all';
  const sort       = document.getElementById('filterSort')?.value || 'newest';

  // Update mobile active filters count badge & reset button
  let activeAdvCount = 0;
  if (topic !== 'all') activeAdvCount++;
  if (preacher !== 'all') activeAdvCount++;
  if (scripture !== 'all') activeAdvCount++;
  if (sort !== 'newest') activeAdvCount++;

  const mobileCountBadge = document.getElementById('mobileFilterCountBadge');
  const toggleBtn = document.getElementById('btnToggleFilters');
  const mobileResetBtn = document.getElementById('mobileResetFiltersBtn');

  if (mobileCountBadge) {
    if (activeAdvCount > 0) {
      mobileCountBadge.textContent = activeAdvCount;
      mobileCountBadge.hidden = false;
      toggleBtn?.classList.add('has-active');
      if (mobileResetBtn) mobileResetBtn.hidden = false;
    } else {
      mobileCountBadge.hidden = true;
      toggleBtn?.classList.remove('has-active');
      if (mobileResetBtn) mobileResetBtn.hidden = true;
    }
  }

  let results = sermons().filter(s => {
    // Season filter (supports slugs, aliases, Xmas/Christmas, Easter/Passover, etc.)
    if (activeSeasonChip !== 'all') {
      const activeSeasonObj = seasons.find(sea => sea.slug === activeSeasonChip);
      const aliases = (activeSeasonObj?.aliases && activeSeasonObj.aliases.length) 
        ? activeSeasonObj.aliases 
        : [activeSeasonChip, activeSeasonObj?.name || ''];

      const matchSeason = (str) => {
        if (!str) return false;
        const sNorm = str.toLowerCase().trim();
        const sClean = sNorm.replace(/[-\s_]/g, '');
        return aliases.some(al => {
          const alNorm = (al || '').toLowerCase().trim();
          const alClean = alNorm.replace(/[-\s_]/g, '');
          return sNorm.includes(alNorm) || alNorm.includes(sNorm) || (sClean && sClean === alClean);
        });
      };

      const primary   = matchSeason(s.primarySeason);
      const secondary = s.secondarySeasons?.some(x => matchSeason(x));
      if (!primary && !secondary) return false;
    }

    // Duration & Favorites quick filters
    if (activeDurationFilter === 'favorites') {
      if (!savedFavorites.includes(s.id)) return false;
    } else if (activeDurationFilter === 'under1') {
      const sec = s.durationSec || 120;
      if (sec >= 60) return false;
    } else if (activeDurationFilter === '1to2') {
      const sec = s.durationSec || 120;
      if (sec < 60 || sec > 120) return false;
    } else if (activeDurationFilter === 'over2') {
      const sec = s.durationSec || 120;
      if (sec <= 120) return false;
    }

    if (topic !== 'all' && !s.topics.includes(topic)) return false;
    if (preacher !== 'all' && s.preacherName !== preacher) return false;
    if (scripture !== 'all' && s.scriptureBook !== scripture) return false;
    if (search) {
      const hit = [s.title, s.preacherName, s.scripture, s.summary, ...(s.transcript || []).map(t => t.text)]
        .some(str => str.toLowerCase().includes(search));
      if (!hit) return false;
    }
    return true;
  });

  if (sort === 'newest') results.sort((a,b) => new Date(b.publishDate) - new Date(a.publishDate));
  else if (sort === 'views') results.sort((a,b) => b.views - a.views);
  else if (sort === 'title') results.sort((a,b) => a.title.localeCompare(b.title));
  else if (sort === 'duration') results.sort((a,b) => (a.durationSec || 120) - (b.durationSec || 120));

  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = results.length;

  const grid = document.getElementById('sermonsIndexGrid');
  if (!grid) return;

  if (!results.length) {
    grid.className = 'sermons-grid';
    grid.innerHTML = `
      <div class="sermons-empty-state" style="grid-column:1/-1;text-align:center;padding:56px 24px;background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.04);">
        <div style="font-size:2.8rem;margin-bottom:14px;">🔍</div>
        <h3 style="margin-bottom:8px;font-family:var(--font-heading);font-size:1.4rem;">No Sermons Found</h3>
        <p style="color:#666;max-width:380px;margin:0 auto 18px;font-size:0.95rem;line-height:1.5;">We couldn't find any sermons matching your active search keywords or filter criteria.</p>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('resetFiltersBtn')?.click()">
          ↺ Reset All Filters
        </button>
      </div>`;
  } else {
    if (activeViewMode === 'list') {
      grid.className = 'sermons-list-view';
      grid.innerHTML = results.map(s => createSermonListRowHtml(s)).join('');
    } else {
      grid.className = 'sermons-grid';
      grid.innerHTML = results.map(s => createSermonCardHtml(s)).join('');
    }
    observeNewCards(grid);
  }
}

// ─── SERMON MODAL — YouTube redirect (no iframe, keeps site fast) ─────────────
export function openSermonModal(sermonId) {
  const list = sermons() || [];
  const targetId = String(sermonId || '').trim();
  const s = list.find(x => 
    String(x.id) === targetId ||
    String(x.id) === `sermon-${targetId}` ||
    `sermon-${x.id}` === targetId ||
    x.slug === targetId ||
    x.title.toLowerCase() === targetId.toLowerCase()
  );
  if (!s) return;
  const modal     = document.getElementById('sermonModal');
  const modalBody = document.getElementById('sermonModalBody');
  if (!modal || !modalBody) return;

  const youtubeUrl = s.youtubeUrl || `https://www.youtube.com/watch?v=${s.youtubeEmbedId}`;

  modalBody.innerHTML = `
    <!-- Thumbnail with YouTube CTA — no iframe, site stays fast -->
    <div class="sermon-thumb-hero" onclick="window.open('${youtubeUrl}','_blank')" role="button" tabindex="0" title="Watch on YouTube">
      <img src="${s.thumbnailUrl}" alt="${s.title}" class="sermon-thumb-hero-img" loading="eager"
        onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='https://img.youtube.com/vi/${s.youtubeEmbedId}/hqdefault.jpg';}else{this.onerror=null;this.src='https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80';}">
      <div class="sermon-thumb-hero-overlay">
        <div class="sermon-yt-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Watch on YouTube</span>
        </div>
        <span class="sermon-thumb-duration">${svgClock} ${s.duration}</span>
      </div>
    </div>

    <div class="sermon-modal-body-inner">
      <div class="carousel-badges" style="margin-bottom:12px;">
        <span class="badge badge-season">${s.primarySeason}</span>
        <span class="badge badge-scripture">${svgBook} ${s.scripture}</span>
      </div>
      <h2 class="sermon-modal-title">${s.title}</h2>
      <div class="sermon-modal-meta">
        By <strong>${s.preacherName}</strong>
        &bull; ${s.publishDate}
        &bull; ${svgClock} ${s.duration}
      </div>
      <p style="margin-bottom:24px;font-size:1.02rem;color:#444;line-height:1.75;">${s.summary}</p>

      ${s.transcript && s.transcript.length ? `
      <div class="transcript-box">
        <div class="transcript-header">Timestamped Transcript</div>
        ${s.transcript.map(l => `
          <div class="transcript-line">
            <span class="ts-tag">${l.time}</span>
            <span>${l.text}</span>
          </div>`).join('')}
      </div>` : ''}

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:4px;">
        <a href="${youtubeUrl}" target="_blank" rel="noopener" class="btn btn-primary">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Watch on YouTube
        </a>
        <button class="btn btn-secondary" onclick="window.playSermonInMiniPlayer('${s.id}'); window.closeSermonModal();">
          🎧 Listen While You Browse
        </button>
        <button class="btn btn-outline" onclick="window.shareSermon('${s.id}')">
          ${svgShare} Share
        </button>
        <button class="btn btn-outline" onclick="window.openPrayerFromSermon()">
          🙏 Prayer Request
        </button>
      </div>
    </div>`;

  lockPageScroll();
  modal.hidden = false;
  document.title = `${s.title} — 2-Minute Sermon`;

  // Inject VideoObject JSON-LD Schema for SEO
  let schemaScript = document.getElementById('dynamicSermonSchema');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'dynamicSermonSchema';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }
  schemaScript.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": s.title,
    "description": s.summary,
    "thumbnailUrl": [s.thumbnailUrl],
    "uploadDate": s.publishDate,
    "duration": `PT${s.durationSec || 120}S`,
    "contentUrl": youtubeUrl,
    "embedUrl": `https://www.youtube.com/embed/${s.youtubeEmbedId}`
  });
}
window.openSermonModal = openSermonModal;

function closeSermonModal() {
  const modal = document.getElementById('sermonModal');
  if (modal && !modal.hidden) {
    modal.hidden = true;
    unlockPageScroll();
    document.getElementById('sermonModalBody').innerHTML = '';
    const schemaScript = document.getElementById('dynamicSermonSchema');
    if (schemaScript) schemaScript.remove();
    if (VIEW_TITLES[activeView]) document.title = VIEW_TITLES[activeView];
  }
}
window.closeSermonModal = closeSermonModal;

document.getElementById('closeSermonModalBtn')?.addEventListener('click', closeSermonModal);

// Modal backdrop click & scroll isolation
const sermonModalEl = document.getElementById('sermonModal');
sermonModalEl?.addEventListener('click', e => {
  if (e.target === sermonModalEl) closeSermonModal();
});
sermonModalEl?.addEventListener('wheel', e => {
  if (e.target === sermonModalEl) e.preventDefault();
}, { passive: false });
sermonModalEl?.addEventListener('touchmove', e => {
  if (e.target === sermonModalEl) e.preventDefault();
}, { passive: false });

// Keyboard Accessibility: Escape key closes modals and menus
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSermonModal();
    closeScriptureCardModal();
    closeSermonShareModal();
    closeDropdown();
    closeMobileDrawer();
  }
});

// ─── DAILY VERSE ──────────────────────────────────────────────────────────────
export function renderDailyVerse() {
  const verse = getVerseForDate(getTodayDateStr());
  if (!verse) return;

  const displayDate = formatVerseDate(verse.publishDate) || verse.publishDate;
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('dvDateDisplay', displayDate);
  setEl('dvQuoteDisplay', `"${verse.verseText}"`);
  setEl('dvRefDisplay', `— ${verse.book} ${verse.chapter}:${verse.verse}`);

  const full = document.getElementById('dailyVerseFullContainer');
  if (full) {
    full.innerHTML = `
      <div class="daily-verse-card" style="margin-bottom:24px;">
        <div class="verse-header">
          <span class="verse-label">
            <svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            ${verse.isFallback ? "Today's Verse" : "Today's Scripture"}
          </span>
          <span class="verse-date">${displayDate}</span>
        </div>
        <blockquote class="verse-quote">"${verse.verseText}"</blockquote>
        <div class="verse-meta">— ${verse.book} ${verse.chapter}:${verse.verse}</div>
        
        <div class="verse-actions" style="margin-top:20px;">
          <button class="btn btn-sm btn-outline" id="dvFullListenBtn">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            Listen (TTS)
          </button>
          <button class="btn btn-sm btn-outline" id="dvFullCopyBtn">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy Verse
          </button>
          <button class="btn btn-sm btn-primary" id="dvFullShareBtn" style="background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%); box-shadow: 0 4px 14px rgba(198, 40, 40, 0.35);">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share Verse Card
          </button>
        </div>
      </div>

      <!-- Pastor's Daily Reflection -->
      <div class="pastor-reflection-card" style="background:#fff;border-radius:18px;border:1px solid var(--color-lightgray);border-left:5px solid var(--color-sermon-red);padding:28px 32px;box-shadow:var(--shadow-sm);margin-bottom:32px;">
        <div style="margin-bottom:12px;">
          <h3 style="margin:0 0 4px;font-family:var(--font-heading);font-size:1.25rem;color:var(--color-dark);letter-spacing:-0.01em;">Pastor's Daily Reflection</h3>
          <span style="font-size:0.82rem;color:var(--color-mediumgray);display:block;">Spiritual encouragement and guidance for today</span>
        </div>
        <p style="font-size:1.06rem;color:#2c2c2c;line-height:1.75;margin:0;font-style:italic;">
          "${verse.reflection || 'Take a moment to meditate on this scripture today. May the Lord grant you peace, strength, and clarity in all you do.'}"
        </p>
      </div>
    `;

    document.getElementById('dvFullListenBtn')?.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) { showToast('TTS not supported on this browser.'); return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${verse.book} chapter ${verse.chapter} verse ${verse.verse}. ${verse.verseText}`);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
      showToast("🔊 Reading Today's Verse aloud…");
    });

    document.getElementById('dvFullCopyBtn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(`"${verse.verseText}" — ${verse.book} ${verse.chapter}:${verse.verse}`);
      showToast('📋 Verse copied to clipboard!');
    });

    document.getElementById('dvFullShareBtn')?.addEventListener('click', () => {
      openScriptureCardModal(verse);
    });
  }
}
window.renderDailyVerse = renderDailyVerse;

export function setupDailyVerse() {
  renderDailyVerse();

  const listenBtn = document.getElementById('dvListenBtn');
  if (listenBtn && !listenBtn.dataset.bound) {
    listenBtn.dataset.bound = 'true';
    listenBtn.addEventListener('click', () => {
      const verse = getVerseForDate(getTodayDateStr());
      if (!verse) return;
      if (!('speechSynthesis' in window)) { showToast('TTS not supported on this browser.'); return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${verse.book} chapter ${verse.chapter} verse ${verse.verse}. ${verse.verseText}`);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
      showToast('🔊 Reading Today\'s Verse aloud…');
    });
  }

  const copyBtn = document.getElementById('dvCopyBtn');
  if (copyBtn && !copyBtn.dataset.bound) {
    copyBtn.dataset.bound = 'true';
    copyBtn.addEventListener('click', () => {
      const verse = getVerseForDate(getTodayDateStr());
      if (!verse) return;
      navigator.clipboard.writeText(`"${verse.verseText}" — ${verse.book} ${verse.chapter}:${verse.verse}`);
      showToast('📋 Verse copied to clipboard!');
    });
  }

  const shareBtn = document.getElementById('dvShareBtn');
  if (shareBtn && !shareBtn.dataset.bound) {
    shareBtn.dataset.bound = 'true';
    shareBtn.addEventListener('click', () => {
      const verse = getVerseForDate(getTodayDateStr());
      if (verse) openScriptureCardModal(verse);
    });
  }
}
window.setupDailyVerse = setupDailyVerse;

// ─── PRAYER FORM ──────────────────────────────────────────────────────────────
function setupPrayerForm() {
  document.getElementById('prayerSubmissionForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name    = (document.getElementById('prayerName')?.value || '').trim() || 'Anonymous';
    const email   = (document.getElementById('prayerEmail')?.value || '').trim();
    const urgency = document.getElementById('prayerUrgency')?.value || 'General';
    const msg     = (document.getElementById('prayerMessage')?.value || '').trim();

    if (!email) {
      showToast('⚠️ Please provide an email address so we can confirm receipt.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }
    if (!msg || msg.length < 5) {
      showToast('⚠️ Please share a short description of your prayer need.');
      return;
    }

    pendingPrayers.unshift({
      id: `pr-${Date.now()}`,
      name,
      email,
      urgency,
      msg,
      status: 'New',
      date: new Date().toISOString().split('T')[0]
    });

    e.target.reset();
    renderAdminPrayerInbox();
    showToast('🙏 Your prayer request has been received with love.');
  });

  document.querySelectorAll('.copy-prayer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.written-prayer-card');
      const text = card ? card.querySelector('p')?.textContent : '';
      const title = card ? card.querySelector('h3')?.textContent : '';
      if (text) {
        navigator.clipboard.writeText(`${title ? `${title}\n\n` : ''}${text}`);
        showToast('📋 Written prayer copied to clipboard!');
      } else {
        showToast('📋 Written prayer copied!');
      }
    });
  });
}

import { isFirebaseConfigured, subscribeCollection } from './firebase.js';

// Real-time Cloud Settings Sync
if (isFirebaseConfigured()) {
  subscribeCollection('settings', (remoteDocs) => {
    const ministryDoc = remoteDocs.find(d => d.id === 'ministry');
    if (ministryDoc) {
      try {
        localStorage.setItem('2ms_settings', JSON.stringify(ministryDoc));
        updateFooterSocialLinks();
      } catch (_) {}
    }
  });
}

function normalizeUrl(url) {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

const DEFAULT_MINISTRY_EMAIL = 'info2minutesermon@gmail.com';
const DEFAULT_FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkjnbzgw';
const DEFAULT_YT_CHANNEL     = 'https://www.youtube.com/c/2MinuteSermonP';
const DEFAULT_FB_PAGE        = 'https://www.facebook.com/2minutesermon';
const DEFAULT_IG_PAGE        = 'https://www.instagram.com/2_minutesermon/';
const DEFAULT_TIKTOK_PAGE    = 'https://www.tiktok.com/@2minutesermon';
const DEFAULT_PROMO_URL      = 'https://www.youtube.com/watch?v=SJFqqNvTeh8';

// ─── SETTINGS HELPERS (reads from localStorage & Firestore) ─────────────────
function getMinistrySettings() {
  try {
    const raw = localStorage.getItem('2ms_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.contactEmail || parsed.contactEmail.includes('@2minutesermon.org')) {
        parsed.contactEmail = DEFAULT_MINISTRY_EMAIL;
      }
      if (!parsed.newsletterEmail || parsed.newsletterEmail.includes('@2minutesermon.org')) {
        parsed.newsletterEmail = DEFAULT_MINISTRY_EMAIL;
      }
      if (!parsed.endpointUrl) {
        parsed.endpointUrl = DEFAULT_FORMSPREE_ENDPOINT;
      }
      if (!parsed.youtubeUrl || parsed.youtubeUrl === 'https://youtube.com' || parsed.youtubeUrl === 'https://youtube.com/') {
        parsed.youtubeUrl = DEFAULT_YT_CHANNEL;
      }
      if (!parsed.facebookUrl || parsed.facebookUrl === 'https://facebook.com' || parsed.facebookUrl === 'https://facebook.com/') {
        parsed.facebookUrl = DEFAULT_FB_PAGE;
      }
      if (!parsed.instagramUrl || parsed.instagramUrl === 'https://instagram.com' || parsed.instagramUrl === 'https://instagram.com/') {
        parsed.instagramUrl = DEFAULT_IG_PAGE;
      }
      if (!parsed.tiktokUrl) {
        parsed.tiktokUrl = DEFAULT_TIKTOK_PAGE;
      }
      if (!parsed.promoVideoUrl) {
        parsed.promoVideoUrl = DEFAULT_PROMO_URL;
      }
      if (!parsed.timezone) {
        parsed.timezone = 'EST';
      }
      return parsed;
    }
  } catch (_) {}
  return {
    contactEmail: DEFAULT_MINISTRY_EMAIL,
    newsletterEmail: DEFAULT_MINISTRY_EMAIL,
    endpointUrl: DEFAULT_FORMSPREE_ENDPOINT,
    youtubeUrl: DEFAULT_YT_CHANNEL,
    facebookUrl: DEFAULT_FB_PAGE,
    instagramUrl: DEFAULT_IG_PAGE,
    tiktokUrl: DEFAULT_TIKTOK_PAGE,
    promoVideoUrl: DEFAULT_PROMO_URL,
    timezone: 'EST',
    twitterUrl: '',
    spotifyUrl: ''
  };
}

function updateFooterSocialLinks() {
  const s = getMinistrySettings();
  
  const map = {
    youtube: normalizeUrl(s.youtubeUrl) || DEFAULT_YT_CHANNEL,
    facebook: normalizeUrl(s.facebookUrl) || DEFAULT_FB_PAGE,
    instagram: normalizeUrl(s.instagramUrl) || DEFAULT_IG_PAGE,
    tiktok: normalizeUrl(s.tiktokUrl) || DEFAULT_TIKTOK_PAGE,
    email: `mailto:${s.contactEmail || DEFAULT_MINISTRY_EMAIL}`,
    gmail: `mailto:${s.contactEmail || DEFAULT_MINISTRY_EMAIL}`
  };

  const socialIcons = document.querySelectorAll('.social-icon');
  socialIcons.forEach(a => {
    const key = (a.getAttribute('data-social') || a.getAttribute('title') || a.getAttribute('aria-label') || '').toLowerCase();
    
    for (const [platform, url] of Object.entries(map)) {
      if (key.includes(platform)) {
        a.href = url;
        break;
      }
    }
  });

  // Also bind any direct data-social="<platform>" elements anywhere on page
  for (const [platform, url] of Object.entries(map)) {
    document.querySelectorAll(`[data-social="${platform}"]`).forEach(el => {
      el.href = url;
    });
  }
}

async function postToEndpoint(endpoint, payload) {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (_) { /* fail silently — toast already shown */ }
}

// ─── NEWSLETTER FORM ─────────────────────────────────────────────────────────
function setupNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    const email = input?.value.trim();
    if (!email || !email.includes('@')) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }

    // Save subscriber to local & Firestore store
    addSubscriber(email, 'Website Newsletter Form');

    const { endpointUrl } = getMinistrySettings();
    if (endpointUrl) {
      await postToEndpoint(endpointUrl, { type: 'newsletter', email, _subject: 'New Newsletter Subscriber' });
    }
    showToast('🎉 Thank you for subscribing to weekly 2-Minute Sermons!');
    form.reset();
  });
}

// ─── GENERAL CONTACT FORM ───────────────────────────────────────────────────
function setupGeneralContactForm() {
  const form = document.getElementById('generalContactForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('contactName')?.value.trim();
    const email   = document.getElementById('contactEmail')?.value.trim();
    const subject = document.getElementById('contactSubject')?.value;
    const msg     = document.getElementById('contactMessage')?.value.trim();

    if (!name || !email || !msg) {
      showToast('⚠️ Please fill out all required fields.');
      return;
    }
    const { endpointUrl } = getMinistrySettings();
    if (endpointUrl) {
      await postToEndpoint(endpointUrl, { type: 'contact', name, email, subject, message: msg, _subject: `Contact: ${subject}` });
    }
    showToast(`✉️ Message sent! Our team will respond shortly.`);
    form.reset();
  });
}

window.openPrayerFromSermon = () => {
  document.getElementById('sermonModal').hidden = true;
  switchView('prayers');
};

window.handleDonateClick = function() {
  const notice = document.getElementById('supportStatusNotice');
  if (notice) {
    notice.style.display = 'block';
  }
  const subSelect = document.getElementById('contactSubject');
  if (subSelect) {
    subSelect.value = 'Ministry Partnership';
  }
  const contactForm = document.getElementById('generalContactForm');
  if (contactForm) {
    contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  showToast('🕊️ Online donation gateway is in setup. Please reach out via Ministry Partnership above!');
};

// ─── ADMIN AUTH GATE ──────────────────────────────────────────────────────────
function openAdminPortal() {
  window.location.href = '/admin.html';
}

// Shake animation for wrong password
const style = document.createElement('style');
style.textContent = `
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
  @keyframes fadeOut { to{opacity:0;transform:scale(0.97)} }
`;
document.head.appendChild(style);

// ─── ADMIN PORTAL SETUP ───────────────────────────────────────────────────────
function setupAdminPortal() {
  document.getElementById('adminHeaderBtn')?.addEventListener('click', openAdminPortal);

  // Sub-tab switching
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-admintab');
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`admintab-${tab}`)?.classList.add('active');
    });
  });

  // Set default date
  const dateInput = document.getElementById('adminDvDate');
  if (dateInput) dateInput.value = getTodayDateStr();

  // ── Daily Verse Scheduler ──
  document.getElementById('adminScheduleVerseForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const dateStr     = document.getElementById('adminDvDate').value;
    const ref         = document.getElementById('adminDvBook').value;
    const verseText   = document.getElementById('adminDvText').value;
    const reflection  = document.getElementById('adminDvReflection').value;

    const parts = ref.split(':');
    const chapterVerse = parts[1] || '1';
    const bookChap = (parts[0] || ref).trim();
    const bookWords = bookChap.split(' ');
    const chap = bookWords.pop();
    const book = bookWords.join(' ') || bookChap;

    const entry = { id: `dv-${dateStr}`, publishDate: dateStr, verseText, book, chapter: chap, verse: chapterVerse, reflection, tags: ['Scheduled'] };

    const queue = [...scheduledDailyVerses()];
    const idx = queue.findIndex(v => v.publishDate === dateStr);
    if (idx >= 0) queue[idx] = entry;
    else {
      queue.push(entry);
      queue.sort((a,b) => new Date(a.publishDate) - new Date(b.publishDate));
    }
    saveDailyVerses(queue);

    e.target.reset();
    if (dateInput) dateInput.value = getTodayDateStr();
    renderAdminVerseQueue();
    setupDailyVerse();
    showToast(`📅 Verse scheduled for ${dateStr}!`);
  });

  // ── Auto-fill 30 Days ──
  document.getElementById('adminAutoGenerate30DaysBtn')?.addEventListener('click', () => {
    const pool = [
      { text: "The Lord is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1", ref2: {book:"Psalm",chapter:"27",verse:"1"}, r: "Light dispels every shadow of doubt. Stand confident in His protection today." },
      { text: "Trust in the Lord with all your heart, and lean not on your own understanding.", ref: "Proverbs 3:5", ref2:{book:"Proverbs",chapter:"3",verse:"5"}, r: "Surrendering control opens the door to divine wisdom." },
      { text: "Cast all your anxiety on Him because He cares for you.", ref: "1 Peter 5:7", ref2:{book:"1 Peter",chapter:"5",verse:"7"}, r: "Your heavenly Father is attentive to your every burden." },
      { text: "Peace I leave with you; my peace I give to you.", ref: "John 14:27", ref2:{book:"John",chapter:"14",verse:"27"}, r: "Christ offers a tranquility the world cannot manufacture." }
    ];

    const start = new Date();
    const queue = [...scheduledDailyVerses()];
    for (let i = 1; i <= 30; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      if (queue.some(v => v.publishDate === dateStr)) continue;
      const sample = pool[i % pool.length];
      queue.push({ id: `dv-${dateStr}`, publishDate: dateStr, verseText: sample.text, ...sample.ref2, reflection: sample.r, tags: ['Auto-Queue'] });
    }
    queue.sort((a,b) => new Date(a.publishDate) - new Date(b.publishDate));
    saveDailyVerses(queue);
    renderAdminVerseQueue();
    setupDailyVerse();
    showToast('⚡ 30-Day verse queue auto-populated!');
  });

  // ── Sermon Publisher ──
  document.getElementById('adminQuickPublishForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const title    = document.getElementById('adminSermonTitle').value;
    const preacher = document.getElementById('adminPreacher').value;
    const scripture= document.getElementById('adminScripture').value;
    const season   = document.getElementById('adminSeason').value;
    const duration = document.getElementById('adminDuration').value;
    const raw      = document.getElementById('adminYoutubeUrl').value;
    const summary  = document.getElementById('adminSummary').value;

    let embedId = raw;
    if (raw.includes('v=')) embedId = raw.split('v=')[1].split('&')[0];
    else if (raw.includes('youtu.be/')) embedId = raw.split('youtu.be/')[1].split('?')[0];

    const newSermon = {
      id: `sermon-${Date.now()}`, title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      preacherId: 'p1', preacherName: preacher,
      scripture, scriptureBook: scripture.split(' ')[0],
      primarySeason: season, secondarySeasons: [], topics: ['Faith'],
      duration, durationSec: 120, youtubeUrl: raw, youtubeEmbedId: embedId,
      thumbnailUrl: `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`,
      summary, publishDate: getTodayDateStr(), views: 1, featured: true,
      transcript: [{ time: '0:00', text: summary }, { time: '1:00', text: 'Walk boldly in God\'s promises today.' }]
    };

    upsertSermon(newSermon);

    renderFeaturedCarousel(true);
    renderHomeSermons();
    filterAndRenderSermons();
    populateDropdownFilterOptions();
    e.target.reset();
    showToast(`🚀 "${title}" published live!`);
  });

  // ── Add Preacher ──
  const clientPreacherBio = document.getElementById('newPreacherBio');
  const clientBioCounter = document.getElementById('clientPreacherBioWordCounter');
  if (clientPreacherBio && clientBioCounter) {
    const updateClientBio = () => {
      const words = clientPreacherBio.value.trim().split(/\s+/).filter(Boolean).length;
      clientBioCounter.textContent = `${words} / 150 words`;
      clientBioCounter.style.color = words > 150 ? 'var(--color-sermon-red)' : 'var(--color-mediumgray)';
    };
    clientPreacherBio.addEventListener('input', updateClientBio);
    clientPreacherBio.addEventListener('paste', () => setTimeout(updateClientBio, 50));
  }

  document.getElementById('adminAddPreacherForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name         = document.getElementById('newPreacherName').value;
    const denomination = document.getElementById('newPreacherDenomination').value;
    const country      = document.getElementById('newPreacherCountry').value;
    const photoUrl     = document.getElementById('newPreacherPhoto').value;
    const bio          = document.getElementById('newPreacherBio').value;

    const bioWords = bio.trim().split(/\s+/).filter(Boolean).length;
    if (bioWords > 150) {
      showToast(`⚠️ Preacher bio cannot exceed 150 words (currently ${bioWords} words). Please shorten it.`);
      document.getElementById('newPreacherBio')?.focus();
      return;
    }

    const newPreacher = {
      id: `p-${Date.now()}`, name, denomination, country, photoUrl, bio
    };

    const currentList = [...preachers(), newPreacher];
    savePreachers(currentList);
    renderPreachersHub();
    renderAdminPreachersList();
    populateDropdownFilterOptions();
    e.target.reset();
    if (clientBioCounter) clientBioCounter.textContent = '0 / 150 words';

    // Update stat counter in hero
    const counter = document.getElementById('homePreachersCount');
    if (counter) counter.textContent = `${currentList.length}+`;

    showToast(`🎙️ ${name} added to the Preachers Directory!`);
  });

  // ── CMS Export ──
  document.getElementById('adminExportJsonBtn')?.addEventListener('click', () => {
    const data = { exportedAt: new Date().toISOString(), scheduledDailyVerses: scheduledDailyVerses(), sermons: sermons(), preachers: preachers(), pendingPrayers };
    const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.href = url; a.download = `2ms-cms-backup-${getTodayDateStr()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    showToast('📥 CMS backup downloaded!');
  });
}

// ─── ADMIN RENDER HELPERS ──────────────────────────────────────────────────────
function renderAdminVerseQueue() {
  const c = document.getElementById('adminVerseQueueList');
  if (!c) return;
  const list = scheduledDailyVerses();
  if (!list.length) {
    c.innerHTML = `<p style="color:#777;text-align:center;padding:24px;">No verses scheduled yet.</p>`;
    return;
  }
  c.innerHTML = list.map((v, idx) => `
    <div class="admin-queue-item">
      <div class="admin-queue-header">
        <strong style="color:var(--color-sermon-red);">${v.publishDate}</strong>
        <span class="badge badge-scripture">${v.book} ${v.chapter}:${v.verse}</span>
      </div>
      <p style="font-size:0.88rem;color:#333;margin:4px 0;">"${v.verseText}"</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
        <span style="font-size:0.75rem;color:#777;">${v.reflection.substring(0, 52)}…</span>
        <button class="btn btn-sm btn-outline" onclick="window.removeScheduledVerse(${idx})" style="flex-shrink:0;">✕ Remove</button>
      </div>
    </div>`).join('');
}
window.removeScheduledVerse = idx => {
  const queue = [...scheduledDailyVerses()];
  queue.splice(idx, 1);
  saveDailyVerses(queue);
  renderAdminVerseQueue();
  setupDailyVerse();
  showToast('Verse removed from queue.');
};

function renderAdminPreachersList() {
  const c = document.getElementById('adminPreachersList');
  if (!c) return;
  const list = preachers();
  c.innerHTML = list.map((p, idx) => `
    <div class="admin-preacher-item">
      <img src="${p.photoUrl}" alt="${p.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=C62828&color=fff'">
      <div class="admin-preacher-info">
        <strong>${p.name}</strong>
        <span>${p.denomination} &bull; ${p.country}</span>
      </div>
      <button class="btn btn-sm btn-outline" onclick="window.removePreacher(${idx})" style="flex-shrink:0;">
        ✕
      </button>
    </div>`).join('');
}
window.removePreacher = idx => {
  const list = [...preachers()];
  const name = list[idx]?.name;
  list.splice(idx, 1);
  savePreachers(list);
  renderPreachersHub();
  renderAdminPreachersList();
  populateDropdownFilterOptions();
  const counter = document.getElementById('homePreachersCount');
  if (counter) counter.textContent = `${list.length}+`;
  showToast(`${name} removed from directory.`);
};

function renderAdminPrayerInbox() {
  const c = document.getElementById('adminPrayerInboxList');
  const badge = document.getElementById('adminPendingBadge');
  if (badge) badge.textContent = pendingPrayers.length;
  if (!c) return;

  if (!pendingPrayers.length) {
    c.innerHTML = `<p style="color:#777;text-align:center;padding:24px;">No pending prayer requests. 🙌</p>`;
    return;
  }
  c.innerHTML = pendingPrayers.map((pr, idx) => `
    <div class="admin-prayer-item">
      <div class="admin-prayer-item-header">
        <strong>${pr.name} (${pr.email})</strong>
        <span class="badge badge-season">${pr.urgency}</span>
      </div>
      <p style="font-size:0.9rem;color:#333;margin:6px 0;">"${pr.msg}"</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
        <span style="font-size:0.75rem;color:#777;">Submitted: ${pr.date}</span>
        <button class="btn btn-sm btn-outline" onclick="window.markPrayerDone(${idx})">✓ Prayed For</button>
      </div>
    </div>`).join('');
}
window.markPrayerDone = idx => {
  pendingPrayers.splice(idx, 1);
  renderAdminPrayerInbox();
  showToast('✓ Prayer request marked as prayed for!');
};

// ─── HUBS ─────────────────────────────────────────────────────────────────────
function renderSeasonsHub() {
  const c = document.getElementById('seasonsHubGrid');
  if (!c) return;
  c.innerHTML = seasons.filter(s => s.slug !== 'all').map(s => `
    <div class="hub-card" onclick="window.selectSeasonChip('${s.slug}');window.switchView('sermons');">
      <h3 style="font-size:1.3rem;margin-bottom:8px;">${s.name}</h3>
      <p style="font-size:0.9rem;color:#777;margin-bottom:18px;line-height:1.5;flex-grow:1;">${s.description}</p>
      <span style="font-weight:700;color:var(--color-sermon-red);font-size:0.88rem;margin-top:auto;">Browse Season →</span>
    </div>`).join('');
  observeNewCards(c);
}

function renderTopicsHub() {
  const c = document.getElementById('topicsHubGrid');
  if (!c) return;
  c.innerHTML = topics.map(t => `
    <div class="hub-card" onclick="window.filterByTopicName('${t.name}')">
      <h3 style="font-size:1.3rem;margin-bottom:8px;">${t.name}</h3>
      <p style="font-size:0.9rem;color:#777;margin-bottom:18px;line-height:1.5;flex-grow:1;">${t.description}</p>
      <span style="font-weight:700;color:var(--color-sermon-red);font-size:0.88rem;margin-top:auto;">View ${t.count} Sermons →</span>
    </div>`).join('');
  observeNewCards(c);
}
window.filterByTopicName = name => {
  switchView('sermons');
  const s = document.getElementById('filterTopic');
  if (s) { s.value = name; filterAndRenderSermons(); }
};

function renderPreachersHub() {
  const c = document.getElementById('preachersHubGrid');
  if (!c) return;
  c.innerHTML = preachers().map(p => {
    const bio = p.bio || '';
    const isLong = bio.length > 140;
    const bioHtml = bio ? (isLong ? `
      <div class="card-bio-wrap is-clamped">
        <p class="preacher-card-bio">${escapeHtml(bio)}</p>
        <button type="button" class="bio-expand-btn" aria-expanded="false" onclick="window.toggleBioExpand(this, event)">Read full bio</button>
      </div>
    ` : `<p class="preacher-card-bio">${escapeHtml(bio)}</p>`) : '';

    return `
      <div class="hub-card preacher-hub-card text-center">
        <img src="${p.photoUrl}" alt="${p.name}" class="preacher-card-img"
             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=C62828&color=fff&size=84'">
        <h3 class="preacher-card-name">${p.name}</h3>
        <div class="preacher-card-meta">${p.denomination} &bull; ${p.country}</div>
        ${bioHtml}
        <div class="preacher-card-footer">
          <button class="btn btn-outline btn-sm btn-full" onclick="window.filterByPreacherName('${p.name}')">
            View Sermons
          </button>
        </div>
      </div>`;
  }).join('');
  observeNewCards(c);
}
window.filterByPreacherName = name => {
  switchView('sermons');
  const s = document.getElementById('filterPreacher');
  if (s) { s.value = name; filterAndRenderSermons(); }
};

function renderEventsGrid() {
  const c = document.getElementById('eventsGrid');
  if (!c) return;
  const list = events();
  const tz = getMinistrySettings().timezone || 'EST';

  if (!list.length) {
    c.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:56px 24px;background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);">
        <div style="font-size:2.5rem;margin-bottom:12px;">📅</div>
        <h3 style="margin-bottom:8px;font-family:var(--font-heading);">No Upcoming Events Scheduled</h3>
        <p style="color:#666;max-width:380px;margin:0 auto;font-size:0.95rem;">Check back soon or follow our online broadcasts for upcoming ministry gatherings.</p>
      </div>`;
    return;
  }

  c.innerHTML = list.map(ev => `
    <div class="event-card">
      <div class="event-card-header">
        <span class="badge badge-season">${ev.category || 'Ministry Event'}</span>
        <span class="event-date-pill">${ev.date}${ev.time ? ` · ${ev.time} ${tz}` : ''}</span>
      </div>
      <h3 class="event-card-title">${ev.title}</h3>
      <div class="event-card-location">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        <span>${ev.location}</span>
      </div>
      <p class="event-card-desc">${ev.description}</p>
      <div class="event-card-footer">
        <button class="btn btn-outline btn-sm btn-full" onclick="window.shareEvent('${encodeURIComponent(ev.title)}', '${encodeURIComponent(ev.date || '')}', '${encodeURIComponent(ev.location || '')}')">
          ${svgShare} Share Event
        </button>
      </div>
    </div>`).join('');
  observeNewCards(c);
}

window.shareEvent = (titleEnc, dateEnc, locEnc) => {
  const title = decodeURIComponent(titleEnc);
  const date  = decodeURIComponent(dateEnc);
  const loc   = decodeURIComponent(locEnc);
  const text  = `Join us for "${title}" on ${date} (${loc}) — 2-Minute Sermon Ministry: ${window.location.origin}/#events`;

  if (navigator.share) {
    navigator.share({ title, text, url: `${window.location.origin}/#events` }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text);
    showToast('📋 Event details copied to clipboard!');
  }
};

// ─── ABOUT US INTERACTIVE HUB (Mission, Structure, Who is Who, Partners) ───────
let activeAboutTab = 'mission';
let activeTeamFilter = 'all';

export function setupAboutTabs() {
  document.querySelectorAll('.about-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-about-tab');
      if (tab) switchAboutTab(tab);
    });
  });

  // Team Filter Chips
  document.querySelectorAll('[data-team-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-team-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeTeamFilter = chip.getAttribute('data-team-filter');
      renderAboutTeamRoster(activeTeamFilter);
    });
  });
}

export function switchAboutTab(tabName) {
  activeAboutTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.about-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-about-tab') === tabName);
  });

  // Update tab panels
  const panelMap = {
    mission: 'aboutPanelMission',
    structure: 'aboutPanelStructure',
    'who-is-who': 'aboutPanelWhoIsWho',
    partners: 'aboutPanelPartners'
  };

  document.querySelectorAll('.about-panel').forEach(p => p.classList.remove('active'));
  const targetPanelId = panelMap[tabName] || 'aboutPanelMission';
  const targetPanel = document.getElementById(targetPanelId);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
}
window.switchAboutTab = switchAboutTab;

export function renderAboutTeamRoster(filter = 'all') {
  const container = document.getElementById('aboutTeamRosterContainer');
  const countEl = document.getElementById('teamTotalCount');
  if (!container) return;

  const team = leadership();
  if (countEl) countEl.textContent = team.length;

  let filtered = team;
  if (filter && filter !== 'all') {
    filtered = team.filter(m => m.tier === filter);
  }

  if (!filtered.length) {
    container.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--color-mediumgray);padding:32px;">No team members found for this category.</p>`;
    return;
  }

  container.innerHTML = filtered.map(m => {
    const isExec = m.tier === 'Executive Board' || m.tierOrder === 1;
    const bio = m.bio || '';
    const isLong = bio.length > 150;
    const bioHtml = bio ? (isLong ? `
      <div class="card-bio-wrap is-clamped">
        <p class="team-bio">${escapeHtml(bio)}</p>
        <button type="button" class="bio-expand-btn" aria-expanded="false" onclick="window.toggleBioExpand(this, event)">Read full bio</button>
      </div>
    ` : `<p class="team-bio">${escapeHtml(bio)}</p>`) : '';

    return `
      <div class="team-member-card ${isExec ? 'executive' : ''}">
        <img src="${m.photoUrl}" alt="${m.name}" class="team-avatar"
             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=C62828&color=fff&size=160'">
        <span class="team-tier-tag">${m.tier || 'Ministry Team'}</span>
        <h3 class="team-name">${m.name}</h3>
        <div class="team-role">${m.role}</div>
        ${bioHtml}
      </div>
    `;
  }).join('');
}
window.renderAboutTeamRoster = renderAboutTeamRoster;

export function renderAboutPartners() {
  const container = document.getElementById('aboutPartnersContainer');
  if (!container) return;

  const list = partners();
  if (!list.length) {
    container.innerHTML = `<p style="text-align:center;color:var(--color-mediumgray);padding:32px;">No partners listed yet.</p>`;
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="partner-card">
      <div class="partner-logo-box">
        <img src="${p.logoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'}" alt="${p.name}" class="partner-logo-img"
             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=D97706&color=fff&size=200'">
      </div>
      <div class="partner-info">
        <span class="partner-badge">${p.category || 'Ministry Partner'}</span>
        <h3 class="partner-title">${p.name}</h3>
        ${p.scriptureAnchor ? `<div class="partner-scripture">📖 ${p.scriptureAnchor}</div>` : ''}
        <p class="partner-desc">${p.description}</p>
        ${p.websiteUrl ? `
          <a href="${p.websiteUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
            🌐 Visit Website
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');
}
window.renderAboutPartners = renderAboutPartners;

// ─── THE CONVERSATION HUB ─────────────────────────────────────────────────────
let activeConvFilter = 'all';

export function setupConversationsView() {
  document.querySelectorAll('[data-conv-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-conv-filter');
      if (activeView !== 'conversations') {
        switchView('conversations');
      }
      document.querySelectorAll('#conversationFilterBar [data-conv-filter]').forEach(c => c.classList.remove('active'));
      document.querySelector(`#conversationFilterBar [data-conv-filter="${filter}"]`)?.classList.add('active');
      activeConvFilter = filter;
      renderConversationsHub(activeConvFilter);
    });
  });
}

export function renderConversationsHub(filter = 'all') {
  const featuredContainer = document.getElementById('conversationFeaturedContainer');
  const gridContainer = document.getElementById('conversationsGrid');
  const countEl = document.getElementById('convTotalCount');
  if (!gridContainer) return;

  const allEpisodes = conversations();
  if (countEl) countEl.textContent = allEpisodes.length;

  // Render Spotlight / Featured Episode
  if (featuredContainer) {
    const featured = allEpisodes.find(c => c.featured) || allEpisodes[0];
    if (featured) {
      const isUpcoming = featured.status === 'Upcoming';
      featuredContainer.innerHTML = `
        <div class="conversation-featured-card">
          <div class="conv-featured-media" onclick="${isUpcoming ? `showToast('📅 This panel discussion is in production and coming soon!')` : `window.open('${featured.youtubeUrl}','_blank')`}">
            <img src="${featured.thumbnailUrl}" alt="${featured.title}" class="conv-featured-img"
                 onerror="this.src='https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'">
            <div class="conv-featured-overlay">
              <div class="conv-featured-play-btn" title="${isUpcoming ? 'Coming Soon' : 'Watch on YouTube'}">
                ${isUpcoming ? '<span style="font-size:1.6rem;">⏳</span>' : svgPlay}
              </div>
            </div>
            <div class="conv-featured-duration">${svgClock} ${featured.duration}</div>
          </div>
          <div class="conv-featured-body">
            <div class="conv-badge-row">
              ${featured.format === 'plus' ? '<span class="conv-category-badge" style="background:#0f172a;color:#f8fafc;font-weight:700;border:1px solid rgba(255,255,255,0.2);">2-MIN PLUS • 3–15 MIN</span>' : ''}
              <span class="conv-category-badge">${featured.category}</span>
              <span class="conv-status-badge">${featured.status}</span>
              <span style="font-size:0.8rem;color:var(--color-mediumgray);">Published: ${featured.publishDate}</span>
            </div>
            <h2 class="conv-featured-title">${featured.title}</h2>
            <div class="conv-panelists">
              <span>🎙️ <strong>Panelists:</strong> ${featured.panelists}</span>
            </div>
            ${featured.scriptures ? `<div class="conv-scriptures">📖 ${featured.scriptures}</div>` : ''}
            <p class="conv-summary">${featured.summary}</p>
            <div class="conv-actions">
              ${isUpcoming ? `
                <button class="btn btn-primary" onclick="showToast('📅 Panel scheduled for ${featured.publishDate}. Follow our channel for release alerts!')">
                  🔔 Notify Me
                </button>
              ` : `
                <a href="${featured.youtubeUrl}" target="_blank" rel="noopener" class="btn btn-primary">
                  ${svgPlay} Watch Conversation
                </a>
                <button class="btn btn-secondary" onclick="window.playConversationInMiniPlayer('${featured.id}')" title="Listen in background while you browse">
                  🎧 Listen
                </button>
              `}
              <button class="btn btn-outline" onclick="window.shareConversation('${encodeURIComponent(featured.title)}','${featured.id}')">
                ${svgShare} Share
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      featuredContainer.innerHTML = '';
    }
  }

  // Filter episodes for grid
  let filtered = allEpisodes;
  if (filter === 'Upcoming') {
    filtered = allEpisodes.filter(c => c.status === 'Upcoming');
  } else if (filter === 'plus') {
    filtered = allEpisodes.filter(c => c.format === 'plus' || (c.title && c.title.toLowerCase().includes('plus')));
  } else if (filter === 'conversation') {
    filtered = allEpisodes.filter(c => c.format !== 'plus' && (!c.title || !c.title.toLowerCase().includes('plus')));
  } else if (filter && filter !== 'all') {
    filtered = allEpisodes.filter(c => c.category === filter);
  }

  if (!filtered.length) {
    gridContainer.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 24px;background:#fff;border-radius:16px;border:1px solid var(--color-lightgray);">
        <div style="font-size:2.4rem;margin-bottom:10px;">🎙️</div>
        <h3 style="font-family:var(--font-heading);margin-bottom:6px;">No Episodes in this Category</h3>
        <p style="color:var(--color-mediumgray);font-size:0.92rem;max-width:360px;margin:0 auto 16px;">More messages and round-table panels are currently in production with our preachers network.</p>
        <button class="btn btn-outline btn-sm" onclick="document.querySelector('#conversationFilterBar [data-conv-filter=\\'all\\']')?.click()">View All Episodes</button>
      </div>`;
    return;
  }

  gridContainer.innerHTML = filtered.map(c => {
    const isUpcoming = c.status === 'Upcoming';
    return `
      <div class="conversation-card">
        <div class="conv-card-thumb-wrap" onclick="${isUpcoming ? `showToast('📅 This panel is coming soon!')` : `window.open('${c.youtubeUrl}','_blank')`}">
          <img src="${c.thumbnailUrl}" alt="${c.title}" class="conv-card-thumb" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80'">
          <div class="conv-card-play-overlay">
            <div class="conv-card-play-icon">
              ${isUpcoming ? '<span style="font-size:1.1rem;">⏳</span>' : svgPlay}
            </div>
          </div>
          <span class="conv-card-duration">${c.duration}</span>
        </div>
        <div class="conv-card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
            <div style="display:flex;gap:4px;align-items:center;">
              ${c.format === 'plus' ? '<span class="conv-category-badge" style="background:#0f172a;color:#f8fafc;font-weight:700;font-size:0.68rem;padding:2px 6px;border:1px solid rgba(255,255,255,0.2);">2-MIN PLUS</span>' : ''}
              <span class="conv-category-badge" style="font-size:0.7rem;padding:2px 8px;">${c.category}</span>
            </div>
            <span class="conv-status-badge" style="font-size:0.68rem;">${c.status}</span>
          </div>
          <h3 class="conv-card-title">${c.title}</h3>
          <div class="conv-card-panelists">
            <span>👥 ${c.panelists}</span>
          </div>
          ${c.scriptures ? `<div class="conv-card-scripture">📖 ${c.scriptures}</div>` : ''}
          <p class="conv-card-desc">${c.summary}</p>
          <div class="conv-card-footer">
            <span style="font-size:0.75rem;color:var(--color-mediumgray);">${c.publishDate}</span>
            <div style="display:flex;gap:6px;">
              <a href="${c.youtubeUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-primary" style="padding:6px 12px;font-size:0.8rem;">
                ${isUpcoming ? 'Details' : 'Watch'}
              </a>
              ${!isUpcoming ? `
                <button class="btn btn-sm btn-outline" onclick="window.playConversationInMiniPlayer('${c.id}')" title="Listen in background while you browse" style="padding:6px 10px;font-size:0.8rem;">
                  🎧 Listen
                </button>
              ` : ''}
              <button class="btn btn-sm btn-outline" onclick="window.shareConversation('${encodeURIComponent(c.title)}','${c.id}')" title="Share Episode" style="padding:6px 10px;">
                ${svgShare}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  observeNewCards(gridContainer);
}
window.renderConversationsHub = renderConversationsHub;

// ─── COMMUNITY REFLECTIONS & FELLOWSHIP ───────────────────────────────────────


function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function setupCommunityReflections() {
  const form = document.getElementById('addReflectionForm');
  const authorInput = document.getElementById('reflectionAuthorInput');
  const contentInput = document.getElementById('reflectionContentInput');
  const charCountEl = document.getElementById('reflectionCharCount');

  // First-time confirmation modal elements
  const confirmModal = document.getElementById('reflectionConfirmModal');
  const confirmPreview = document.getElementById('reflectionConfirmPreview');
  const btnCancel = document.getElementById('btnCancelReflectionPost');
  const btnConfirm = document.getElementById('btnConfirmReflectionPost');
  const btnClose = document.getElementById('btnCloseReflectionConfirmModal');

  let pendingSubmission = null;

  const executePost = (author, content) => {
    const verse = getVerseForDate(getTodayDateStr());
    const verseDate = verse?.publishDate || getTodayDateStr();

    addReflection({ verseDate, author, content });
    if (form) form.reset();
    if (charCountEl) charCountEl.textContent = '0 / 500 characters';
    renderCommunityReflections();
    showToast('🕊️ Thank you! Your reflection was shared with fellowship.');
  };

  const closeConfirmModal = (focusContent = false) => {
    if (confirmModal && !confirmModal.hidden) {
      confirmModal.hidden = true;
      unlockPageScroll();
      if (focusContent && contentInput) {
        contentInput.focus();
      }
    }
    pendingSubmission = null;
  };

  const openConfirmModal = (author, content) => {
    pendingSubmission = { author, content };
    if (confirmPreview) {
      confirmPreview.innerHTML = `<strong>${escapeHtml(author)}:</strong> &ldquo;${escapeHtml(content)}&rdquo;`;
    }
    if (confirmModal) {
      lockPageScroll();
      confirmModal.hidden = false;
    }
  };

  btnCancel?.addEventListener('click', () => {
    closeConfirmModal(true);
  });

  btnClose?.addEventListener('click', () => {
    closeConfirmModal(true);
  });

  confirmModal?.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      closeConfirmModal(true);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && confirmModal && !confirmModal.hidden) {
      closeConfirmModal(true);
    }
  });

  btnConfirm?.addEventListener('click', () => {
    if (!pendingSubmission) return;
    try {
      localStorage.setItem('2ms_reflection_policy_acknowledged', '1');
    } catch {
      // ignore storage quota issues
    }
    const { author, content } = pendingSubmission;
    closeConfirmModal(false);
    executePost(author, content);
  });

  contentInput?.addEventListener('input', () => {
    const len = contentInput.value.length;
    if (charCountEl) {
      charCountEl.textContent = `${len} / 500 characters`;
      charCountEl.style.color = len >= 480 ? 'var(--color-sermon-red)' : 'var(--color-mediumgray)';
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = contentInput?.value.trim();
    if (!content) {
      showToast('⚠️ Please write a brief reflection before submitting.');
      return;
    }
    if (content.length > 500) {
      showToast('⚠️ Reflections are limited to 500 characters.');
      return;
    }
    const author = authorInput?.value.trim() || 'Fellow Believer';

    let hasAcknowledged = false;
    try {
      hasAcknowledged = localStorage.getItem('2ms_reflection_policy_acknowledged') === '1';
    } catch {
      hasAcknowledged = false;
    }

    if (!hasAcknowledged) {
      openConfirmModal(author, content);
    } else {
      executePost(author, content);
    }
  });

  window.addEventListener('2ms:reflections:updated', renderCommunityReflections);
}

export function renderCommunityReflections() {
  const container = document.getElementById('reflectionsFeedContainer');
  const countBadge = document.getElementById('reflectionsCountBadge');
  if (!container) return;

  const verse = getVerseForDate(getTodayDateStr());
  const verseDate = verse?.publishDate || getTodayDateStr();
  const list = getReflectionsForDate(verseDate);

  if (countBadge) {
    countBadge.textContent = `💬 ${list.length} Reflection${list.length === 1 ? '' : 's'}`;
  }

  if (!list.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:24px;color:var(--color-mediumgray);font-size:0.9rem;border-radius:12px;background:var(--color-offwhite);">
        Be the first to share a devotional reflection or prayer on today's scripture!
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(r => {
    const timeAgo = formatTimeAgo(r.timestamp);
    const likedKey = `2ms_liked_${r.id}`;
    const isLiked = localStorage.getItem(likedKey) === '1';

    return `
      <div class="community-reflection-item" style="padding:16px;background:var(--color-offwhite);border-radius:12px;border:1px solid rgba(0,0,0,0.06);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:30px;height:30px;border-radius:50%;background:var(--color-sermon-red);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;">
              ${(r.author || 'B')[0].toUpperCase()}
            </div>
            <strong style="font-size:0.9rem;color:#222;">${escapeHtml(r.author || 'Fellow Believer')}</strong>
          </div>
          <span style="font-size:0.78rem;color:var(--color-mediumgray);">${timeAgo}</span>
        </div>
        <p style="margin:0 0 10px;font-size:0.92rem;color:#333;line-height:1.55;white-space:pre-wrap;">${escapeHtml(r.content)}</p>
        <div style="display:flex;justify-content:flex-end;">
          <button class="btn btn-sm btn-outline" onclick="window.toggleLikeReflectionAction('${r.id}')" style="font-size:0.8rem;padding:5px 12px;gap:5px;border-radius:20px;font-weight:600;${isLiked ? 'color:var(--color-sermon-red);border-color:var(--color-sermon-red);background:rgba(198,40,40,0.06);' : ''}">
            ${isLiked ? '❤️ Liked' : '🤍 Like'} ${r.likes ? `(${r.likes})` : ''}
          </button>
        </div>
      </div>
    `;
  }).join('');
}
window.renderCommunityReflections = renderCommunityReflections;

window.toggleLikeReflectionAction = (id) => {
  toggleLikeReflection(id);
  renderCommunityReflections();
};

export function shareDailyVerse() {
  const verse = getVerseForDate(getTodayDateStr());
  if (verse) openScriptureCardModal(verse);
}
window.shareDailyVerse = shareDailyVerse;

export function shareConversation(titleEnc, id) {
  const targetId = (id !== undefined && id !== null && id !== '') ? id : titleEnc;
  const title = titleEnc ? decodeURIComponent(titleEnc) : '';
  const convList = conversations() || [];
  const c = convList.find(item => 
    String(item.id) === String(targetId) || 
    (title && item.title === title) || 
    item.title === targetId
  ) || {
    id: targetId,
    title: title || 'Theological Dialogue',
    panelists: 'Pastoral Panel',
    youtubeId: 'SJFqqNvTeh8',
    duration: '25:00',
    category: 'Theological Dialogue'
  };

  const url = `${window.location.origin}/#conversations`;
  const panelistsStr = Array.isArray(c.panelists) ? c.panelists.join(', ') : (c.panelists || 'Pastoral Panel');
  const directYt = c.youtubeUrl || (c.youtubeId ? `https://youtu.be/${c.youtubeId}` : url);
  const thumb = c.thumbnailUrl || (c.youtubeId ? `https://img.youtube.com/vi/${c.youtubeId}/hqdefault.jpg` : '/assets/logo.png');

  openVideoShareModal({
    badge: '💬 The Conversation',
    heading: 'Share Episode',
    sub: 'Share this theological dialogue with friends, study groups, and leaders.',
    title: c.title,
    speaker: `Panel: ${panelistsStr}`,
    topic: c.category || 'Theological Dialogue',
    duration: c.duration || '25:00',
    thumbnailUrl: thumb,
    youtubeId: c.youtubeId,
    url: url,
    directVideoUrl: directYt,
    formattedMessage: `💬 The Conversation: "${c.title}"\n👥 Panelists: ${panelistsStr}\n🕊️ Watch here:\n${url}\n\n▶️ Direct Video:\n${directYt}`
  });
}
window.shareConversation = shareConversation;

// ─── UTILS ────────────────────────────────────────────────────────────────────
export function showToast(msg, duration = 4000) {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  c.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}
window.showToast = showToast;

export function openVideoShareModal(video) {
  if (!video) return;
  const modal = document.getElementById('sermonShareModal');
  if (!modal) return;

  // Header dynamic labels
  const headingEl = document.getElementById('shareModalHeading');
  if (headingEl) {
    headingEl.textContent = video.heading || 'Share Video';
  }

  // Card preview
  const thumbEl = document.getElementById('shareModalThumb');
  if (thumbEl) {
    thumbEl.src = video.thumbnailUrl || (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : '/assets/logo.png');
  }
  const durEl = document.getElementById('shareModalDuration');
  if (durEl) durEl.textContent = video.duration || '2:00';
  const preacherEl = document.getElementById('shareModalPreacher');
  if (preacherEl) preacherEl.textContent = video.speaker || video.preacher || '2-Minute Sermon';
  const titleEl = document.getElementById('shareModalTitle');
  if (titleEl) titleEl.textContent = video.title || 'Video Message';
  
  const scripEl = document.getElementById('shareModalScripture');
  const dotEl = document.getElementById('shareModalDot');
  const rawMeta = video.topic || (video.scripture ? `📖 ${video.scripture}` : '');
  if (scripEl) {
    if (rawMeta) {
      scripEl.textContent = rawMeta;
      scripEl.style.display = '';
      if (dotEl) dotEl.style.display = '';
    } else {
      scripEl.style.display = 'none';
      if (dotEl) dotEl.style.display = 'none';
    }
  }

  const linkInput = document.getElementById('shareModalLinkInput');
  if (linkInput) linkInput.value = video.url || window.location.href;

  const formattedMsg = video.formattedMessage || `🎙️ "${video.title}"\n🕊️ Watch on 2-Minute Sermon:\n${video.url}\n\n▶️ Direct Video:\n${video.directVideoUrl || video.url}`;

  // WhatsApp
  const waBtn = document.getElementById('btnShareWhatsapp');
  if (waBtn) {
    waBtn.onclick = () => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMsg)}`, '_blank');
    };
  }

  // Facebook
  const fbBtn = document.getElementById('btnShareFacebook');
  if (fbBtn) {
    fbBtn.onclick = () => {
      const shareUrl = video.directVideoUrl || video.url;
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    };
  }

  // Instagram
  const igBtn = document.getElementById('btnShareInstagram');
  if (igBtn) {
    igBtn.onclick = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(formattedMsg);
      }
      showToast('📸 Link & caption copied! Opening Instagram…');
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 350);
    };
  }

  // Native Share Button
  const nativeBtn = document.getElementById('btnShareNative');
  if (nativeBtn) {
    nativeBtn.onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: `"${video.title}" | 2-Minute Sermon`,
          text: `🎙️ "${video.title}" — ${video.speaker || video.preacher || ''}`,
          url: video.url
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(formattedMsg);
        showToast('📋 Video details copied to clipboard!');
      }
    };
  }

  // Download Story Card Button
  const storyBtn = document.getElementById('btnDownloadStoryCard');
  if (storyBtn) {
    storyBtn.onclick = () => {
      generateSermonStoryCard({
        title: video.title,
        preacher: video.speaker || video.preacher,
        scripture: video.topic || video.scripture,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl,
        youtubeId: video.youtubeId
      });
    };
  }

  // Copy Link Button
  const copyLinkBtn = document.getElementById('btnCopyShareLink');
  if (copyLinkBtn) {
    copyLinkBtn.onclick = () => {
      navigator.clipboard.writeText(video.url);
      showToast('🔗 Video link copied to clipboard!');
    };
  }

  // Copy Formatted Message Button
  const copyMsgBtn = document.getElementById('btnCopyFormattedMsg');
  if (copyMsgBtn) {
    copyMsgBtn.onclick = () => {
      navigator.clipboard.writeText(formattedMsg);
      showToast('📋 Formatted video message copied for chat/SMS!');
    };
  }

  // Wire close buttons
  document.getElementById('closeSermonShareBtn')?.addEventListener('click', closeSermonShareModal, { once: true });
  modal.onclick = (e) => {
    if (e.target.id === 'sermonShareModal') closeSermonShareModal();
  };

  // Show modal
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}
window.openVideoShareModal = openVideoShareModal;

export function shareSermon(arg1, arg2) {
  // Support both shareSermon(id) and legacy shareSermon(title, id)
  const targetId = (arg2 !== undefined && arg2 !== null && arg2 !== '') ? arg2 : arg1;
  openSermonShareModal(targetId);
}
window.shareSermon = shareSermon;

export function openSermonShareModal(sermonId) {
  const sermonList = sermons() || [];
  if (!sermonList.length) return;

  const targetStr = String(sermonId || '').trim();
  const s = sermonList.find(item => 
    String(item.id) === targetStr ||
    String(item.id).toLowerCase() === targetStr.toLowerCase() ||
    String(item.id) === `sermon-${targetStr}` ||
    `sermon-${item.id}` === targetStr ||
    item.slug === targetStr ||
    item.title === targetStr ||
    item.title.toLowerCase() === targetStr.toLowerCase()
  ) || sermonList[0];

  if (!s) return;

  const cleanId = String(s.id).startsWith('sermon-') ? s.id : `sermon-${s.id}`;
  const url = `${window.location.origin}/#${cleanId}`;
  const ytDirectUrl = s.youtubeId ? `https://youtu.be/${s.youtubeId}` : (s.youtubeUrl || url);
  const thumb = s.thumbnailUrl || (s.youtubeId ? `https://img.youtube.com/vi/${s.youtubeId}/hqdefault.jpg` : '/assets/logo.png');

  openVideoShareModal({
    badge: 'Spiritual Blessing',
    heading: 'Share Sermon',
    sub: 'Spread this 2-minute message with friends, family, and fellowship groups.',
    title: s.title,
    speaker: s.preacher || s.preacherName || '2-Minute Sermon',
    topic: s.scripture ? `📖 ${s.scripture}` : (s.primarySeason || 'Daily Encouragement'),
    duration: s.duration || '2:00',
    thumbnailUrl: thumb,
    youtubeId: s.youtubeId || s.youtubeEmbedId,
    url: url,
    directVideoUrl: ytDirectUrl,
    formattedMessage: `🎙️ "${s.title}" — ${s.preacher || s.preacherName || '2-Minute Sermon'}\n📖 Scripture: ${s.scripture || 'Daily Word'}\n🕊️ Watch on 2-Minute Sermon:\n${url}\n\n▶️ Direct Video:\n${ytDirectUrl}`
  });
}
window.openSermonShareModal = openSermonShareModal;

export function sharePromoVideo() {
  const promoUrl = (typeof getSettings === 'function' ? getSettings()?.promoVideoUrl : '') || 'https://www.youtube.com/watch?v=SJFqqNvTeh8';
  let ytId = 'SJFqqNvTeh8';
  const m = promoUrl.match(/(?:youtu\.be\/|v=|\/embed\/|\/watch\?v=|\/watch\?.+&v=)([\w-]{11})/i);
  if (m) ytId = m[1];
  const directYt = `https://youtu.be/${ytId}`;
  const url = `${window.location.origin}/`;

  openVideoShareModal({
    badge: 'Official Overview',
    heading: 'Share Welcome Video',
    sub: 'Introduce others to 2-Minute Sermon — bite-sized, scripture-rooted encouragement.',
    title: 'Welcome to 2-Minute Sermon',
    speaker: 'Ministry Introduction & Vision',
    topic: 'Scriptural Encouragement Worldwide',
    duration: '2:00',
    thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
    youtubeId: ytId,
    url: url,
    directVideoUrl: directYt,
    formattedMessage: `🕊️ "Welcome to 2-Minute Sermon" — Short, scripture-rooted messages from ministers worldwide, designed for your busy daily rhythm.\n\n▶️ Watch the welcome video:\n${url}\n\n▶️ Direct Video:\n${directYt}`
  });
}
window.sharePromoVideo = sharePromoVideo;

export function closeSermonShareModal() {
  const modal = document.getElementById('sermonShareModal');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}
window.closeSermonShareModal = closeSermonShareModal;

export function generateSermonStoryCard(s) {
  const canvas = document.getElementById('sermonStoryCanvas');
  if (!canvas || !s) return;

  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  showToast('🎨 Rendering high-res Story card…');

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#090b10');
  bgGrad.addColorStop(0.5, '#131722');
  bgGrad.addColorStop(1, '#080a0e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow behind card
  const glow = ctx.createRadialGradient(W / 2, 700, 50, W / 2, 700, 650);
  glow.addColorStop(0, 'rgba(198, 40, 40, 0.28)');
  glow.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Load YouTube Thumbnail
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    drawContent(true);
  };
  img.onerror = () => {
    drawContent(false);
  };
  img.src = s.thumbnailUrl || (s.youtubeId ? `https://img.youtube.com/vi/${s.youtubeId}/hqdefault.jpg` : '/assets/logo.png');

  function drawContent(hasImg = true) {
    // Header Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('2 - M I N U T E   S E R M O N', W / 2, 160);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '500 28px sans-serif';
    ctx.fillText('SCRIPTURE & ENCOURAGEMENT WORLDWIDE', W / 2, 210);

    // Draw Thumbnail Box
    const thumbW = 900;
    const thumbH = 506; // 16:9
    const thumbX = (W - thumbW) / 2;
    const thumbY = 280;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(thumbX, thumbY, thumbW, thumbH, 28);
    ctx.clip();
    if (hasImg) {
      ctx.drawImage(img, thumbX, thumbY, thumbW, thumbH);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(thumbX, thumbY, thumbW, thumbH);
    }
    // Subtle inner vignette
    const vig = ctx.createLinearGradient(0, thumbY + 300, 0, thumbY + thumbH);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = vig;
    ctx.fillRect(thumbX, thumbY, thumbW, thumbH);
    ctx.restore();

    // Red border around thumbnail
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(thumbX, thumbY, thumbW, thumbH, 28);
    ctx.stroke();
    ctx.restore();

    // Duration badge on bottom right of thumb
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(thumbX + thumbW - 130, thumbY + thumbH - 58, 110, 42, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(s.duration || '2:00', thumbX + thumbW - 75, thumbY + thumbH - 30);

    // Preacher / Speaker Pill
    const pillY = thumbY + thumbH + 70;
    ctx.fillStyle = 'rgba(198, 40, 40, 0.2)';
    ctx.strokeStyle = 'rgba(198, 40, 40, 0.6)';
    ctx.lineWidth = 2;
    const speakerRaw = s.preacher || s.speaker || '2-Minute Sermon';
    const preacherText = `🎙️ ${speakerRaw}`.toUpperCase();
    ctx.font = 'bold 26px sans-serif';
    const pW = ctx.measureText(preacherText).width + 50;
    ctx.beginPath();
    ctx.roundRect((W - pW) / 2, pillY, pW, 52, 26);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(preacherText, W / 2, pillY + 35);

    // Sermon Title (Multiline wrap)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Georgia, serif';
    const words = (s.title || '').split(' ');
    let line = '';
    let titleY = pillY + 130;
    const maxLineW = 880;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineW && n > 0) {
        ctx.fillText(line.trim(), W / 2, titleY);
        line = words[n] + ' ';
        titleY += 68;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), W / 2, titleY);

    // Scripture / Topic Citation
    const citation = s.scripture || s.topic;
    if (citation) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'italic 34px Georgia, serif';
      ctx.fillText(`— ${citation} —`, W / 2, titleY + 75);
    }

    // Bottom Call to Action Card
    const ctaY = 1620;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(100, ctaY, W - 200, 160, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Experience Spiritual Growth in 2 Minutes', W / 2, ctaY + 65);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '24px sans-serif';
    ctx.fillText('Watch free at 2minutesermon.org', W / 2, ctaY + 115);

    // Trigger Download
    setTimeout(() => {
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const link = document.createElement('a');
        link.download = `2min-sermon-${(s.title || 'message').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-story.jpg`;
        link.href = dataUrl;
        link.click();
        showToast('📸 Story Graphic downloaded successfully!');
      } catch (err) {
        showToast('⚠️ Could not export graphic: ' + err.message);
      }
    }, 150);
  }
}
window.generateSermonStoryCard = generateSermonStoryCard;
