// The variants are built as qh-light and qh-dark (scripts/compose-tokens.mjs); the MFEs load light and dark.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '../dist');
for (const file of fs.readdirSync(dist)) {
  if (file.startsWith('qh-')) {
    fs.renameSync(path.join(dist, file), path.join(dist, file.slice('qh-'.length)));
  }
}
