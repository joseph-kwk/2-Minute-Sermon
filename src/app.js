import { getSermons, upsertSermon } from './data/sermons.js';
import { getEvents, saveEvents } from './data/events.js';
import { getPreachers, savePreachers } from './data/preachers.js';
import { seasons } from './data/seasons.js';
import { topics } from './data/topics.js';
import { getDailyVerses, saveDailyVerses } from './data/dailyVerse.js';
import { getLeadershipTeam, saveLeadershipTeam } from './data/leadership.js';
import { getPartners, savePartners } from './data/partners.js';
import { getConversations, saveConversations, extractVideoId, ytThumb } from './data/conversations.js';

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

function getTodayDateStr() {
  return new Date().toISOString().split('T')[0];
}

function getVerseForDate(dateStr) {
  const list = scheduledDailyVerses();
  return list.find(v => v.publishDate === dateStr) || list[0];
}

// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  animateLogoTitle();
  setupScrollReveal();
  setupHeaderScroll();
  setupNavigation();
  setupExploreDropdown();
  setupMobileDrawer();
  setupHeroCtas();
  setupHeroVideo();
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

  renderHomeSermons();
  filterAndRenderSermons();
  renderSeasonsHub();
  renderTopicsHub();
  renderPreachersHub();
  renderConversationsHub();
  renderEventsGrid();
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
    [...word].forEach((ch, ci) => {
      const delay = baseDelay + (wi * word.length + ci) * 48;
      html += `<span class="letter" style="animation-delay:${delay}ms">${ch}</span>`;
    });
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
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      if (!targetView) return;
      if (targetView === 'admin') { openAdminPortal(); return; }
      
      const aboutTab = btn.getAttribute('data-about-tab');
      switchView(targetView);
      if (targetView === 'about' && aboutTab) {
        switchAboutTab(aboutTab);
      }
      closeDropdown();
      closeMobileDrawer();
    });
  });

  function handleRouteHash() {
    const rawHash = window.location.hash.replace('#', '');
    if (!rawHash) return;

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
  if (window.location.hash) handleRouteHash();
}

const VIEW_TITLES = {
  home: '2-Minute Sermon | Short, Scripture-Rooted Messages Worldwide',
  sermons: 'All Sermons | 2-Minute Sermon',
  seasons: 'Liturgical Seasons Hub | 2-Minute Sermon',
  topics: 'Topics & Pastoral Themes | 2-Minute Sermon',
  preachers: 'Preachers Directory | 2-Minute Sermon',
  conversations: 'The Conversation | 2-Minute Sermon',
  'daily-verse': "Today's Daily Verse | 2-Minute Sermon",
  prayers: 'Prayer Requests & Community Wall | 2-Minute Sermon',
  events: 'Upcoming Ministry Events | 2-Minute Sermon',
  about: 'About Our Ministry | 2-Minute Sermon',
  contact: 'Contact & Minister Submissions | 2-Minute Sermon'
};

