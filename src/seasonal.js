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
    this.isListening = false;
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

    // New Year Celebration Ceremony (Dec 31 to Jan 1 first landing)
    this.newYearCeremony = new NewYearCeremony(this);
    this.newYearCeremony.init();

    // Attach listeners once
    if (!this.isListening) {
      this.isListening = true;
      window.addEventListener('resize', () => this.handleResize());
      window.addEventListener('storage', (e) => {
        if (e.key === 'sermon_seasonal_global' || e.key === '2ms_settings') {
          this.init();
        }
      });
      window.addEventListener('2ms:settings:updated', () => {
        this.init();
      });
    }
  }

  /**
   * Calculates season dates: Admin global control takes priority, then automatic calendar
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

    // Christmas Window: Dec 15 to Dec 27 (Starts 10 days before Dec 25, extends through Dec 27)
    if (month === 12 && day >= 15 && day <= 27) {
      return 'christmas';
    }

    // New Year Window: Dec 28 to Jan 5 (Smoothly takes over after Christmas through the first week of the new year)
    if ((month === 12 && day >= 28) || (month === 1 && day <= 5)) {
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

    // Easter Resurrection Season Window: Easter Sunday through the following Sunday (Full Easter Octave / Week)
    const easterStart = new Date(easterSunday);
    easterStart.setHours(0, 0, 0, 0);

    const sevenDaysAfterEaster = new Date(easterSunday);
    sevenDaysAfterEaster.setDate(easterSunday.getDate() + 7);
    sevenDaysAfterEaster.setHours(23, 59, 59, 999);

    if (now >= easterStart && now <= sevenDaysAfterEaster) {
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
    const navLogo = document.querySelector('.brand-logo') || document.querySelector('.header-container');
    if (!navLogo) return;

    let badge = document.getElementById('seasonalHeaderBadge');
    if (this.activeSeason === 'off') {
      if (badge) badge.remove();
      return;
    }

    if (!badge) {
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
        <div class="seasonal-showcase-svg-wrap">
          <svg class="seasonal-showcase-svg" viewBox="0 0 340 85" width="300" height="75" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bethlehem Star and Caravans">
            <defs>
              <radialGradient id="bethlehemAura" cx="80%" cy="25%" r="45%">
                <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.8" />
                <stop offset="35%" stop-color="#F59E0B" stop-opacity="0.35" />
                <stop offset="100%" stop-color="#000" stop-opacity="0" />
              </radialGradient>
            </defs>
            <circle cx="270" cy="22" r="24" fill="url(#bethlehemAura)" />
            <g transform="translate(270, 22)">
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
              <line x1="-9" y1="-9" x2="9" y2="9" stroke="#FDE68A" stroke-width="1.2" stroke-linecap="round" />
              <line x1="9" y1="-9" x2="-9" y2="9" stroke="#FDE68A" stroke-width="1.2" stroke-linecap="round" />
              <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
            </g>
            <path d="M0 85 Q75 62 165 72 Q250 82 340 68 L340 85 L0 85 Z" fill="#0C1412" />
            <!-- Camel 1 (Lead) -->
            <g transform="translate(180, 52) scale(0.48)">
              <path d="M10 25 Q12 18 18 12 Q24 6 28 8 Q32 10 30 16 Q28 20 25 24 Q30 20 38 20 Q44 20 48 26 Q52 30 50 40 L50 62 L46 62 L46 44 L38 44 L38 62 L34 62 L34 40 L26 40 L24 62 L20 62 L22 36 L15 36 L12 62 L8 62 L10 25 Z" fill="#050907" />
              <circle cx="34" cy="18" r="4.5" fill="#050907" />
            </g>
            <!-- Camel 2 -->
            <g transform="translate(130, 55) scale(0.44)">
              <path d="M10 25 Q12 18 18 12 Q24 6 28 8 Q32 10 30 16 Q28 20 25 24 Q30 20 38 20 Q44 20 48 26 Q52 30 50 40 L50 62 L46 62 L46 44 L38 44 L38 62 L34 62 L34 40 L26 40 L24 62 L20 62 L22 36 L15 36 L12 62 L8 62 L10 25 Z" fill="#050907" />
              <circle cx="34" cy="18" r="4.5" fill="#050907" />
            </g>
            <!-- Camel 3 -->
            <g transform="translate(85, 58) scale(0.40)">
              <path d="M10 25 Q12 18 18 12 Q24 6 28 8 Q32 10 30 16 Q28 20 25 24 Q30 20 38 20 Q44 20 48 26 Q52 30 50 40 L50 62 L46 62 L46 44 L38 44 L38 62 L34 62 L34 40 L26 40 L24 62 L20 62 L22 36 L15 36 L12 62 L8 62 L10 25 Z" fill="#050907" />
              <circle cx="34" cy="18" r="4.5" fill="#050907" />
            </g>
          </svg>
        </div>
        <div class="seasonal-showcase-pill">⭐ Christmas Season of Grace</div>
        <h3 class="seasonal-showcase-title">Joy to the World — Celebrating the Nativity</h3>
        <blockquote class="seasonal-showcase-quote">
          “For unto us a Child is born, unto us a Son is given; and the government will be upon His shoulder. And His name will be called Wonderful, Counselor, Mighty God, Everlasting Father, Prince of Peace.”
        </blockquote>
        <span class="seasonal-showcase-ref">— Isaiah 9:6</span>
      `;
    } else if (this.activeSeason === 'newyear') {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      let outgoingYear, incomingYear;
      if (month === 12 && now.getDate() === 31) {
        outgoingYear = year;
        incomingYear = year + 1;
      } else if (month === 1 && now.getDate() === 1) {
        incomingYear = year;
        outgoingYear = year - 1;
      } else {
        if (month >= 7) {
          outgoingYear = year;
          incomingYear = year + 1;
        } else {
          outgoingYear = year - 1;
          incomingYear = year;
        }
      }

      container.hidden = false;
      container.innerHTML = `
        <div class="ny-footer-crossover-wrap">
          <div class="ny-footer-years-row">
            <div class="ny-footer-year-col out">
              <span class="ny-footer-col-label">Bidding Farewell</span>
              <span class="ny-footer-col-digit">${outgoingYear}</span>
              <span class="ny-footer-col-desc">Faithful In Every Trial</span>
            </div>
            
            <div class="ny-footer-crossover-center">
              <div class="ny-footer-sparkle-icon">✨</div>
              <div class="ny-footer-arrow-line">
                <span class="line-dot"></span>
                <span class="line-bar"></span>
                <svg class="line-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
              <span class="ny-footer-crossover-tag">SACRED CROSSOVER</span>
            </div>

            <div class="ny-footer-year-col in">
              <span class="ny-footer-col-label">Stepping Into</span>
              <span class="ny-footer-col-digit">${incomingYear}</span>
              <span class="ny-footer-col-desc">Walking In Divine Favor</span>
            </div>
          </div>

          <div class="seasonal-showcase-svg-wrap ny-footer-skyline-wrap">
            <svg class="seasonal-showcase-svg" viewBox="0 0 360 80" width="320" height="70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="New Year Transition Stardust Bridge">
              <defs>
                <linearGradient id="nyBridgeGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stop-color="#A8A29E" stop-opacity="0.3" />
                  <stop offset="50%" stop-color="#F59E0B" stop-opacity="0.9" />
                  <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.8" />
                </linearGradient>
                <radialGradient id="nyRightSunburst" cx="80%" cy="30%" r="50%">
                  <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.8" />
                  <stop offset="40%" stop-color="#F59E0B" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#000" stop-opacity="0" />
                </radialGradient>
              </defs>
              <path d="M40 75 Q180 15 320 75" stroke="url(#nyBridgeGrad)" stroke-width="1.8" stroke-dasharray="4 4" fill="none" />
              <circle cx="65" cy="52" r="3" fill="#E2E8F0" opacity="0.7" />
              <circle cx="95" cy="38" r="2" fill="#E2E8F0" opacity="0.5" />
              <circle cx="180" cy="22" r="14" fill="rgba(245,158,11,0.2)" />
              <circle cx="180" cy="22" r="3.5" fill="#FFFFFF" />
              <line x1="180" y1="10" x2="180" y2="34" stroke="#FDE68A" stroke-width="1.2" />
              <line x1="168" y1="22" x2="192" y2="22" stroke="#FDE68A" stroke-width="1.2" />
              <circle cx="285" cy="28" r="24" fill="url(#nyRightSunburst)" />
              <g transform="translate(285, 28)">
                <line x1="0" y1="-16" x2="0" y2="16" stroke="#FFFFFF" stroke-width="1.4" />
                <line x1="-16" y1="0" x2="16" y2="0" stroke="#FFFFFF" stroke-width="1.4" />
                <line x1="-10" y1="-10" x2="10" y2="10" stroke="#F59E0B" stroke-width="1.1" />
                <line x1="10" y1="-10" x2="-10" y2="10" stroke="#F59E0B" stroke-width="1.1" />
                <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
              </g>
              <path d="M0 80 L35 80 L35 68 L48 68 L48 80 L95 80 L95 62 L105 52 L115 62 L115 80 L155 80 L165 42 L170 34 L175 42 L185 80 L225 80 L225 64 L235 55 L245 64 L245 80 L290 80 L290 72 L302 72 L302 80 L360 80 Z" fill="#0C0E14" />
            </svg>
          </div>
        </div>

        <div class="seasonal-showcase-pill">✨ The Sacred Crossover • ${outgoingYear} ➔ ${incomingYear}</div>
        <h3 class="seasonal-showcase-title">Walking in Faith &amp; New Beginnings</h3>
        <blockquote class="seasonal-showcase-quote">
          “Forget the former things; do not dwell on the past. See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.”
        </blockquote>
        <span class="seasonal-showcase-ref">— Isaiah 43:18–19</span>
      `;
    } else if (this.activeSeason === 'passion') {
      container.hidden = false;
      container.innerHTML = `
        <div class="seasonal-showcase-svg-wrap calvary-crosses-wrap">
          <svg class="seasonal-showcase-svg calvary-crosses-svg" viewBox="0 0 320 90" width="280" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Three Crosses on Calvary Hill">
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
        <div class="seasonal-showcase-svg-wrap">
          <svg class="seasonal-showcase-svg" viewBox="0 0 340 85" width="300" height="75" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="The Empty Tomb of Christ">
            <defs>
              <radialGradient id="tombDawnGlow" cx="48%" cy="56%" r="48%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
                <stop offset="35%" stop-color="#FDE68A" stop-opacity="0.65" />
                <stop offset="65%" stop-color="#F59E0B" stop-opacity="0.30" />
                <stop offset="100%" stop-color="#7C3AED" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="easterDawnSky" cx="50%" cy="30%" r="55%">
                <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.4" />
                <stop offset="50%" stop-color="#7C3AED" stop-opacity="0.15" />
                <stop offset="100%" stop-color="#000" stop-opacity="0" />
              </radialGradient>
            </defs>
            <circle cx="170" cy="35" r="40" fill="url(#easterDawnSky)" />
            <path d="M0 85 Q70 65 140 70 L140 85 Z" fill="#0F1018" />
            <g transform="translate(60, 50) scale(0.4)">
              <rect x="-1" y="0" width="2" height="18" fill="#1C1A28" />
              <rect x="-5" y="4" width="10" height="2" fill="#1C1A28" />
              <rect x="19" y="-6" width="3" height="26" fill="#1C1A28" />
              <rect x="13" y="0" width="15" height="2.5" fill="#1C1A28" />
              <rect x="39" y="0" width="2" height="18" fill="#1C1A28" />
              <rect x="35" y="4" width="10" height="2" fill="#1C1A28" />
            </g>
            <path d="M110 85 Q160 38 240 50 Q290 58 340 85 L340 85 L110 85 Z" fill="#11131E" />
            <path d="M165 60 L130 30 M165 60 L145 20 M165 60 L170 15 M165 60 L195 20 M165 60 L210 32" stroke="#FDE68A" stroke-width="1.2" stroke-opacity="0.6" stroke-dasharray="2 3" />
            <ellipse cx="172" cy="62" rx="16" ry="20" fill="url(#tombDawnGlow)" />
            <ellipse cx="172" cy="63" rx="13" ry="17" fill="#FFFBEB" />
            <path d="M166 69 Q172 67 178 69" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round" />
            <ellipse cx="198" cy="64" rx="14" ry="18" fill="#1E2130" stroke="#2D3247" stroke-width="1.5" />
            <ellipse cx="196" cy="63" rx="10" ry="14" fill="#282D42" />
          </svg>
        </div>
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
    const badge = document.getElementById('seasonalHeaderBadge');
    if (badge) {
      badge.remove();
    }
    if (this.newYearCeremony) {
      this.newYearCeremony.dismiss();
    }
    const showcase = document.getElementById('seasonalFooterShowcase');
    if (showcase) {
      showcase.hidden = true;
      showcase.innerHTML = '';
    }
    document.body.removeAttribute('data-season');
  }
}

/**
 * --------------------------------------------------------------------------
 * NEW YEAR TRANSITION CEREMONY
 * Floating Hero Celebration (Dec 31 to Jan 1)
 * Floats gently on top of the hero section showing the outgoing year,
 * dissolves into celestial stardust, launches a radiant confetti shower
 * over the hero, emerges the incoming new year, and then smoothly disappears!
 * Triggers on first landing during transition days (or via URL preview).
 * --------------------------------------------------------------------------
 */
