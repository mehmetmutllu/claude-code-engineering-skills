#!/usr/bin/env node
/*
 * verify_bundle.js - look INSIDE a release artifact (AAB / APK / IPA are zip files) before shipping it.
 * "Build succeeded" does not mean the package is right: this refuses when
 *   1) a file inside the bundle does not contain a required pattern (e.g. the ad TEST flag is not false), or
 *   2) a version stamp inside the bundle differs from the one in the repo (stale assets / skipped sync).
 * Pure Node (zlib), no unzip dependency.
 *
 * Usage:
 *   node verify_bundle.js <bundle> \
 *     --require "base/assets/public/js/ad-ids.js=TEST:\s*false" \
 *     --same    "base/assets/public/sw.js=www/sw.js=VERSION\s*=\s*'([^']+)'"
 * --require <inner path>=<regex>                 inner file must match regex
 * --same    <inner path>=<repo path>=<regex(1 group)>  captured group must be equal in both
 * Both flags may repeat. Exit 1 on any failure. Counter-test it once with a deliberately bad bundle.
 */
const fs = require('fs');
const zlib = require('zlib');

function readZip(buf) {
  // find End Of Central Directory (signature 0x06054b50) scanning backwards
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    entries.set(name, { method, csize, local });
    p += 46 + nlen + xlen + clen;
  }
  return name => {
    const e = entries.get(name);
    if (!e) return null;
    const lnlen = buf.readUInt16LE(e.local + 26), lxlen = buf.readUInt16LE(e.local + 28);
    const start = e.local + 30 + lnlen + lxlen;
    const data = buf.subarray(start, start + e.csize);
    if (e.method === 0) return data.toString('utf8');
    if (e.method === 8) return zlib.inflateRawSync(data).toString('utf8');
    throw new Error(`unsupported compression ${e.method} for ${name}`);
  };
}

const USAGE = `usage: node verify_bundle.js <bundle> [--require <inner path>=<regex>]... [--same <inner path>=<repo path>=<regex with 1 group>]...
  --require  inner file must match regex
  --same     captured group must be equal in the bundle file and the repo file
exit: 0 all checks passed · 1 a check failed (do not ship) · 2 usage error`;
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) { console.log(USAGE); process.exit(0); }
const bundle = args.shift();
if (!bundle || args.length === 0) { console.error(USAGE); process.exit(2); }
const get = readZip(fs.readFileSync(bundle));
let failed = 0;
const fail = msg => { failed++; console.error('  FAIL ' + msg); };

for (let i = 0; i < args.length; i += 2) {
  const flag = args[i], spec = args[i + 1] || '';
  if (flag === '--require') {
    const [inner, re] = [spec.slice(0, spec.indexOf('=')), spec.slice(spec.indexOf('=') + 1)];
    const text = get(inner);
    if (text == null) fail(`${inner}: missing from bundle`);
    else if (!new RegExp(re).test(text)) fail(`${inner}: does not match /${re}/`);
    else console.log(`  ok   ${inner} matches /${re}/`);
  } else if (flag === '--same') {
    const [inner, repo, ...rest] = spec.split('=');
    const re = new RegExp(rest.join('='));
    const a = get(inner), b = fs.existsSync(repo) ? fs.readFileSync(repo, 'utf8') : null;
    const va = a && (a.match(re) || [])[1], vb = b && (b.match(re) || [])[1];
    if (!va || !vb) fail(`${inner} / ${repo}: version not found (${va} / ${vb})`);
    else if (va !== vb) fail(`version differs: bundle ${va} vs repo ${vb} (stale assets? skipped sync?)`);
    else console.log(`  ok   version ${va} in bundle and repo`);
  } else { console.error('unknown flag ' + flag); process.exit(2); }
}
if (failed) { console.error(`\n${failed} check(s) failed - DO NOT SHIP this bundle.`); process.exit(1); }
console.log('\nall checks passed');