export function switchView(viewId) {
  activeView = viewId;
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
    playPromoVideo();
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

// ─── LOCALHOST HERO VIDEO BACKGROUND TEST ────────────────────────────────────
function setupHeroVideo() {
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.endsWith('.localhost') ||
    window.location.hostname.match(/^192\.168\.\d+\.\d+$/) ||
    window.location.hostname.match(/^10\.\d+\.\d+\.\d+$/)
  );

  if (!isLocalhost) return;

  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;

  // Create video element (loaded only on localhost)
  const video = document.createElement('video');
  video.className = 'hero-video-bg';
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('aria-hidden', 'true');
  video.src = '/assets/hero-bg-video.mp4';

  video.addEventListener('canplay', () => {
    video.classList.add('is-playing');
  });

  // Prepend before overlay so gradient overlay remains on top
  heroSection.prepend(video);
  video.play().catch(err => {
    console.warn('Hero video autoplay prevented (user interaction might be needed):', err);
  });

  // Performance Guard: Pause video when scrolled out of view to ensure 0% lag on rest of page
  let videoInView = true;
  let videoEnabled = true;
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      videoInView = entry.isIntersecting;
      if (videoInView && videoEnabled) {
        if (video.paused) video.play().catch(() => {});
      } else {
        if (!video.paused) video.pause();
      }
    });
  }, { threshold: 0.05 });
  videoObserver.observe(heroSection);

  // ─── AMBIENT GOLDEN LIGHT PARTICLES ────────────────────────
  setupHeroParticles(heroSection, videoObserver);

  // ─── SMOOTH SCROLL PARALLAX ────────────────────────────────
  setupHeroParallax(heroSection, video);

  // Interactive toggle badge in bottom-right corner of hero
  const badge = document.createElement('button');
  badge.className = 'localhost-video-badge';
  badge.title = 'Click to toggle hero video background / static image';
  badge.innerHTML = `<span class="badge-dot"></span><span>Localhost Video: Active</span>`;

  badge.addEventListener('click', () => {
    videoEnabled = !videoEnabled;
    if (videoEnabled) {
      video.style.display = 'block';
      if (videoInView) video.play().catch(() => {});
      badge.classList.remove('is-paused');
      badge.innerHTML = `<span class="badge-dot"></span><span>Localhost Video: Active</span>`;
    } else {
      video.pause();
      video.style.display = 'none';
      badge.classList.add('is-paused');
      badge.innerHTML = `<span class="badge-dot"></span><span>Localhost Video: Paused</span>`;
    }
  });

  heroSection.appendChild(badge);
}

