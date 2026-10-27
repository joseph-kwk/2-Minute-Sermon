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
    this.footerObserver = null;
  }

  init() {
    // Clean up any legacy public footer switcher element
    const oldControl = document.getElementById('seasonalFooterControl');
    if (oldControl) oldControl.remove();

    // Clean up any seasonal badge after logo
    const oldBadge = document.getElementById('seasonalHeaderBadge');
    if (oldBadge) oldBadge.remove();

    // Determine active season (Admin Panel setting or Automatic liturgical date calculation)
    this.activeSeason = this.determineSeason();
    document.body.setAttribute('data-season', this.activeSeason);

    if (this.activeSeason === 'off') {
      this.cleanup();
      this.updateFooterStage();
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

    // Seasonal logo, favicon, scripture banner, and full-footer stage
    this.updateSeasonalLogos();
    this.updateSeasonalFavicon();
    this.updateSeasonalScriptureBanner();
    this.updateFooterStage();

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

    // 3. Automatic date calculation (Auto mode: 5 days before and 5 days after)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1 - 12
    const day = now.getDate();

    // Christmas Window (Dec 25 ± 5 days):
    // Starts Dec 20 (5 days before Dec 25) through Dec 26 (hands over to New Year on Dec 27)
    if (month === 12 && day >= 20 && day <= 26) {
      return 'christmas';
    }

    // New Year Window (Jan 1 ± 5 days):
    // Starts Dec 27 (exactly 5 days before Jan 1) through Jan 6 (exactly 5 days after Jan 1)
    if ((month === 12 && day >= 27) || (month === 1 && day <= 6)) {
      return 'newyear';
    }

    // Easter & Passion Holy Week Window
    const easterSunday = this.getEasterSunday(year);

    // Passion / Holy Week Window: exactly 5 days leading up to Easter Sunday
    const fiveDaysBeforeEaster = new Date(easterSunday);
    fiveDaysBeforeEaster.setDate(easterSunday.getDate() - 5);
    fiveDaysBeforeEaster.setHours(0, 0, 0, 0);

    const oneDayBeforeEaster = new Date(easterSunday);
    oneDayBeforeEaster.setDate(easterSunday.getDate() - 1);
    oneDayBeforeEaster.setHours(23, 59, 59, 999);

    if (now >= fiveDaysBeforeEaster && now <= oneDayBeforeEaster) {
      return 'passion';
    }

    // Easter Resurrection Season Window: Easter Sunday through 5 days after Easter
    const easterStart = new Date(easterSunday);
    easterStart.setHours(0, 0, 0, 0);

    const fiveDaysAfterEaster = new Date(easterSunday);
    fiveDaysAfterEaster.setDate(easterSunday.getDate() + 5);
    fiveDaysAfterEaster.setHours(23, 59, 59, 999);

    if (now >= easterStart && now <= fiveDaysAfterEaster) {
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

  /**
   * Sets up an IntersectionObserver on .app-footer so animations activate when the footer is in view
   */
  setupFooterObserver(footer) {
    if (!footer) return;

    if (this.footerObserver) {
      this.footerObserver.disconnect();
      this.footerObserver = null;
    }

    if (!('IntersectionObserver' in window)) {
      footer.classList.add('in-view');
      return;
    }

    this.footerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          footer.classList.add('in-view');
        } else {
          footer.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.08
    });

    this.footerObserver.observe(footer);
  }

  /**
   * Renders full-bleed, responsive vector art across the whole footer behind the text
   * Less to no words; the visual icons and animations tell the story.
   * Original footer background color is preserved.
   */
  updateFooterStage() {
    const stage = document.getElementById('seasonalFooterStage');
    const scrim = document.getElementById('seasonalFooterScrim');
    const footer = document.querySelector('.app-footer');
    if (!stage || !footer) return;

    if (this.activeSeason === 'off') {
      stage.innerHTML = '';
      stage.style.display = 'none';
      if (scrim) scrim.style.display = 'none';
      footer.classList.remove('footer-season-active', 'in-view');
      if (this.footerObserver) {
        this.footerObserver.disconnect();
        this.footerObserver = null;
      }
      return;
    }

    stage.style.display = 'block';
    if (scrim) scrim.style.display = 'block';
    footer.classList.add('footer-season-active');

    if (this.activeSeason === 'christmas') {
      stage.innerHTML = this.getChristmasFooterSVG();
    } else if (this.activeSeason === 'newyear') {
      stage.innerHTML = this.getNewYearFooterSVG();
    } else if (this.activeSeason === 'passion') {
      stage.innerHTML = this.getPassionFooterSVG();
    } else if (this.activeSeason === 'easter') {
      stage.innerHTML = this.getEasterFooterSVG();
    }

    this.setupFooterObserver(footer);
  }

  updateFooterShowcase() {
    this.updateFooterStage();
  }

  /**
   * Christmas Full Footer Stage:
   * Star of Bethlehem with guiding light beam, starry night sky, snowy pine trees, and Three Wise Men caravan.
   */
  getChristmasFooterSVG() {
    return `
      <svg class="christmas-full-footer-svg" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Christmas Night Sky and Bethlehem Caravan">
        <defs>
          <radialGradient id="bethlehemAuraFull" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="25%" stop-color="#FEF08A" stop-opacity="0.9" />
            <stop offset="55%" stop-color="#F59E0B" stop-opacity="0.5" />
            <stop offset="85%" stop-color="#B45309" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="bethlehemBeamFull" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55" />
            <stop offset="40%" stop-color="#FDE68A" stop-opacity="0.25" />
            <stop offset="85%" stop-color="#F59E0B" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="snowDuneGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1E3A8A" stop-opacity="0.35" />
            <stop offset="50%" stop-color="#0B132B" stop-opacity="0.85" />
            <stop offset="100%" stop-color="#060913" stop-opacity="0.98" />
          </linearGradient>
        </defs>

        <!-- Starfield Clusters -->
        <g class="anim-christmas-starfield" opacity="0.85">
          <circle cx="120" cy="80" r="1.8" fill="#FFFFFF" class="star-twinkle-1" />
          <circle cx="280" cy="140" r="1.4" fill="#BAE6FD" class="star-twinkle-2" />
          <circle cx="450" cy="70" r="2.0" fill="#FFFFFF" class="star-twinkle-3" />
          <circle cx="620" cy="110" r="1.5" fill="#FEF08A" class="star-twinkle-1" />
          <circle cx="800" cy="65" r="2.2" fill="#FFFFFF" class="star-twinkle-2" />
          <circle cx="980" cy="120" r="1.6" fill="#BAE6FD" class="star-twinkle-3" />
          <circle cx="1140" cy="85" r="1.8" fill="#FFFFFF" class="star-twinkle-1" />
          <circle cx="1450" cy="130" r="1.5" fill="#FEF08A" class="star-twinkle-2" />
        </g>

        <!-- Guiding Starlight Beam from Bethlehem Star -->
        <polygon class="anim-bethlehem-beam" points="1320,110 320,680 1580,680" fill="url(#bethlehemBeamFull)" opacity="0.3" />

        <!-- Star of Bethlehem -->
        <g class="anim-bethlehem-star-group" transform="translate(1320, 110)">
          <circle cx="0" cy="0" r="110" fill="url(#bethlehemAuraFull)" class="anim-bethlehem-glow" />
          <polygon points="-3,-90 3,-90 0,90" fill="#FFFFFF" />
          <polygon points="-90,-3 -90,3 90,0" fill="#FFFFFF" />
          <polygon points="-45,-45 45,45 0,0" stroke="#FDE68A" stroke-width="2" fill="none" opacity="0.8" />
          <polygon points="45,-45 -45,45 0,0" stroke="#FDE68A" stroke-width="2" fill="none" opacity="0.8" />
          <circle cx="0" cy="0" r="6" fill="#FEF08A" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
        </g>

        <!-- Distant Pine Trees -->
        <g fill="#091426" opacity="0.75">
          <polygon points="120,640 145,540 170,640" />
          <polygon points="260,650 285,555 310,650" />
          <polygon points="480,650 510,530 540,650" />
          <polygon points="820,645 845,540 870,645" />
          <polygon points="1120,650 1150,520 1180,650" />
          <polygon points="1420,640 1445,535 1470,640" />
        </g>

        <!-- Midground Snow Hill -->
        <path d="M0 620 Q400 550 900 590 T1600 560 L1600 700 L0 700 Z" fill="url(#snowDuneGrad1)" stroke="#38BDF8" stroke-width="1.5" stroke-opacity="0.4" />

        <!-- Three Wise Men (Magi) Caravan Journeying Along the Base -->
        <g class="anim-caravan-march" transform="translate(120, 520) scale(0.95)">
          <!-- Lead Camel with Royal Gold Gift -->
          <g transform="translate(260, 0)">
            <ellipse cx="45" cy="88" rx="42" ry="7" fill="#000000" opacity="0.7" />
            <ellipse cx="42" cy="38" rx="30" ry="18" fill="#060913" stroke="#F59E0B" stroke-width="1.2" stroke-opacity="0.8" />
            <circle cx="48" cy="20" r="14" fill="#060913" stroke="#F59E0B" stroke-width="1.2" stroke-opacity="0.8" />
            <path d="M58 32 C74 18 80 4 75 -12 C70 -18 60 -10 65 4 C60 18 52 26 48 32 Z" fill="#060913" stroke="#F59E0B" stroke-width="1.2" />
            <ellipse cx="78" cy="-14" rx="9" ry="5" fill="#060913" />
            <path d="M28 24 Q44 20 60 24 L58 46 Q44 48 30 46 Z" fill="#DC2626" />
            <circle cx="46" cy="6" r="10" fill="#FDE047" opacity="0.8" />
            <path d="M24 54 L16 88 M32 54 L26 86 M54 54 L62 88 M64 54 L72 86" stroke="#060913" stroke-width="4.5" stroke-linecap="round" />
          </g>
          <!-- Second Camel -->
          <g transform="translate(130, 6) scale(0.92)">
            <ellipse cx="45" cy="88" rx="42" ry="7" fill="#000000" opacity="0.7" />
            <ellipse cx="42" cy="38" rx="30" ry="18" fill="#060913" stroke="#38BDF8" stroke-width="1.2" stroke-opacity="0.8" />
            <circle cx="48" cy="20" r="14" fill="#060913" stroke="#38BDF8" stroke-width="1.2" stroke-opacity="0.8" />
            <path d="M58 32 C74 18 80 4 75 -12 C70 -18 60 -10 65 4 C60 18 52 26 48 32 Z" fill="#060913" stroke="#38BDF8" stroke-width="1.2" />
            <ellipse cx="78" cy="-14" rx="9" ry="5" fill="#060913" />
            <path d="M28 24 Q44 20 60 24 L58 46 Q44 48 30 46 Z" fill="#059669" />
            <path d="M24 54 L16 88 M32 54 L26 86 M54 54 L62 88 M64 54 L72 86" stroke="#060913" stroke-width="4.5" stroke-linecap="round" />
          </g>
          <!-- Third Camel -->
          <g transform="translate(0, 12) scale(0.86)">
            <ellipse cx="45" cy="88" rx="42" ry="7" fill="#000000" opacity="0.7" />
            <ellipse cx="42" cy="38" rx="30" ry="18" fill="#060913" stroke="#A855F7" stroke-width="1.2" stroke-opacity="0.8" />
            <circle cx="48" cy="20" r="14" fill="#060913" stroke="#A855F7" stroke-width="1.2" stroke-opacity="0.8" />
            <path d="M58 32 C74 18 80 4 75 -12 C70 -18 60 -10 65 4 C60 18 52 26 48 32 Z" fill="#060913" stroke="#A855F7" stroke-width="1.2" />
            <ellipse cx="78" cy="-14" rx="9" ry="5" fill="#060913" />
            <path d="M28 24 Q44 20 60 24 L58 46 Q44 48 30 46 Z" fill="#7C3AED" />
            <path d="M24 54 L16 88 M32 54 L26 86 M54 54 L62 88 M64 54 L72 86" stroke="#060913" stroke-width="4.5" stroke-linecap="round" />
          </g>
        </g>

        <!-- Foreground Dunes -->
        <path d="M0 660 Q450 630 950 650 T1600 640 L1600 700 L0 700 Z" fill="#04060C" opacity="0.95" />
      </svg>
    `;
  }

  /**
   * New Year Full Footer Stage:
   * Stardust bridge, fireworks, midnight clock tower, and radiant 2027 temple arch monument.
   */
  getNewYearFooterSVG() {
    return `
      <svg class="newyear-full-footer-svg" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="New Year 2027 Celebration Across Entire Footer">
        <defs>
          <radialGradient id="nyGoldBurstAuraFull" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="25%" stop-color="#FEF08A" stop-opacity="0.95" />
            <stop offset="55%" stop-color="#F59E0B" stop-opacity="0.65" />
            <stop offset="85%" stop-color="#B45309" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="nyBridgeGradFull" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#64748B" stop-opacity="0.3" />
            <stop offset="35%" stop-color="#CBD5E1" stop-opacity="0.7" />
            <stop offset="50%" stop-color="#FDE047" stop-opacity="1" />
            <stop offset="70%" stop-color="#F59E0B" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#FEF08A" stop-opacity="0.4" />
          </linearGradient>
          <radialGradient id="fw1Full" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="35%" stop-color="#FDE047" stop-opacity="0.9" />
            <stop offset="75%" stop-color="#EA580C" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#000" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="fw2Full" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="30%" stop-color="#BAE6FD" stop-opacity="0.95" />
            <stop offset="70%" stop-color="#6366F1" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#000" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Celebratory Fireworks in the Sky -->
        <!-- Firework 1: Left Sky -->
        <g class="anim-firework-burst-1" transform="translate(420, 130)">
          <circle cx="0" cy="0" r="75" fill="url(#fw1Full)" opacity="0.3" />
          <line x1="0" y1="0" x2="0" y2="-65" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="0" y2="65" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="-65" y2="0" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="65" y2="0" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
          <circle cx="0" cy="-68" r="3" fill="#FFFFFF" />
          <circle cx="0" cy="68" r="3" fill="#FFFFFF" />
          <circle cx="-68" cy="0" r="3" fill="#FFFFFF" />
          <circle cx="68" cy="0" r="3" fill="#FFFFFF" />
        </g>

        <!-- Firework 2: Center Sky above Clock -->
        <g class="anim-firework-burst-2" transform="translate(800, 85)">
          <circle cx="0" cy="0" r="95" fill="url(#fw2Full)" opacity="0.35" />
          <line x1="0" y1="0" x2="0" y2="-80" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="0" y2="80" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="-80" y2="0" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="80" y2="0" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <circle cx="0" cy="-84" r="3" fill="#BAE6FD" />
          <circle cx="0" cy="84" r="3" fill="#BAE6FD" />
          <circle cx="-84" cy="0" r="3" fill="#BAE6FD" />
          <circle cx="84" cy="0" r="3" fill="#BAE6FD" />
        </g>

        <!-- Firework 3: Right Sky over 2027 -->
        <g class="anim-firework-burst-3" transform="translate(1220, 140)">
          <circle cx="0" cy="0" r="85" fill="url(#fw1Full)" opacity="0.3" />
          <line x1="0" y1="0" x2="0" y2="-70" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="0" y2="70" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="-70" y2="0" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="70" y2="0" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
          <circle cx="0" cy="-73" r="3" fill="#FFFFFF" />
          <circle cx="0" cy="73" r="3" fill="#FFFFFF" />
        </g>

        <!-- Parabolic Stardust Bridge across columns -->
        <g class="anim-stardust-bridge">
          <path d="M 240 460 Q 800 210 1360 460" stroke="url(#nyBridgeGradFull)" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8" />
          <path d="M 280 470 Q 800 230 1320 470" stroke="#FDE68A" stroke-width="1.2" stroke-dasharray="4 8" fill="none" opacity="0.5" />
        </g>

        <!-- Center Midnight Campanile Clock Tower striking 12:00 -->
        <g transform="translate(0, 40)">
          <!-- Tower Spire -->
          <polygon points="800,140 793,190 807,190" fill="#1A1E30" />
          <line x1="800" y1="125" x2="800" y2="140" stroke="#FDE047" stroke-width="2.5" />
          <rect x="772" y="210" width="56" height="60" rx="3" fill="#0A0D18" stroke="#2D3250" stroke-width="1.2" />
          <!-- Clock Face -->
          <circle cx="800" cy="240" r="22" fill="#05060A" stroke="#FDE047" stroke-width="2" />
          <line x1="800" y1="240" x2="800" y2="225" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <line x1="800" y1="240" x2="800" y2="228" stroke="#FEF08A" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="800" cy="240" r="2.5" fill="#FDE047" />
          <!-- Tower Base -->
          <rect x="768" y="270" width="64" height="300" fill="#060810" />
        </g>

        <!-- Right Sector: Triumphal Sunrise Temple Arch with Glowing 2027 Monument -->
        <g id="nySunriseGateway" transform="translate(1260, 430)">
          <circle cx="0" cy="10" r="220" fill="url(#nyGoldBurstAuraFull)" class="anim-2027-glow" opacity="0.35" />
          <!-- Triumphal Arch -->
          <polygon points="0,-45 -115,10 115,10" fill="#201530" stroke="#F59E0B" stroke-width="1.8" />
          <rect x="-120" y="10" width="240" height="14" rx="2" fill="#2A1B40" stroke="#D97706" stroke-width="1.4" />
          <rect x="-115" y="24" width="230" height="175" fill="#0A0812" stroke="#B45309" stroke-width="1" />
          <path d="M-68 199 L-68 85 Q0 15 68 85 L68 199 Z" fill="#040306" stroke="#F59E0B" stroke-width="1.6" />
          
          <!-- BOLD GLOWING 2027 DIGITS DISPLAY (Telling the story of 2027) -->
          <g transform="translate(0, 115)">
            <text x="0" y="8" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', serif" font-size="46" font-weight="900" fill="#FFFFFF" stroke="#FEF08A" stroke-width="1.5" class="ny-stage-2027-digits">2027</text>
          </g>
        </g>

        <!-- Ascending Celebratory Confetti & Stardust -->
        <g class="anim-confetti-float" opacity="0.9">
          <circle cx="340" cy="520" r="3" fill="#FDE047" />
          <circle cx="560" cy="480" r="2.5" fill="#FFFFFF" />
          <circle cx="720" cy="510" r="3" fill="#F59E0B" />
          <circle cx="940" cy="490" r="2.8" fill="#FDE68A" />
          <circle cx="1100" cy="530" r="3.2" fill="#FFFFFF" />
          <circle cx="1400" cy="500" r="2.5" fill="#FDE047" />
        </g>

        <!-- Base Horizon Silhouette -->
        <path d="M0 630 Q400 580 800 590 T1600 580 L1600 700 L0 700 Z" fill="#05060A" opacity="0.98" />
      </svg>
    `;
  }

  /**
   * Passion Full Footer Stage:
   * Sacred celestial halo behind Center Cross on Calvary Hill with drifting twilight embers.
   */
  getPassionFooterSVG() {
    return `
      <svg class="passion-full-footer-svg" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Calvary Hill with Three Crosses Across Entire Footer">
        <defs>
          <radialGradient id="passionSacredAuraFull" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="18%" stop-color="#FEF08A" stop-opacity="0.95" />
            <stop offset="40%" stop-color="#F43F5E" stop-opacity="0.85" />
            <stop offset="70%" stop-color="#9F1239" stop-opacity="0.55" />
            <stop offset="90%" stop-color="#4C0519" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="passionBeamGradFull" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
            <stop offset="30%" stop-color="#FDE047" stop-opacity="0.6" />
            <stop offset="60%" stop-color="#F43F5E" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="calvaryHillGradFull" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3B071A" />
            <stop offset="35%" stop-color="#1F040E" />
            <stop offset="100%" stop-color="#080104" />
          </linearGradient>
        </defs>

        <!-- Sacred Celestial Backlight Aura behind Center Cross -->
        <g class="anim-passion-sacred-aura">
          <circle cx="800" cy="330" r="380" fill="url(#passionSacredAuraFull)" />
          <!-- Upward Piercing Light Columns toward heaven -->
          <polygon points="620,500 760,-80 840,-80 980,500" fill="url(#passionBeamGradFull)" opacity="0.65" />
          <polygon points="720,500 790,-160 810,-160 880,500" fill="#FFFBEB" opacity="0.6" />
        </g>

        <!-- Calvary Hill Silhouette -->
        <path d="M0 650 Q400 590 800 530 Q1200 590 1600 650 L1600 700 L0 700 Z" fill="url(#calvaryHillGradFull)" stroke="#F43F5E" stroke-width="2" stroke-opacity="0.8" />
        <path d="M0 675 Q500 635 800 595 Q1100 635 1600 675 L1600 700 L0 700 Z" fill="#080104" />

        <!-- Atmospheric Low Mist Layer -->
        <path class="anim-passion-mist" d="M0 620 Q400 570 800 580 Q1200 570 1600 620 L1600 670 L0 670 Z" fill="rgba(190, 18, 60, 0.18)" />

        <!-- The Three Solemn Crosses on Calvary -->
        <g id="calvaryCrossesGroup">
          <!-- Left Cross (Thief) -->
          <g transform="rotate(-6 620 480)">
            <rect x="614" y="380" width="11" height="170" rx="2" fill="#0A0206" stroke="#BE123C" stroke-width="1.5" />
            <rect x="588" y="420" width="64" height="11" rx="2" fill="#0A0206" stroke="#BE123C" stroke-width="1.5" />
          </g>

          <!-- Right Cross (Thief) -->
          <g transform="rotate(6 980 480)">
            <rect x="974" y="380" width="11" height="170" rx="2" fill="#0A0206" stroke="#BE123C" stroke-width="1.5" />
            <rect x="948" y="420" width="64" height="11" rx="2" fill="#0A0206" stroke="#BE123C" stroke-width="1.5" />
          </g>

          <!-- Center Cross of Christ (Towering with Sacred Rim) -->
          <g id="passionCenterCross">
            <rect x="788" y="210" width="24" height="340" rx="3" fill="#080105" stroke="#FDA4AF" stroke-width="2.5" />
            <rect x="720" y="275" width="160" height="22" rx="3" fill="#080105" stroke="#FDA4AF" stroke-width="2.5" />
            <line x1="724" y1="286" x2="876" y2="286" stroke="#F43F5E" stroke-width="1.5" opacity="0.9" />
          </g>
        </g>

        <!-- Rising Redemption Embers -->
        <g class="anim-passion-embers" opacity="0.9">
          <circle cx="580" cy="560" r="2.5" fill="#F43F5E" />
          <circle cx="700" cy="520" r="2.8" fill="#FDE047" />
          <circle cx="800" cy="460" r="3.2" fill="#FDA4AF" />
          <circle cx="830" cy="380" r="2.5" fill="#FFF1F2" />
          <circle cx="910" cy="510" r="2.8" fill="#F43F5E" />
          <circle cx="1040" cy="550" r="2.5" fill="#FDE047" />
        </g>
      </svg>
    `;
  }

  /**
   * Easter Full Footer Stage:
   * Sunrise dawn rays, open rock tomb, rolled-away stone, and radiant resurrection light.
   */
  getEasterFooterSVG() {
    return `
      <svg class="easter-full-footer-svg" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Easter Resurrection Dawn and Open Tomb Across Entire Footer">
        <defs>
          <radialGradient id="easterSunGlowFull" cx="25%" cy="60%" r="75%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="18%" stop-color="#FEF08A" stop-opacity="0.95" />
            <stop offset="42%" stop-color="#FDE047" stop-opacity="0.8" />
            <stop offset="68%" stop-color="#F59E0B" stop-opacity="0.45" />
            <stop offset="90%" stop-color="#EA580C" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="godRayBeamGradFull" x1="0%" y1="50%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
            <stop offset="25%" stop-color="#FEF08A" stop-opacity="0.8" />
            <stop offset="60%" stop-color="#FDE047" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
          </linearGradient>
          <radialGradient id="stoneSurfaceFull" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stop-color="#D4D0DC" />
            <stop offset="40%" stop-color="#9C98A6" />
            <stop offset="75%" stop-color="#555260" />
            <stop offset="100%" stop-color="#26232D" />
          </radialGradient>
          <linearGradient id="cliffRockGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4C3D63" />
            <stop offset="60%" stop-color="#2E233D" />
            <stop offset="100%" stop-color="#150E20" />
          </linearGradient>
        </defs>

        <!-- Rising Dawn Sun Aura -->
        <circle class="anim-easter-sun" cx="340" cy="500" r="500" fill="url(#easterSunGlowFull)" opacity="0.85" />

        <!-- Distant Dawn Purple Hills -->
        <path d="M0 640 Q400 510 900 570 T1600 530 L1600 700 L0 700 Z" fill="#3D204E" opacity="0.65" />
        <path d="M0 660 Q500 560 1100 610 T1600 590 L1600 700 L0 700 Z" fill="#251533" opacity="0.85" />

        <!-- Sweeping Holy Golden God-Rays bursting from inside tomb -->
        <g class="anim-god-rays" style="transform-origin: 270px 520px;">
          <polygon points="270,520 680,120 1080,210 280,540" fill="url(#godRayBeamGradFull)" opacity="0.8" />
          <polygon points="265,510 960,-10 1480,110 285,530" fill="url(#godRayBeamGradFull)" opacity="0.65" />
          <polygon points="260,530 1180,260 1660,420 275,550" fill="url(#godRayBeamGradFull)" opacity="0.5" />
          <circle cx="275" cy="520" r="180" fill="url(#easterSunGlowFull)" opacity="0.9" />
        </g>

        <!-- Rock Cliff & Tomb Archway -->
        <g id="easterTombCliff">
          <path d="M-60 700 L-40 310 Q40 260 120 290 Q210 210 290 250 Q370 300 400 380 Q450 450 490 530 Q510 600 520 700 Z" fill="url(#cliffRockGradFull)" />
          <!-- Radiant glowing cave interior -->
          <path d="M140 680 L140 490 C140 400 220 370 290 370 C360 370 440 400 440 490 L440 680 Z" fill="#FFFBEB" opacity="0.95" />
          <path d="M130 680 L130 490 C130 390 215 355 290 355 C365 355 450 390 450 490 L450 680 L430 680 L430 492 C430 410 355 385 290 385 C225 385 150 410 150 492 L150 680 Z" fill="#6B6278" />
        </g>

        <!-- Stone Floor Track & Rolled-Away Stone -->
        <g id="easterStoneAssembly" transform="translate(200, 0)">
          <!-- Ground Shadow (follows the roll) -->
          <ellipse class="anim-easter-stone-shadow" cx="300" cy="668" rx="145" ry="16" fill="#000000" opacity="0.75" />
          <!-- Massive Natural Sealing Stone (Rolls subtly into resting position when section is active) -->
          <g class="anim-easter-stone" style="transform-origin: 300px 520px;">
            <circle cx="300" cy="520" r="140" fill="url(#stoneSurfaceFull)" stroke="#1F1C23" stroke-width="3" />
            <circle cx="298" cy="518" r="137" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.8" fill="none" />
            <!-- Organic strata contours and fissures so the roll rotation is visually distinct -->
            <path d="M235 480 Q270 515 255 575 M315 445 Q345 510 325 585 M275 435 Q295 485 285 535" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2.5" stroke-linecap="round" fill="none" />
            <circle cx="265" cy="495" r="3.5" fill="#2E2838" opacity="0.75" />
            <circle cx="330" cy="535" r="4" fill="#2E2838" opacity="0.75" />
          </g>
        </g>

        <!-- Ascending Golden Dawn Sparks -->
        <g class="anim-easter-sparks" opacity="0.9">
          <circle cx="490" cy="440" r="2.5" fill="#FEF08A" />
          <circle cx="630" cy="370" r="2.0" fill="#FDE047" />
          <circle cx="780" cy="410" r="2.5" fill="#FEF08A" />
          <circle cx="950" cy="340" r="2.2" fill="#F59E0B" />
          <circle cx="1120" cy="400" r="2.4" fill="#FEF08A" />
        </g>

        <!-- Foreground Ground Silhouettes -->
        <path d="M0 670 Q450 640 950 660 T1600 650 L1600 700 L0 700 Z" fill="#0E0715" />
        <path d="M0 690 Q600 670 1200 680 T1600 675 L1600 700 L0 700 Z" fill="#06020A" />
      </svg>
    `;
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
        banner.innerHTML = '<em>"For unto us a Child is born, unto us a Son is given..."</em> — Isaiah 9:6';
      } else if (this.activeSeason === 'newyear') {
        banner.innerHTML = '<em>"See, I am doing a new thing! Now it springs up; do you not perceive it?"</em> — Isaiah 43:19';
      } else if (this.activeSeason === 'passion') {
        banner.innerHTML = '<em>"He was pierced for our transgressions, He was crushed for our iniquities..."</em> — Isaiah 53:5';
      } else if (this.activeSeason === 'easter') {
        banner.innerHTML = '<em>"He is not here; He has risen, just as He said!"</em> — Matthew 28:6';
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
    if (this.footerObserver) {
      this.footerObserver.disconnect();
      this.footerObserver = null;
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
    const stage = document.getElementById('seasonalFooterStage');
    if (stage) {
      stage.innerHTML = '';
      stage.style.display = 'none';
    }
    const scrim = document.getElementById('seasonalFooterScrim');
    if (scrim) {
      scrim.style.display = 'none';
    }
    const footer = document.querySelector('.app-footer');
    if (footer) {
      footer.classList.remove('footer-season-active', 'in-view');
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
    return { outgoingYear: 2026, incomingYear: 2027 };
  }

  markSeen() {
    try {
      localStorage.setItem('2ms_ny_ceremony_2027', 'seen');
    } catch (_) {}
  }

  mount() {
    if (this.isActive || document.getElementById('nyHeroFloatingCeremony')) return;
    this.isActive = true;
    this.markSeen();

    const heroSection = document.querySelector('.hero-section') || document.getElementById('mainContent') || document.body;
    const displayYear = 2027;

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

// Quick helper for live preview in DevTools console: setSeason('christmas' | 'newyear' | 'passion' | 'easter' | 'off')
window.setSeason = (season) => {
  const normalized = season?.toLowerCase();
  if (['christmas', 'newyear', 'easter', 'passion', 'off'].includes(normalized)) {
    localStorage.setItem('sermon_seasonal_global', normalized);
    window.seasonalManager?.init();
    console.log(`%c[Seasonal] Switched to: ${normalized.toUpperCase()}`, 'color: #D4AF37; font-weight: bold;');
  } else {
    console.warn(`[Seasonal] Unknown season "${season}". Use: 'christmas', 'newyear', 'passion', 'easter', 'off'`);
  }
};
