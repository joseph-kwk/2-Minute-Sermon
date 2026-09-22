/**
 * 2-MINUTE SERMON — CINEMATIC SEASONAL DECORATION MANAGER
 * High-Class, Aesthetic, Non-Intrusive Multi-Layer Canvas & Ambient System
 * Inspired by Holiday Cinematography, Gala Celebrations & Resurrection Dawn
 */

class SeasonalManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.fireworks = [];
    this.animationFrame = null;
    this.activeSeason = 'off';
    this.width = 0;
    this.height = 0;
    this.lastFireworkTime = 0;
    this.godRayAngle = 0;
  }

  init() {
    // Clean up any legacy public footer switcher element
    const oldControl = document.getElementById('seasonalFooterControl');
    if (oldControl) oldControl.remove();

    // Determine active season (Admin Panel setting or Automatic liturgical date calculation)
    this.activeSeason = this.determineSeason();
    document.body.setAttribute('data-season', this.activeSeason);

    if (this.activeSeason === 'off') {
      this.cleanup();
      this.updateHeaderBadge();
      this.updateFooterShowcase();
      return;
    }

    // Setup Canvas
    this.setupCanvas();

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this.initParticles();
      this.animate();
    }

    // Header badge, seasonal logo, favicon, scripture banner, and footer showcase
    this.updateSeasonalLogos();
    this.updateSeasonalFavicon();
    this.updateSeasonalScriptureBanner();
    this.updateHeaderBadge();
    this.updateFooterShowcase();

    // Resize listener
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Calculates season dates: Admin global control takes priority, then automatic calendar (~10 days before holiday)
   */
  determineSeason() {
    // 1. Check URL override ?season=christmas|newyear|easter|passion|off (for quick preview/testing)
    const urlParams = new URLSearchParams(window.location.search);
    let seasonParam = urlParams.get('season')?.toLowerCase();
    if (seasonParam === 'lent') seasonParam = 'passion';
    if (['christmas', 'newyear', 'easter', 'passion', 'off'].includes(seasonParam)) {
      return seasonParam;
    }

    // 2. Check Admin Panel Global Setting (controlled exclusively by ministry administrators)
    try {
      let globalSetting = localStorage.getItem('sermon_seasonal_global');
      if (globalSetting === 'lent') globalSetting = 'passion';
      if (globalSetting && ['christmas', 'newyear', 'easter', 'passion', 'off'].includes(globalSetting)) {
        return globalSetting;
      }
      const rawSettings = localStorage.getItem('2ms_settings');
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        let sMode = parsed.seasonalMode;
        if (sMode === 'lent') sMode = 'passion';
        if (sMode && ['christmas', 'newyear', 'easter', 'passion', 'off'].includes(sMode)) {
          return sMode;
        }
      }
    } catch (_) {}

    // 3. Automatic date calculation (Auto mode)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1 - 12
    const day = now.getDate();

    // Christmas Window: Dec 15 to Dec 27 (Starts 10 days before Dec 25)
    if (month === 12 && day >= 15 && day <= 27) {
      return 'christmas';
    }

    // New Year Window: Dec 22 to Jan 3 (Starts 10 days before Jan 1)
    if ((month === 12 && day >= 22) || (month === 1 && day <= 3)) {
      return 'newyear';
    }

    // Easter & Passion Holy Week Window
    const easterSunday = this.getEasterSunday(year);

    // Holy Week & Passion: Palm Sunday (7 days before Easter) through Holy Saturday (1 day before)
    const sevenDaysBeforeEaster = new Date(easterSunday);
    sevenDaysBeforeEaster.setDate(easterSunday.getDate() - 7);
    sevenDaysBeforeEaster.setHours(0, 0, 0, 0);

    const oneDayBeforeEaster = new Date(easterSunday);
    oneDayBeforeEaster.setDate(easterSunday.getDate() - 1);
    oneDayBeforeEaster.setHours(23, 59, 59, 999);

    if (now >= sevenDaysBeforeEaster && now <= oneDayBeforeEaster) {
      return 'passion';
    }

    // Easter Sunday Window: Easter Sunday through Easter Tuesday (+3 days)
    const easterStart = new Date(easterSunday);
    easterStart.setHours(0, 0, 0, 0);

    const threeDaysAfterEaster = new Date(easterSunday);
    threeDaysAfterEaster.setDate(easterSunday.getDate() + 3);
    threeDaysAfterEaster.setHours(23, 59, 59, 999);

    if (now >= easterStart && now <= threeDaysAfterEaster) {
      return 'easter';
    }

    return 'off';
  }

  /**
   * Gregorian Easter calculation (Meeus/Jones/Butcher algorithm)
   */
  getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  setupCanvas() {
    this.canvas = document.getElementById('seasonal-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'seasonal-canvas';
      document.body.prepend(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.handleResize();
  }

  handleResize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initParticles() {
    this.particles = [];
    const isMobile = this.width < 768;
    const count = isMobile ? 16 : 28; // Serene holiday snowfall — visible, beautiful, non-intrusive

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const isMobile = this.width < 768;
    const speedMult = isMobile ? 0.40 : 0.60;

    if (this.activeSeason === 'christmas') {
      // 3 Parallax Layers: 0 = foreground (soft halo), 1 = midground (crisp snowflake), 2 = background (golden frost)
      const layer = Math.random() < 0.25 ? 0 : Math.random() < 0.65 ? 1 : 2;
      return {
        layer,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: layer === 0 ? Math.random() * 2.2 + 1.8 : layer === 1 ? Math.random() * 1.5 + 1.0 : Math.random() * 1.0 + 0.5,
        speedY: (layer === 0 ? 0.75 : layer === 1 ? 0.50 : 0.30) * speedMult,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: layer === 0 ? Math.random() * 0.35 + 0.45 : layer === 1 ? Math.random() * 0.30 + 0.65 : Math.random() * 0.30 + 0.60,
        twinkle: Math.random() * 0.05
      };
    } else if (this.activeSeason === 'newyear') {
      // Champagne Stardust & Gentle Rising Sparkles
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.3 + 0.6,
        speedY: -(Math.random() * 0.45 + 0.2) * speedMult,
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.55 + 0.15,
        color: Math.random() > 0.35 ? '#F59E0B' : '#FFFFFF',
        pulse: Math.random() * 0.03
      };
    } else if (this.activeSeason === 'easter') {
      // Sunrise Grace Rays & Delicate Petal Bokeh
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 4.0 + 2.0,
        speedY: (Math.random() - 0.5) * 0.15,
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.16 + 0.06,
        color: Math.random() > 0.5 ? '#F59E0B' : '#7C3AED'
      };
    } else if (this.activeSeason === 'passion') {
      // Holy Week & Passion: Faint, solemn twilight embers / Calvary ash motes
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.8,
        speedY: -(Math.random() * 0.25 + 0.12) * speedMult,
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.28 + 0.12,
        color: Math.random() > 0.45 ? '#DC2626' : '#A8A29E', // Wounded crimson & Calvary ash
        pulse: Math.random() * 0.03
      };
    }
    return {};
  }

  animate() {
    if (!this.ctx || this.activeSeason === 'off') return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.activeSeason === 'christmas') {
      this.drawBethlehemStar();
      this.renderChristmasSnow();
    } else if (this.activeSeason === 'newyear') {
      this.renderNewYearGala();
    } else if (this.activeSeason === 'easter') {
      this.drawSunriseGodRays();
      this.renderEasterBokeh();
    } else if (this.activeSeason === 'passion') {
      this.renderPassionShadows();
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  renderPassionShadows() {
    for (let p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color === '#DC2626'
        ? `rgba(185, 28, 28, ${p.opacity})`
        : `rgba(168, 162, 158, ${p.opacity})`;
      this.ctx.fill();

      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
    }
  }

  /**
   * Draw Bethlehem Star flare in top right
   */
  drawBethlehemStar() {
    const starX = this.width * (this.width > 768 ? 0.85 : 0.80);
    const starY = 70;
    const time = Date.now() * 0.0015;
    const pulse = Math.sin(time) * 0.15 + 0.85;

    // Outer Aura
    const aura = this.ctx.createRadialGradient(starX, starY, 0, starX, starY, 60 * pulse);
    aura.addColorStop(0, 'rgba(255, 240, 200, 0.45)');
    aura.addColorStop(0.3, 'rgba(245, 158, 11, 0.15)');
    aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
    this.ctx.fillStyle = aura;
    this.ctx.beginPath();
    this.ctx.arc(starX, starY, 60 * pulse, 0, Math.PI * 2);
    this.ctx.fill();

    // 4-Point Star Rays
    this.ctx.save();
    this.ctx.translate(starX, starY);
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * pulse})`;
    this.ctx.lineWidth = 1.5;

    // Vertical ray
    this.ctx.beginPath();
    this.ctx.moveTo(0, -35 * pulse);
    this.ctx.lineTo(0, 35 * pulse);
    this.ctx.stroke();

    // Horizontal ray
    this.ctx.beginPath();
    this.ctx.moveTo(-35 * pulse, 0);
    this.ctx.lineTo(35 * pulse, 0);
    this.ctx.stroke();

    // Diagonal rays
    this.ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 * pulse})`;
    this.ctx.beginPath();
    this.ctx.moveTo(-18 * pulse, -18 * pulse);
    this.ctx.lineTo(18 * pulse, 18 * pulse);
    this.ctx.moveTo(18 * pulse, -18 * pulse);
    this.ctx.lineTo(-18 * pulse, 18 * pulse);
    this.ctx.stroke();

    // Core Star Center
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 3.5 * pulse, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  renderChristmasSnow() {
    for (let p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      if (p.layer === 0) {
        // Soft foreground blur snow
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      } else if (p.layer === 1) {
        // Midground snowflake
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      } else {
        // Twinkling background gold/white frost spark
        const twinkleOp = p.opacity + Math.sin(Date.now() * p.twinkle) * 0.2;
        this.ctx.fillStyle = `rgba(245, 215, 160, ${Math.max(0.1, twinkleOp)})`;
      }
      this.ctx.fill();

      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.01) * p.speedX;

      if (p.y > this.height + 10) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }
    }
  }

  renderNewYearGala() {
    const now = Date.now();

    // Render Champagne Particles
    for (let p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color === '#FFFFFF' 
        ? `rgba(255, 255, 255, ${p.opacity})` 
        : `rgba(245, 158, 11, ${p.opacity})`;
      this.ctx.fill();

      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
    }

    // Spawn subtle fireworks burst occasionally (every 7.5s, calm and serene)
    if (now - this.lastFireworkTime > 7500) {
      this.lastFireworkTime = now;
      this.spawnFirework();
    }

    // Render active fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      for (let spark of fw.sparks) {
        this.ctx.beginPath();
        this.ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${spark.r}, ${spark.g}, ${spark.b}, ${spark.life})`;
        this.ctx.fill();

        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.025; // gentle gravity
        spark.life -= 0.018;
      }
      if (fw.sparks[0]?.life <= 0) {
        this.fireworks.splice(i, 1);
      }
    }
  }

  spawnFirework() {
    const fwX = Math.random() * (this.width * 0.7) + (this.width * 0.15);
    const fwY = Math.random() * (this.height * 0.28) + 70;
    const sparks = [];
    const colorType = Math.random();
    const SPARK_COUNT = 12;

    for (let i = 0; i < SPARK_COUNT; i++) {
      const angle = (Math.PI * 2 / SPARK_COUNT) * i;
      const speed = Math.random() * 1.3 + 0.7;
      sparks.push({
        x: fwX,
        y: fwY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 1.1 + 0.6,
        r: colorType > 0.5 ? 245 : 255,
        g: colorType > 0.5 ? 158 : 223,
        b: colorType > 0.5 ? 11 : 0,
        life: 0.9
      });
    }
    this.fireworks.push({ sparks });
  }

  drawSunriseGodRays() {
    this.godRayAngle += 0.001;
    const sunX = this.width * 0.15;
    const sunY = 50;

    const rayGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, this.width * 0.7);
    rayGradient.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
    rayGradient.addColorStop(0.4, 'rgba(124, 58, 237, 0.05)');
    rayGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = rayGradient;
    this.ctx.beginPath();
    this.ctx.arc(sunX, sunY, this.width * 0.7, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderEasterBokeh() {
    for (let p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color === '#F59E0B'
        ? `rgba(245, 158, 11, ${p.opacity})`
        : `rgba(124, 58, 237, ${p.opacity})`;
      this.ctx.fill();

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < -10 || p.x > this.width + 10) p.speedX *= -1;
      if (p.y < -10 || p.y > this.height + 10) p.speedY *= -1;
    }
  }

  updateHeaderBadge() {
    const navLogo = document.querySelector('.navbar .nav-logo') || document.querySelector('.navbar .container');
    if (!navLogo) return;

    let badge = document.getElementById('seasonalHeaderBadge');
    if (!badge && this.activeSeason !== 'off') {
      badge = document.createElement('span');
      badge.id = 'seasonalHeaderBadge';
      badge.className = 'seasonal-badge';
      navLogo.appendChild(badge);
    }

    if (badge) {
      if (this.activeSeason === 'christmas') {
        badge.innerHTML = '⭐ Christmas Season';
      } else if (this.activeSeason === 'newyear') {
        badge.innerHTML = '✨ Grace in the New Year';
      } else if (this.activeSeason === 'easter') {
        badge.innerHTML = '✝️ He is Risen';
      } else if (this.activeSeason === 'passion') {
        badge.innerHTML = '✝️ Holy Week • The Passion';
      } else {
        badge.remove();
      }
    }
  }

  /**
   * Renders a rich festive display in the footer showcase during active holidays
   */
  updateFooterShowcase() {
    const container = document.getElementById('seasonalFooterShowcase');
    if (!container) return;

    if (this.activeSeason === 'christmas') {
      container.hidden = false;
      container.innerHTML = `
        <div class="seasonal-showcase-pill">⭐ Christmas Season of Grace</div>
        <h3 class="seasonal-showcase-title">Joy to the World — Celebrating the Nativity</h3>
        <blockquote class="seasonal-showcase-quote">
          “For unto us a Child is born, unto us a Son is given; and the government will be upon His shoulder. And His name will be called Wonderful, Counselor, Mighty God, Everlasting Father, Prince of Peace.”
        </blockquote>
        <span class="seasonal-showcase-ref">— Isaiah 9:6</span>
      `;
    } else if (this.activeSeason === 'newyear') {
      container.hidden = false;
      container.innerHTML = `
        <div class="seasonal-showcase-pill">✨ Grace in the New Year</div>
        <h3 class="seasonal-showcase-title">Walking in Faith &amp; New Beginnings</h3>
        <blockquote class="seasonal-showcase-quote">
          “Behold, I make all things new... I will give of the fountain of the water of life freely to him who thirsts.”
        </blockquote>
        <span class="seasonal-showcase-ref">— Revelation 21:5–6</span>
      `;
    } else if (this.activeSeason === 'passion') {
      container.hidden = false;
      container.innerHTML = `
        <div class="calvary-crosses-wrap">
          <svg class="calvary-crosses-svg" viewBox="0 0 320 90" width="280" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Three Crosses on Calvary Hill">
            <defs>
              <radialGradient id="crossAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#DC2626" stop-opacity="0.65" />
                <stop offset="55%" stop-color="#6B21A8" stop-opacity="0.30" />
                <stop offset="100%" stop-color="#000" stop-opacity="0" />
              </radialGradient>
            </defs>
            <circle cx="160" cy="38" r="28" fill="url(#crossAura)" />
            <path d="M0 90 Q80 62 160 60 Q240 62 320 90 L320 90 L0 90 Z" fill="#0C0D14" />
            <!-- Left Cross -->
            <g transform="translate(100, 36) rotate(-2 0 0)">
              <rect x="-2" y="0" width="4" height="42" rx="1.5" fill="#1C1924" />
              <rect x="-11" y="9" width="22" height="3.5" rx="1.5" fill="#1C1924" />
            </g>
            <!-- Right Cross -->
            <g transform="translate(220, 36) rotate(2 0 0)">
              <rect x="-2" y="0" width="4" height="42" rx="1.5" fill="#1C1924" />
              <rect x="-11" y="9" width="22" height="3.5" rx="1.5" fill="#1C1924" />
            </g>
            <!-- Center Cross of Christ -->
            <g transform="translate(160, 16)">
              <rect x="-3" y="0" width="6" height="64" rx="2" fill="#090A0F" />
              <rect x="-5" y="2" width="10" height="3.5" rx="1" fill="#1C1924" />
              <rect x="-18" y="14" width="36" height="5" rx="2" fill="#090A0F" />
            </g>
          </svg>
        </div>
        <div class="seasonal-showcase-pill">✝️ Holy Week • The Passion &amp; Sacrifice</div>
        <h3 class="seasonal-showcase-title">It Is Finished — The Sacred Lamb of God</h3>
        <blockquote class="seasonal-showcase-quote">
          “He was pierced for our transgressions, He was crushed for our iniquities; the punishment that brought us peace was on Him, and by His wounds we are healed.”
        </blockquote>
        <span class="seasonal-showcase-ref">— Isaiah 53:5</span>
      `;
    } else if (this.activeSeason === 'easter') {
      container.hidden = false;
      container.innerHTML = `
        <div class="seasonal-showcase-pill">✝️ Holy Easter Resurrection</div>
        <h3 class="seasonal-showcase-title">He is Risen — Victory Over the Grave</h3>
        <blockquote class="seasonal-showcase-quote">
          “I am the resurrection and the life. He who believes in Me, though he may die, he shall live.”
        </blockquote>
        <span class="seasonal-showcase-ref">— John 11:25</span>
      `;
    } else {
      container.hidden = true;
      container.innerHTML = '';
    }
  }

  updateSeasonalLogos() {
    // 1. Swap all logo images across main site and admin portal
    const logos = document.querySelectorAll('.logo-img-main, .footer-logo, .admin-auth-logo, .admin-sidebar-logo, img[src*="logo.png"]');
    logos.forEach(logo => {
      if (!logo.dataset.defaultSrc) {
        logo.dataset.defaultSrc = logo.getAttribute('src');
      }
      if (this.activeSeason === 'christmas') {
        logo.src = '/assets/logo-christmas.png';
      } else {
        logo.src = logo.dataset.defaultSrc;
      }
    });

    // 2. Swap social share meta preview cards (OpenGraph & Twitter)
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      if (!ogImage.dataset.defaultContent) ogImage.dataset.defaultContent = ogImage.content;
      ogImage.content = this.activeSeason === 'christmas' ? '/assets/logo-christmas.png' : ogImage.dataset.defaultContent;
    }
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      if (!twitterImage.dataset.defaultContent) twitterImage.dataset.defaultContent = twitterImage.content;
      twitterImage.content = this.activeSeason === 'christmas' ? '/assets/logo-christmas.png' : twitterImage.dataset.defaultContent;
    }
  }

  updateSeasonalFavicon() {
    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!faviconLink) return;
    if (!faviconLink.dataset.defaultHref) {
      faviconLink.dataset.defaultHref = faviconLink.getAttribute('href');
    }

    if (this.activeSeason === 'christmas') {
      faviconLink.href = '/assets/logo-christmas.png';
    } else {
      faviconLink.href = faviconLink.dataset.defaultHref;
    }
  }

  updateSeasonalScriptureBanner() {
    const header = document.querySelector('header') || document.querySelector('.navbar');
    if (!header) return;

    let banner = document.getElementById('seasonalScriptureBanner');
    if (!banner && this.activeSeason !== 'off') {
      banner = document.createElement('div');
      banner.id = 'seasonalScriptureBanner';
      banner.className = 'seasonal-scripture-banner';
      header.parentNode.insertBefore(banner, header);
    }

    if (banner) {
      if (this.activeSeason === 'christmas') {
        banner.innerHTML = '✨ <em>"For unto us a Child is born, unto us a Son is given..."</em> — Isaiah 9:6';
      } else if (this.activeSeason === 'newyear') {
        banner.innerHTML = '✨ <em>"See, I am doing a new thing! Now it springs up; do you not perceive it?"</em> — Isaiah 43:19';
      } else if (this.activeSeason === 'passion') {
        banner.innerHTML = '✝️ <em>"He was pierced for our transgressions, He was crushed for our iniquities..."</em> — Isaiah 53:5';
      } else if (this.activeSeason === 'easter') {
        banner.innerHTML = '✝️ <em>"He is not here; He has risen, just as He said!"</em> — Matthew 28:6';
      } else {
        banner.remove();
      }
    }
  }

  cleanup() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    const logos = document.querySelectorAll('.logo-img-main, .footer-logo, .admin-auth-logo, .admin-sidebar-logo, img[src*="logo.png"]');
    logos.forEach(logo => {
      if (logo.dataset.defaultSrc) {
        logo.src = logo.dataset.defaultSrc;
      }
    });
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.dataset.defaultContent) {
      ogImage.content = ogImage.dataset.defaultContent;
    }
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.dataset.defaultContent) {
      twitterImage.content = twitterImage.dataset.defaultContent;
    }
    const faviconLink = document.querySelector('link[rel="icon"]');
    if (faviconLink && faviconLink.dataset.defaultHref) {
      faviconLink.href = faviconLink.dataset.defaultHref;
    }
    const banner = document.getElementById('seasonalScriptureBanner');
    if (banner) {
      banner.remove();
    }
    const showcase = document.getElementById('seasonalFooterShowcase');
    if (showcase) {
      showcase.hidden = true;
      showcase.innerHTML = '';
    }
    document.body.removeAttribute('data-season');
  }
}

// Auto-initialize on DOMReady
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.seasonalManager = new SeasonalManager();
    window.seasonalManager.init();
  });
} else {
  window.seasonalManager = new SeasonalManager();
  window.seasonalManager.init();
}
