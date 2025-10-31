#!/usr/bin/env node
// Simple environment health check for v_shop
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { execSync } from 'node:child_process';

const root = process.cwd();
const log = (...a) => console.log(...a);
const PASS = (m) => log(`✅  ${m}`);
const WARN = (m) => log(`⚠️  ${m}`);
const FAIL = (m) => log(`❌  ${m}`);

function which(cmd) {
  try { execSync(process.platform === 'win32' ? `where ${cmd}` : `which ${cmd}`, { stdio: 'ignore' }); return true; } catch { return false; }
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

async function checkPort(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1');
    socket.setTimeout(800);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { resolve(false); });
  });
}

(async () => {
  log('v_shop health check');
  log('cwd:', root);

  // Tooling
  try { PASS(`node: ${execSync('node -v').toString().trim()}`); } catch { FAIL('node not found'); }
  try { PASS(`npm: ${execSync('npm -v').toString().trim()}`); } catch { WARN('npm not found'); }
  if (which('java')) { PASS('java found'); } else { FAIL('java not found'); }
  if (which('mvn') || fs.existsSync(path.join(root, 'vocaloidshop', 'mvnw'))) { PASS('maven/mvnw found'); } else { WARN('maven not found'); }

  // Frontend
  const viteCfg = path.join(root, 'vocaloid_front', 'vite.config.ts');
  if (fs.existsSync(viteCfg)) {
    const txt = readFileSafe(viteCfg) || '';
    const proxy8081 = /localhost:\s*8081/.test(txt);
    PASS('frontend: vite.config.ts present');
    if (!proxy8081) WARN('frontend: vite proxy not pointing to 8081 (OK if you changed backend port)');
  } else {
    FAIL('frontend: vite.config.ts missing');
  }

  // Backend config
  const appYml = path.join(root, 'vocaloidshop', 'src', 'main', 'resources', 'application.yml');
  const envYml = path.join(root, 'vocaloidshop', 'src', 'main', 'resources', 'application-env.yml');
  const hasApp = fs.existsSync(appYml);
  const hasEnv = fs.existsSync(envYml);
  if (hasApp) PASS('backend: application.yml present'); else WARN('backend: application.yml missing');
  if (hasEnv) PASS('backend: application-env.yml present (env profile)');

  // Port check
  const port = 8081;
  const listening = await checkPort(port);
  if (listening) PASS(`backend: port ${port} is listening`); else WARN(`backend: port ${port} not listening (start app or use different port)`);

  // Flyway migrations directory
  const fly = path.join(root, 'vocaloidshop', 'src', 'main', 'resources', 'db', 'migration');
  if (fs.existsSync(fly)) PASS('backend: Flyway migrations directory present'); else WARN('backend: Flyway migrations directory missing');

  log('\nDone. Review warnings/failures above.');
})();
