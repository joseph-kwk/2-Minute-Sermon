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
    // Determine active season
    this.activeSeason = this.determineSeason();
    document.body.setAttribute('data-season', this.activeSeason);

    if (this.activeSeason === 'off') {
      this.cleanup();
      this.updateHeaderBadge();
      this.initFooterControl();
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

    // Header badge, seasonal logo, favicon, scripture banner & footer controls
    this.updateSeasonalLogos();
    this.updateSeasonalFavicon();
    this.updateSeasonalScriptureBanner();
    this.updateHeaderBadge();
    this.initFooterControl();

    // Resize listener
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Calculates season dates (starts ~10 days before the holiday)
   */
  determineSeason() {
    // 1. Check URL override ?season=christmas|newyear|easter|off
    const urlParams = new URLSearchParams(window.location.search);
    const seasonParam = urlParams.get('season')?.toLowerCase();
    if (['christmas', 'newyear', 'easter', 'off'].includes(seasonParam)) {
      return seasonParam;
    }

    // 2. Check user preference stored in localStorage
    const stored = localStorage.getItem('sermon_seasonal_preference');
    if (stored && ['christmas', 'newyear', 'easter', 'off'].includes(stored)) {
      return stored;
    }

    // 3. Automatic date calculation (~10 days before holiday)
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

    // Easter Window: 10 days before Easter Sunday through Easter Tuesday
    const easterSunday = this.getEasterSunday(year);
    const tenDaysBeforeEaster = new Date(easterSunday);
    tenDaysBeforeEaster.setDate(easterSunday.getDate() - 10);
    
    const threeDaysAfterEaster = new Date(easterSunday);
    threeDaysAfterEaster.setDate(easterSunday.getDate() + 3);

    if (now >= tenDaysBeforeEaster && now <= threeDaysAfterEaster) {
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
    const count = isMobile ? 30 : 60; // Parallax multi-layer count

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const isMobile = this.width < 768;
    const speedMult = isMobile ? 0.4 : 0.7;

    if (this.activeSeason === 'christmas') {
      // 3 Parallax Layers: 0 = foreground (large/soft), 1 = midground (classic), 2 = background (glitter)
      const layer = Math.random() < 0.2 ? 0 : Math.random() < 0.6 ? 1 : 2;
      return {
        layer,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: layer === 0 ? Math.random() * 2.5 + 3.0 : layer === 1 ? Math.random() * 1.8 + 1.2 : Math.random() * 1.0 + 0.5,
        speedY: (layer === 0 ? 1.2 : layer === 1 ? 0.7 : 0.4) * speedMult,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: layer === 0 ? Math.random() * 0.35 + 0.15 : layer === 1 ? Math.random() * 0.6 + 0.3 : Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * 0.05
      };
    } else if (this.activeSeason === 'newyear') {
      // Champagne Stardust & Rising Sparkles
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.8 + 0.3) * speedMult,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.8 + 0.2,
        color: Math.random() > 0.35 ? '#F59E0B' : '#FFFFFF',
        pulse: Math.random() * 0.04
      };
    } else if (this.activeSeason === 'easter') {
      // Sunrise Grace Rays & Floating Petal Bokeh
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 7.0 + 3.5,
        speedY: (Math.random() - 0.5) * 0.25,
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.3 + 0.1,
        color: Math.random() > 0.5 ? '#F59E0B' : '#7C3AED'
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
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
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

    // Spawn subtle fireworks burst occasionally (every 4s)
    if (now - this.lastFireworkTime > 4000) {
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
        spark.vy += 0.03; // slight gravity
        spark.life -= 0.015;
      }
      if (fw.sparks[0]?.life <= 0) {
        this.fireworks.splice(i, 1);
      }
    }
  }

  spawnFirework() {
    const fwX = Math.random() * (this.width * 0.7) + (this.width * 0.15);
    const fwY = Math.random() * (this.height * 0.3) + 80;
    const sparks = [];
    const colorType = Math.random();

    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 / 24) * i;
      const speed = Math.random() * 2.0 + 1.0;
      sparks.push({
        x: fwX,
        y: fwY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 1.5 + 1.0,
        r: colorType > 0.5 ? 245 : 255,
        g: colorType > 0.5 ? 158 : 223,
        b: colorType > 0.5 ? 11 : 0,
        life: 1.0
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
      } else {
        badge.remove();
      }
    }
  }

  initFooterControl() {
    const footerContainer = document.querySelector('.footer-bottom .container') || document.querySelector('footer .container');
    if (!footerContainer || document.getElementById('seasonalFooterControl')) return;

    const controlWrapper = document.createElement('div');
    controlWrapper.id = 'seasonalFooterControl';
    controlWrapper.className = 'seasonal-footer-control';
    controlWrapper.innerHTML = `
      <label for="seasonalSelect">✨ Ambiance:</label>
      <select id="seasonalSelect">
        <option value="auto">Auto (~10 Days Before)</option>
        <option value="christmas">🎄 Christmas</option>
        <option value="newyear">✨ New Year</option>
        <option value="easter">✝️ Easter</option>
        <option value="off">Off</option>
      </select>
    `;

    footerContainer.appendChild(controlWrapper);

    const select = controlWrapper.querySelector('#seasonalSelect');
    const stored = localStorage.getItem('sermon_seasonal_preference') || 'auto';
    select.value = stored;

    select.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'auto') {
        localStorage.removeItem('sermon_seasonal_preference');
      } else {
        localStorage.setItem('sermon_seasonal_preference', val);
      }
      this.cleanup();
      this.init();
    });
  }

  updateSeasonalLogos() {
    const logos = document.querySelectorAll('.logo-img-main, .footer-logo, .admin-auth-logo, .admin-sidebar-logo');
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
    const logos = document.querySelectorAll('.logo-img-main, .footer-logo, .admin-auth-logo, .admin-sidebar-logo');
    logos.forEach(logo => {
      if (logo.dataset.defaultSrc) {
        logo.src = logo.dataset.defaultSrc;
      }
    });
    const faviconLink = document.querySelector('link[rel="icon"]');
    if (faviconLink && faviconLink.dataset.defaultHref) {
      faviconLink.href = faviconLink.dataset.defaultHref;
    }
    const banner = document.getElementById('seasonalScriptureBanner');
    if (banner) {
      banner.remove();
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
