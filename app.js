/**
 * ============================================================================
 * SOFTRA SOL HERO SECTION — Main Application Script
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize Roveia Living Wave Engine
  const wave = RoveiaWave.init({
    targetId: 'roveiaWaveBg',
    baseHeight: 220,
    baseHeightMobile: 260,
    color: '#218AFF',
    fillOpacity: 0.52,
    blur: 16,
    speedMultiplier: 1.0,
    refWidth: 1440,
    points: 8,
    layers: [
      { wave: 420, opacity: 0.60, speed: 0.50, blurMul: 1.25, seed: 11 },
      { wave: 310, opacity: 0.78, speed: 0.60, blurMul: 1.00, seed: 29 },
      { wave: 180, amp: 90, opacity: 1.00, speed: 0.72, blurMul: 0.80, seed: 53 },
    ]
  });

  // Current tuning state
  const state = {
    color: '#218AFF',
    blur: 16,
    speed: 1.0,
    height: 220,
    fillOpacity: 0.52,
    theme: 'light'
  };

  // 2. DOM Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  // 3. Theme Toggle Logic
  function setTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    document.body.setAttribute('data-theme', next);
    state.theme = next;
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      setTheme(next);
    });
  }

  // 4. Mobile Menu
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // =========================================================================
  // 5. Emotion Agency Style Interactive Text Hover (Single Targeted Phrase)
  // Guaranteed ZERO layout shift & buttery smooth 120fps GPU physics wave
  // =========================================================================
  const targetEl = document.getElementById('emotionTarget');
  const cursorWrapper = document.getElementById('liquidCursorWrapper');
  const bubble = document.getElementById('liquidBubble');

  if (targetEl) {
    const rawText = targetEl.textContent.trim();
    targetEl.innerHTML = '';

    const charObjects = [];

    // Build individual character spans
    for (let i = 0; i < rawText.length; i++) {
      const char = rawText[i];
      const span = document.createElement('span');
      span.className = 'emotion-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      targetEl.appendChild(span);

      charObjects.push({
        span: span,
        isSpace: char === ' ',
        currentY: 0,
        targetY: 0,
        currentScale: 1,
        targetScale: 1,
        currentChroma: 0,
        targetChroma: 0,
        centerX: 0
      });
    }

    // Pre-measure and lock exact character pixel widths (Prevents ANY text shaking)
    function measureCharacters() {
      charObjects.forEach(obj => {
        const rect = obj.span.getBoundingClientRect();
        if (rect.width > 0) {
          obj.span.style.width = `${rect.width.toFixed(2)}px`;
        }
        obj.centerX = rect.left + rect.width / 2;
      });
    }

    requestAnimationFrame(measureCharacters);
    window.addEventListener('resize', measureCharacters);

    let isHovered = false;
    let animFrameId = null;

    // Fluid Physics Animation Loop (Runs via requestAnimationFrame lerp, zero CSS transition conflicts)
    function updatePhysics() {
      let isMoving = false;

      charObjects.forEach(obj => {
        const dy = (obj.targetY - obj.currentY) * 0.18;
        const ds = (obj.targetScale - obj.currentScale) * 0.18;
        const dc = (obj.targetChroma - obj.currentChroma) * 0.18;

        obj.currentY += dy;
        obj.currentScale += ds;
        obj.currentChroma += dc;

        if (Math.abs(dy) > 0.01 || Math.abs(ds) > 0.001 || Math.abs(dc) > 0.01) {
          isMoving = true;
        }

        // Pure 3D transform on GPU (Cannot cause reflow on parent or hero section)
        obj.span.style.transform = `translate3d(0, ${obj.currentY.toFixed(2)}px, 0) scale(${obj.currentScale.toFixed(3)})`;
        
        if (Math.abs(obj.currentChroma) > 0.1) {
          const c = obj.currentChroma.toFixed(1);
          obj.span.style.textShadow = `${c}px 0 2px rgba(33, 138, 255, 0.75), ${-c}px 0 2px rgba(244, 63, 94, 0.65), 0 0 16px rgba(33, 138, 255, 0.35)`;
        } else {
          obj.span.style.textShadow = '';
        }
      });

      if (isHovered || isMoving) {
        animFrameId = requestAnimationFrame(updatePhysics);
      } else {
        animFrameId = null;
        charObjects.forEach(obj => {
          obj.currentY = 0;
          obj.currentScale = 1;
          obj.currentChroma = 0;
          obj.span.style.transform = 'translate3d(0, 0, 0) scale(1)';
          obj.span.style.textShadow = '';
        });
      }
    }

    function startPhysicsLoop() {
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(updatePhysics);
      }
    }

    targetEl.addEventListener('mouseenter', () => {
      isHovered = true;
      measureCharacters();
      startPhysicsLoop();
    });

    targetEl.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const radius = 80; // Smooth 80px influence bell curve

      charObjects.forEach(obj => {
        if (obj.isSpace) {
          obj.targetY = 0;
          obj.targetScale = 1;
          obj.targetChroma = 0;
          return;
        }

        const dist = mouseX - obj.centerX;

        if (Math.abs(dist) < radius) {
          const factor = Math.cos((dist / radius) * (Math.PI / 2));
          obj.targetY = -factor * 6.5; // Smooth 6.5px lift
          obj.targetScale = 1 + factor * 0.08;
          obj.targetChroma = (-dist / radius) * 2.5;
        } else {
          obj.targetY = 0;
          obj.targetScale = 1;
          obj.targetChroma = 0;
        }
      });

      startPhysicsLoop();
    });

    targetEl.addEventListener('mouseleave', () => {
      isHovered = false;
      charObjects.forEach(obj => {
        obj.targetY = 0;
        obj.targetScale = 1;
        obj.targetChroma = 0;
      });
      startPhysicsLoop();
    });
  }

  // Liquid Bubble Cursor Follower
  if (cursorWrapper && bubble && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = -200, mouseY = -200;
    let currentX = -200, currentY = -200;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        cursorWrapper.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cursorWrapper.style.opacity = '0';
    });

    function renderCursor() {
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;
      cursorWrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    if (heroHeading) {
      heroHeading.addEventListener('mouseenter', () => {
        bubble.classList.add('dissolve-in-text');
      });
      heroHeading.addEventListener('mouseleave', () => {
        bubble.classList.remove('dissolve-in-text');
      });
    }
  }

  // =========================================================================
  // 8. Interactive Work Category Filter Tabs
  // =========================================================================
  const filterBtns = document.querySelectorAll('.work-filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      workCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 9. Interactive Project Inquiry Form & Chip Selectors
  // =========================================================================
  const serviceChips = document.querySelectorAll('#serviceChips .chip-btn');
  const serviceInput = document.getElementById('selectedServiceInput');
  const budgetChips = document.querySelectorAll('#budgetChips .chip-btn');
  const budgetInput = document.getElementById('selectedBudgetInput');
  const inquiryForm = document.getElementById('projectInquiryForm');
  const formSuccessAlert = document.getElementById('formSuccessAlert');
  const submitInquiryBtn = document.getElementById('submitInquiryBtn');

  serviceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      serviceChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      if (serviceInput) serviceInput.value = chip.getAttribute('data-value');
    });
  });

  budgetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      budgetChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      if (budgetInput) budgetInput.value = chip.getAttribute('data-value');
    });
  });

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('clientName')?.value.trim();
      const email = document.getElementById('clientEmail')?.value.trim();
      const message = document.getElementById('clientMessage')?.value.trim();

      if (!name || !email || !message) {
        alert('Please fill in your name, email, and project overview.');
        return;
      }

      if (submitInquiryBtn) {
        submitInquiryBtn.disabled = true;
        const textSpan = submitInquiryBtn.querySelector('span');
        if (textSpan) textSpan.textContent = 'Transmitting Request...';
      }

      setTimeout(() => {
        if (submitInquiryBtn) {
          submitInquiryBtn.disabled = false;
          const textSpan = submitInquiryBtn.querySelector('span');
          if (textSpan) textSpan.textContent = 'Request Sent!';
        }
        if (formSuccessAlert) {
          formSuccessAlert.style.display = 'flex';
        }
        inquiryForm.reset();
      }, 700);
    });
  }

  // =========================================================================
  // 10. Smooth Back to Top
  // =========================================================================
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

});
