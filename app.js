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

    const heroHeading = document.querySelector('.hero-heading');
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
  // 8. Cinematic Work Horizontal Runway Slider & Category Filter
  // =========================================================================
  const runwayTrack = document.getElementById('workRunwayTrack');
  const runwayCards = document.querySelectorAll('.work-runway-card');
  const workPrevBtn = document.getElementById('workPrevBtn');
  const workNextBtn = document.getElementById('workNextBtn');
  const workCounterActive = document.getElementById('workCounterActive');
  const workProgressBar = document.getElementById('workRunwayProgressBar');
  const filterBtns = document.querySelectorAll('.work-filter-btn');

  function updateRunwayProgress() {
    if (!runwayTrack) return;
    const scrollLeft = runwayTrack.scrollLeft;
    const maxScroll = runwayTrack.scrollWidth - runwayTrack.clientWidth;
    const progress = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)) : 0;
    
    if (workProgressBar) {
      workProgressBar.style.width = `${progress}%`;
    }

    // Determine currently active card based on center position
    if (runwayCards.length > 0 && workCounterActive) {
      const trackRect = runwayTrack.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      let closestCardIndex = 0;
      let minDistance = Infinity;

      runwayCards.forEach((card, idx) => {
        if (card.style.display !== 'none') {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(trackCenter - cardCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestCardIndex = idx;
          }
        }
      });

      workCounterActive.textContent = String(closestCardIndex + 1).padStart(2, '0');
    }
  }

  if (runwayTrack) {
    runwayTrack.addEventListener('scroll', updateRunwayProgress, { passive: true });
    updateRunwayProgress();

    // Arrow navigation
    const getScrollStep = () => {
      const firstCard = runwayTrack.querySelector('.work-runway-card:not([style*="display: none"])');
      return firstCard ? firstCard.offsetWidth + 28 : 500;
    };

    if (workPrevBtn) {
      workPrevBtn.addEventListener('click', () => {
        runwayTrack.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      });
    }

    if (workNextBtn) {
      workNextBtn.addEventListener('click', () => {
        runwayTrack.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      });
    }

    // Mouse Drag to Scroll for Desktop Users
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    runwayTrack.addEventListener('mousedown', (e) => {
      // Don't drag if clicking links or buttons
      if (e.target.closest('a') || e.target.closest('button')) return;
      isDown = true;
      runwayTrack.classList.add('is-dragging');
      startX = e.pageX - runwayTrack.offsetLeft;
      scrollStart = runwayTrack.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
      if (runwayTrack) runwayTrack.classList.remove('is-dragging');
    });

    runwayTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - runwayTrack.offsetLeft;
      const walk = (x - startX) * 1.6;
      runwayTrack.scrollLeft = scrollStart - walk;
    });
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      let visibleCount = 0;
      runwayCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (runwayTrack) {
        runwayTrack.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(updateRunwayProgress, 200);
      }
    });
  });

  // =========================================================================
  // 9. Direct Project Inquiry Submission & Validation (softrasol@gmail.com)
  // =========================================================================
  const serviceChips = document.querySelectorAll('#serviceChips .chip-btn');
  const serviceInput = document.getElementById('selectedServiceInput');
  const budgetChips = document.querySelectorAll('#budgetChips .chip-btn');
  const budgetInput = document.getElementById('selectedBudgetInput');
  const inquiryForm = document.getElementById('projectInquiryForm');
  const contactSuccessCard = document.getElementById('contactSuccessCard');
  const successClientName = document.getElementById('successClientName');
  const successServiceVal = document.getElementById('successServiceVal');
  const successBudgetVal = document.getElementById('successBudgetVal');
  const sendAnotherBtn = document.getElementById('sendAnotherBtn');
  const submitInquiryBtn = document.getElementById('submitInquiryBtn');
  const submitBtnText = document.getElementById('submitBtnText');

  // Direct Left Column Email Copy
  const copyDirectEmailBtn = document.getElementById('copyDirectEmailBtn');
  const copyDirectEmailText = document.getElementById('copyDirectEmailText');
  if (copyDirectEmailBtn) {
    copyDirectEmailBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText('softrasol@gmail.com');
        if (copyDirectEmailText) {
          copyDirectEmailText.textContent = 'Copied!';
          copyDirectEmailBtn.classList.add('copied');
          setTimeout(() => {
            copyDirectEmailText.textContent = 'Copy';
            copyDirectEmailBtn.classList.remove('copied');
          }, 2200);
        }
      } catch (err) {
        // Fallback
        const directLink = document.getElementById('directEmailLink');
        if (directLink) directLink.click();
      }
    });
  }

  // Service Chip Selection
  serviceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      serviceChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      if (serviceInput) serviceInput.value = chip.getAttribute('data-value') || chip.textContent.trim();
    });
  });

  // Budget Chip Selection
  budgetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      budgetChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      if (budgetInput) budgetInput.value = chip.getAttribute('data-value') || chip.textContent.trim();
    });
  });

  // Real-time inline field validation
  const clientNameInput = document.getElementById('clientName');
  const clientEmailInput = document.getElementById('clientEmail');
  const clientCompanyInput = document.getElementById('clientCompany');
  const clientMessageInput = document.getElementById('clientMessage');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  function clearError(input, errorEl) {
    if (input) input.classList.remove('input-error-state');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function setError(input, errorEl, message) {
    if (input) {
      input.classList.add('input-error-state');
      input.focus();
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  if (clientNameInput) {
    clientNameInput.addEventListener('input', () => clearError(clientNameInput, nameError));
  }
  if (clientEmailInput) {
    clientEmailInput.addEventListener('input', () => clearError(clientEmailInput, emailError));
  }
  if (clientMessageInput) {
    clientMessageInput.addEventListener('input', () => clearError(clientMessageInput, messageError));
  }

  let lastGeneratedSpec = '';
  let lastMailtoUrl = '';

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = clientNameInput ? clientNameInput.value.trim() : '';
      const email = clientEmailInput ? clientEmailInput.value.trim() : '';
      const company = clientCompanyInput ? clientCompanyInput.value.trim() : '';
      const message = clientMessageInput ? clientMessageInput.value.trim() : '';
      const selectedService = (serviceInput && serviceInput.value) || 'High Conversion Web';
      const selectedBudget = (budgetInput && budgetInput.value) || '$10k – $25k';

      // Validate Name
      if (!name || name.length < 2) {
        setError(clientNameInput, nameError, 'Please enter your full name (minimum 2 characters).');
        return;
      }

      // Validate Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailPattern.test(email)) {
        setError(clientEmailInput, emailError, 'Please enter a valid work email address (e.g. name@company.com).');
        return;
      }

      // Validate Message
      if (!message || message.length < 10) {
        setError(clientMessageInput, messageError, 'Please describe your project or requirements (at least 10 characters).');
        return;
      }

      // Indicate Transmission in Progress
      if (submitInquiryBtn) {
        submitInquiryBtn.disabled = true;
        if (submitBtnText) submitBtnText.textContent = 'Transmitting to softrasol@gmail.com...';
      }

      // Formulate Structured Enterprise Spec
      const formattedSubject = `[Project Inquiry] ${selectedService} — ${name}${company ? ' (' + company + ')' : ''}`;

      // Helper to display direct success card
      const renderSuccessState = () => {
        if (successClientName) successClientName.textContent = name;
        if (successServiceVal) successServiceVal.textContent = selectedService;
        if (successBudgetVal) successBudgetVal.textContent = selectedBudget;

        if (inquiryForm) inquiryForm.style.display = 'none';
        if (contactSuccessCard) {
          contactSuccessCard.style.display = 'block';
          contactSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (submitInquiryBtn) {
          submitInquiryBtn.disabled = false;
          if (submitBtnText) submitBtnText.textContent = 'Submit Project Request';
        }
      };

      // Automatic background serverless dispatch to softrasol@gmail.com
      fetch('https://formsubmit.co/ajax/softrasol@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: formattedSubject,
          _captcha: 'false',
          _template: 'table',
          client_name: name,
          work_email: email,
          company: company || 'Direct Client',
          service_requested: selectedService,
          estimated_budget: selectedBudget,
          project_overview: message
        })
      })
      .then(res => res.json())
      .then(() => {
        renderSuccessState();
      })
      .catch(() => {
        // Fallback display if network or adblock intercepts
        renderSuccessState();
      });
    });
  }

  // Submit Another Project Request Button
  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', () => {
      if (contactSuccessCard) contactSuccessCard.style.display = 'none';
      if (inquiryForm) {
        inquiryForm.reset();
        clearError(clientNameInput, nameError);
        clearError(clientEmailInput, emailError);
        clearError(clientMessageInput, messageError);

        // Reset service chips to default (1st chip)
        if (serviceChips.length > 0) {
          serviceChips.forEach((c, idx) => {
            const isActive = idx === 0;
            c.classList.toggle('active', isActive);
            c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          });
          if (serviceInput) serviceInput.value = serviceChips[0].getAttribute('data-value') || 'High Conversion Web';
        }

        // Reset budget chips to default (2nd chip: $10k - $25k)
        if (budgetChips.length > 0) {
          budgetChips.forEach((c, idx) => {
            const isActive = idx === 1;
            c.classList.toggle('active', isActive);
            c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          });
          if (budgetInput) budgetInput.value = budgetChips[1]?.getAttribute('data-value') || '$10k – $25k';
        }

        inquiryForm.style.display = 'flex';
        inquiryForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // =========================================================================
  // 10. Smooth Back to Top
  // =========================================================================
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } catch (err) {
        window.scrollTo(0, 0);
      }
      if (document.documentElement) {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
      if (document.body) {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    });
  }

  // =========================================================================
  // 11. Kinetic Holographic Parallax 3D Engine & Canvas Visualizers
  // =========================================================================
  const kineticSection = document.getElementById('stats');
  const kineticCards = document.querySelectorAll('.kinetic-card');

  // --- A. 3D Tilt & Specular Light Spotlight Physics ---
  kineticCards.forEach(card => {
    let currRotateX = 0, currRotateY = 0;
    let targetRotateX = 0, targetRotateY = 0;
    let isHovering = false;
    let animId = null;

    function updateTilt() {
      currRotateX += (targetRotateX - currRotateX) * 0.12;
      currRotateY += (targetRotateY - currRotateY) * 0.12;
      card.style.transform = `perspective(1000px) rotateX(${currRotateX.toFixed(2)}deg) rotateY(${currRotateY.toFixed(2)}deg) translateZ(${isHovering ? 8 : 0}px)`;

      if (isHovering || Math.abs(targetRotateX - currRotateX) > 0.05 || Math.abs(targetRotateY - currRotateY) > 0.05) {
        animId = requestAnimationFrame(updateTilt);
      } else {
        card.style.transform = '';
      }
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normX = (x / rect.width) - 0.5;
      const normY = (y / rect.height) - 0.5;

      targetRotateX = -normY * 14;
      targetRotateY = normX * 14;

      card.style.setProperty('--spot-x', `${(x / rect.width * 100).toFixed(1)}%`);
      card.style.setProperty('--spot-y', `${(y / rect.height * 100).toFixed(1)}%`);

      if (!isHovering) {
        isHovering = true;
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(updateTilt);
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      targetRotateX = 0;
      targetRotateY = 0;
    });
  });

  // --- B. Four Kinetic Procedural Canvas Animations ---
  function setupHiDPI(canvas) {
    if (!canvas) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 300;
    const h = rect.height || 140;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w, h };
  }

  const cvWave = document.getElementById('canvasWaveform');
  const cvCube = document.getElementById('canvasCube');
  const cvOrbit = document.getElementById('canvasOrbit');
  const cvInf = document.getElementById('canvasInfinity');

  let canWaveState, canCubeState, canOrbitState, canInfState;

  function initCanvases() {
    if (cvWave) canWaveState = setupHiDPI(cvWave);
    if (cvCube) canCubeState = setupHiDPI(cvCube);
    if (cvOrbit) canOrbitState = setupHiDPI(cvOrbit);
    if (cvInf) canInfState = setupHiDPI(cvInf);
  }

  initCanvases();
  window.addEventListener('resize', initCanvases);

  // 1. Waveform Pulse (Card 1)
  function renderWaveform(t) {
    if (!canWaveState) return;
    const { ctx, w, h } = canWaveState;
    ctx.clearRect(0, 0, w, h);

    const centerY = h * 0.55;
    const blue = '#218AFF';
    const cyan = '#06B6D4';

    // Glow background trail
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const freq = 0.024;
      const wave1 = Math.sin(x * freq + t * 2.8) * 20;
      const wave2 = Math.sin(x * freq * 1.6 - t * 1.8) * 9;
      const y = centerY + wave1 + wave2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(33, 138, 255, 0.25)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Sharp foreground neon line
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const freq = 0.024;
      const wave1 = Math.sin(x * freq + t * 2.8) * 20;
      const wave2 = Math.sin(x * freq * 1.6 - t * 1.8) * 9;
      const y = centerY + wave1 + wave2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, cyan);
    grad.addColorStop(0.5, blue);
    grad.addColorStop(1, cyan);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Floating pulse beacon dot
    const dotX = (t * 70) % w;
    const dotY = centerY + Math.sin(dotX * 0.024 + t * 2.8) * 20 + Math.sin(dotX * 0.024 * 1.6 - t * 1.8) * 9;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // 2. 3D Isometric Wireframe Cube (Card 2)
  const cubeVertices = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]
  ];
  const cubeEdges = [
    [0,1], [1,2], [2,3], [3,0],
    [4,5], [5,6], [6,7], [7,4],
    [0,4], [1,5], [2,6], [3,7]
  ];

  function renderCube(t) {
    if (!canCubeState) return;
    const { ctx, w, h } = canCubeState;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5, cy = h * 0.5;
    const scale = 34;
    const rotX = t * 0.65;
    const rotY = t * 0.95;

    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

    const projected = cubeVertices.map(([vx, vy, vz]) => {
      const x1 = vx * cosY + vz * sinY;
      const y1 = vy;
      const z1 = -vx * sinY + vz * cosY;
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const fov = 3.2;
      const p = fov / (fov + z2);
      return [cx + x2 * scale * p, cy + y2 * scale * p];
    });

    // Edges
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
    ctx.lineWidth = 1.8;
    for (const [i, j] of cubeEdges) {
      ctx.beginPath();
      ctx.moveTo(projected[i][0], projected[i][1]);
      ctx.lineTo(projected[j][0], projected[j][1]);
      ctx.stroke();
    }

    // Glowing Vertex Nodes
    for (const [px, py] of projected) {
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#818CF8';
      ctx.shadowColor = '#6366F1';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // 3. Concentric Kinetic Orbit Rings (Card 3)
  function renderOrbit(t) {
    if (!canOrbitState) return;
    const { ctx, w, h } = canOrbitState;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5, cy = h * 0.5;

    // Outer Orbit Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, 50, 24, -Math.PI / 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Middle Orbit Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, 34, 16, Math.PI / 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(33, 138, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Core Pulse
    const corePulse = 7 + Math.sin(t * 3.5) * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, corePulse, 0, Math.PI * 2);
    ctx.fillStyle = '#06B6D4';
    ctx.shadowColor = '#06B6D4';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Satellite 1
    const sat1Angle = t * 2.2;
    const s1x = cx + Math.cos(sat1Angle) * 50;
    const s1y = cy + Math.sin(sat1Angle) * 24;
    ctx.beginPath();
    ctx.arc(s1x, s1y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#218AFF';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Satellite 2
    const sat2Angle = -t * 3.0;
    const s2x = cx + Math.cos(sat2Angle) * 34;
    const s2y = cy + Math.sin(sat2Angle) * 16;
    ctx.beginPath();
    ctx.arc(s2x, s2y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#38BDF8';
    ctx.fill();
  }

  // 4. Infinity Laser Energy Loop (Card 4)
  function renderInfinity(t) {
    if (!canInfState) return;
    const { ctx, w, h } = canInfState;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5, cy = h * 0.5;
    const a = 46;

    // Background faint path
    ctx.beginPath();
    for (let u = 0; u <= Math.PI * 2; u += 0.05) {
      const denom = 1 + Math.sin(u) * Math.sin(u);
      const px = cx + (a * Math.cos(u)) / denom;
      const py = cy + (a * Math.sin(u) * Math.cos(u)) / denom;
      if (u === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.28)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Laser Particle Beam Traveling along infinity
    const numBeams = 3;
    for (let b = 0; b < numBeams; b++) {
      const u = (t * 2.4 + (b * Math.PI * 2 / numBeams)) % (Math.PI * 2);
      const denom = 1 + Math.sin(u) * Math.sin(u);
      const bx = cx + (a * Math.cos(u)) / denom;
      const by = cy + (a * Math.sin(u) * Math.cos(u)) / denom;

      ctx.beginPath();
      ctx.arc(bx, by, 4 - b, 0, Math.PI * 2);
      ctx.fillStyle = b === 0 ? '#FFFFFF' : '#38BDF8';
      ctx.shadowColor = '#0284C7';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Unified 60fps Render Loop with IntersectionObserver
  let isKineticVisible = false;
  let kineticRaf = null;

  function kineticLoop(now) {
    if (!isKineticVisible) return;
    const t = now * 0.001;
    renderWaveform(t);
    renderCube(t);
    renderOrbit(t);
    renderInfinity(t);
    kineticRaf = requestAnimationFrame(kineticLoop);
  }

  if (kineticSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      isKineticVisible = entry.isIntersecting;
      if (isKineticVisible) {
        cancelAnimationFrame(kineticRaf);
        kineticRaf = requestAnimationFrame(kineticLoop);
      }
    }, { threshold: 0.05 }).observe(kineticSection);
  } else {
    isKineticVisible = true;
    kineticRaf = requestAnimationFrame(kineticLoop);
  }

});
