// Side-effect module: load platform .env before connector runs.
// Imported first in entry.mjs so env vars are set before runAdapter executes.
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const dir = process.platform === 'win32'
  ? join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'mycelium-for-forma')
  : join(homedir(), '.config', 'mycelium-for-forma');

try {
  for (const line of readFileSync(join(dir, '.env'), 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t[0] === '#') continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    if (k && !(k in process.env)) process.env[k] = t.slice(i + 1).trim();
  }
} catch {}
