/**
 * ============================================================================
 * ROVEIA LIVING WAVE ENGINE — 100% Exact Reverse-Engineered Mathematical Wave
 * ============================================================================
 * Generates organic, non-repeating cubic Bezier harmonic waves with gaussian
 * blur and vertical linear gradients.
 * 
 * Features:
 * - Dual harmonic oscillation using Golden Ratio frequency offset (1.618x)
 * - Catmull-Rom to Cubic Bezier curve calculation
 * - Multi-layered parallax depth (3 distinct animated SVG layers)
 * - Hardware accelerated CSS filters (blur + 3D transform)
 * - Auto-pauses on visibility change or off-screen (zero CPU waste)
 * - Accessible: respects prefers-reduced-motion
 * - Live reactive tuning API (color, blur, speed, base height, opacity)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RoveiaWave = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const DEFAULT_CONFIG = {
    targetId: 'roveiaWaveBg',
    baseHeight: 220,          // Solid rectangular base height on desktop (px)
    baseHeightMobile: 260,    // Solid rectangular base height on <=600px screens (px)
    color: '#218AFF',         // Signature Electric Blue
    fillOpacity: 0.52,        // Opacity at the crest (fades smoothly downward to 0)
    blur: 16,                 // Base gaussian blur in px
    speedMultiplier: 1.0,     // Overall speed coefficient
    refWidth: 1440,           // Reference coordinate width
    points: 8,                // Control anchor points across width
    // 3 parallax depth layers (back to front)
    layers: [
      { wave: 420, opacity: 0.60, speed: 0.50, blurMul: 1.25, seed: 11 },
      { wave: 310, opacity: 0.78, speed: 0.60, blurMul: 1.00, seed: 29 },
      { wave: 180, amp: 90, opacity: 1.00, speed: 0.72, blurMul: 0.80, seed: 53 },
    ]
  };

  class WaveEngine {
    constructor(customConfig = {}) {
      this.config = JSON.parse(JSON.stringify({ ...DEFAULT_CONFIG, ...customConfig }));
      this.container = null;
      this.layerInstances = [];
      this.xs = [];
      this.running = false;
      this.rafId = 0;
      this.observer = null;
      this.onResize = this.layout.bind(this);
      this.onVisibility = this.handleVisibility.bind(this);
      
      this.init();
    }

    // Linear Congruential Generator for reproducible smooth seed pseudo-randomness
    makeRng(seed) {
      let s = seed >>> 0;
      return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      };
    }

    init() {
      this.container = document.getElementById(this.config.targetId);
      if (!this.container) {
        console.warn(`[RoveiaWave] Element #${this.config.targetId} not found.`);
        return;
      }

      // Clear any prior children
      this.container.innerHTML = '';
      this.layerInstances = [];

      // CSS Variables on root
      this.updateRootStyles();

      const W = this.config.refWidth;
      const MARGIN = W * 0.18; // Margin overflow prevents clipping at left and right edges
      const TAU = Math.PI * 2;

      // Compute evenly spaced X coordinates from -MARGIN to W + MARGIN
      this.xs = [];
      for (let i = 0; i <= this.config.points; i++) {
        this.xs.push(-MARGIN + i * ((W + 2 * MARGIN) / this.config.points));
      }

      const SVGNS = 'http://www.w3.org/2000/svg';

      // Instantiate each layer DOM element
      this.layerInstances = this.config.layers.map((cfg, idx) => {
        const rnd = this.makeRng(cfg.seed || (idx + 1) * 7919);
        
        // Random phases and frequencies for dual harmonic sine synthesis
        const pts = this.xs.map(() => ({
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

        const gradId = 'rwbGrad_' + idx + '_' + Math.floor(Math.random() * 100000);
        
        svg.innerHTML = `
          <defs>
            <linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="0">
              <stop offset="0%" stop-color="${this.config.color}" stop-opacity="var(--rwb-fill, 0.52)" />
              <stop offset="90%" stop-color="${this.config.color}" stop-opacity="0.05" />
              <stop offset="100%" stop-color="${this.config.color}" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path fill="url(#${gradId})"></path>
        `;

        div.appendChild(svg);
        this.container.appendChild(div);

        return {
          cfg,
          pts,
          div,
          svg,
          grad: svg.querySelector('linearGradient'),
          stops: svg.querySelectorAll('stop'),
          path: svg.querySelector('path'),
          totalH: 0,
          mean: 0,
          amp: 0
        };
      });

      this.layout();
      window.addEventListener('resize', this.onResize);
      document.addEventListener('visibilitychange', this.onVisibility);

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        this.renderFrame(0);
        return;
      }

      // Intersection observer for performance
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            this.start();
          } else {
            this.stop();
          }
        }, { threshold: 0 });
        this.observer.observe(this.container);
      } else {
        this.start();
      }
    }

    updateRootStyles() {
      if (!this.container) return;
      this.container.style.setProperty('--rwb-blur', `${this.config.blur}px`);
      this.container.style.setProperty('--rwb-color', this.config.color);
      this.container.style.setProperty('--rwb-fill', this.config.fillOpacity);

      // Also update gradient stops
      if (this.layerInstances && this.layerInstances.length) {
        this.layerInstances.forEach(L => {
          if (L.stops) {
            L.stops.forEach(s => s.setAttribute('stop-color', this.config.color));
          }
        });
      }
    }

    layout() {
      const isMobile = window.innerWidth <= 640;
      const base = isMobile ? this.config.baseHeightMobile : this.config.baseHeight;
      const W = this.config.refWidth;

      for (const L of this.layerInstances) {
        const total = base + L.cfg.wave;
        L.totalH = total;
        L.mean = L.cfg.wave * 0.5;
        L.amp = L.cfg.amp != null ? L.cfg.amp : L.cfg.wave * 0.45;

        L.div.style.height = `${total}px`;
        L.svg.setAttribute('viewBox', `0 0 ${W} ${total}`);
        L.grad.setAttribute('y2', total);
      }
    }

    /**
     * Catmull-Rom spline converted to cubic Bezier curve segments:
     * c1 = P1 + (P2 - P0) / 6
     * c2 = P2 - (P3 - P1) / 6
     */
    buildPath(ys, totalH) {
      const xs = this.xs;
      let d = `M ${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`;

      for (let i = 0; i < xs.length - 1; i++) {
        const x0 = xs[i - 1] ?? xs[i];
        const y0 = ys[i - 1] ?? ys[i];
        const x1 = xs[i];
        const y1 = ys[i];
        const x2 = xs[i + 1];
        const y2 = ys[i + 1];
        const x3 = xs[i + 2] ?? x2;
        const y3 = ys[i + 2] ?? y2;

        const c1x = x1 + (x2 - x0) / 6;
        const c1y = y1 + (y2 - y0) / 6;
        const c2x = x2 - (x3 - x1) / 6;
        const c2y = y2 - (y3 - y1) / 6;

        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      }

      d += ` L ${xs[xs.length - 1].toFixed(1)} ${totalH} L ${xs[0].toFixed(1)} ${totalH} Z`;
      return d;
    }

    renderFrame(t) {
      const speedCoeff = this.config.speedMultiplier;
      for (const L of this.layerInstances) {
        const sp = L.cfg.speed * speedCoeff;
        const ys = L.pts.map(pt => {
          // Dual harmonic synthesis: primary wave + secondary wave modulated at 1.62x (Golden Ratio)
          const a = Math.sin(t * sp * pt.f1 + pt.p1);
          const b = Math.sin(t * sp * 1.618 * pt.f2 + pt.p2);
          return L.mean + L.amp * (0.62 * a + 0.38 * b);
        });

        L.path.setAttribute('d', this.buildPath(ys, L.totalH));
      }
    }

    start() {
      if (this.running) return;
      this.running = true;
      const loop = (timestamp) => {
        if (!this.running) return;
        this.renderFrame(timestamp / 1000);
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
    }

    handleVisibility() {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    }

    // Public Tuning API
    setColor(hex) {
      this.config.color = hex;
      this.updateRootStyles();
    }

    setBlur(px) {
      this.config.blur = px;
      this.updateRootStyles();
    }

    setSpeed(mult) {
      this.config.speedMultiplier = mult;
    }

    setBaseHeight(px) {
      this.config.baseHeight = px;
      this.config.baseHeightMobile = Math.min(px + 40, 380);
      this.layout();
    }

    setFillOpacity(op) {
      this.config.fillOpacity = op;
      this.updateRootStyles();
    }

    reset() {
      this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      this.updateRootStyles();
      this.layout();
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this.onResize);
      document.removeEventListener('visibilitychange', this.onVisibility);
      if (this.observer) this.observer.disconnect();
      if (this.container) this.container.innerHTML = '';
    }
  }

  // Singleton instance or factory
  let instance = null;

  return {
    init: function (config) {
      if (instance) instance.destroy();
      instance = new WaveEngine(config);
      return instance;
    },
    getInstance: function () {
      return instance;
    },
    setColor: function (c) { if (instance) instance.setColor(c); },
    setBlur: function (b) { if (instance) instance.setBlur(b); },
    setSpeed: function (s) { if (instance) instance.setSpeed(s); },
    setBaseHeight: function (h) { if (instance) instance.setBaseHeight(h); },
    setFillOpacity: function (o) { if (instance) instance.setFillOpacity(o); },
    reset: function () { if (instance) instance.reset(); },
    DEFAULT_CONFIG
  };
}));
