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
  const cornerWaveControlBtn = document.getElementById('cornerWaveControlBtn');
  
  // Customizer Controls
  const dock = document.getElementById('waveCustomizerDock');
  const dockCollapseBtn = document.getElementById('dockCollapseBtn');
  const blurSlider = document.getElementById('blurSlider');
  const blurValDisplay = document.getElementById('blurValDisplay');
  const speedSlider = document.getElementById('speedSlider');
  const speedValDisplay = document.getElementById('speedValDisplay');
  const heightSlider = document.getElementById('heightSlider');
  const heightValDisplay = document.getElementById('heightValDisplay');
  const fillSlider = document.getElementById('fillSlider');
  const fillValDisplay = document.getElementById('fillValDisplay');
  const colorChips = document.querySelectorAll('.color-chip');
  const resetWaveBtn = document.getElementById('resetWaveBtn');

  // Modal Elements
  const openExportModalBtn = document.getElementById('openExportModalBtn');
  const closeExportModalBtn = document.getElementById('closeExportModalBtn');
  const exportModal = document.getElementById('exportModal');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const codeSnippetContent = document.getElementById('codeSnippetContent');

  // 3. Theme Toggle Logic
  function setTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    document.body.setAttribute('data-theme', next);
    state.theme = next;

    const segLight = document.getElementById('segThemeLight');
    const segDark = document.getElementById('segThemeDark');
    if (segLight && segDark) {
      if (next === 'light') {
        segLight.classList.add('active');
        segDark.classList.remove('active');
      } else {
        segDark.classList.add('active');
        segLight.classList.remove('active');
      }
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      setTheme(next);
    });
  }

  const segLight = document.getElementById('segThemeLight');
  const segDark = document.getElementById('segThemeDark');
  if (segLight) {
    segLight.addEventListener('click', () => setTheme('light'));
  }
  if (segDark) {
    segDark.addEventListener('click', () => setTheme('dark'));
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

  // 5. Corner Plus Button (Toggles Wave Customizer Dock)
  if (cornerWaveControlBtn) {
    cornerWaveControlBtn.addEventListener('click', () => {
      dock.classList.toggle('collapsed');
      if (!dock.classList.contains('collapsed')) {
        dock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Dock Collapse Header Click
  const dockHeader = document.querySelector('.dock-header');
  if (dockHeader) {
    dockHeader.addEventListener('click', (e) => {
      dock.classList.toggle('collapsed');
    });
  }

  // 6. Real-time Wave Parameter Handlers
  if (blurSlider) {
    blurSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.blur = val;
      blurValDisplay.textContent = `${val}px`;
      RoveiaWave.setBlur(val);
      updateEmbedCode();
    });
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.speed = val;
      speedValDisplay.textContent = `${val.toFixed(1)}x`;
      RoveiaWave.setSpeed(val);
      updateEmbedCode();
    });
  }

  if (heightSlider) {
    heightSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.height = val;
      heightValDisplay.textContent = `${val}px`;
      RoveiaWave.setBaseHeight(val);
      updateEmbedCode();
    });
  }

  if (fillSlider) {
    fillSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.fillOpacity = val;
      fillValDisplay.textContent = val.toFixed(2);
      RoveiaWave.setFillOpacity(val);
      updateEmbedCode();
    });
  }

  // Color chips
  colorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      colorChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const hex = chip.getAttribute('data-color');
      state.color = hex;
      RoveiaWave.setColor(hex);
      document.documentElement.style.setProperty('--brand-blue', hex);
      updateEmbedCode();
    });
  });

  // Reset Button
  if (resetWaveBtn) {
    resetWaveBtn.addEventListener('click', () => {
      state.color = '#218AFF';
      state.blur = 16;
      state.speed = 1.0;
      state.height = 220;
      state.fillOpacity = 0.52;

      blurSlider.value = 16;
      blurValDisplay.textContent = '16px';
      speedSlider.value = 1.0;
      speedValDisplay.textContent = '1.0x';
      heightSlider.value = 220;
      heightValDisplay.textContent = '220px';
      fillSlider.value = 0.52;
      fillValDisplay.textContent = '0.52';

      colorChips.forEach(c => c.classList.remove('active'));
      const defaultChip = document.querySelector('.color-chip[data-color="#218AFF"]');
      if (defaultChip) defaultChip.classList.add('active');
      document.documentElement.style.setProperty('--brand-blue', '#218AFF');

      RoveiaWave.reset();
      updateEmbedCode();
    });
  }

  // 7. Modal & Embed Code Generator
  function generateEmbedCode() {
    return `<!-- ============================================================
     SOFTRA SOL / ROVEIA LIVING WAVE BACKGROUND (100% CONCEPT)
     Paste between markers into any HTML / Webflow Embed block.
     Container must have: position: relative; overflow: hidden;
     ============================================================ -->
<div id="softraWaveBg" class="roveia-wave-bg" aria-hidden="true"></div>

<style>
  .roveia-wave-bg {
    --rwb-blur: ${state.blur}px;
    --rwb-color: ${state.color};
    --rwb-fill: ${state.fillOpacity};

    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
  }
  .roveia-wave-bg .rwb-layer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    filter: blur(calc(var(--rwb-blur) * var(--m, 1)));
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  .roveia-wave-bg .rwb-layer svg {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>

<script>
(function() {
  const CONFIG = {
    targetId: 'softraWaveBg',
    baseHeight: ${state.height},
    baseHeightMobile: ${Math.min(state.height + 40, 380)},
    color: '${state.color}',
    refWidth: 1440,
    points: 8,
    speedMultiplier: ${state.speed.toFixed(1)},
    layers: [
      { wave: 420, opacity: 0.60, speed: 0.50, blurMul: 1.25, seed: 11 },
      { wave: 310, opacity: 0.78, speed: 0.60, blurMul: 1.00, seed: 29 },
      { wave: 180, amp: 90, opacity: 1.00, speed: 0.72, blurMul: 0.80, seed: 53 },
    ]
  };

  const root = document.getElementById(CONFIG.targetId);
  if (!root) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = CONFIG.refWidth, MARGIN = W * 0.18, TAU = Math.PI * 2;

  const xs = [];
  for (let i = 0; i <= CONFIG.points; i++) {
    xs.push(-MARGIN + i * ((W + 2 * MARGIN) / CONFIG.points));
  }

  function makeRng(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  const SVGNS = 'http://www.w3.org/2000/svg';
  const layers = CONFIG.layers.map((cfg, idx) => {
    const rnd = makeRng(cfg.seed || (idx + 1) * 7919);
    const pts = xs.map(() => ({
      p1: rnd() * TAU,
      p2: rnd() * TAU,
      f1: 0.8 + rnd() * 0.4,
      f2: 0.8 + rnd() * 0.4
    }));

    const div = document.createElement('div');
    div.className = 'rwb-layer';
    div.style.setProperty('--m', cfg.blurMul);
    div.style.opacity = cfg.opacity;

    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('preserveAspectRatio', 'none');
    const gradId = 'rwbGrad_' + idx;
    svg.innerHTML = \`<defs>
      <linearGradient id="\${gradId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="\${CONFIG.color}" stop-opacity="var(--rwb-fill, ${state.fillOpacity})" />
        <stop offset="90%" stop-color="\${CONFIG.color}" stop-opacity="0.05" />
        <stop offset="100%" stop-color="\${CONFIG.color}" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path fill="url(#\${gradId})"></path>\`;
    div.appendChild(svg);
    root.appendChild(div);
    return { cfg, pts, div, svg, grad: svg.querySelector('linearGradient'), path: svg.querySelector('path'), totalH: 0, mean: 0, amp: 0 };
  });

  function layout() {
    const base = window.innerWidth <= 640 ? CONFIG.baseHeightMobile : CONFIG.baseHeight;
    for (const L of layers) {
      const total = base + L.cfg.wave;
      L.totalH = total;
      L.mean = L.cfg.wave * 0.5;
      L.amp = L.cfg.amp != null ? L.cfg.amp : L.cfg.wave * 0.45;
      L.div.style.height = total + 'px';
      L.svg.setAttribute('viewBox', \`0 0 \${W} \${total}\`);
      L.grad.setAttribute('y2', total);
    }
  }

  function buildPath(ys, totalH) {
    let d = \`M \${xs[0].toFixed(1)} \${ys[0].toFixed(1)}\`;
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i - 1] ?? xs[i], y0 = ys[i - 1] ?? ys[i];
      const x1 = xs[i], y1 = ys[i];
      const x2 = xs[i + 1], y2 = ys[i + 1];
      const x3 = xs[i + 2] ?? x2, y3 = ys[i + 2] ?? y2;
      const c1x = x1 + (x2 - x0) / 6, c1y = y1 + (y2 - y0) / 6;
      const c2x = x2 - (x3 - x1) / 6, c2y = y2 - (y3 - y1) / 6;
      d += \` C \${c1x.toFixed(1)} \${c1y.toFixed(1)} \${c2x.toFixed(1)} \${c2y.toFixed(1)} \${x2.toFixed(1)} \${y2.toFixed(1)}\`;
    }
    d += \` L \${xs[xs.length - 1].toFixed(1)} \${totalH} L \${xs[0].toFixed(1)} \${totalH} Z\`;
    return d;
  }

  function frame(t) {
    const spCoeff = CONFIG.speedMultiplier;
    for (const L of layers) {
      const sp = L.cfg.speed * spCoeff;
      const ys = L.pts.map(pt => {
        const a = Math.sin(t * sp * pt.f1 + pt.p1);
        const b = Math.sin(t * sp * 1.618 * pt.f2 + pt.p2);
        return L.mean + L.amp * (0.62 * a + 0.38 * b);
      });
      L.path.setAttribute('d', buildPath(ys, L.totalH));
    }
  }

  layout();
  window.addEventListener('resize', layout);

  if (reduce) { frame(0); return; }

  let running = false, raf = 0;
  function loop(now) { frame(now / 1000); raf = requestAnimationFrame(loop); }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop(), { threshold: 0 }).observe(root);
  } else { start(); }
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
})();
<\/script>`;
  }

  function updateEmbedCode() {
    if (codeSnippetContent) {
      codeSnippetContent.textContent = generateEmbedCode();
    }
  }

  updateEmbedCode();

  if (openExportModalBtn && exportModal) {
    openExportModalBtn.addEventListener('click', () => {
      updateEmbedCode();
      exportModal.classList.add('open');
      exportModal.setAttribute('aria-hidden', 'false');
    });
  }

  if (closeExportModalBtn && exportModal) {
    closeExportModalBtn.addEventListener('click', () => {
      exportModal.classList.remove('open');
      exportModal.setAttribute('aria-hidden', 'true');
    });

    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) {
        exportModal.classList.remove('open');
        exportModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', async () => {
      const code = generateEmbedCode();
      try {
        await navigator.clipboard.writeText(code);
        copyBtnText.textContent = 'Copied!';
        setTimeout(() => {
          copyBtnText.textContent = 'Copy Code';
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyBtnText.textContent = 'Copied!';
        setTimeout(() => {
          copyBtnText.textContent = 'Copy Code';
        }, 2000);
      }
    });
  }

  // =========================================================================
  // 7. Emotion Agency Style Interactive Text Hover Engine
  // =========================================================================
  const heroHeading = document.getElementById('heroHeadline');
  const liquidDisplace = document.getElementById('liquidDisplace');
  const liquidTurbulence = document.getElementById('liquidTurbulence');
  const cursorWrapper = document.getElementById('liquidCursorWrapper');
  const bubble = document.getElementById('liquidBubble');

  // Decode Glyph Palette (matching Emotion Agency matrix/decode feel)
  const SCRAMBLE_GLYPHS = ['*', '+', '~', '§', '‡', '1', '0', 'x', 'z', '/', '<', '>', '$', '%', '#', '∆'];

  if (heroHeading) {
    const emotionWords = heroHeading.querySelectorAll('.emotion-word');

    // Split words into interactive character spans
    emotionWords.forEach(wordEl => {
      const rawText = wordEl.getAttribute('data-word') || wordEl.textContent.trim();
      wordEl.innerHTML = '';
      
      const chars = Array.from(rawText);
      chars.forEach((char, idx) => {
        const span = document.createElement('span');
        span.className = 'emotion-char';
        span.textContent = char;
        span.setAttribute('data-orig', char);
        span.setAttribute('data-index', idx);
        wordEl.appendChild(span);
      });

      let isScrambling = false;

      // Scramble / Decode effect on hover
      function triggerScramble() {
        if (isScrambling) return;
        isScrambling = true;

        const charSpans = wordEl.querySelectorAll('.emotion-char');
        charSpans.forEach((span, i) => {
          const orig = span.getAttribute('data-orig');
          const delay = i * 22; // Staggered ripple across letters
          const totalFrames = 6 + Math.floor(Math.random() * 4);
          let frame = 0;

          setTimeout(() => {
            span.classList.add('scrambling');
            const interval = setInterval(() => {
              if (frame < totalFrames) {
                span.textContent = SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
                frame++;
              } else {
                clearInterval(interval);
                span.textContent = orig;
                span.classList.remove('scrambling');
                if (i === charSpans.length - 1) {
                  isScrambling = false;
                }
              }
            }, 36);
          }, delay);
        });
      }

      wordEl.addEventListener('mouseenter', (e) => {
        wordEl.classList.add('is-hovered');
        triggerScramble();
        bumpLiquidRipple(16);
      });

      wordEl.addEventListener('mousemove', (e) => {
        const rect = wordEl.getBoundingClientRect();
        const wordCenterX = rect.left + rect.width / 2;
        const wordCenterY = rect.top + rect.height / 2;
        const normX = Math.max(-1, Math.min(1, (e.clientX - wordCenterX) / (rect.width / 2)));
        const normY = Math.max(-1, Math.min(1, (e.clientY - wordCenterY) / (rect.height / 2)));

        // Dynamic Chromatic Aberration Split (RGB Fringe) & Magnetic Lift
        const chromaR = (-normX * 3.5).toFixed(1);
        const chromaB = (normX * 3.5).toFixed(1);
        const chromaY = (normY * 1.5).toFixed(1);
        
        wordEl.style.textShadow = `${chromaR}px ${chromaY}px 1px rgba(33, 138, 255, 0.75), ${chromaB}px ${-chromaY}px 1px rgba(244, 63, 94, 0.65), 0 0 16px rgba(33, 138, 255, 0.3)`;
        wordEl.style.transform = `translate3d(${(normX * 4).toFixed(1)}px, ${(normY * 2.5 - 2).toFixed(1)}px, 0) scale(1.015)`;
      });

      wordEl.addEventListener('mouseleave', () => {
        wordEl.classList.remove('is-hovered');
        wordEl.style.textShadow = '';
        wordEl.style.transform = '';
      });
    });

    // Serif Italic Prefix ('Where') Hover Scramble & Tilt
    const serifPrefix = document.getElementById('heroSerifPrefix');
    if (serifPrefix) {
      serifPrefix.addEventListener('mouseenter', () => {
        bumpLiquidRipple(18);
      });
    }
  }

  // Liquid Ripple Displacement Engine (SVG Filter scale modulator)
  let currentDisplaceScale = 0;
  let targetDisplaceScale = 0;
  let liquidTime = 0;

  function bumpLiquidRipple(strength = 14) {
    targetDisplaceScale = Math.max(targetDisplaceScale, strength);
  }

  function updateLiquidRipple() {
    currentDisplaceScale += (targetDisplaceScale - currentDisplaceScale) * 0.14;
    targetDisplaceScale *= 0.92; // smooth decay

    if (currentDisplaceScale < 0.05) {
      currentDisplaceScale = 0;
    }

    if (liquidDisplace) {
      liquidDisplace.setAttribute('scale', currentDisplaceScale.toFixed(2));
    }

    if (liquidTurbulence && currentDisplaceScale > 0.1) {
      liquidTime += 0.02;
      liquidTurbulence.setAttribute('baseFrequency', `${(0.038 + Math.sin(liquidTime) * 0.008).toFixed(4)} ${(0.038 + Math.cos(liquidTime) * 0.008).toFixed(4)}`);
    }

    requestAnimationFrame(updateLiquidRipple);
  }
  requestAnimationFrame(updateLiquidRipple);

  // Mouse Velocity Tracking across Hero for Liquid Wake
  let lastMouseX = 0, lastMouseY = 0;
  if (heroHeading) {
    heroHeading.addEventListener('mousemove', (e) => {
      const vx = e.clientX - lastMouseX;
      const vy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      const speed = Math.hypot(vx, vy);
      if (speed > 8) {
        bumpLiquidRipple(Math.min(18, 4 + speed * 0.4));
      }
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

});
