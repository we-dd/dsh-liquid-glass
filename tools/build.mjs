// Builds lib/client.js from src/client.template.js + src/glass.css.
// No bundler: the client half is plain ESM-shaped JavaScript that registers
// itself with the web app's module loader.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const template = readFileSync(join(root, 'src', 'client.template.js'), 'utf8');
const css = readFileSync(join(root, 'src', 'glass.css'), 'utf8');

const marker = '__LIQUID_GLASS_CSS__';
if (!template.includes(marker)) throw new Error(`client template is missing ${marker}`);

const out = template.replace(marker, JSON.stringify(css));
const target = join(root, 'lib', 'client.js');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, out, 'utf8');
console.log(`wrote ${target} (${out.length} bytes, css ${css.length} bytes)`);
