import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const api = process.env.GAMEMATCH_API_URL;
const key = process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!api || !key)
  throw new Error('Set GAMEMATCH_API_URL and CLERK_PUBLISHABLE_KEY before building for Vercel.');
const apiUrl = new URL(api);
if (!['https:', 'http:'].includes(apiUrl.protocol)) throw new Error('Invalid API URL');
if (!/^pk_(test|live)_[A-Za-z0-9_-]+$/.test(key)) throw new Error('Invalid Clerk publishable key');
const clerkDomain = Buffer.from(key.split('_').slice(2).join('_'), 'base64')
  .toString()
  .replace(/\$$/, '');
if (!/^[a-z0-9.-]+$/.test(clerkDomain)) throw new Error('Invalid Clerk domain');
const envFile = fileURLToPath(new URL('../src/environments/environment.prod.ts', import.meta.url));
const indexFile = fileURLToPath(new URL('../src/index.html', import.meta.url));
writeFileSync(
  envFile,
  `export const environment = {api_url: ${JSON.stringify(api.replace(/\/$/, ''))}, designPreview: false};\n`,
);
let html = readFileSync(indexFile, 'utf8');
html = html.replace(/data-clerk-publishable-key="[^"]*"/, `data-clerk-publishable-key="${key}"`);
html = html.replace(
  /src="https:\/\/[^/]+\/npm\/@clerk\/clerk-js@[^/]+\/dist\/clerk.browser.js"/,
  `src="https://${clerkDomain}/npm/@clerk/clerk-js@5/dist/clerk.browser.js"`,
);
writeFileSync(indexFile, html);
