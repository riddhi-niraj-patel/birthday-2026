/* ==========================================
   PREMIUM BIRTHDAY WEBSITE - MAIN SCRIPT
   All Animations, Interactions & Logic
   ========================================== */

(function () {
  'use strict';

  // ==========================================
  // CONFIGURATION
  // ==========================================
  const BIRTHDAY = new Date('2026-07-31T00:00:00');
  const CONFIG = {
    loadingDuration: 4000,
    countdownInterval: 1000,
    floatItemCount: 20,
    confettiCount: 150,
  };

  // ==========================================
  // DOM REFS
  // ==========================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const loadingScreen = $('#loadingScreen');
  const loaderProgress = $('#loaderProgress');
  const loadingSubtext = $('#loadingSubtext');
  const mainSite = $('#mainSite');
  const cursorGlow = $('#cursorGlow');
  const bgCanvas = $('#bgCanvas');
  const confettiCanvas = $('#confettiCanvas');
  const loadingCanvas = $('#loadingCanvas');
  const scrollProgress = $('#scrollProgress');
  const musicToggle = $('#musicToggle');
  const musicPopup = $('#musicPopup');
  const musicCloseBtn = $('#musicCloseBtn');
  const birthdayAudio = $('#birthdayAudio');
  const musicWave = $('.music-wave');
  const countdownGrid = $('#countdownGrid');
  const birthdayMessage = $('#birthdayMessage');
  const cakeCandles = $('#cakeCandles');
  const cakeWrapper = $('#cakeWrapper');
  const blowCandleBtn = $('#blowCandleBtn');
  const cutCakeBtn = $('#cutCakeBtn');
  const resetCakeBtn = $('#resetCakeBtn');
  const quoteTrack = $('#quoteTrack');
  const quoteDots = $('#quoteDots');
  const quotePrev = $('#quotePrev');
  const quoteNext = $('#quoteNext');
  const heroParticles = $('#heroParticles');
  const floatingDecorations = $('#floatingDecorations');

  let isMusicPlaying = false;
  let isCakeCut = false;
  let areCandlesBlown = false;
  let quoteIndex = 0;
  let totalQuotes = 0;
  let countdownInterval = null;
  let floatAnimFrame = null;
  let bgAnimFrame = null;
  let loadingAnimFrame = null;

  // ==========================================
  // 1. LOADING SCREEN
  // ==========================================
  function initLoading() {
    const ctx = loadingCanvas.getContext('2d');
    let w, h, particles = [];
    const texts = ['લોડ થઈ રહ્યું છે...', 'લગભગ તૈયાર...', 'લગભગ...', 'બસ થોડીક સેકંડ...'];

    function resize() {
      w = loadingCanvas.width = window.innerWidth;
      h = loadingCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class LoadingParticle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 4 + 1;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = ['#d4a843', '#f0d78c', '#ffffff', '#87ceeb'][Math.floor(Math.random() * 4)];
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.y < -10) this.reset();
        if (this.x < -10 || this.x > w + 10) this.speedX *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < 80; i++) particles.push(new LoadingParticle());

    let progress = 0;
    const startTime = Date.now();

    function updateLoading() {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / CONFIG.loadingDuration, 1);

      ctx.clearRect(0, 0, w, h);

      particles.forEach(p => { p.update(); p.draw(); });

      const textIdx = Math.min(Math.floor(progress * texts.length), texts.length - 1);
      loadingSubtext.textContent = texts[textIdx];

      const pct = Math.round(progress * 100);
      loaderProgress.style.width = pct + '%';

      if (progress < 1) {
        loadingAnimFrame = requestAnimationFrame(updateLoading);
      } else {
        finishLoading();
      }
    }

    updateLoading();
  }

  function finishLoading() {
    if (loadingAnimFrame) cancelAnimationFrame(loadingAnimFrame);
    loadingScreen.classList.add('fade-out');
    mainSite.classList.remove('hidden');
    setTimeout(() => {
      mainSite.classList.add('visible');
      loadingScreen.style.display = 'none';
      initBackgroundCanvas();
      initFloatingDecorations();
      initHeroParticles();
      initCountdown();
      initQuoteCarousel();
      initCake();
      initScrollReveal();
      initLazyLoading();
      initScrollProgress();
      initCursorGlow();
      requestAnimationFrame(animateBackground);
      requestAnimationFrame(animateFloatItems);
    }, 300);
    setTimeout(() => {
      tryAutoPlayMusic();
    }, 1000);
  }

  // ==========================================
  // 2. BACKGROUND CANVAS
  // ==========================================
  let bgCtx, bgW, bgH, stars = [], nebula;

  function initBackgroundCanvas() {
    bgCtx = bgCanvas.getContext('2d');
    resizeBg();
    window.addEventListener('resize', resizeBg);

    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * bgW,
        y: Math.random() * bgH,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }

    nebula = {
      x: bgW * 0.3,
      y: bgH * 0.4,
      radius: Math.min(bgW, bgH) * 0.4,
      color1: 'rgba(10, 25, 47, 1)',
      color2: 'rgba(212, 168, 67, 0.02)',
    };
  }

  function resizeBg() {
    bgW = bgCanvas.width = window.innerWidth;
    bgH = bgCanvas.height = window.innerHeight;
  }

  function animateBackground() {
    bgCtx.clearRect(0, 0, bgW, bgH);

    const grad = bgCtx.createRadialGradient(
      nebula.x + Math.sin(Date.now() * 0.0002) * 100,
      nebula.y + Math.cos(Date.now() * 0.0003) * 80,
      0,
      bgW * 0.5,
      bgH * 0.5,
      Math.max(bgW, bgH) * 0.8
    );
    grad.addColorStop(0, 'rgba(17, 34, 64, 1)');
    grad.addColorStop(0.5, 'rgba(10, 25, 47, 1)');
    grad.addColorStop(1, 'rgba(6, 13, 23, 1)');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, bgW, bgH);

    stars.forEach(star => {
      const twinkle = Math.sin(Date.now() * 0.001 * star.speed + star.phase) * 0.3 + 0.7;
      bgCtx.beginPath();
      bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
      bgCtx.fill();

      if (star.size > 1.2) {
        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(212, 168, 67, ${0.05 * twinkle})`;
        bgCtx.fill();
      }
    });

    bgAnimFrame = requestAnimationFrame(animateBackground);
  }

  // ==========================================
  // 3. FLOATING DECORATIONS
  // ==========================================
  let floatItems = [];

  function initFloatingDecorations() {
    const icons = [
      'fa-balloon', 'fa-heart', 'fa-star', 'fa-gem', 'fa-gift',
      'fa-crown', 'fa-feather', 'fa-sparkle', 'fa-snowflake',
      'fa-moon', 'fa-sun', 'fa-dove'
    ];

    for (let i = 0; i < CONFIG.floatItemCount; i++) {
      const el = document.createElement('div');
      el.className = 'float-item';
      const iconClass = icons[Math.floor(Math.random() * icons.length)];
      el.innerHTML = `<i class="fas ${iconClass}"></i>`;
      el.style.left = Math.random() * 100 + '%';
      el.style.fontSize = (Math.random() * 20 + 12) + 'px';
      el.style.animationDuration = (Math.random() * 20 + 20) + 's';
      el.style.animationDelay = (Math.random() * 20) + 's';
      el.style.opacity = Math.random() * 0.1 + 0.05;
      floatingDecorations.appendChild(el);
      floatItems.push({
        el,
        y: 100 + Math.random() * 20,
        speed: Math.random() * 0.1 + 0.05,
        drift: Math.random() * 0.3 - 0.15,
        x: Math.random() * 100,
      });
    }
  }

  function animateFloatItems() {
    floatItems.forEach(item => {
      const rect = item.el.getBoundingClientRect();
      const scrollY = window.scrollY;
      item.y -= item.speed;
      item.x += item.drift;
      if (item.x > 100) item.x = 0;
      if (item.x < 0) item.x = 100;
      if (item.y < -10) item.y = 110;
      item.el.style.transform = `translateX(${Math.sin(Date.now() * 0.001 + item.y) * 20}px)`;
    });
    floatAnimFrame = requestAnimationFrame(animateFloatItems);
  }

  // ==========================================
  // 4. HERO PARTICLES
  // ==========================================
  function initHeroParticles() {
    const container = heroParticles;
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        width: ${Math.random() * 6 + 2}px;
        height: ${Math.random() * 6 + 2}px;
        background: ${['#d4a843', '#f0d78c', '#ffffff', '#87ceeb', '#b39ddb'][Math.floor(Math.random() * 5)]};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.4 + 0.1};
        animation: float ${Math.random() * 5 + 5}s ease-in-out infinite;
        animation-delay: ${Math.random() * 3}s;
      `;
      container.appendChild(el);
    }
  }

  // ==========================================
  // 5. COUNTDOWN
  // ==========================================
  function initCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, CONFIG.countdownInterval);
  }

  function updateCountdown() {
    const now = new Date();
    const diff = BIRTHDAY.getTime() - now.getTime();

    if (diff <= 0) {
      showBirthdayMessage();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    animateNumber('#days', days);
    animateNumber('#hours', hours);
    animateNumber('#minutes', minutes);
    animateNumber('#seconds', seconds);
  }

  function animateNumber(selector, value) {
    const el = document.querySelector(selector);
    if (!el) return;
    const str = String(value).padStart(2, '0');
    if (el.textContent !== str) {
      el.textContent = str;
      el.style.transform = 'scale(1.1)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
    }
  }

  function showBirthdayMessage() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownGrid.classList.add('hidden');
    birthdayMessage.classList.remove('hidden');
    launchConfetti(200);
  }

  // ==========================================
  // 6. CAKE INTERACTION
  // ==========================================
  function initCake() {
    blowCandleBtn.addEventListener('click', blowCandles);
    cutCakeBtn.addEventListener('click', cutCake);
    resetCakeBtn.addEventListener('click', resetCake);
  }

  function blowCandles() {
    if (areCandlesBlown) return;
    const flames = document.querySelectorAll('.flame');
    areCandlesBlown = true;

    flames.forEach((flame, i) => {
      setTimeout(() => {
        flame.classList.add('blown');
        createSmokeParticles(flame);
      }, i * 300);
    });

    blowCandleBtn.classList.add('hidden');
    if (!isCakeCut) cutCakeBtn.classList.remove('hidden');

    setTimeout(() => {
      launchConfetti(80);
    }, 1200);
  }

  function createSmokeParticles(flame) {
    const rect = flame.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2 + (Math.random() - 0.5) * 20}px;
        top: ${rect.top + rect.height / 2}px;
        width: ${Math.random() * 6 + 3}px;
        height: ${Math.random() * 6 + 3}px;
        background: rgba(200, 200, 200, 0.5);
        border-radius: 50%;
        pointer-events: none;
        z-index: 100;
        transition: all ${0.8 + Math.random() * 0.5}s ease-out;
      `;
      document.body.appendChild(particle);
      requestAnimationFrame(() => {
        particle.style.transform = `translate(${(Math.random() - 0.5) * 40}px, ${-(Math.random() * 40 + 20)}px) scale(0)`;
        particle.style.opacity = '0';
      });
      setTimeout(() => particle.remove(), 1500);
    }
  }

  function cutCake() {
    if (isCakeCut) return;
    isCakeCut = true;
    cutCakeBtn.classList.add('hidden');

    cakeWrapper.classList.add('cut-animation');

    setTimeout(() => {
      launchConfetti(150);

      const msg = document.createElement('div');
      msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Dancing Script', cursive;
        font-size: 2.5rem;
        color: #d4a843;
        text-align: center;
        z-index: 1000;
        animation: scaleIn 0.5s ease forwards;
        text-shadow: 0 0 40px rgba(212, 168, 67, 0.3);
        pointer-events: none;
      `;
      msg.innerHTML = '🎉 હેપ્પી બર્થડે ચકુ! 🎉';
      document.body.appendChild(msg);
      setTimeout(() => {
        msg.style.transition = 'opacity 1s ease';
        msg.style.opacity = '0';
        setTimeout(() => msg.remove(), 1000);
      }, 3000);

      resetCakeBtn.classList.remove('hidden');

      if (!areCandlesBlown) {
        areCandlesBlown = true;
        document.querySelectorAll('.flame').forEach(f => f.classList.add('blown'));
        blowCandleBtn.classList.add('hidden');
      }
    }, 800);
  }

  function resetCake() {
    isCakeCut = false;
    areCandlesBlown = false;
    cakeWrapper.classList.remove('cut-animation');
    document.querySelectorAll('.flame').forEach(f => f.classList.remove('blown'));
    blowCandleBtn.classList.remove('hidden');
    cutCakeBtn.classList.remove('hidden');
    resetCakeBtn.classList.add('hidden');
  }

  // ==========================================
  // 7. QUOTE CAROUSEL
  // ==========================================
  function initQuoteCarousel() {
    const slides = quoteTrack.querySelectorAll('.quote-slide');
    totalQuotes = slides.length;

    for (let i = 0; i < totalQuotes; i++) {
      const dot = document.createElement('div');
      dot.className = 'quote-dot' + (i === 0 ? ' active' : '');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToQuote(i));
      quoteDots.appendChild(dot);
    }

    quotePrev.addEventListener('click', () => goToQuote(quoteIndex - 1));
    quoteNext.addEventListener('click', () => goToQuote(quoteIndex + 1));

    let autoInterval = setInterval(() => goToQuote(quoteIndex + 1), 5000);

    const carousel = document.querySelector('.quote-carousel');
    carousel.addEventListener('mouseenter', () => clearInterval(autoInterval));
    carousel.addEventListener('mouseleave', () => {
      autoInterval = setInterval(() => goToQuote(quoteIndex + 1), 5000);
    });
  }

  function goToQuote(index) {
    if (index < 0) index = totalQuotes - 1;
    if (index >= totalQuotes) index = 0;
    quoteIndex = index;

    quoteTrack.style.transform = `translateX(-${index * 100}%)`;

    document.querySelectorAll('.quote-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  // ==========================================
  // 8. SCROLL REVEAL (AOS)
  // ==========================================
  function initScrollReveal() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    function checkReveal() {
      const windowHeight = window.innerHeight;
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < windowHeight * 0.85 && !el.classList.contains('aos-animate')) {
          el.classList.add('aos-animate');
        }
      });
    }

    checkReveal();
    window.addEventListener('scroll', checkReveal);
    window.addEventListener('resize', checkReveal);
  }

  // ==========================================
  // 9. LAZY LOADING
  // ==========================================
  function initLazyLoading() {
    const images = document.querySelectorAll('.lazy');
    if (!images.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.onload = () => {
                img.classList.add('loaded');
                const placeholder = img.parentElement.querySelector('.gallery-placeholder, .frame-placeholder');
                if (placeholder) placeholder.style.display = 'none';
              };
              img.onerror = () => {
                img.classList.add('loaded');
              };
            }
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '100px' });
      images.forEach(img => observer.observe(img));
    } else {
      images.forEach(img => {
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.onload = () => {
            img.classList.add('loaded');
            const placeholder = img.parentElement.querySelector('.gallery-placeholder, .frame-placeholder');
            if (placeholder) placeholder.style.display = 'none';
          };
        }
      });
    }
  }

  // ==========================================
  // 10. SCROLL PROGRESS
  // ==========================================
  function initScrollProgress() {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + '%';
    });
  }

  // ==========================================
  // 11. CURSOR GLOW
  // ==========================================
  function initCursorGlow() {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      cursorGlow.style.opacity = '1';
    });
  }

  // ==========================================
  // 12. MUSIC PLAYER
  // ==========================================
  function tryAutoPlayMusic() {
    birthdayAudio.play().then(() => {
      isMusicPlaying = true;
      musicWave.classList.remove('paused');
    }).catch(() => {
      isMusicPlaying = false;
      musicWave.classList.add('paused');
    });
  }

  musicToggle.addEventListener('click', () => {
    if (musicPopup.classList.contains('hidden')) {
      musicPopup.classList.remove('hidden');
    } else {
      musicPopup.classList.add('hidden');
    }

    if (isMusicPlaying) {
      birthdayAudio.pause();
      isMusicPlaying = false;
      musicWave.classList.add('paused');
      musicToggle.querySelector('i').className = 'fas fa-play';
    } else {
      birthdayAudio.play().then(() => {
        isMusicPlaying = true;
        musicWave.classList.remove('paused');
        musicToggle.querySelector('i').className = 'fas fa-music';
      }).catch(() => {});
    }
  });

  musicCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    musicPopup.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!musicToggle.contains(e.target) && !musicPopup.contains(e.target)) {
      musicPopup.classList.add('hidden');
    }
  });

  // ==========================================
  // 13. CONFETTI SYSTEM
  // ==========================================
  let confettiCtx, confettiW, confettiH;

  function initConfetti() {
    confettiCtx = confettiCanvas.getContext('2d');
    confettiW = confettiCanvas.width = window.innerWidth;
    confettiH = confettiCanvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      confettiW = confettiCanvas.width = window.innerWidth;
      confettiH = confettiCanvas.height = window.innerHeight;
    });
  }
  initConfetti();

  function launchConfetti(count) {
    count = count || CONFIG.confettiCount;
    const items = [];
    const colors = ['#d4a843', '#f0d78c', '#87ceeb', '#b39ddb', '#f8bbd0', '#ffffff', '#c0c0c0'];

    for (let i = 0; i < count; i++) {
      items.push({
        x: Math.random() * confettiW,
        y: -20 - Math.random() * 200,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }

    let frame;
    const startTime = Date.now();

    function animateConfetti() {
      const elapsed = Date.now() - startTime;
      if (elapsed > 6000) {
        confettiCtx.clearRect(0, 0, confettiW, confettiH);
        return;
      }

      confettiCtx.clearRect(0, 0, confettiW, confettiH);

      items.forEach(item => {
        item.y += item.speedY;
        item.x += item.speedX;
        item.rotation += item.rotSpeed;
        item.speedY += 0.02;
        item.opacity = Math.min(1, (6000 - elapsed) / 2000);

        confettiCtx.save();
        confettiCtx.translate(item.x, item.y);
        confettiCtx.rotate((item.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = item.opacity;

        if (item.shape === 'rect') {
          confettiCtx.fillStyle = item.color;
          confettiCtx.fillRect(-item.w / 2, -item.h / 2, item.w, item.h);
        } else {
          confettiCtx.beginPath();
          confettiCtx.arc(0, 0, item.w / 2, 0, Math.PI * 2);
          confettiCtx.fillStyle = item.color;
          confettiCtx.fill();
        }

        confettiCtx.restore();
      });

      frame = requestAnimationFrame(animateConfetti);
    }

    animateConfetti();
  }

  // ==========================================
  // 14. SMOOTH ANCHOR SCROLLING
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==========================================
  // 15. RIPPLE EFFECT ON BUTTONS
  // ==========================================
  document.querySelectorAll('.glass-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        left: ${x - 10}px;
        top: ${y - 10}px;
        pointer-events: none;
        transform: scale(0);
        animation: rippleAnim 0.6s ease-out forwards;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple animation
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(6); opacity: 0; }
    }
  `;
  document.head.appendChild(styleSheet);

  // ==========================================
  // 16. PARALLAX ON SCROLL
  // ==========================================
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      const heroContent = heroSection.querySelector('.hero-container');
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
        heroContent.style.opacity = Math.max(0, 1 - scrolled / 600);
      }
    }
  });

  // ==========================================
  // INIT
  // ==========================================
  initLoading();

  // Expose confetti to global for inline use
  window.launchConfetti = launchConfetti;

})();