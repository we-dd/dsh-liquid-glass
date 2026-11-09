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
    const CSS = "/* ============================================================================\r\n   DSH Liquid Glass — prototype v7\r\n   ========================================================================== */\r\n\r\nhtml.lg-on {\r\n  /* ---- dynamic wallpaper palette (overwritten by the client half) ---- */\r\n  --lg-w-base1: #eef7fd;\r\n  --lg-w-base2: #cfe6f0;\r\n  --lg-w-a: rgba(150, 205, 245, 0.9);\r\n  --lg-w-b: rgba(196, 232, 250, 0.85);\r\n  --lg-w-c: rgba(126, 214, 214, 0.8);\r\n  --lg-w-d: rgba(255, 226, 196, 0.75);\r\n  --lg-w-glow: rgba(255, 255, 255, 0.5);\r\n  /* solid white shell: the dynamic palette below is kept for reference but the\r\n     wall now paints flat white in light appearance and a deep night field in\r\n     dark appearance, so the glass controls are the only material in play. */\r\n  --lg-wall-paint: linear-gradient(168deg, #f2f5fa 0%, #e9eef7 52%, #e3e9f3 100%);\r\n  --lg-wall-paint-dynamic:\r\n    radial-gradient(78% 62% at 12% 4%, var(--lg-w-glow) 0%, rgba(255, 255, 255, 0) 58%),\r\n    radial-gradient(120% 92% at 14% 10%, var(--lg-w-a) 0%, rgba(255, 255, 255, 0) 58%),\r\n    radial-gradient(104% 86% at 86% 6%, var(--lg-w-b) 0%, rgba(255, 255, 255, 0) 56%),\r\n    radial-gradient(118% 96% at 84% 88%, var(--lg-w-c) 0%, rgba(255, 255, 255, 0) 62%),\r\n    radial-gradient(96% 80% at 12% 94%, var(--lg-w-d) 0%, rgba(255, 255, 255, 0) 60%),\r\n    linear-gradient(158deg, var(--lg-w-base1) 0%, var(--lg-w-base2) 100%);\r\n\r\n  --lg-blur: 10px;\r\n  --lg-sat: 200%;\r\n  --lg-bright: 1.0;\r\n  --lg-dark-bright: 0.95;\r\n  --lg-rim: rgba(255, 255, 255, 1);\r\n  --lg-rim-soft: rgba(255, 255, 255, 0.45);\r\n  --lg-edge: rgba(255, 255, 255, 0.6);\r\n  --lg-outline: rgba(13, 21, 38, 0.1);\r\n  --lg-shadow: 0 30px 70px -44px rgba(10, 18, 40, 0.45), 0 12px 26px -22px rgba(10, 18, 40, 0.22), 0 1px 2px rgba(10, 18, 40, 0.06);\r\n  --lg-panel-a: rgba(255, 255, 255, 0.07);\r\n  --lg-panel-b: rgba(252, 254, 255, 0.035);\r\n  --lg-ease: cubic-bezier(0.22, 1, 0.36, 1);\r\n  }\r\n\r\nbody[data-ds-dark-theme] {\r\n  --lg-rim: rgba(255, 255, 255, 0.26);\r\n  --lg-rim-soft: rgba(255, 255, 255, 0.08);\r\n  --lg-edge: rgba(255, 255, 255, 0.14);\r\n  --lg-outline: rgba(0, 0, 0, 0.35);\r\n  --lg-shadow: 0 30px 72px -32px rgba(0, 0, 0, 0.95), 0 12px 28px -18px rgba(0, 0, 0, 0.75);\r\n  --lg-panel-a: rgba(26, 28, 34, 0.55);\r\n  --lg-panel-b: rgba(15, 17, 21, 0.45);\r\n  }\r\n\r\n/* ---------------------------------------------------------------- wallpaper */\r\n#lg-wall {\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: 0;\r\n  pointer-events: none;\r\n  overflow: hidden;\r\n  background: var(--lg-wall-paint);\r\n}\r\n#lg-wall .lg-vignette {\r\n  position: absolute;\r\n  inset: 0;\r\n  background: radial-gradient(125% 95% at 50% 38%, rgba(0,0,0,0) 48%, rgba(8, 12, 24, 0.14) 100%);\r\n}\r\nbody[data-ds-dark-theme] #lg-wall .lg-vignette {\r\n  background: radial-gradient(125% 95% at 50% 34%, rgba(0, 0, 0, 0.2) 18%, rgba(0, 0, 0, 0.72) 100%);\r\n}\r\n\r\n/* ------------------------------------------------------------ transparency */\r\nhtml.lg-on body { background: transparent !important; }\r\nhtml.lg-on #root { position: relative; z-index: 1; }\r\n\r\nhtml.lg-on #root *:has(> [class*=\"sidebarCol\"]):has(> [class*=\"centerCol\"]) {\r\n  background: transparent !important;\r\n  overflow: visible !important;\r\n}\r\n\r\nhtml.lg-on [class*=\"sidebarCol\"],\r\nhtml.lg-on [class*=\"centerCol\"] {\r\n  position: relative;\r\n  border-radius: 30px;\r\n  background-image:\r\n    radial-gradient(92% 74% at 50% 46%, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.015) 56%, rgba(255, 255, 255, 0) 100%),\r\n    linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 26%, rgba(10, 18, 40, 0.035) 100%),\r\n    linear-gradient(158deg, var(--lg-panel-a) 0%, var(--lg-panel-b) 54%, var(--lg-panel-a) 100%) !important;\r\n  background-blend-mode: normal, normal, normal;\r\n  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat)) brightness(var(--lg-bright));\r\n  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat)) brightness(var(--lg-bright));\r\n  box-shadow:\r\n    0 0 0 1px var(--lg-outline),\r\n    var(--lg-shadow),\r\n    inset 0 1.5px 0 var(--lg-rim),\r\n    inset 0 3px 5px -3px rgba(255, 255, 255, 0.85),\r\n    inset 0 0 0 1px var(--lg-edge),\r\n    inset 0 -1.5px 0 var(--lg-rim-soft),\r\n    inset 0 -26px 34px -32px rgba(10, 18, 40, 0.22);\r\n  overflow: hidden;\r\n}\r\n\r\n/* Dark material: the same stack, but the \"light falling on glass\" layers have to\r\n   be an order of magnitude weaker — a 20% white radial on a dark pane is exactly\r\n   what makes dark mode read as washed-out grey. */\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"sidebarCol\"],\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"centerCol\"] {\r\n  background-image:\r\n    radial-gradient(92% 74% at 50% 46%, rgba(255, 255, 255, 0.015) 0%, rgba(255, 255, 255, 0.006) 56%, rgba(255, 255, 255, 0) 100%),\r\n    linear-gradient(180deg, rgba(255, 255, 255, 0.022) 0%, rgba(255, 255, 255, 0) 22%, rgba(0, 0, 0, 0.3) 100%),\r\n    linear-gradient(158deg, var(--lg-panel-a) 0%, var(--lg-panel-b) 54%, var(--lg-panel-a) 100%) !important;\r\n  background-blend-mode: normal, normal, normal;\r\n  backdrop-filter: blur(var(--lg-blur)) saturate(118%) brightness(var(--lg-dark-bright, 0.95));\r\n  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(118%) brightness(var(--lg-dark-bright, 0.95));\r\n  /* the light stack's 85% white inner highlight is a lamp on a dark pane */\r\n  box-shadow:\r\n    0 0 0 1px var(--lg-outline),\r\n    var(--lg-shadow),\r\n    inset 0 1.5px 0 var(--lg-rim),\r\n    inset 0 0 0 1px var(--lg-edge),\r\n    inset 0 -1.5px 0 var(--lg-rim-soft);\r\n}\r\n\r\n/* refraction ring — content pane first; the navigation column gets a thinner,\r\n   fainter band in the sidebar block below (a 26px band on a 270px column reads\r\n   as a colour fringe, not as an edge). */\r\nhtml.lg-on [class*=\"centerCol\"]::before {\r\n  content: \"\";\r\n  position: absolute;\r\n  inset: 0;\r\n  z-index: 3;\r\n  pointer-events: none;\r\n  border-radius: inherit;\r\n  background-image: var(--lg-wall-paint);\r\n  background-attachment: fixed;\r\n  background-size: cover;\r\n  background-position: center;\r\n  transform: scale(1.12);\r\n  transform-origin: center;\r\n  filter: saturate(155%) brightness(1.03);\r\n  padding: 26px;\r\n  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\r\n  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\r\n  -webkit-mask-composite: xor;\r\n  mask-composite: exclude;\r\n  opacity: 0.85;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"centerCol\"]::before { opacity: 0.4; }\r\n\r\n/* specular sweep */\r\nhtml.lg-on [class*=\"sidebarCol\"]::after,\r\nhtml.lg-on [class*=\"centerCol\"]::after {\r\n  content: \"\";\r\n  position: absolute;\r\n  inset: -30%;\r\n  z-index: 4;\r\n  pointer-events: none;\r\n  background: linear-gradient(115deg, rgba(255,255,255,0) 44%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 56%);\r\n  transform: translateX(-40%);\r\n  animation: lg-sweep 19s var(--lg-ease) infinite;\r\n  mix-blend-mode: screen;\r\n  opacity: 0;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"sidebarCol\"]::after,\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"centerCol\"]::after { opacity: 0 !important; }\r\n@keyframes lg-sweep {\r\n  0%, 60% { transform: translateX(-40%); opacity: 0; }\r\n  70% { opacity: 0.45; }\r\n  100% { transform: translateX(40%); opacity: 0; }\r\n}\r\n\r\nhtml.lg-on [class*=\"sidebarCol\"] {\r\n  margin: 12px 0 12px 12px;\r\n  /* same material as the content pane: the wallpaper is banded top-to-bottom,\r\n     so a given height renders the same tint in every column. */\r\n}\r\n/* a faint, narrow edge band instead of the content pane's wide one */\r\nhtml.lg-on [class*=\"sidebarCol\"]::before {\r\n  content: \"\";\r\n  position: absolute;\r\n  inset: 0;\r\n  z-index: 3;\r\n  pointer-events: none;\r\n  border-radius: inherit;\r\n  background-image: var(--lg-wall-paint);\r\n  background-attachment: fixed;\r\n  background-size: cover;\r\n  background-position: center;\r\n  transform: scale(1.05);\r\n  transform-origin: center;\r\n  filter: saturate(130%) brightness(1.02);\r\n  padding: 10px;\r\n  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\r\n  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\r\n  -webkit-mask-composite: xor;\r\n  mask-composite: exclude;\r\n  opacity: 0.18;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"sidebarCol\"]::before { opacity: 0.12; }\r\n\r\nhtml.lg-on [class*=\"centerCol\"] { margin: 12px; }\r\nhtml.lg-on [class*=\"bottomRow\"] { background: transparent !important; }\r\n\r\n/* sidebar interior fills */\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"root\"],\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"quietBars\"] { background: transparent !important; }\r\n\r\n\r\n\r\n/* conversation shell */\r\nhtml.lg-on [class*=\"wSkVaW_root\"],\r\nhtml.lg-on [class*=\"dshWbBody\"],\r\nhtml.lg-on [class*=\"dshWbFrame\"] { background: transparent !important; }\r\n\r\n/* composer card */\r\nhtml.lg-on [class*=\"composer\"] [class*=\"card\"],\r\nhtml.lg-on [class*=\"uV2eYG\"] [class*=\"card\"] {\r\n  background: linear-gradient(168deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.4) 58%, rgba(255,255,255,0.52) 100%) !important;\r\n  backdrop-filter: var(--lg-composer-lens, none) blur(42px) saturate(220%) brightness(1.04);\r\n  -webkit-backdrop-filter: var(--lg-composer-lens, none) blur(42px) saturate(220%) brightness(1.04);\r\n  box-shadow:\r\n    0 34px 74px -32px rgba(12, 20, 44, 0.5),\r\n    0 0 0 0.5px rgba(13, 21, 38, 0.14),\r\n    inset 0 1.5px 0 rgba(255,255,255,1),\r\n    inset 0 0 0 1px rgba(255,255,255,0.7),\r\n    inset 0 -26px 38px -34px rgba(12,20,44,0.3) !important;\r\n  border: 0 !important;\r\n  transition: transform 0.5s var(--lg-ease), box-shadow 0.5s var(--lg-ease);\r\n}\r\nhtml.lg-on [class*=\"composer\"] [class*=\"card\"]:focus-within,\r\nhtml.lg-on [class*=\"uV2eYG\"] [class*=\"card\"]:focus-within { transform: translateY(-1px); }\r\n\r\n/* ----------------------------------------------------------------------------\r\n   Apple-format input: focus, caret, selection, send states.\r\n\r\n   The HIG field is not defined by its corner radius, it is defined by a state\r\n   machine everyone can read:\r\n     · keyboard focus is ALWAYS visible — the accent ring (macOS: 2–3pt solid\r\n       accent, tight to the control). A glass composer also lifts one brightness\r\n       step so the focused surface reads as \"live\".\r\n     · the caret and the text selection use the accent colour, never the label\r\n       colour.\r\n     · a send/confirm control is neutral while there is nothing to send and\r\n       takes the accent only when the field carries content (Messages model),\r\n       instead of a permanently tinted button at reduced opacity.\r\n   -------------------------------------------------------------------------- */\r\nhtml.lg-on [class*=\"composer\"] [class*=\"card\"]:focus-within,\r\nhtml.lg-on [class*=\"uV2eYG\"] [class*=\"card\"]:focus-within {\r\n  box-shadow:\r\n    0 0 0 1.5px color-mix(in srgb, #4176e6 52%, transparent),\r\n    0 0 0 5px color-mix(in srgb, #4176e6 12%, transparent),\r\n    0 34px 74px -32px rgba(12, 20, 44, 0.5),\r\n    inset 0 1.5px 0 rgba(255, 255, 255, 1),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.75) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"composer\"] [class*=\"card\"]:focus-within,\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"uV2eYG\"] [class*=\"card\"]:focus-within {\r\n  box-shadow:\r\n    0 0 0 1.5px color-mix(in srgb, #6f9bff 66%, transparent),\r\n    0 0 0 4px color-mix(in srgb, #6f9bff 18%, transparent),\r\n    0 34px 78px -34px rgba(0, 0, 0, 0.95),\r\n    inset 0 1.5px 0 rgba(255, 255, 255, 0.28),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.14) !important;\r\n}\r\n\r\n/* caret + selection follow the accent, as every AppKit/UIKit field does */\r\nhtml.lg-on [class*=\"uV2eYG_input\"],\r\nhtml.lg-on [contenteditable=\"true\"] {\r\n  caret-color: #4176e6;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"uV2eYG_input\"],\r\nhtml.lg-on body[data-ds-dark-theme] [contenteditable=\"true\"] {\r\n  caret-color: #6f9bff;\r\n}\r\nhtml.lg-on [class*=\"uV2eYG_input\"]::selection,\r\nhtml.lg-on [contenteditable=\"true\"]::selection {\r\n  background: color-mix(in srgb, #4176e6 26%, transparent);\r\n}\r\n\r\n/* send: neutral until there is something to send, accent when there is */\r\nhtml.lg-on [class*=\"uV2eYG_primary\"]:disabled {\r\n  background: rgba(13, 21, 38, 0.1) !important;\r\n  color: var(--dsw-static-neutral-bluish-600, #81858c) !important;\r\n  opacity: 1 !important;\r\n  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45) !important;\r\n}\r\nhtml.lg-on [class*=\"uV2eYG_primary\"]:not(:disabled) {\r\n  box-shadow:\r\n    0 10px 22px -12px rgba(65, 118, 230, 0.65),\r\n    inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"uV2eYG_primary\"]:disabled {\r\n  background: rgba(255, 255, 255, 0.14) !important;\r\n  color: rgba(255, 255, 255, 0.58) !important;\r\n  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"composer\"] [class*=\"card\"],\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"uV2eYG\"] [class*=\"card\"] {\r\n  background: linear-gradient(168deg, rgba(34, 37, 45, 0.72) 0%, rgba(22, 24, 30, 0.66) 100%) !important;\r\n  -webkit-backdrop-filter: var(--lg-composer-lens, none) blur(28px) saturate(130%) brightness(0.94);\r\n  backdrop-filter: var(--lg-composer-lens, none) blur(28px) saturate(130%) brightness(0.94);\r\n    0 0 0 0.5px rgba(0,0,0,0.65),\r\n    inset 0 1.5px 0 rgba(255,255,255,0.22),\r\n    inset 0 0 0 1px rgba(255,255,255,0.12) !important;\r\n}\r\n\r\nhtml.lg-on [class*=\"bubble\"] { backdrop-filter: blur(14px) saturate(150%); }\r\n\r\nhtml.lg-on [class*=\"selected\"] {\r\n  box-shadow: inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 0 1px rgba(255,255,255,0.5), 0 2px 10px -8px rgba(16,24,48,0.5);\r\n}\r\n\r\n/* ============================================================================\r\n   Token layer: make every token-driven surface translucent glass.\r\n   ========================================================================== */\r\nhtml.lg-on body {\r\n  --dsw-alias-bg-base: rgba(255, 255, 255, 0.55) !important;\r\n  --dsw-alias-bg-layer-1: rgba(255, 255, 255, 0.66) !important;\r\n  --dsw-alias-bg-layer-2: rgba(255, 255, 255, 0.52) !important;\r\n  --dsw-alias-bg-layer-3: rgba(255, 255, 255, 0.44) !important;\r\n  --dsw-alias-bg-overlay: rgba(240, 244, 251, 0.72) !important;\r\n  --dsw-alias-bg-module-platform: rgba(245, 247, 250, 0.5) !important;\r\n  --dsw-alias-bg-multi-select: rgba(245, 247, 250, 0.5) !important;\r\n  --dsw-specific-sidebar-fill: rgba(255, 255, 255, 0.06) !important;\r\n  --dsw-specific-input-major: rgba(255, 255, 255, 0.62) !important;\r\n  --dsw-specific-menu: rgba(255, 255, 255, 0.66) !important;\r\n  --dsw-specific-selector: rgba(255, 255, 255, 0.5) !important;\r\n  --dsw-specific-bubble: rgba(233, 242, 255, 0.72) !important;\r\n  --dsw-specific-tip: rgba(255, 255, 255, 0.6) !important;\r\n  --dsw-menu-surface-fill: rgba(250, 252, 255, 0.7) !important;\r\n  --dsw-menu-backdrop-filter: blur(44px) saturate(185%) brightness(1.04) !important;\r\n  --dsw-alias-markdown-code-block: rgba(255, 255, 255, 0.52) !important;\r\n  --dsw-alias-markdown-code-block-banner: rgba(255, 255, 255, 0.44) !important;\r\n  --dsw-alias-markdown-inline-code: rgba(255, 255, 255, 0.6) !important;\r\n  --dsw-alias-markdown-tag: rgba(255, 255, 255, 0.5) !important;\r\n  --dsw-alias-markdown-placeholder: rgba(245, 247, 250, 0.55) !important;\r\n  --dsw-alias-interactive-bg-hover: rgba(255, 255, 255, 0.42) !important;\r\n  --dsw-alias-interactive-bg-hover-solid: rgba(255, 255, 255, 0.55) !important;\r\n  --dsw-alias-interactive-bg-active: rgba(255, 255, 255, 0.6) !important;\r\n  --dsw-alias-settings-card-fill: rgba(255, 255, 255, 0.56) !important;\r\n  --dsw-alias-menu-group-header-fill: rgba(248, 250, 252, 0.6) !important;\r\n  --dsw-alias-turn-trigger-bg: rgba(255, 255, 255, 0.4) !important;\r\n  --dsw-alias-button-elevated-fill: rgba(255, 255, 255, 0.72) !important;\r\n  --dsw-alias-button-floating-fill: rgba(255, 255, 255, 0.78) !important;\r\n  --dsw-alias-button-floating-hover: rgba(255, 255, 255, 0.92) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] {\r\n  /* macOS dark ladder: wall < content < sidebar < cards < chips < composer/menus.\r\n     Channels are near-neutral (a 2–3 point blue bias only, like macOS 26 dark);\r\n     the old block leaned 10+ points into blue, which is what read as grey. */\r\n  --dsw-alias-bg-base: rgba(17, 19, 24, 0.66) !important;\r\n  --dsw-alias-bg-layer-1: rgba(24, 26, 32, 0.74) !important;\r\n  --dsw-alias-bg-layer-2: rgba(30, 32, 39, 0.66) !important;\r\n  --dsw-alias-bg-layer-3: rgba(36, 39, 47, 0.58) !important;\r\n  --dsw-alias-bg-overlay: rgba(22, 24, 30, 0.82) !important;\r\n  --dsw-alias-bg-module-platform: rgba(26, 28, 34, 0.64) !important;\r\n  --dsw-alias-bg-multi-select: rgba(26, 28, 34, 0.64) !important;\r\n  --dsw-specific-sidebar-fill: rgba(20, 22, 28, 0.42) !important;\r\n  --dsw-specific-input-major: rgba(34, 37, 45, 0.7) !important;\r\n  --dsw-specific-menu: rgba(34, 37, 45, 0.8) !important;\r\n  --dsw-specific-selector: rgba(30, 32, 39, 0.62) !important;\r\n  --dsw-specific-bubble: rgba(34, 40, 56, 0.7) !important;\r\n  --dsw-specific-tip: rgba(32, 35, 42, 0.72) !important;\r\n  --dsw-menu-surface-fill: rgba(34, 37, 45, 0.8) !important;\r\n  --dsw-menu-backdrop-filter: blur(40px) saturate(120%) brightness(0.98) !important;\r\n  --dsw-alias-markdown-code-block: rgba(24, 26, 32, 0.66) !important;\r\n  --dsw-alias-markdown-code-block-banner: rgba(30, 32, 39, 0.64) !important;\r\n  --dsw-alias-markdown-inline-code: rgba(38, 41, 49, 0.64) !important;\r\n  --dsw-alias-markdown-tag: rgba(38, 41, 49, 0.6) !important;\r\n  --dsw-alias-markdown-placeholder: rgba(38, 41, 49, 0.6) !important;\r\n  --dsw-alias-interactive-bg-hover: rgba(255, 255, 255, 0.07) !important;\r\n  --dsw-alias-interactive-bg-hover-solid: rgba(255, 255, 255, 0.1) !important;\r\n  --dsw-alias-interactive-bg-active: rgba(255, 255, 255, 0.14) !important;\r\n  --dsw-alias-settings-card-fill: rgba(26, 28, 34, 0.64) !important;\r\n  --dsw-alias-menu-group-header-fill: rgba(30, 32, 39, 0.64) !important;\r\n  --dsw-alias-turn-trigger-bg: rgba(255, 255, 255, 0.04) !important;\r\n  --dsw-alias-button-elevated-fill: rgba(38, 41, 49, 0.82) !important;\r\n  --dsw-alias-button-floating-fill: rgba(38, 41, 49, 0.86) !important;\r\n  --dsw-alias-button-floating-hover: rgba(46, 49, 58, 0.95) !important;\r\n}\r\n\r\n/* liquid press spring (no cursor-tracking highlight: the glass keeps a fixed\r\n   specular edge instead of a light that follows the pointer) */\r\nhtml.lg-on [data-lg-press] {\r\n  transform: scale(0.97) !important;\r\n  transition: transform 0.12s cubic-bezier(0.3, 0, 0.2, 1) !important;\r\n}\r\n\r\n/* ----------------------------------------------------------------------------\r\n   Sidebar toggle, mirrored to the right edge of the window.\r\n\r\n   The shell renders its collapse control inside the sidebar header; once the\r\n   sidebar is narrow that button sits in the app's top-left corner, which is the\r\n   least discoverable place for \"hide this column\". The original button stays in\r\n   the DOM (hidden) and owns the state — the floating control below only\r\n   forwards the click, so nothing in React's tree is relocated.\r\n   -------------------------------------------------------------------------- */\r\n/* only the shell's own button is hidden — by a class the client half adds, so\r\n   the mirror (same aria-label) is never caught by this rule */\r\nhtml.lg-on .lg-toggle-origin {\r\n  display: none !important;\r\n}\r\n\r\nhtml.lg-on .lg-sidebar-toggle {\r\n  position: fixed;\r\n  /* on the brand line, inside the sidebar, flush to its inner right edge */\r\n  top: var(--lg-sidebar-toggle-top, 31px);\r\n  left: max(8px, calc(var(--lg-sidebar-edge, 285px) - 42px));\r\n  right: auto;\r\n  z-index: 60;\r\n  width: 30px;\r\n  height: 30px;\r\n  display: grid;\r\n  place-items: center;\r\n  padding: 0;\r\n  border: 0;\r\n  border-radius: 8px;\r\n  color: var(--dsw-alias-label-secondary, #61666b);\r\n  /* No tile: the button sits on the pane like the shell's own icon buttons and\r\n     only materialises on hover — an always-on plate reads as a foreign object\r\n     once the panes are this transparent. */\r\n  background: transparent;\r\n  box-shadow: none;\r\n  -webkit-backdrop-filter: none;\r\n  backdrop-filter: none;\r\n  cursor: pointer;\r\n  transition: background 0.16s var(--lg-ease), color 0.16s var(--lg-ease), transform 0.15s var(--lg-ease);\r\n}\r\nhtml.lg-on .lg-sidebar-toggle:hover {\r\n  color: var(--dsw-alias-label-primary, #0f1115);\r\n  background: rgba(15, 23, 42, 0.06);\r\n}\r\nhtml.lg-on .lg-sidebar-toggle[hidden] { display: none !important; }\r\nhtml.lg-on .lg-sidebar-toggle:active { transform: scale(0.94); }\r\nhtml.lg-on .lg-sidebar-toggle:focus-visible {\r\n  outline: 2px solid #4176e6;\r\n  outline-offset: 2px;\r\n}\r\nhtml.lg-on .lg-sidebar-toggle .lg-sidebar-toggle-icon { display: grid; place-items: center; }\r\nhtml.lg-on .lg-sidebar-toggle svg {\r\n  width: 16px;\r\n  height: 16px;\r\n  display: block;\r\n  fill: none;\r\n  stroke: currentColor;\r\n  stroke-width: 1.4;\r\n  stroke-linecap: round;\r\n  stroke-linejoin: round;\r\n  transition: transform 0.24s var(--lg-ease);\r\n}\r\nhtml.lg-on .lg-sidebar-toggle[data-collapsed='true'] svg { transform: scaleX(-1); }\r\nhtml.lg-on body[data-ds-dark-theme] .lg-sidebar-toggle {\r\n  color: rgba(255, 255, 255, 0.62);\r\n  background: transparent;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] .lg-sidebar-toggle:hover {\r\n  color: #fff;\r\n  background: rgba(255, 255, 255, 0.09);\r\n}\r\n\r\n\r\n/* ----------------------------------------------------------------------------\r\n   Reach-through toggles for the shell pieces that do not read a token:\r\n   the sidebar keeps an inline width from its resize state, and the right dock\r\n   renders an opaque tab host even while closed.\r\n   -------------------------------------------------------------------------- */\r\nhtml.lg-on [class*=\"sidebarCol\"] > div > [style*=\"width\"] { width: 100% !important; }\r\nhtml.lg-on [class*=\"rightbarCol\"],\r\nhtml.lg-on [class*=\"emptyTabHost\"] { background: transparent !important; }\r\n\r\n/* The design system's material layer (menus, popovers, dialog backings). It\r\n   already reads --dsw-menu-surface-fill/--dsw-menu-backdrop-filter, so the\r\n   token layer made it translucent; this adds the glass edge. */\r\nhtml.lg-on [class*=\"_material_\"] {\r\n  box-shadow:\r\n    inset 0 1px 0 rgba(255, 255, 255, 0.92),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.55),\r\n    0 0 0 0.5px rgba(13, 21, 38, 0.14);\r\n  background-image: linear-gradient(152deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0) 58%);\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"_material_\"] {\r\n  box-shadow:\r\n    inset 0 1px 0 rgba(255, 255, 255, 0.16),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.1),\r\n    0 0 0 0.5px rgba(0, 0, 0, 0.6);\r\n  background-image: linear-gradient(152deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0) 58%);\r\n}\r\n\r\n/* ----------------------------------------------------------------------------\r\n   Modal surfaces cover live content, so they get an opaque-ish frosted body\r\n   instead of the shell's see-through glass: still a material, never a window\r\n   you can read the chat through.\r\n   -------------------------------------------------------------------------- */\r\nhtml.lg-on [role=\"dialog\"][aria-modal=\"true\"],\r\nhtml.lg-on [data-shortcut-modal] {\r\n  background:\r\n    radial-gradient(120% 70% at 50% 0%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 62%),\r\n    linear-gradient(168deg, rgba(255, 255, 255, 0.88), rgba(248, 251, 255, 0.8)) !important;\r\n  backdrop-filter: blur(46px) saturate(185%) brightness(1.03) !important;\r\n  -webkit-backdrop-filter: blur(46px) saturate(185%) brightness(1.03) !important;\r\n  box-shadow:\r\n    0 44px 110px -44px rgba(10, 18, 40, 0.55),\r\n    0 6px 20px -14px rgba(10, 18, 40, 0.35),\r\n    inset 0 1.5px 0 rgba(255, 255, 255, 1),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.72) !important;\r\n  border: 0 !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [role=\"dialog\"][aria-modal=\"true\"],\r\nhtml.lg-on body[data-ds-dark-theme] [data-shortcut-modal] {\r\n  background:\r\n    radial-gradient(120% 70% at 50% 0%, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0) 62%),\r\n    linear-gradient(168deg, rgba(34, 37, 50, 0.94), rgba(20, 23, 32, 0.9)) !important;\r\n  box-shadow:\r\n    0 44px 110px -44px rgba(0, 0, 0, 0.95),\r\n    inset 0 1.5px 0 rgba(255, 255, 255, 0.2),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.12) !important;\r\n}\r\n/* ===== BRAND: OFFICIAL DEEPSEEK MARK ===== */\r\n/* The stock sidebar mark is the Desktop app's own whale; the hero mark is the\r\n   official DeepSeek whale. Both are replaced / tinted with the official mark in\r\n   the official brand blue (#4D6BFE), so the product reads as DeepSeek's. */\r\nhtml.lg-on {\r\n  --lg-brand: #4d6bfe;\r\n  --lg-whale: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 23.16 17.04'><path d='M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z' fill='%23000'/></svg>\");\r\n  --lg-whale-brand: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 23.16 17.04'><path d='M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z' fill='%234d6bfe'/></svg>\");\r\n}\r\n\r\n/* sidebar: hide the Desktop bubble-whale, paint the official one (vector mask,\r\n   so it stays crisp and follows the brand colour instead of currentColor) */\r\nhtml.lg-on [data-slot=\"sidebar.brand.mark\"] > svg { display: none !important; }\r\nhtml.lg-on [data-slot=\"sidebar.brand.mark\"] {\r\n  display: inline-flex !important;\r\n  align-items: center;\r\n  justify-content: center;\r\n}\r\nhtml.lg-on [data-slot=\"sidebar.brand.mark\"]::before {\r\n  content: \"\";\r\n  width: 27px;\r\n  height: 19.9px;\r\n  background-color: var(--lg-brand);\r\n  -webkit-mask: var(--lg-whale) center / contain no-repeat;\r\n  mask: var(--lg-whale) center / contain no-repeat;\r\n  flex: none;\r\n}\r\n\r\n/* hero: the stock mark is already the official whale — give it the brand colour */\r\nhtml.lg-on [data-slot=\"conversation.hero.brand.mark\"] svg,\r\nhtml.lg-on svg.pXSMma_fish {\r\n  color: var(--lg-brand) !important;\r\n}\r\n\r\n/* ============================================================================\r\n   iOS Liquid Glass pass\r\n   Rules taken from Apple's own guidance (HIG › Materials, \"Adopting Liquid Glass\"):\r\n     · Liquid Glass is the *functional* layer — navigation and controls float over\r\n       content, which keeps scrolling underneath;\r\n     · shapes are concentric: controls get rounder and nest inside their container;\r\n     · iOS 26 controls are pills and segmented capsules, not small rounded rects;\r\n     · the material carries vibrancy, so labels stay at full strength on glass.\r\n   ========================================================================== */\r\n\r\n/* segmented control: the tab strip becomes a floating capsule with a sliding\r\n   filled pill, instead of text with an underline */\r\nhtml.lg-on [role=\"tablist\"] {\r\n  width: max-content !important;\r\n  max-width: 100%;\r\n  gap: 2px !important;\r\n  padding: 3px;\r\n  border-radius: 999px;\r\n  background: rgba(255, 255, 255, 0.34);\r\n  box-shadow:\r\n    inset 0 1px 0 rgba(255, 255, 255, 0.75),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.4),\r\n    0 8px 20px -16px rgba(10, 18, 40, 0.6);\r\n  -webkit-backdrop-filter: blur(20px) saturate(180%);\r\n  backdrop-filter: blur(20px) saturate(180%);\r\n}\r\nhtml.lg-on [role=\"tablist\"] [role=\"tab\"] {\r\n  height: 28px;\r\n  padding: 0 14px;\r\n  border-radius: 999px;\r\n  color: var(--dsw-alias-label-secondary);\r\n  transition: background 0.2s var(--lg-ease), color 0.2s var(--lg-ease), box-shadow 0.2s var(--lg-ease);\r\n}\r\nhtml.lg-on [role=\"tablist\"] [role=\"tab\"]::after { display: none !important; }\r\nhtml.lg-on [role=\"tablist\"] [role=\"tab\"][aria-selected=\"true\"] {\r\n  color: var(--dsw-alias-label-primary);\r\n  background: rgba(255, 255, 255, 0.82);\r\n  box-shadow:\r\n    0 1px 2px rgba(10, 18, 40, 0.12),\r\n    inset 0 1px 0 rgba(255, 255, 255, 1);\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [role=\"tablist\"] {\r\n  background: rgba(255, 255, 255, 0.08);\r\n  box-shadow:\r\n    inset 0 1px 0 rgba(255, 255, 255, 0.12),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.08),\r\n    0 8px 20px -16px rgba(0, 0, 0, 0.9);\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [role=\"tablist\"] [role=\"tab\"][aria-selected=\"true\"] {\r\n  color: #fff;\r\n  background: rgba(255, 255, 255, 0.2);\r\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);\r\n}\r\n\r\n/* pills: every small control in the functional layer is a capsule */\r\nhtml.lg-on [class*=\"trigger\"],\r\nhtml.lg-on [class*=\"pill\"] {\r\n  border-radius: 999px !important;\r\n}\r\nhtml.lg-on [class*=\"trigger\"]:hover,\r\nhtml.lg-on [class*=\"pill\"]:hover {\r\n  background: rgba(255, 255, 255, 0.42);\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"trigger\"]:hover,\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"pill\"]:hover {\r\n  background: rgba(255, 255, 255, 0.1);\r\n}\r\n\r\n/* concentric corners: menus belong to the same family as the panels */\r\nhtml.lg-on [class*=\"_material_\"] { border-radius: 20px; }\r\n\r\n/* the composer is a functional surface too — keep it rounder than content */\r\nhtml.lg-on [class*=\"composer\"] [class*=\"card\"],\r\nhtml.lg-on [class*=\"uV2eYG\"] [class*=\"card\"] { border-radius: 999px; }\r\n\r\n/* scroll edge: content softens as it slides under the functional layer, the way\r\n   an iOS scroll view fades beneath a bar instead of being cut by a hard edge */\r\nhtml.lg-on [class*=\"scrollBody\"] {\r\n  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 22px);\r\n  mask-image: linear-gradient(180deg, transparent 0, #000 22px);\r\n}\r\n\r\n/* capsule controls need a fill to read as capsules (iOS uses a translucent\r\n   fill, not just a hit area) */\r\nhtml.lg-on button[class*=\"trigger\"] {\r\n  background: rgba(13, 21, 38, 0.055);\r\n  box-shadow:\r\n    inset 0 1px 0 rgba(255, 255, 255, 0.7),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.35);\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] button[class*=\"trigger\"] {\r\n  background: rgba(255, 255, 255, 0.08);\r\n  box-shadow:\r\n    inset 0 1px 0 rgba(255, 255, 255, 0.12),\r\n    inset 0 0 0 1px rgba(255, 255, 255, 0.08);\r\n}\r\n\r\n/* ============================================================================\r\n   Clear glass: the panes are back, at the lowest fill that still reads as a\r\n   surface. The edge — 1.5px specular rim, hairline outline, refraction band —\r\n   carries the \"this is a pane\" signal, not the fill.\r\n   ========================================================================== */\r\nhtml.lg-on [class*=\"centerCol\"] [class*=\"scrollBody\"],\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"listArea\"] {\r\n  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"centerCol\"] [class*=\"scrollBody\"],\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"sidebarCol\"] [class*=\"listArea\"] {\r\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);\r\n}\r\n\r\n/* dark appearance keeps a dark wall — a white field under light labels would be\r\n   unreadable — but it is a flat field, not the time-based artwork */\r\nhtml.lg-on body[data-ds-dark-theme] {\r\n  --lg-wall-paint: linear-gradient(168deg, #0b0d12 0%, #080a0f 52%, #05070a 100%);\r\n}\r\n\r\n/* flat white field: the vignette belongs to the artwork, not to a solid colour */\r\nhtml.lg-on #lg-wall .lg-vignette { display: none; }\r\n\r\n/* a solid field has nothing to refract or sweep — keep only fill, rim, shadow */\r\nhtml.lg-on [class*=\"sidebarCol\"]::before,\r\nhtml.lg-on [class*=\"centerCol\"]::before,\r\nhtml.lg-on [class*=\"sidebarCol\"]::after,\r\nhtml.lg-on [class*=\"centerCol\"]::after { display: none !important; }\r\n\r\n/* ============================================================================\r\n   iOS shell: navigation column + top bar.\r\n   iOS list language — 10pt row corners, tinted selection, quiet 13pt group\r\n   headers, capsule segmented controls — and an iOS navigation bar: one hairline\r\n   under the bar, 17pt semibold title, circular toolbar buttons.\r\n   ========================================================================== */\r\n\r\n/* ---- sidebar: grouped list ---- */\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"panelRow\"],\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"bhn1Oq_row\"] {\r\n  border-radius: 10px !important;\r\n  min-height: 38px;\r\n  transition: background 0.16s var(--lg-ease), color 0.16s var(--lg-ease);\r\n}\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"panelRow\"]:hover,\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"bhn1Oq_row\"]:hover {\r\n  background: rgba(13, 21, 38, 0.06);\r\n}\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"panelGlyph\"] {\r\n  color: var(--dsw-alias-label-secondary);\r\n}\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"sectionHeader\"] {\r\n  font-size: 11.5px;\r\n  font-weight: 600;\r\n  letter-spacing: 0.01em;\r\n  color: var(--dsw-alias-label-secondary);\r\n  padding: 6px 10px 4px;\r\n}\r\nhtml.lg-on [class*=\"sidebarCol\"] [class*=\"sectionLabel\"] {\r\n  opacity: 0.85;\r\n}\r\n\r\n/* ---- top bar: iOS navigation bar ---- */\r\nhtml.lg-on [class*=\"wSkVaW_header\"] {\r\n  padding-bottom: 2px;\r\n  border-bottom: 1px solid rgba(13, 21, 38, 0.055);\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"wSkVaW_header\"] {\r\n  border-bottom-color: rgba(255, 255, 255, 0.07);\r\n}\r\nhtml.lg-on [class*=\"wSkVaW_title\"] {\r\n  font-size: 17px;\r\n  font-weight: 600;\r\n  letter-spacing: -0.01em;\r\n}\r\n/* circular toolbar buttons, the iOS 26 toolbar treatment */\r\nhtml.lg-on [class*=\"wSkVaW_header\"] button:not([role=\"tab\"]):not([class*=\"tab\"]),\r\nhtml.lg-on [class*=\"headerActions\"] button {\r\n  border-radius: 999px !important;\r\n  height: 30px;\r\n  min-width: 30px;\r\n  background: transparent;\r\n  transition: background 0.16s var(--lg-ease);\r\n}\r\nhtml.lg-on [class*=\"wSkVaW_header\"] button:not([role=\"tab\"]):not([class*=\"tab\"]):hover,\r\nhtml.lg-on [class*=\"headerActions\"] button:hover {\r\n  background: rgba(13, 21, 38, 0.07);\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"wSkVaW_header\"] button:not([role=\"tab\"]):not([class*=\"tab\"]),\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"headerActions\"] button {\r\n  background: transparent;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"wSkVaW_header\"] button:not([role=\"tab\"]):not([class*=\"tab\"]):hover,\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"headerActions\"] button:hover {\r\n  background: rgba(255, 255, 255, 0.1);\r\n}\r\n\r\n/* ---- sidebar: 新会话 = blue capsule, content centred and on one line ---- */\r\nhtml.lg-on [class*=\"newSession\"] {\r\n  height: 44px !important;\r\n  border-radius: 999px !important;\r\n  border: 0 !important;\r\n  background: #4d6bfe !important;\r\n  background-image: none !important;\r\n  box-shadow:\r\n    0 10px 22px -14px rgba(77, 107, 254, 0.95),\r\n    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;\r\n  justify-content: center !important;\r\n  padding: 0 16px !important;\r\n  transition: background 0.16s var(--lg-ease) !important;\r\n}\r\nhtml.lg-on [class*=\"newSession\"]:hover { background: #4d6bfe !important; }\r\nhtml.lg-on [class*=\"newSession\"]:active { background: #4d6bfe !important; transform: none !important; }\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"newSession\"] {\r\n  background: #5568ff !important;\r\n  box-shadow:\r\n    0 10px 24px -14px rgba(0, 0, 0, 0.9),\r\n    inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"newSession\"]:hover { background: #5568ff !important; }\r\n\r\n/* one line, centred: the mask/content wrappers are flex boxes in their own\r\n   right, so they need the same centring or the glyph drifts left of the label */\r\nhtml.lg-on [class*=\"newSessionLabelMask\"],\r\nhtml.lg-on [class*=\"newSessionContent\"],\r\nhtml.lg-on [class*=\"newSessionLabel\"] {\r\n  border: 0 !important;\r\n  outline: none !important;\r\n  box-shadow: none !important;\r\n  display: inline-flex !important;\r\n  align-items: center !important;\r\n  justify-content: center !important;\r\n  width: auto !important;\r\n  padding: 0 !important;\r\n  line-height: 1 !important;\r\n  color: #fff !important;\r\n  -webkit-text-fill-color: #fff !important;\r\n  background: transparent !important;\r\n  background-image: none !important;\r\n  mask-image: none !important;\r\n  -webkit-mask-image: none !important;\r\n  font-size: 17px !important;\r\n  font-weight: 600 !important;\r\n  letter-spacing: -0.01em !important;\r\n}\r\n/* the shell's glyph is a plus inside a ring — at 16px that reads as a magnifier.\r\n   iOS would use a bare plus, so draw one and hide the ringed icon. */\r\nhtml.lg-on [class*=\"newSession\"] svg { display: none !important; }\r\nhtml.lg-on [class*=\"newSessionContent\"]::before {\r\n  content: \"+\";\r\n  display: inline-block;\r\n  margin-right: 7px;\r\n  font-size: 17px;\r\n  font-weight: 500;\r\n  line-height: 1;\r\n  color: #fff;\r\n  transform: translateY(-0.5px);\r\n  align-self: center;\r\n}\r\n/* the shortcut hint stays hidden: the row is plain text */\r\nhtml.lg-on [class*=\"newSessionShortcut\"] { display: none !important; }\r\n\r\n/* ============================================================================\r\n   macOS toolbar: the top-right trio and the two top-left controls.\r\n   macOS 26 toolbar language — borderless 28pt squircles that only show a fill on\r\n   hover, adjacent items grouped inside one hairline capsule with 1px dividers,\r\n   icon at secondary label strength.\r\n   ========================================================================== */\r\nhtml.lg-on [class*=\"wSkVaW_header\"] button:not([role=\"tab\"]):not([class*=\"tab\"]),\r\nhtml.lg-on [class*=\"OMoRSG_\"],\r\nhtml.lg-on [class*=\"brand\"] {\r\n  border-radius: 7px !important;\r\n  border: 0 !important;\r\n  background: transparent !important;\r\n  box-shadow: none !important;\r\n  transition: background 0.12s var(--lg-ease) !important;\r\n}\r\nhtml.lg-on [class*=\"wSkVaW_header\"] button:not([role=\"tab\"]):not([class*=\"tab\"]):hover,\r\nhtml.lg-on [class*=\"OMoRSG_\"]:hover,\r\nhtml.lg-on [class*=\"brand\"]:hover {\r\n  background: rgba(13, 21, 38, 0.06) !important;\r\n}\r\nhtml.lg-on [class*=\"wSkVaW_header\"] button:not([role=\"tab\"]):not([class*=\"tab\"]):active,\r\nhtml.lg-on [class*=\"OMoRSG_\"]:active {\r\n  background: rgba(13, 21, 38, 0.12) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"wSkVaW_header\"] button:not([role=\"tab\"]):not([class*=\"tab\"]):hover,\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"OMoRSG_\"]:hover,\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"brand\"]:hover {\r\n  background: rgba(255, 255, 255, 0.09) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"wSkVaW_header\"] button:not([role=\"tab\"]):not([class*=\"tab\"]):active,\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"OMoRSG_\"]:active {\r\n  background: rgba(255, 255, 255, 0.16) !important;\r\n}\r\n\r\n/* the split \"open with\" control becomes one capsule: squared where the halves\r\n   meet, rounded on the outside, with a hairline divider between them */\r\nhtml.lg-on [class*=\"OMoRSG_main\"] {\r\n  border-radius: 7px 0 0 7px !important;\r\n}\r\nhtml.lg-on [class*=\"OMoRSG_chevron\"] {\r\n  border-radius: 0 7px 7px 0 !important;\r\n  border-left: 1px solid rgba(13, 21, 38, 0.09) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"OMoRSG_main\"] { }\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"OMoRSG_chevron\"] {\r\n  border-left-color: rgba(255, 255, 255, 0.12) !important;\r\n}\r\n\r\n/* top-left pair: brand button + collapse control share the same geometry */\r\nhtml.lg-on .lg-sidebar-toggle { border-radius: 7px !important; }\r\n\r\n/* macOS popup buttons: the two chips on the left of the title row (\"创造模式\",\r\n   \"1 个后台任务运行中\") — squircle, hairline outline, 12pt secondary label. */\r\nhtml.lg-on [class*=\"wSkVaW_header\"] [class*=\"trigger\"],\r\nhtml.lg-on [class*=\"headerActions\"] [class*=\"trigger\"] {\r\n  border-radius: 6px !important;\r\n  height: 22px;\r\n  padding: 0 8px;\r\n  font-size: 12px !important;\r\n  color: var(--dsw-alias-label-secondary) !important;\r\n  background: transparent !important;\r\n  box-shadow: inset 0 0 0 1px rgba(13, 21, 38, 0.09) !important;\r\n}\r\nhtml.lg-on [class*=\"wSkVaW_header\"] [class*=\"trigger\"]:hover,\r\nhtml.lg-on [class*=\"headerActions\"] [class*=\"trigger\"]:hover {\r\n  background: rgba(13, 21, 38, 0.05) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"wSkVaW_header\"] [class*=\"trigger\"],\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"headerActions\"] [class*=\"trigger\"] {\r\n  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"wSkVaW_header\"] [class*=\"trigger\"]:hover,\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"headerActions\"] [class*=\"trigger\"]:hover {\r\n  background: rgba(255, 255, 255, 0.08) !important;\r\n}\r\n\r\n/* ============================================================================\r\n   Question / confirm panels must win over the glass.\r\n   The ask card shares the page with translucent panes, so it gets its own\r\n   opaque-ish surface, full-strength labels, and it evicts our floating control.\r\n   ========================================================================== */\r\nhtml.lg-on [class*=\"nUhMVa_choices\"] { position: relative; z-index: 2; }\r\nhtml.lg-on [class*=\"nUhMVa_choice\"] {\r\n  background: rgba(255, 255, 255, 0.88) !important;\r\n  border-radius: 10px !important;\r\n  box-shadow: inset 0 0 0 1px rgba(13, 21, 38, 0.1) !important;\r\n  opacity: 1 !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"nUhMVa_choice\"] {\r\n  background: rgba(255, 255, 255, 0.09) !important;\r\n  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.13) !important;\r\n}\r\nhtml.lg-on [class*=\"nUhMVa_choiceTitle\"],\r\nhtml.lg-on [class*=\"nUhMVa_choiceNote\"],\r\nhtml.lg-on [class*=\"nUhMVa_choiceMain\"] {\r\n  opacity: 1 !important;\r\n  -webkit-text-fill-color: currentColor !important;\r\n}\r\n/* the floating sidebar toggle must not hover above a modal */\r\nhtml.lg-on:has([aria-modal=\"true\"]) .lg-sidebar-toggle,\r\nhtml.lg-on:has([role=\"dialog\"]) .lg-sidebar-toggle { display: none !important; }\r\n/* and no modal surface may be see-through enough to lose its text */\r\nhtml.lg-on [role=\"dialog\"][aria-modal=\"true\"] { backdrop-filter: blur(24px) saturate(160%); }\r\n\r\n/* ============================================================================\r\n   macOS traffic lights, top-right, drawn by the plugin.\r\n   They only exist when the shell patch is installed (window.lgWindow bridge);\r\n   the native Windows caption buttons are gone in that build, so these are the\r\n   real controls: red close, yellow minimise, green zoom.\r\n   ========================================================================== */\r\nhtml.lg-on .lg-traffic {\r\n  position: fixed;\r\n  top: max(6px, calc((var(--dsh-windows-titlebar-height, 36px) - 12px) / 2));\r\n  right: 14px;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  z-index: 200;\r\n  -webkit-app-region: no-drag;\r\n}\r\nhtml.lg-on .lg-traffic-dot {\r\n  width: 12px !important;\r\n  height: 12px !important;\r\n  min-width: 12px !important;\r\n  flex: none;\r\n  padding: 0;\r\n  border: 0;\r\n  border-radius: 50% !important;\r\n  corner-shape: round !important;\r\n  display: grid;\r\n  place-items: center;\r\n  cursor: pointer;\r\n  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.14);\r\n  -webkit-app-region: no-drag;\r\n  transition: filter 0.12s var(--lg-ease);\r\n}\r\nhtml.lg-on .lg-traffic-min { background: #febc2e; }\r\nhtml.lg-on .lg-traffic-max { background: #28c840; }\r\nhtml.lg-on .lg-traffic-close { background: #ff5f57; }\r\nhtml.lg-on .lg-traffic-dot svg {\r\n  width: 8px;\r\n  height: 8px;\r\n  fill: none;\r\n  stroke: rgba(0, 0, 0, 0.55);\r\n  stroke-width: 1.3;\r\n  stroke-linecap: round;\r\n  opacity: 0;\r\n  transition: opacity 0.12s var(--lg-ease);\r\n}\r\nhtml.lg-on .lg-traffic:hover .lg-traffic-dot svg { opacity: 1; }\r\nhtml.lg-on .lg-traffic-dot:active { filter: brightness(0.86); }\r\nhtml.lg-on .lg-traffic-dot:focus-visible { outline: 2px solid #4176e6; outline-offset: 2px; }\r\n\r\n/* ============================================================================\r\n   Modals: no bleed-through, ever.\r\n   The ask/confirm card is translucent by default, so chat text shows through it\r\n   and reads as \"content hidden behind something\". Any dialog-like surface gets\r\n   an opaque plate; anything that looks like a dialog but is only marked by its\r\n   class name is covered by the [class*=\"dialog\" i] grab bag.\r\n   ========================================================================== */\r\nhtml.lg-on [role=\"dialog\"],\r\nhtml.lg-on [aria-modal=\"true\"],\r\nhtml.lg-on [class*=\"dialog\" i],\r\nhtml.lg-on [class*=\"modal\" i],\r\nhtml.lg-on [class*=\"sheet\" i],\r\nhtml.lg-on [class*=\"askPanel\" i],\r\nhtml.lg-on [class*=\"promptCard\" i] {\r\n  background-color: #fbfcff !important;\r\n  background-image: none !important;\r\n  -webkit-backdrop-filter: none !important;\r\n  backdrop-filter: none !important;\r\n  box-shadow:\r\n    0 34px 90px -40px rgba(10, 18, 40, 0.5),\r\n    0 0 0 1px rgba(13, 21, 38, 0.08) !important;\r\n}\r\nhtml.lg-on body[data-ds-dark-theme] [role=\"dialog\"],\r\nhtml.lg-on body[data-ds-dark-theme] [aria-modal=\"true\"],\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"dialog\" i],\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"modal\" i],\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"sheet\" i],\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"askPanel\" i],\r\nhtml.lg-on body[data-ds-dark-theme] [class*=\"promptCard\" i] {\r\n  background-color: #15181f !important;\r\n  box-shadow:\r\n    0 34px 90px -40px rgba(0, 0, 0, 0.95),\r\n    0 0 0 1px rgba(255, 255, 255, 0.1) !important;\r\n}\r\n/* a modal that is taller than the window scrolls inside itself instead of\r\n   spilling its first line out over the rounded edge */\r\nhtml.lg-on [role=\"dialog\"],\r\nhtml.lg-on [aria-modal=\"true\"] {\r\n  max-height: 86vh;\r\n  overflow: auto;\r\n}\r\n\r\n/* the new-session control is a label, not a toy: no press scale, no hover\r\n   colour, and none of the shell's label-mask plate behind the text */\r\nhtml.lg-on [class*=\"newSession\"],\r\nhtml.lg-on [class*=\"newSession\"]:hover,\r\nhtml.lg-on [class*=\"newSession\"]:active,\r\nhtml.lg-on [class*=\"newSession\"][data-lg-press] {\r\n  transform: none !important;\r\n  transition: none !important;\r\n  animation: none !important;\r\n}\r\nhtml.lg-on [class*=\"newSessionLabelMask\"],\r\nhtml.lg-on [class*=\"newSessionLabelMask\"]::before,\r\nhtml.lg-on [class*=\"newSessionLabelMask\"]::after,\r\nhtml.lg-on [class*=\"newSessionLabelMask\"]::first-line {\r\n  background: transparent !important;\r\n  background-image: none !important;\r\n  box-shadow: none !important;\r\n}\r\n\r\n\r\n/* the nested plates the shell stacks inside the new-session button read as\r\n/* the nested plates the shell stacks inside the new-session button read as\r\n/* the shell stacks three plates inside the new-session button (label mask,\r\n   content, label) and each one paints a slightly lighter pill inside the last:\r\n   that is the concentric-lens look. Flatten them so one capsule remains. */\r\nhtml.lg-on [class*=\"newSession\"] [class*=\"LabelMask\"],\r\nhtml.lg-on [class*=\"newSession\"] [class*=\"Content\"],\r\nhtml.lg-on [class*=\"newSession\"] [class*=\"Label\"] {\r\n  display: contents !important;\r\n  background: none !important;\r\n  background-image: none !important;\r\n  box-shadow: none !important;\r\n  border: 0 !important;\r\n  -webkit-backdrop-filter: none !important;\r\n  backdrop-filter: none !important;\r\n}\r\n\r\n/* ============================================================================\r\n   Window shape: Apple-style continuous corners on the outermost surface.\r\n   The window is a rectangle (Electron, frameless), so the shell is clipped to\r\n   a superellipse and the four outside corners are painted with the window\r\n   background colour the shell uses (#f8f8f6 / #141416), so the notch reads as\r\n   the real window chrome instead of a stray polygon.\r\n   ========================================================================== */\r\nhtml.lg-on {\r\n  --lg-window-radius: 34px;\r\n  --dsh-windows-content-radius: var(--lg-window-radius) !important;\r\n  /* the window is transparent (shell patch): keep this clear so the rounded\r\n     corners reveal the desktop instead of a coloured rectangle */\r\n  background: transparent !important;\r\n}\r\nhtml.lg-on #lg-wall {\r\n  border-radius: var(--lg-window-radius);\r\n  corner-shape: superellipse(1.7);\r\n  overflow: hidden;\r\n}\r\nhtml.lg-on #root {\r\n  border-radius: var(--lg-window-radius);\r\n  corner-shape: superellipse(1.7);\r\n}\r\n";

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
    /**
     * Liquid refraction for the composer only.
     *
     * The SVG filter warps whatever sits *behind* the composer card — the chat
     * scroller passes under it, so a displacement map gives a real, live lens
     * instead of a fake overlay. The displacement is driven by scroll velocity
     * and decays to zero, so a still UI stays perfectly crisp.
     */
    function installComposerLens() {
      const doc = document;
      const ns = 'http://www.w3.org/2000/svg';
      const SVG_ID = 'lg-lens-svg';
      const FILTER_ID = 'lg-lens';

      let svg = doc.getElementById(SVG_ID);
      if (svg === null) {
        svg = doc.createElementNS(ns, 'svg');
        svg.id = SVG_ID;
        svg.setAttribute('aria-hidden', 'true');
        svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
        const filter = doc.createElementNS(ns, 'filter');
        filter.id = FILTER_ID;
        filter.setAttribute('x', '0');
        filter.setAttribute('y', '0');
        filter.setAttribute('width', '100%');
        filter.setAttribute('height', '100%');
        filter.innerHTML =
          '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="1" seed="4" result="noise"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>';
        svg.appendChild(filter);
        doc.body.appendChild(svg);
      }
      const displacement = svg.querySelector('feDisplacementMap');
      if (displacement === null) return () => {};

      // NB: this module has a local `const CSS = __LIQUID_GLASS_CSS__`, so the
      // DOM API has to be reached through globalThis.
      if (!globalThis.CSS || !globalThis.CSS.supports('backdrop-filter', `url(#${FILTER_ID})`)) return () => {};
      doc.documentElement.style.setProperty('--lg-composer-lens', `url(#${FILTER_ID})`);

      let target = 0;
      let current = 0;
      let frame = 0;

      const step = () => {
        current += (target - current) * 0.22;
        if (Math.abs(target - current) < 0.4) current = target;
        displacement.setAttribute('scale', current.toFixed(2));
        frame = current === 0 && target === 0 ? 0 : requestAnimationFrame(step);
      };
      const kick = (value) => {
        target = Math.max(0, Math.min(18, value));
        if (frame === 0) frame = requestAnimationFrame(step);
      };

      /* velocity of the chat scroller drives the lens */
      let lastTop = -1;
      let lastTime = 0;
      const onScroll = (event) => {
        const node = event.target;
        const top = node && typeof node.scrollTop === 'number' ? node.scrollTop : 0;
        const now = performance.now();
        if (lastTop < 0) { lastTop = top; lastTime = now; return; }
        const dt = Math.max(8, now - lastTime);
        const speed = Math.abs(top - lastTop) / dt;
        lastTop = top;
        lastTime = now;
        kick(speed * 220);
      };
      doc.addEventListener('scroll', onScroll, { capture: true, passive: true });

      /* expose a manual trigger so the effect can be inspected without scrolling */
      window.__lgLens = (value) => { target = value; if (frame === 0) frame = requestAnimationFrame(step); };

      return () => {
        doc.removeEventListener('scroll', onScroll, { capture: true });
        doc.documentElement.style.removeProperty('--lg-composer-lens');
        if (frame !== 0) cancelAnimationFrame(frame);
        delete window.__lgLens;
      };
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
      teardown.push(installComposerLens());
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
