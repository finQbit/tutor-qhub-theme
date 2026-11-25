// Writes the token sources that `paragon build-tokens` compiles into paragon/tokens/build-src.
//
// Core is our tokens as written; Paragon merges them over its own. The variants are composed here: Paragon's
// light tokens, then ours for light, and for dark ours for dark on top. A token of ours replaces Paragon's as a
// whole: style-dictionary would merge them key by key and keep Paragon's `modify` steps, which recompute the
// value (a contrast-picked text colour, a mix with white). The variants are built as qh-light and qh-dark, which
// Paragon does not ship, so that it adds none of its tokens back; scripts/name-variants.mjs names the files light
// and dark. Paragon ships no dark tokens at all, and the MFEs load one variant at a time, so dark has to define
// every token.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const paragonTokens = path.join(root, 'node_modules/@openedx/paragon/tokens/src');
const ourTokens = path.join(root, 'paragon/tokens/src');
const out = path.join(root, 'paragon/tokens/build-src');

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// Groups merge key by key; a token (an object with `$value`) replaces the token it overrides. Only `actions`,
// from which Paragon generates its utility classes, is carried over.
function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    const isGroup = isObject(value) && !('$value' in value);
    if (isGroup && isObject(target[key])) {
      merge(target[key], value);
    } else {
      const replaced = target[key];
      target[key] = structuredClone(value);
      if (isObject(replaced) && replaced.actions && !value.actions) {
        target[key].actions = replaced.actions;
      }
    }
  }
  return target;
}

const readTree = (dir) => fs.readdirSync(dir, { recursive: true })
  .filter((file) => file.endsWith('.json'))
  .sort()
  .reduce((tree, file) => merge(tree, JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))), {});

const variants = {
  'qh-light': ['themes/light'],
  'qh-dark': ['themes/light', 'themes/dark'],
};
// The text colours Paragon's color-yiq picks for light and dark backgrounds. It reads them from its own
// themes/<variant>/global/other.json, which does not exist for these names.
const yiq = {
  'qh-light': { 'yiq-text-dark': '#1F2937', 'yiq-text-light': '#FFFFFF' },
  'qh-dark': { 'yiq-text-dark': '#1A1A1C', 'yiq-text-light': '#E8E8EA' },
};

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(ourTokens, 'core'), path.join(out, 'core'), { recursive: true });
for (const [variant, layers] of Object.entries(variants)) {
  const tree = readTree(path.join(paragonTokens, 'themes/light'));
  for (const layer of layers) {
    merge(tree, readTree(path.join(ourTokens, layer)));
  }
  fs.mkdirSync(path.join(out, 'themes', variant), { recursive: true });
  fs.writeFileSync(path.join(out, 'themes', variant, 'tokens.json'), `${JSON.stringify(tree, null, 2)}\n`);

  const yiqFile = path.join(paragonTokens, 'themes', variant, 'global/other.json');
  fs.mkdirSync(path.dirname(yiqFile), { recursive: true });
  fs.writeFileSync(yiqFile, `${JSON.stringify(yiq[variant], null, 2)}\n`);
}

console.log(`Token sources written to ${path.relative(root, out)}`);
