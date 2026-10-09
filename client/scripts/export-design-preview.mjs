import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../dist/design-preview/browser/', import.meta.url));
const index = `${output}index.html`;
writeFileSync(
  index,
  readFileSync(index, 'utf8').replace(
    /<script\b[^>]*data-clerk-publishable-key[^>]*>[\s\S]*?<\/script>/g,
    '',
  ),
);
writeFileSync(
  `${output}vercel.json`,
  JSON.stringify(
    {
      framework: null,
      rewrites: [{ source: '/((?!.*\\.).*)', destination: '/index.html' }],
    },
    null,
    2,
  ),
);
