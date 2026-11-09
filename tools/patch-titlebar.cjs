// macOS traffic-light window buttons for DSH Desktop.
//
// This patches the *desktop shell* (app.asar), not the web app: it removes
// Electron's titleBarOverlay (Windows caption buttons), guards the
// setTitleBarOverlay call that would otherwise throw, and adds the
// `lg:window` IPC channel plus the `window.lgWindow` preload bridge that the
// client plugin's traffic lights call.
//
//   node tools/patch-titlebar.cjs            apply (validated, backs up first)
//   node tools/patch-titlebar.cjs --dry      validate only, do not swap
//   node tools/patch-titlebar.cjs --restore  put the backup back
//
// Paths below point at a stock Windows install; edit RES if yours differs.
// Keep the plugin's src/ in sync with what this patch expects.
// Patches the DSH Desktop shell (app.asar) so the Windows caption buttons are
// replaced by macOS-style traffic lights drawn by the liquid-glass plugin.
//
//   node lg/tools/patch-titlebar.cjs          -> apply (writes app.asar.new, validates, swaps)
//   node lg/tools/patch-titlebar.cjs --restore-> put app.asar.bak-titlebar back
//
// Validation before the swap: the new archive is re-parsed, every untouched file
// must still match its stored SHA-256, and both patched files must parse.
process.noAsar = true;
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const RES = 'D:/DeepSeek Harness/DSH Desktop/resources';
const ASAR = path.join(RES, 'app.asar');
const BAK = path.join(RES, 'app.asar.bak-titlebar');
const NEW = path.join(RES, 'app.asar.new');

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const align4 = (n) => (n + 3) & ~3;

function parse(buf) {
  const headerSize = buf.readUInt32LE(4);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.toString('utf8', 16, 16 + jsonLen));
  const dataStart = 8 + headerSize;
  return { json, jsonLen, dataStart };
}

function walk(node, prefix, out) {
  for (const [name, entry] of Object.entries(node.files)) {
    const p = prefix ? `${prefix}/${name}` : name;
    if (entry.files) walk(entry, p, out);
    else if (entry.unpacked) continue; // lives in app.asar.unpacked, not in the archive
    else if (entry.size !== undefined) out.push({ path: p, entry });
  }
}

function isWindowsFrameAnchor(text) {
  return text.includes("...isWindows ? {\n      titleBarStyle: \"hidden\",") && !text.includes('frame: false');
}

function patchMain(text) {
  let next = text;
  const overlay = 'titleBarOverlay: windowsTitleBarOverlay(nativeTheme.shouldUseDarkColors),';
  if (next.includes(overlay)) next = next.replace(overlay, '');
  /* with the overlay gone, Electron throws "Titlebar overlay is not enabled"
     from every setTitleBarOverlay call — guard them instead of removing them */
  const call = 'window.setTitleBarOverlay(windowsTitleBarOverlay(isDark));';
  const guarded = 'try{window.setTitleBarOverlay(windowsTitleBarOverlay(isDark));}catch(__lgNoOverlay){}';
  if (next.includes(call) && !next.includes(guarded)) next = next.split(call).join(guarded);

  /* The shell also repaints the window background on every theme sync
     (`window.setBackgroundColor(isDark ? "#141416" : "#ffffff")`), which throws
     the transparency away and makes the rounded corners opaque again. */
  const solidWindowBg = 'else window.setBackgroundColor(isDark ? "#141416" : "#ffffff");';
  if (next.includes(solidWindowBg)) {
    next = next.split(solidWindowBg).join('else window.setBackgroundColor("#00000000");');
  }

  /* Transparent window: the app draws its own rounded shell in CSS, so the
     window itself must be see-through or those corners would reveal an opaque
     rectangle instead of the desktop. Windows only — macOS keeps its native
     shape and vibrancy.
     Electron on Windows only composites alpha for *frameless* windows, so the
     same patch has to drop the frame (`titleBarStyle: hidden` keeps it). */
  if (!next.includes('transparent: true')) {
    const anchor = 'show: false,\n    title: "",';
    if (!next.includes(anchor)) throw new Error('main: window options anchor not found');
    next = next.replace(anchor, 'show: false,\n    ...isWindows ? { transparent: true } : {},\n    title: "",');
  }
  if (isWindowsFrameAnchor(next)) {
    next = next.replace(
      '...isWindows ? {\n      titleBarStyle: "hidden",',
      '...isWindows ? {\n      titleBarStyle: "hidden",\n      frame: false,',
    );
  }
  const solidBg = 'backgroundColor: process.platform === "darwin" ? "#00000000" : nativeTheme.shouldUseDarkColors ? "#141416" : "#f8f8f6",';
  if (next.includes(solidBg)) {
    next = next.replace(solidBg, 'backgroundColor: "#00000000",');
  }

  if (next.includes('lg:window')) return next; // hook already installed
  const hook = `
void import("electron").then(({ ipcMain, BrowserWindow }) => {
  if (globalThis.__lgWindowIpc) return;
  globalThis.__lgWindowIpc = true;
  ipcMain.on("lg:window", (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || win.isDestroyed()) return;
    if (action === "min") win.minimize();
    else if (action === "max") { if (win.isMaximized()) win.unmaximize(); else win.maximize(); }
    else if (action === "close") win.close();
  });
}).catch(() => {});
`;
  return next + hook;
}

