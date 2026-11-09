/**
 * dsh-liquid-glass — client half.
 *
 * Loaded by the web app's client-module system as `dsh-liquid-glass/client.js`.
 * No bundler, no runtime dependencies: the module registers itself with
 * `window.__ModuleLoader__` and returns a plain Cordis plugin object.
 *
 * The material has three layers:
 *   1. a wallpaper layer behind the shell — the light source the glass refracts;
 *   2. a stylesheet that turns the shell's columns, composer and menus into
 *      translucent glass with specular rims and a magnified edge refraction;
 *   3. pointer behaviour — a specular highlight that follows the cursor and a
 *      liquid press on controls.
 *
 * Everything it installs is returned as one disposer, so disabling the plugin
 * restores the stock UI exactly.
 */
window.__ModuleLoader__.load({
  id: 'dsh-liquid-glass',
  factory: () => {
    const NAME = 'dsh-liquid-glass';
    const STYLE_ID = 'dsh-liquid-glass-style';
    const WALL_ID = 'lg-wall';
    const HTML_CLASS = 'lg-on';

    /** Generated from src/glass.css by tools/build.mjs. */
    const CSS = __LIQUID_GLASS_CSS__;

    /**
     * The shell's own sidebar toggle (one element that switches its aria-label
     * between 收起侧边栏 / 打开侧边栏). It is mirrored as a floating control on
     * the right of the window, because the app renders it inside the sidebar
     * header — the one place a "collapse the sidebar" affordance is hardest to
     * find once the sidebar is narrow.
     */
    const SIDEBAR_TOGGLE_SELECTOR =
      'button[aria-label="收起侧边栏"], button[aria-label="打开侧边栏"], [class*="toggle"][aria-keyshortcuts="Control+Alt+B"]';

    /**
     * Dynamic wallpaper palette — the macOS "dynamic" behaviour: four anchor
     * looks across the day, interpolated by the local clock, with a fixed night
     * palette whenever the app is in dark appearance.
     * Every entry is [base1, base2, a, b, c, d, glow].
     */
    const WALL_ANCHORS = [
      [5.5, ['#fdf2ec', '#dde8f7', '#f7c6a6', '#cfe0fb', '#a3d9d0', '#ffd9b6', '#fff6ee']],
      [9.5, ['#eff8fe', '#d2e8f2', '#93ccf7', '#c4e9fb', '#7ed7d7', '#ffe3c6', '#ffffff']],
      [14, ['#f0f8fe', '#d5e9f3', '#97cef8', '#c8eafb', '#84d9d9', '#ffe5c8', '#ffffff']],
      [18.5, ['#f8ecf4', '#d9dcef', '#c9a6f0', '#ffc9a8', '#92c8dc', '#ffb9c9', '#fff0f7']],
      [21.5, ['#e9eefb', '#cdd6ea', '#9aa8d8', '#b9c2e8', '#86a8c8', '#c9b3d8', '#eef2ff']],
    ];

    /** Night look used for dark appearance, independent of the clock. */
    const WALL_DARK = ['#0a1522', '#050c14', '#1b4560', '#10374d', '#0b3a45', '#243a66', '#8fc0ff'];

    const WALL_KEYS = ['base1', 'base2', 'a', 'b', 'c', 'd', 'glow'];

    const toRgb = (hex) => {
      const value = hex.replace('#', '');
      return [
        parseInt(value.slice(0, 2), 16),
        parseInt(value.slice(2, 4), 16),
        parseInt(value.slice(4, 6), 16),
      ];
    };

    const mix = (from, to, t) => {
      const a = toRgb(from);
      const b = toRgb(to);
      const channel = (i) => Math.round(a[i] + (b[i] - a[i]) * t).toString(16).padStart(2, '0');
      return `#${channel(0)}${channel(1)}${channel(2)}`;
    };

    /** Local-clock palette: interpolate between the two surrounding anchors. */
    const paletteFor = (date, dark) => {
      if (dark) return WALL_DARK;
      const hour = date.getHours() + date.getMinutes() / 60;
      const anchors = WALL_ANCHORS;
      let from = anchors[anchors.length - 1];
      let to = anchors[0];
      for (let i = 0; i < anchors.length; i += 1) {
        const current = anchors[i];
        const next = anchors[(i + 1) % anchors.length];
        const span = (next[0] - current[0] + 24) % 24;
        const offset = (hour - current[0] + 24) % 24;
        if (offset <= span) {
          from = current;
          to = next;
          const t = span === 0 ? 0 : offset / span;
          return current[1].map((colour, index) => mix(colour, next[1][index], t));
        }
      }
      return from[1].map((colour, index) => mix(colour, to[1][index], 0));
    };

    /**
     * Writes the palette into the stylesheet's variables, so the wallpaper and
     * the glass refraction stay one surface. Re-evaluates every five minutes and
     * whenever the app flips appearance.
     */
    function installWallpaper() {
      const doc = document;
      const root = doc.documentElement;
      const apply = () => {
        const dark = doc.body !== null && doc.body.hasAttribute('data-ds-dark-theme');
        const palette = paletteFor(new Date(), dark);
        WALL_KEYS.forEach((key, index) => {
          root.style.setProperty(`--lg-w-${key}`, palette[index]);
        });
      };
      apply();
      const timer = window.setInterval(apply, 5 * 60 * 1000);
      let observer = null;
      if (doc.body !== null) {
        observer = new MutationObserver(apply);
        observer.observe(doc.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
      }
      return () => {
        window.clearInterval(timer);
        if (observer !== null) observer.disconnect();
        for (const key of WALL_KEYS) root.style.removeProperty(`--lg-w-${key}`);
      };
    }


    /**
     * macOS traffic lights. The shell patch removes Electron's titleBarOverlay
     * (Windows caption buttons) and exposes window.lgWindow, so these buttons are
     * the only way to minimise / zoom / close the window. Without the bridge the
     * whole control stays absent and the browser page is untouched.
     */
    function installTrafficLights() {
      const bridge = window.lgWindow;
      if (!bridge || typeof bridge.close !== 'function') return () => {};
      const doc = document;
      /* the shell collapses its reserved title strip when the native overlay is
         gone; keep it (the shell's own CSS keys off this attribute) so the dots
         sit in a bar instead of on top of the header */
      const root = doc.documentElement;
      if (!root.hasAttribute('data-windows-titlebar')) root.setAttribute('data-windows-titlebar', '');
      if (!getComputedStyle(root).getPropertyValue('--dsh-windows-titlebar-height').trim()) {
        root.style.setProperty('--dsh-windows-titlebar-height', '36px');
      }
      const host = doc.createElement('div');
      host.className = 'lg-traffic';
      host.innerHTML =
        '<button type="button" class="lg-traffic-dot lg-traffic-min" aria-label="最小化"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.6 6h6.8"/></svg></button>' +
        '<button type="button" class="lg-traffic-dot lg-traffic-max" aria-label="全屏"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.2 3.2h5.6v5.6H3.2z"/></svg></button>' +
        '<button type="button" class="lg-traffic-dot lg-traffic-close" aria-label="关闭"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.4 3.4l5.2 5.2M8.6 3.4l-5.2 5.2"/></svg></button>';
      host.querySelector('.lg-traffic-min').addEventListener('click', () => bridge.minimize());
      host.querySelector('.lg-traffic-max').addEventListener('click', () => bridge.toggleMaximize());
      host.querySelector('.lg-traffic-close').addEventListener('click', () => bridge.close());
      doc.body.appendChild(host);
      return () => host.remove();
    }
    function installStyles() {
      const doc = document;
      let style = doc.getElementById(STYLE_ID);
      if (style === null) {
        style = doc.createElement('style');
        style.id = STYLE_ID;
        style.setAttribute('data-plugin', NAME);
        doc.head.appendChild(style);
      }
      style.textContent = CSS;
      return () => {
        style.remove();
      };
    }

    function installWall() {
      const doc = document;
      let wall = doc.getElementById(WALL_ID);
      const created = wall === null;
      if (created) {
        wall = doc.createElement('div');
        wall.id = WALL_ID;
        wall.setAttribute('aria-hidden', 'true');
        wall.innerHTML = '<div class="lg-vignette"></div>';
        doc.body.insertBefore(wall, doc.body.firstChild);
      }
      return () => {
        if (created) wall.remove();
      };
    }

    /** Browser-tab icon: the official DeepSeek whale in the brand blue, read from
     * the stylesheet so the mark has exactly one source of truth. The previous
     * href is restored on unload.
     */
    function installFavicon() {
      const doc = document;
      const link = doc.querySelector('link[rel~="icon"]');
      if (link === null) return () => {};
      const computed = getComputedStyle(doc.documentElement).getPropertyValue('--lg-whale-brand').trim();
      const match = /^url\(["']?(.*?)["']?\)$/.exec(computed);
      if (match === null) return () => {};
      const previous = link.getAttribute('href');
      link.setAttribute('href', match[1]);
      return () => {
        if (previous === null) link.removeAttribute('href');
        else link.setAttribute('href', previous);
      };
    }

    /** Liquid press only — no cursor-tracking highlight. */
    function installPress() {
      const doc = document;

      const onDown = (event) => {
        const target = event.target instanceof Element ? event.target.closest('button, [role="button"]') : null;
        if (target === null) return;
        // the new-session control opts out of the press effect entirely
        if (target.closest('[class*="newSession"]') !== null) return;
        target.setAttribute('data-lg-press', '');
        const release = () => {
          target.removeAttribute('data-lg-press');
          doc.removeEventListener('pointerup', release);
          doc.removeEventListener('pointercancel', release);
        };
        doc.addEventListener('pointerup', release);
        doc.addEventListener('pointercancel', release);
      };

      doc.addEventListener('pointerdown', onDown, { passive: true });

      return () => {
        doc.removeEventListener('pointerdown', onDown);
        for (const pressed of doc.querySelectorAll('[data-lg-press]')) pressed.removeAttribute('data-lg-press');
      };
    }

    /**
     * Mirror of the shell's sidebar toggle, pinned to the sidebar's right edge
     * (on the seam between the navigation column and the content pane). The
     * original button stays in the DOM (hidden) and keeps owning the state; the
     * mirror only forwards clicks, so React's tree is never touched.
     */
    function installSidebarToggle() {
      const doc = document;
      let mirror = null;
      let syncQueued = false;
      let followFrame = 0;

      const source = () => doc.querySelector(SIDEBAR_TOGGLE_SELECTOR);

      /** Right edge of the navigation column, in viewport pixels. */
      const sidebarEdge = () => {
        const column = doc.querySelector('[class*="sidebarCol"]');
        if (column === null) return 280;
        return Math.round(column.getBoundingClientRect().right);
      };

      /**
       * Vertical centre of the brand line ("deepseek HARNESS") — the mirror sits
       * on that line rather than on the modal header line.
       */
      const brandCentre = () => {
        const brand = doc.querySelector('[class*="hHd-Xa_brand"]');
        if (brand === null) return 46;
        const rect = brand.getBoundingClientRect();
        return Math.round(rect.top + rect.height / 2);
      };

      /** Park the mirror inside the sidebar, on the brand line. */
      const place = () => {
        doc.documentElement.style.setProperty('--lg-sidebar-edge', `${sidebarEdge() + 5}px`);
        doc.documentElement.style.setProperty('--lg-sidebar-toggle-top', `${brandCentre() - 15}px`);
      };

      /** The collapse animation changes the edge for a few hundred ms — follow it. */
      const follow = () => {
        if (followFrame !== 0) cancelAnimationFrame(followFrame);
        const until = performance.now() + 520;
        const step = () => {
          place();
          followFrame = performance.now() < until ? requestAnimationFrame(step) : 0;
        };
        followFrame = requestAnimationFrame(step);
      };

      const sync = () => {
        syncQueued = false;
        const origin = source();
        if (origin === null) {
          if (mirror !== null) {
            mirror.remove();
            mirror = null;
          }
          return;
        }
        const label = origin.getAttribute('aria-label') || '侧边栏';
        // Collapsed: the shell turns that same button into the rail's brand mark
        // (the whale), and the 46px rail has no room for a second control — so
        // the mirror steps aside and the native whale keeps expanding the rail.
        const collapsed = label.includes('打开');
        origin.classList.toggle('lg-toggle-origin', !collapsed);
        if (!origin.id) origin.id = 'lg-sidebar-toggle-origin';
        if (mirror === null) {
          mirror = doc.createElement('button');
          mirror.type = 'button';
          mirror.className = 'lg-sidebar-toggle';
          mirror.innerHTML = '<span class="lg-sidebar-toggle-icon"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2.75" width="12" height="10.5" rx="2.2"/><path d="M6.2 2.75v10.5"/></svg></span>';
          mirror.addEventListener('click', () => {
            const current = source();
            if (current !== null) current.click();
            follow();
          });
          doc.body.appendChild(mirror);
        }
        mirror.hidden = collapsed;
        place();
        if (mirror.getAttribute('aria-label') !== label) {
          mirror.setAttribute('aria-label', label);
          mirror.setAttribute('title', label);
        }
        // One stable panel glyph; flipped when it reads "open" instead of "close".
        mirror.dataset.collapsed = collapsed ? 'true' : 'false';
      };

      const queue = () => {
        if (syncQueued) return;
        syncQueued = true;
        requestAnimationFrame(sync);
      };

      const onResize = () => {
        place();
        follow();
      };

      const observer = new MutationObserver(queue);
      observer.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-label', 'class', 'style'] });
      window.addEventListener('resize', onResize, { passive: true });
      queue();
      follow();

      return () => {
        observer.disconnect();
        window.removeEventListener('resize', onResize);
        if (followFrame !== 0) cancelAnimationFrame(followFrame);
        if (mirror !== null) mirror.remove();
        mirror = null;
        doc.documentElement.style.removeProperty('--lg-sidebar-edge');
        const origin = source();
        if (origin !== null) origin.classList.remove('lg-toggle-origin');
      };
    }

    function install() {
      const doc = document;
      if (!doc.body) return () => {};
      const teardown = [];
      // Styles first: the wall and the pointer layer only matter once the
      // material is in place.
      teardown.push(installStyles());
      teardown.push(installTrafficLights());
      // Dynamic wallpaper is dormant while the shell paints flat white; the
      // installer is kept (installWallpaper) for when the artwork comes back.
      // The material rules are scoped to `html.lg-on`, so the class has to be
      // live before anything reads a brand variable out of the stylesheet.
      doc.documentElement.classList.add(HTML_CLASS);
      teardown.push(() => doc.documentElement.classList.remove(HTML_CLASS));
      teardown.push(installWall());
      teardown.push(installFavicon());
      teardown.push(installPress());
      teardown.push(installSidebarToggle());
      return () => {
        // Reverse order: class, listeners, wall, stylesheet.
        for (const dispose of teardown.reverse()) {
          try {
            dispose();
          } catch {
            // A disposed DOM node must never break the unload path.
          }
        }
      };
    }

    function apply(ctx) {
      if (typeof ctx?.effect === 'function') {
        ctx.effect(() => install(), `${NAME}: liquid glass material`);
        return;
      }
      install();
    }

    return { name: NAME, inject: [], apply };
  },
});
