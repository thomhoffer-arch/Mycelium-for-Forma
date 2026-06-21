#!/usr/bin/env node
// Bundle connector → CJS via esbuild (no top-level await at module level),
// then package into standalone binaries with @yao-pkg/pkg.
import { build } from 'esbuild';
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root   = resolve(__dirname, '..');
const entry  = resolve(root, 'mycelium-draft/connectors/forma/connector.mjs');
const outCjs = resolve(root, 'dist/connector.cjs');

mkdirSync(resolve(root, 'dist'), { recursive: true });

// Env-file loader prepended as CJS banner: reads credentials from
// %APPDATA%\mycelium-for-forma\.env (Windows) or
// ~/.config/mycelium-for-forma/.env (macOS/Linux) before the connector runs.
const envBanner = [
  "const _fs=require('fs'),_path=require('path'),_os=require('os');",
  "try{",
  "  const _d=process.platform==='win32'",
  "    ?_path.join(process.env.APPDATA||_path.join(_os.homedir(),'AppData','Roaming'),'mycelium-for-forma')",
  "    :_path.join(_os.homedir(),'.config','mycelium-for-forma');",
  "  for(const _l of _fs.readFileSync(_path.join(_d,'.env'),'utf8').split('\\n')){",
  "    const _t=_l.trim();if(!_t||_t[0]==='#')continue;",
  "    const _i=_t.indexOf('=');if(_i<1)continue;",
  "    const _k=_t.slice(0,_i).trim();",
  "    if(_k&&!(_k in process.env))process.env[_k]=_t.slice(_i+1).trim();",
  "  }",
  "}catch(_e){}",
].join('\n');

// 1. Bundle ESM → CJS (connector has no top-level await at module level now;
//    await is inside exported run() which is fine for CJS).
await build({
  entryPoints: [entry],
  bundle:      true,
  platform:    'node',
  format:      'cjs',
  outfile:     outCjs,
  banner:      { js: envBanner },
});
console.log('✓ esbuild → dist/connector.cjs');

// 2. pkg: create self-contained binaries per platform
const args         = process.argv.slice(2);
const targetFilter = (args.find(a => a.startsWith('--target=')) ?? '--target=all').split('=')[1];

const targets = [];
if (targetFilter === 'all' || targetFilter === 'windows')
  targets.push({ target: 'node18-win-x64',     out: 'dist/mycelium-for-forma-win-x64.exe' });
if (targetFilter === 'all' || targetFilter === 'macos') {
  targets.push({ target: 'node18-macos-x64',   out: 'dist/mycelium-for-forma-macos-x64'   });
  targets.push({ target: 'node18-macos-arm64', out: 'dist/mycelium-for-forma-macos-arm64'  });
}

for (const { target, out } of targets) {
  console.log(`pkg → ${out} (${target})`);
  execSync(
    `npx --yes @yao-pkg/pkg ${outCjs} --target ${target} --output ${out}`,
    { stdio: 'inherit', cwd: root }
  );
  console.log(`✓ ${out}`);
}