function patchPreload(text) {
  if (text.includes('lgWindow')) return text; // already bridged
  const hook = `
;(()=>{try{const{contextBridge,ipcRenderer}=require("electron");contextBridge.exposeInMainWorld("lgWindow",{minimize:()=>ipcRenderer.send("lg:window","min"),toggleMaximize:()=>ipcRenderer.send("lg:window","max"),close:()=>ipcRenderer.send("lg:window","close")});}catch(err){}})();
`;
  return text + hook;
}

if (process.argv.includes('--restore')) {
  if (!fs.existsSync(BAK)) throw new Error('no backup at ' + BAK);
  fs.copyFileSync(BAK, ASAR);
  console.log('restored app.asar from backup');
  process.exit(0);
}

const original = fs.readFileSync(ASAR);
const { json, dataStart } = parse(original);

const leaves = [];
walk(json, '', leaves);
console.log('files in archive:', leaves.length);

const TARGETS = {
  'out/main/index.js': patchMain,
  'out/preload/index.cjs': patchPreload,
};

const out = fs.openSync(NEW, 'w');
let cursor16 = 0; // placeholder, header written after the data sizes are known

// build payloads first (memory: ~370 MB total, acceptable)
const payloads = [];
for (const leaf of leaves) {
  const start = dataStart + Number(leaf.entry.offset);
  const originalBytes = original.subarray(start, start + leaf.entry.size);
  const patch = TARGETS[leaf.path];
  let bytes = originalBytes;
  if (patch) {
    bytes = Buffer.from(patch(originalBytes.toString('utf8')), 'utf8');
    leaf.entry.size = bytes.length;
    leaf.entry.integrity = { algorithm: 'SHA256', hash: sha(bytes), blockSize: 4194304, blocks: [sha(bytes)] };
    console.log('patched', leaf.path, originalBytes.length, '->', bytes.length);
  }
  payloads.push({ leaf, bytes });
}

// lay the payloads out, then write the header with the final offsets
let offset = 0;
for (const item of payloads) {
  item.leaf.entry.offset = String(offset);
  offset += item.bytes.length;
}

const headerJson = Buffer.from(JSON.stringify(json), 'utf8');
const jsonLen = headerJson.length;
/* pickle layout of an asar header (verified against the original archive):
     u32 @0  = 4
     u32 @4  = 4 + size2
     u32 @8  = 4 + jsonLen + pad
     u32 @12 = jsonLen
     utf8 json, zero padding, then the file payloads */
const padBytes = align4(4 + jsonLen) - (4 + jsonLen);
const size2 = 4 + jsonLen + padBytes;
const size1 = 4 + size2;
const headLen = 8 + size1;

const head = Buffer.alloc(headLen);
head.writeUInt32LE(4, 0);
head.writeUInt32LE(size1, 4);
head.writeUInt32LE(size2, 8);
head.writeUInt32LE(jsonLen, 12);
headerJson.copy(head, 16);

fs.writeSync(out, head);
for (const item of payloads) fs.writeSync(out, item.bytes);
fs.closeSync(out);
console.log('wrote', NEW, fs.statSync(NEW).size, 'bytes');

// ---- validate before swapping ------------------------------------------------
const check = fs.readFileSync(NEW);
const parsed = parse(check);
const checkLeaves = [];
walk(parsed.json, '', checkLeaves);
let bad = 0;
for (const leaf of checkLeaves) {
  const start = parsed.dataStart + Number(leaf.entry.offset);
  const bytes = check.subarray(start, start + leaf.entry.size);
  const expected = leaf.entry.integrity && leaf.entry.integrity.hash;
  if (expected && sha(bytes) !== expected) {
    bad += 1;
    if (bad < 5) console.log('integrity mismatch:', leaf.path);
  }
}
const mainText = check.subarray(
  parsed.dataStart + Number(checkLeaves.find((l) => l.path === 'out/main/index.js').entry.offset),
).subarray(0, 2000).toString('utf8');
console.log('integrity failures:', bad);
console.log('main head:', mainText.slice(0, 80).replace(/\n/g, ' '));
if (bad !== 0) throw new Error('validation failed, keeping the original archive');

if (process.argv.includes('--dry')) { console.log('dry run: archive valid, not swapped'); process.exit(0); }
if (!fs.existsSync(BAK)) fs.copyFileSync(ASAR, BAK);
fs.copyFileSync(NEW, ASAR);
fs.unlinkSync(NEW);
console.log('app.asar replaced; backup at', BAK);