class NewYearCeremony {
  constructor(manager) {
    this.manager = manager;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.confetti = [];
    this.animFrame = null;
    this.isActive = false;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.autoDismissTimer = null;
    this.resizeHandler = null;
  }

  init() {
    if (!this.shouldTrigger()) return;

    // 400ms delay after page settles
    setTimeout(() => {
      this.mount();
    }, 400);
  }

  shouldTrigger() {
    const urlParams = new URLSearchParams(window.location.search);
    const forcePreview = urlParams.get('ceremony') === '1' ||
                         urlParams.get('ny_ceremony') === '1' ||
                         urlParams.get('test_ny') === '1' ||
                         (urlParams.get('season') === 'newyear' && urlParams.get('welcome') === '1');

    if (forcePreview) return true;

    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    const year = now.getFullYear();

    // Active strictly on Dec 31 and Jan 1
    const isTransitionDay = (month === 12 && day === 31) || (month === 1 && day === 1);
    if (!isTransitionDay) return false;

    const incomingYear = (month === 12 && day === 31) ? year + 1 : year;
    const storageKey = `2ms_ny_ceremony_${incomingYear}`;

    try {
      if (localStorage.getItem(storageKey) === 'seen') {
        return false;
      }
    } catch (_) {}

    return true;
  }