// ─── GOLDEN SUN-MOTE CANVAS PARTICLES ─────────────────────────────────────────
function setupHeroParticles(heroSection, sectionObserver) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles-canvas';
  heroSection.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = heroSection.offsetWidth);
  let height = (canvas.height = heroSection.offsetHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = heroSection.offsetWidth;
    height = canvas.height = heroSection.offsetHeight;
  }, { passive: true });

  const PARTICLE_COUNT = 36;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2.4 + 1.0,
    baseAlpha: Math.random() * 0.45 + 0.25,
    alphaSpeed: Math.random() * 0.02 + 0.01,
    alphaOffset: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.45) * 0.35,
    vy: -(Math.random() * 0.45 + 0.2), // gentle upward drift
    wobbleSpeed: Math.random() * 0.02 + 0.005,
    wobbleAmp: Math.random() * 1.2 + 0.4,
    color: Math.random() > 0.4 ? '251, 191, 36' : '245, 158, 11' // Amber & Gold
  }));

  let animFrameId = null;
  let isRunning = true;
  let time = 0;

  function render() {
    if (!isRunning) return;
    time += 0.02;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      p.y += p.vy;
      p.x += p.vx + Math.sin(time * p.wobbleSpeed + p.alphaOffset) * 0.25;

      // Wrap around edges seamlessly
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const currentAlpha = p.baseAlpha + Math.sin(time * p.alphaSpeed * 60 + p.alphaOffset) * 0.2;
      const safeAlpha = Math.max(0.08, Math.min(0.85, currentAlpha));

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
      gradient.addColorStop(0, `rgba(${p.color}, ${safeAlpha})`);
      gradient.addColorStop(0.5, `rgba(${p.color}, ${safeAlpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${p.color}, 0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
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
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroHeight = heroSection.offsetHeight;

        if (scrollY <= heroHeight + 50) {
          // Subtle downward parallax on video background (0.28x speed)
          if (video) {
            const videoOffset = scrollY * 0.28;
            video.style.transform = `translate3d(-50%, calc(-50% + ${videoOffset}px), 0)`;
          }

          // Gentle fade and upward shift for hero text container
          if (container) {
            const textOffset = scrollY * 0.14;
            const opacity = Math.max(0, 1 - (scrollY / (heroHeight * 0.78)));
            container.style.transform = `translate3d(0, ${textOffset}px, 0)`;
            container.style.opacity = opacity.toFixed(2);
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
let activeCardTheme = 'midnight';
let activeCardRatio = 'story'; // 'story' (9:16) or 'square' (1:1)

export function setupScriptureCardGenerator() {
  const modal = document.getElementById('scriptureCardModal');
  if (!modal) return;

  // Aspect ratio switchers
  modal.querySelectorAll('.ratio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCardRatio = btn.getAttribute('data-ratio') || 'story';
      if (activeCardVerse) renderScriptureCardToCanvas(activeCardVerse, activeCardTheme, activeCardRatio);
    });
  });

  // Theme switchers
  modal.querySelectorAll('.theme-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.theme-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCardTheme = btn.getAttribute('data-theme') || 'midnight';
      if (activeCardVerse) renderScriptureCardToCanvas(activeCardVerse, activeCardTheme, activeCardRatio);
    });
  });

  // Download High-Res PNG
  document.getElementById('cardDownloadBtn')?.addEventListener('click', () => {
    const canvas = document.getElementById('scriptureExportCanvas');
    if (!canvas || !activeCardVerse) return;

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeBook = (activeCardVerse.book || 'Scripture').replace(/\s+/g, '-');
      a.href = url;
      a.download = `2-Minute-Sermon-${safeBook}-${activeCardVerse.chapter || '1'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📥 Scripture card downloaded in high resolution!');
    }, 'image/png');
  });

  // Native Share (Mobile Instagram / WhatsApp / System Sheet)
  document.getElementById('cardNativeShareBtn')?.addEventListener('click', async () => {
    const canvas = document.getElementById('scriptureExportCanvas');
    if (!canvas || !activeCardVerse) return;

    canvas.toBlob(async blob => {
      if (!blob) return;
      const safeBook = (activeCardVerse.book || 'Scripture').replace(/\s+/g, '-');
      const file = new File([blob], `2ms-verse-${safeBook}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `${activeCardVerse.book} ${activeCardVerse.chapter}:${activeCardVerse.verse}`,
            text: `"${activeCardVerse.verseText}" — ${activeCardVerse.book} ${activeCardVerse.chapter}:${activeCardVerse.verse}\n\nShared via 2minutesermon.org`,
            files: [file]
          });
          showToast('✨ Shared successfully!');
        } catch (err) {
          // User dismissed share dialog
        }
      } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `2ms-verse-${safeBook}.png`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Image downloaded! Share it to your Instagram or WhatsApp story.');
      }
    }, 'image/png');
  });

  // Copy Image to Clipboard
  document.getElementById('cardCopyBtn')?.addEventListener('click', () => {
    const canvas = document.getElementById('scriptureExportCanvas');
    if (!canvas) return;

    canvas.toBlob(async blob => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('📋 Image copied to clipboard!');
      } catch (err) {
        showToast('⚠️ Direct image copy not supported on this browser. Try Download!');
      }
    }, 'image/png');
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

  lockPageScroll();
  modal.hidden = false;
  renderScriptureCardToCanvas(activeCardVerse, activeCardTheme, activeCardRatio);
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
const SCRIPTURE_CARD_TEMPLATES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Sanctuary',
    imageUrl: '/assets/hero-bg.jpg',
    fallbackGrad: ['#090a0f', '#12151e', '#07080b'],
    safeZone: {
      story:  { xPercent: 0.10, yPercent: 0.28, widthPercent: 0.80, heightPercent: 0.44 },
      square: { xPercent: 0.08, yPercent: 0.22, widthPercent: 0.84, heightPercent: 0.54 }
    },
    accentColor: '#f59e0b',
    badgeText: '• DAILY SCRIPTURE ENCOURAGEMENT •'
  },
  dawn: {
    id: 'dawn',
    name: 'Dawn Grace',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    fallbackGrad: ['#1e0c24', '#581c3c', '#9f1239', '#d97706'],
    safeZone: {
      story:  { xPercent: 0.10, yPercent: 0.28, widthPercent: 0.80, heightPercent: 0.44 },
      square: { xPercent: 0.08, yPercent: 0.22, widthPercent: 0.84, heightPercent: 0.54 }
    },
    accentColor: '#fbbf24',
    badgeText: '• MORNING DEVOTION •'
  },
  parchment: {
    id: 'parchment',
    name: 'Sacred Parchment',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    fallbackGrad: ['#faf4e8', '#f5ebe0', '#eedecb'],
    safeZone: {
      story:  { xPercent: 0.12, yPercent: 0.28, widthPercent: 0.76, heightPercent: 0.44 },
      square: { xPercent: 0.10, yPercent: 0.22, widthPercent: 0.80, heightPercent: 0.54 }
    },
    accentColor: '#78350f',
    badgeText: '• SCRIPTURE OF THE DAY •'
  },
  emerald: {
    id: 'emerald',
    name: 'Living Hope',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    fallbackGrad: ['#042f2e', '#064e3b', '#022c22'],
    safeZone: {
      story:  { xPercent: 0.10, yPercent: 0.28, widthPercent: 0.80, heightPercent: 0.44 },
      square: { xPercent: 0.08, yPercent: 0.22, widthPercent: 0.84, heightPercent: 0.54 }
    },
    accentColor: '#34d399',
    badgeText: '• LIVING WORD •'
  }
};

const cardImageCache = {};
let logoImgCache = null;

function getCachedCardImage(url) {
  if (!url) return Promise.resolve(null);
  if (cardImageCache[url] && cardImageCache[url].complete && cardImageCache[url].naturalWidth > 0) {
    return Promise.resolve(cardImageCache[url]);
  }
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cardImageCache[url] = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function getCachedLogo() {
  if (logoImgCache && logoImgCache.complete && logoImgCache.naturalWidth > 0) {
    return Promise.resolve(logoImgCache);
  }
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      logoImgCache = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = '/assets/logo.png';
  });
}

function fitTextInSafeZone(ctx, text, maxW, maxH, minFontSize = 24, maxFontSize = 62) {
  let fontSize = maxFontSize;
  let lines = [];
  let lineHeight = Math.round(fontSize * 1.45);
  let totalHeight = 0;

  while (fontSize >= minFontSize) {
    ctx.font = `italic 600 ${fontSize}px "Playfair Display", Georgia, serif`;
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

async function renderScriptureCardToCanvas(verse, themeId = 'midnight', ratio = 'story') {
  const canvas = document.getElementById('scriptureExportCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isStory = ratio === 'story';
  const width  = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width  = width;
  canvas.height = height;

  const tpl = SCRIPTURE_CARD_TEMPLATES[themeId] || SCRIPTURE_CARD_TEMPLATES.midnight;

  // 1. Draw Background Image or Fallback Gradient
  const bgImg = await getCachedCardImage(tpl.imageUrl);
  if (bgImg) {
    // Cover-fit image to canvas
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

    // Deep rich overlay to ensure photograph serves as atmosphere
    const imgTint = ctx.createLinearGradient(0, 0, 0, height);
    if (themeId === 'parchment') {
      imgTint.addColorStop(0, 'rgba(250, 244, 232, 0.75)');
      imgTint.addColorStop(1, 'rgba(238, 222, 203, 0.88)');
    } else {
      imgTint.addColorStop(0, 'rgba(5, 7, 12, 0.72)');
      imgTint.addColorStop(0.5, 'rgba(10, 14, 22, 0.55)');
      imgTint.addColorStop(1, 'rgba(5, 7, 12, 0.82)');
    }
    ctx.fillStyle = imgTint;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Rich fallback gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    tpl.fallbackGrad.forEach((col, idx) => {
      grad.addColorStop(idx / (tpl.fallbackGrad.length - 1), col);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
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
  const mutedTextColor   = isLight ? 'rgba(41, 37, 36, 0.75)' : 'rgba(255, 255, 255, 0.78)';

  // 5. Auto-Scaling Font Loop for Scripture Quote (The Hero Content)
  const quoteText = `"${verse.verseText}"`;
  const maxAvailableH = safeH - 80;
  const { fontSize, lines, lineHeight, totalHeight } = fitTextInSafeZone(
    ctx, quoteText, safeW - 40, maxAvailableH, 26, isStory ? 58 : 50
  );

  // Vertical centering calculation within the Safe Zone
  const contentTotalH = totalHeight + 70;
  const startY = safeY + Math.max(20, Math.round((safeH - contentTotalH) / 2)) + fontSize;

  // Set Readability Shadow on Text
  ctx.shadowColor = isLight ? 'rgba(0, 0, 0, 0.10)' : 'rgba(0, 0, 0, 0.70)';
  ctx.shadowBlur = isLight ? 4 : 14;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  // Render Scripture Quote Lines
  ctx.textAlign = 'center';
  ctx.font = `italic 600 ${fontSize}px "Playfair Display", Georgia, serif`;
  ctx.fillStyle = primaryTextColor;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, startY + (i * lineHeight));
  }

  // 6. Render Scripture Reference (Clean, Elegant, Tracked Small-Caps)
  const refY = startY + (lines.length - 1) * lineHeight + 56;
  ctx.font = '700 30px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
  ctx.fillStyle = accentTextColor;
  ctx.letterSpacing = '3px';
  ctx.shadowBlur = isLight ? 2 : 8;
  const bookRef = `${verse.book} ${verse.chapter}:${verse.verse}`.toUpperCase();
  ctx.fillText(bookRef, width / 2, refY);

  // Reset shadow for clean vector logo & imprint
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 7. Minimalist Social Media Footer Imprint (Clean, High-End Watermark)
  const footerY = isStory ? height - 140 : height - 80;
  const logo = await getCachedLogo();

  if (logo) {
    const logoSize = 44;
    const logoX = (width - logoSize) / 2;
    const logoY = footerY - 54;
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  }

  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
  ctx.fillStyle = isLight ? '#78350f' : 'rgba(255, 255, 255, 0.90)';
  ctx.letterSpacing = '2px';
  ctx.fillText('2-MINUTE SERMON', width / 2, footerY);

  ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
  ctx.fillStyle = isLight ? 'rgba(120, 53, 15, 0.65)' : 'rgba(255, 255, 255, 0.55)';
  ctx.letterSpacing = '1px';
  ctx.fillText('2minutesermon.com', width / 2, footerY + 22);
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function setupPromoVideo() {
  const posterWrap = document.getElementById('promoPosterWrap');
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

  posterWrap.style.display = 'none';
  playerWrap.hidden = false;
  playerWrap.innerHTML = `
    <iframe 
      src="https://www.youtube-nocookie.com/embed/${PROMO_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1" 
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
  container.innerHTML = sermons().slice(0, 6).map(s => createSermonCardHtml(s)).join('');
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

function createSermonCardHtml(s) {
  const isFav = savedFavorites.includes(s.id);
  return `
    <div class="sermon-card">
      <div class="sermon-thumb-wrap">
        <button class="sermon-card-fav-btn ${isFav ? 'is-favorited' : ''}" onclick="event.stopPropagation(); window.toggleSermonFavorite('${s.id}')" title="${isFav ? 'Remove from Saved' : 'Save to Devotional Queue'}" aria-label="Favorite sermon">
          ★
        </button>
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
          <button class="btn btn-outline btn-sm" onclick="window.shareSermon('${s.title}', '${s.id}')">
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

  if (topicSel)
    topicSel.innerHTML = `<option value="all">All Topics</option>` +
      topics.map(t => `<option value="${t.name}">${t.name}</option>`).join('');

  if (preachSel)
    preachSel.innerHTML = `<option value="all">All Preachers</option>` +
      preachers().map(p => `<option value="${p.name}">${p.name}</option>`).join('');

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

  let results = sermons().filter(s => {
    // Season filter
    if (activeSeasonChip !== 'all') {
      const primary   = s.primarySeason.toLowerCase().includes(activeSeasonChip);
      const secondary = s.secondarySeasons?.some(x => x.toLowerCase().includes(activeSeasonChip));
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
  const s = sermons().find(x => x.id === sermonId);
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
        <button class="btn btn-outline" onclick="window.shareSermon('${s.title}','${s.id}')">
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
    closeDropdown();
    closeMobileDrawer();
  }
});

// ─── DAILY VERSE ──────────────────────────────────────────────────────────────
export function renderDailyVerse() {
  const verse = getVerseForDate(getTodayDateStr());
  if (!verse) return;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('dvDateDisplay', verse.publishDate);
  setEl('dvQuoteDisplay', `"${verse.verseText}"`);
  setEl('dvRefDisplay', `— ${verse.book} ${verse.chapter}:${verse.verse}`);
  setEl('dvReflectionDisplay', verse.reflection);

  const full = document.getElementById('dailyVerseFullContainer');
  if (full) {
    full.innerHTML = `
      <div class="daily-verse-card" style="margin-bottom:36px;">
        <div class="verse-header">
          <span class="verse-label">Today's Scheduled Verse</span>
          <span class="verse-date">${verse.publishDate}</span>
        </div>
        <blockquote class="verse-quote">"${verse.verseText}"</blockquote>
        <div class="verse-meta">— ${verse.book} ${verse.chapter}:${verse.verse}</div>
        <p class="verse-reflection">${verse.reflection}</p>
      </div>
      <h2 style="margin-bottom:20px;">Upcoming Verse Queue</h2>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${scheduledDailyVerses().map(v => `
          <div class="hub-card reveal-on-scroll">
            <span class="badge badge-season">${v.publishDate}</span>
            <h3 style="margin:10px 0 4px;">"${v.verseText}"</h3>
            <div style="font-weight:700;color:var(--color-sermon-red);margin-bottom:6px;">— ${v.book} ${v.chapter}:${v.verse}</div>
            <p style="font-size:0.88rem;color:#777;">${v.reflection}</p>
          </div>`).join('')}
      </div>`;
    // trigger reveal for newly injected cards
    setTimeout(() => full.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed')), 100);
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
    shareBtn.addEventListener('click', () => shareDailyVerse());
  }

  const shareImgBtn = document.getElementById('dvShareImageBtn');
  if (shareImgBtn && !shareImgBtn.dataset.bound) {
    shareImgBtn.dataset.bound = 'true';
    shareImgBtn.addEventListener('click', () => {
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
    btn.addEventListener('click', () => showToast('📋 Written prayer copied!'));
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
    twitterUrl: '',
    spotifyUrl: ''
  };
}

function updateFooterSocialLinks() {
  const s = getMinistrySettings();
  
  const map = {
    youtube: normalizeUrl(s.youtubeUrl) || DEFAULT_YT_CHANNEL,
    facebook: normalizeUrl(s.facebookUrl) || DEFAULT_FB_PAGE,
    instagram: normalizeUrl(s.instagramUrl) || DEFAULT_IG_PAGE
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

// ─── ADMIN AUTH GATE ──────────────────────────────────────────────────────────
function openAdminPortal() {
  if (adminAuthenticated) { switchView('admin'); return; }

  // Render auth overlay
  const overlay = document.createElement('div');
  overlay.className = 'admin-auth-overlay';
  overlay.id = 'adminAuthOverlay';
  overlay.innerHTML = `
    <div class="admin-auth-card">
      <img src="/assets/logo.png" alt="2-Minute Sermon" class="admin-auth-logo">
      <h2 class="admin-auth-title">The Steward</h2>
      <p class="admin-auth-subtitle">Faithful management of sermons, schedules &amp; ministry content.</p>
      <form class="admin-auth-form" id="adminAuthForm">
        <input type="text" class="admin-auth-input" id="adminAuthUser" placeholder="Username" autocomplete="username" required>
        <input type="password" class="admin-auth-input" id="adminAuthPass" placeholder="Password" autocomplete="current-password" required>
        <div class="admin-auth-error" id="adminAuthError"></div>
        <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top:4px;">
          🔐 Enter The Steward
        </button>
      </form>
      <p class="admin-auth-hint">Enter your password to continue.</p>
    </div>`;

  document.body.appendChild(overlay);

  document.getElementById('adminAuthForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const pass = (document.getElementById('adminAuthPass')?.value || '').trim();
    const errEl = document.getElementById('adminAuthError');

    if (VALID_PASSWORDS.includes(pass)) {
      adminAuthenticated = true;
      overlay.style.animation = 'fadeOut 0.25s ease forwards';
      setTimeout(() => { overlay.remove(); switchView('admin'); }, 250); 
      showToast('✅ Welcome to The Steward');
    } else {
      errEl.textContent = 'Incorrect password. Please try again.';
      document.getElementById('adminAuthPass').value = '';
      document.getElementById('adminAuthPass').focus();
      const card = overlay.querySelector('.admin-auth-card');
      card.style.animation = 'none';
      requestAnimationFrame(() => { card.style.animation = 'shake 0.4s ease'; });
    }
  });
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
  document.getElementById('adminAddPreacherForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name         = document.getElementById('newPreacherName').value;
    const denomination = document.getElementById('newPreacherDenomination').value;
    const country      = document.getElementById('newPreacherCountry').value;
    const photoUrl     = document.getElementById('newPreacherPhoto').value;
    const bio          = document.getElementById('newPreacherBio').value;

    const newPreacher = {
      id: `p-${Date.now()}`, name, denomination, country, photoUrl, bio
    };

    const currentList = [...preachers(), newPreacher];
    savePreachers(currentList);
    renderPreachersHub();
    renderAdminPreachersList();
    populateDropdownFilterOptions();
    e.target.reset();

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
      <p style="font-size:0.9rem;color:#777;margin-bottom:18px;line-height:1.5;">${s.description}</p>
      <span style="font-weight:700;color:var(--color-sermon-red);font-size:0.88rem;">Browse Season →</span>
    </div>`).join('');
  observeNewCards(c);
}

function renderTopicsHub() {
  const c = document.getElementById('topicsHubGrid');
  if (!c) return;
  c.innerHTML = topics.map(t => `
    <div class="hub-card" onclick="window.filterByTopicName('${t.name}')">
      <h3 style="font-size:1.3rem;margin-bottom:8px;">${t.name}</h3>
      <p style="font-size:0.9rem;color:#777;margin-bottom:18px;line-height:1.5;">${t.description}</p>
      <span style="font-weight:700;color:var(--color-sermon-red);font-size:0.88rem;">View ${t.count} Sermons →</span>
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
  c.innerHTML = preachers().map(p => `
    <div class="hub-card text-center">
      <img src="${p.photoUrl}" alt="${p.name}" class="preacher-card-img"
           onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=C62828&color=fff&size=84'">
      <h3 style="font-size:1.2rem;margin-bottom:4px;">${p.name}</h3>
      <div style="font-size:0.8rem;color:var(--color-sermon-red);font-weight:600;margin-bottom:10px;">${p.denomination} &bull; ${p.country}</div>
      <p style="font-size:0.85rem;color:#777;margin-bottom:18px;line-height:1.5;">${p.bio}</p>
      <button class="btn btn-outline btn-sm btn-full" onclick="window.filterByPreacherName('${p.name}')">
        View Sermons
      </button>
    </div>`).join('');
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
        <span class="event-date-pill">${ev.date}${ev.time ? ` · ${ev.time}` : ''}</span>
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
    return `
      <div class="team-member-card ${isExec ? 'executive' : ''}">
        <img src="${m.photoUrl}" alt="${m.name}" class="team-avatar"
             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=C62828&color=fff&size=160'">
        <span class="team-tier-tag">${m.tier || 'Ministry Team'}</span>
        <h3 class="team-name">${m.name}</h3>
        <div class="team-role">${m.role}</div>
        ${m.bio ? `<p class="team-bio">${m.bio}</p>` : ''}
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
      document.querySelectorAll('[data-conv-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeConvFilter = chip.getAttribute('data-conv-filter');
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
  } else if (filter && filter !== 'all') {
    filtered = allEpisodes.filter(c => c.category === filter);
  }

  if (!filtered.length) {
    gridContainer.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 24px;background:#fff;border-radius:16px;border:1px solid var(--color-lightgray);">
        <div style="font-size:2.4rem;margin-bottom:10px;">🎙️</div>
        <h3 style="font-family:var(--font-heading);margin-bottom:6px;">No Conversations in this Category</h3>
        <p style="color:var(--color-mediumgray);font-size:0.92rem;max-width:360px;margin:0 auto 16px;">More round-table episodes are currently in production with our preachers network.</p>
        <button class="btn btn-outline btn-sm" onclick="document.querySelector('[data-conv-filter=\\'all\\']')?.click()">View All Episodes</button>
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
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span class="conv-category-badge" style="font-size:0.7rem;padding:2px 8px;">${c.category}</span>
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

export function shareDailyVerse() {
  const verse = getVerseForDate(getTodayDateStr());
  if (!verse) return;
  const shareTitle = `Daily Verse: ${verse.book} ${verse.chapter}:${verse.verse}`;
  const shareText = `📖 Today's Verse — ${verse.book} ${verse.chapter}:${verse.verse}\n\n"${verse.verseText}"\n\n🕊️ Reflection: ${verse.reflection}\n\n✨ Read and listen on 2-Minute Sermon:`;
  const url = `${window.location.origin}/#daily-verse`;

  if (navigator.share) {
    navigator.share({
      title: shareTitle,
      text: `${shareText}\n${url}`,
      url: url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${shareText}\n${url}`);
    showToast('🔗 Daily Verse link & scripture copied to clipboard!');
  }
}
window.shareDailyVerse = shareDailyVerse;

export function shareConversation(titleEnc, id) {
  const title = decodeURIComponent(titleEnc);
  const convList = conversations() || [];
  const c = convList.find(item => String(item.id) === String(id) || item.title === title);
  const url = `${window.location.origin}/#conversations`;

  let shareText = `💬 The Conversation: "${title}" on 2-Minute Sermon`;
  if (c) {
    const panelistsStr = Array.isArray(c.panelists) ? c.panelists.join(', ') : (c.panelists || 'Pastoral Panel');
    shareText = `💬 The Conversation: "${c.title}"\n👥 Panelists: ${panelistsStr}\n🕊️ Watch here:`;
  }

  if (navigator.share) {
    navigator.share({
      title: `The Conversation: ${title}`,
      text: `${shareText}\n${url}`,
      url: url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${shareText}\n${url}`);
    showToast(`🔗 Link copied for "${title}"`);
  }
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

export function shareSermon(title, id) {
  const sermonList = sermons() || [];
  const s = sermonList.find(item => String(item.id) === String(id));
  const url = `${window.location.origin}/#sermon-${id}`;

  let shareText = `🎙️ Watch "${title}" on 2-Minute Sermon`;
  if (s) {
    shareText = `🎙️ "${s.title}" — ${s.preacher}\n📖 Scripture: ${s.scripture}\n🕊️ Experience spiritual growth in 2 minutes:`;
  }

  if (navigator.share) {
    navigator.share({
      title: s ? `${s.title} | 2-Minute Sermon` : title,
      text: `${shareText}\n${url}`,
      url: url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${shareText}\n${url}`);
    showToast(`🔗 Link copied for "${title}"`);
  }
}
window.shareSermon = shareSermon;