  getYears() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();

    let outgoingYear, incomingYear;
    if (month === 12 && day === 31) {
      outgoingYear = year;
      incomingYear = year + 1;
    } else if (month === 1 && day === 1) {
      incomingYear = year;
      outgoingYear = year - 1;
    } else {
      // Testing/preview: if in latter half of year (like 2026), transition 2026 -> 2027
      if (month >= 7) {
        outgoingYear = year;
        incomingYear = year + 1;
      } else {
        outgoingYear = year - 1;
        incomingYear = year;
      }
    }
    return { outgoingYear, incomingYear };
  }

  markSeen() {
    const { incomingYear } = this.getYears();
    try {
      localStorage.setItem(`2ms_ny_ceremony_${incomingYear}`, 'seen');
    } catch (_) {}
  }

  mount() {
    if (this.isActive || document.getElementById('nyHeroFloatingCeremony')) return;
    this.isActive = true;
    this.markSeen();

    const heroSection = document.querySelector('.hero-section') || document.getElementById('mainContent') || document.body;
    const { outgoingYear, incomingYear } = this.getYears();
    const now = new Date();
    const isNewYearDay = (now.getMonth() === 0 && now.getDate() === 1);
    const displayYear = isNewYearDay ? incomingYear : outgoingYear;

    // 1. Confetti Canvas over the Hero
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'nyHeroConfettiCanvas';
    this.canvas.className = 'ny-hero-confetti-canvas';
    heroSection.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas(heroSection);

    // 2. Floating Year Pop-up Container (Just that year, floating on top of hero in confetti style)
    this.container = document.createElement('div');
    this.container.id = 'nyHeroFloatingCeremony';
    this.container.className = 'ny-hero-floating-ceremony pop-in';

    this.container.innerHTML = `
      <div class="ny-float-aura"></div>
      <div class="ny-float-year-box">
        <span class="ny-float-digit single-year" id="nyFloatingYear">${displayYear}</span>
      </div>
    `;

    heroSection.appendChild(this.container);

    this.resizeHandler = () => this.resizeCanvas(heroSection);
    window.addEventListener('resize', this.resizeHandler);

    this.runSequence();
  }

  resizeCanvas(heroSection) {
    if (!this.canvas) return;
    const parent = heroSection || this.canvas.parentElement;
    this.canvas.width = parent ? parent.clientWidth : window.innerWidth;
    this.canvas.height = parent ? parent.clientHeight : window.innerHeight;
  }

  runSequence() {
    const digit = document.getElementById('nyFloatingYear');

    // 1. Confetti cannon burst immediately as the year pops up
    setTimeout(() => {
      if (!this.isActive) return;
      this.launchConfetti();
    }, 150);

    // 2. Second festive flutter burst at 1.2s
    setTimeout(() => {
      if (!this.isActive) return;
      this.launchConfetti();
    }, 1200);

    if (this.isReducedMotion) {
      setTimeout(() => this.dismiss(), 3500);
      return;
    }

    // 3. At 4.0s, the floating year dissolves in confetti stardust and disappears
    setTimeout(() => {
      if (!this.isActive) return;
      if (digit) digit.classList.add('vanishing');
      if (this.container) this.container.classList.add('disappearing');
    }, 4000);

    // 4. At 5.2s, completely unmount and remove from DOM
    this.autoDismissTimer = setTimeout(() => {
      if (this.isActive) this.dismiss();
    }, 5200);
  }

  launchConfetti() {
    if (!this.canvas || !this.ctx) return;
    this.confetti = [];
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 55 : 95;
    const colors = [
      '#F59E0B', '#FBBF24', '#D97706', '#FEF3C7', '#FFFFFF',
      '#8B5CF6', '#EC4899', '#10B981'
    ];

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Dual cannons + center burst
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      let originX, originY, angle, velocity;

      if (mode === 0) {
        // Left cannon
        originX = w * 0.18;
        originY = h * 0.82;
        angle = -Math.PI / 4 - (Math.random() * 0.35);
        velocity = Math.random() * 13 + 9;
      } else if (mode === 1) {
        // Right cannon
        originX = w * 0.82;
        originY = h * 0.82;
        angle = -3 * Math.PI / 4 + (Math.random() * 0.35);
        velocity = Math.random() * 13 + 9;
      } else {
        // Center celebratory stardust fountain
        originX = w * 0.5 + (Math.random() - 0.5) * 60;
        originY = h * 0.45;
        angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        velocity = Math.random() * 10 + 6;
      }

      this.confetti.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 3,
        vy: Math.sin(angle) * velocity,
        gravity: Math.random() * 0.15 + 0.18,
        drag: 0.97,
        width: Math.random() * 8 + 5,
        height: Math.random() * 13 + 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 11,
        tilt: Math.random() * 10,
        tiltSpeed: Math.random() * 0.12 + 0.06,
        isRibbon: Math.random() > 0.32,
        opacity: 1
      });
    }

    this.animateConfetti();
  }

  animateConfetti() {
    if (!this.isActive || !this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let activeCount = 0;

    for (let p of this.confetti) {
      if (p.opacity <= 0) continue;
      activeCount++;

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.tilt += p.tiltSpeed;

      if (p.y > this.canvas.height * 0.7) {
        p.opacity -= 0.018;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      if (p.isRibbon) {
        const ribbonWidth = p.width * Math.cos(p.tilt);
        this.ctx.fillRect(-ribbonWidth / 2, -p.height / 2, ribbonWidth, p.height);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.width * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (activeCount > 0) {
      this.animFrame = requestAnimationFrame(() => this.animateConfetti());
    }
  }

  dismiss() {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.autoDismissTimer) clearTimeout(this.autoDismissTimer);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);

    if (this.container) {
      this.container.classList.add('disappearing');
    }

    setTimeout(() => {
      if (this.animFrame) cancelAnimationFrame(this.animFrame);
      this.container?.remove();
      this.canvas?.remove();
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.confetti = [];
    }, 1100);
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
