// Checks the built theme (dist/) against WCAG 2.2 AA in light and dark mode: 4.5:1 for text, 3:1 for control
// boundaries and meaningful graphics (DESIGN.md, Accessibility). Fails the build on any pair below its minimum.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '../dist');

function variables(...files) {
  const vars = {};
  for (const file of files) {
    const css = fs.readFileSync(path.join(dist, file), 'utf8');
    for (const block of css.matchAll(/:root\s*\{([^}]*)\}/g)) {
      for (const [, name, value] of block[1].matchAll(/(--pgn-[\w-]+)\s*:\s*([^;]+);/g)) {
        vars[name] = value.trim();
      }
    }
  }
  return vars;
}

function resolve(vars, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`circular ${name}`);
  seen.add(name);
  const value = vars[name];
  if (value === undefined) throw new Error(`undefined ${name}`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve(vars, ref[1], seen) : value;
}

function rgba(value) {
  const hex = value.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, hex[2] ? parseInt(hex[2], 16) / 255 : 1];
  }
  throw new Error(`not a colour: ${value}`);
}

const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
const luminance = (c) => {
  const [r, g, b] = c.slice(0, 3).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg, bg) => {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

const TEXT = 4.5;
const UI = 3;
// [what, foreground, background, minimum]
const pairs = [
  ['body text on the page ground', 'color-body-base', 'color-body-bg', TEXT],
  ['body text on a card', 'color-body-base', 'color-bg-base', TEXT],
  ['secondary text on a card', 'color-gray-700', 'color-bg-base', TEXT],
  ['tertiary text on a card', 'color-gray-600', 'color-bg-base', TEXT],
  ['tertiary text on the page ground', 'color-gray-600', 'color-body-bg', TEXT],
  ['links on a card', 'color-link-base', 'color-bg-base', TEXT],
  ['links on the page ground', 'color-link-base', 'color-body-bg', TEXT],
  ['the accent on Ember Wash (current states)', 'color-primary-500', 'color-primary-100', TEXT],
  ['primary button label', 'color-btn-text-primary', 'color-btn-bg-primary', TEXT],
  ['primary button label, hover', 'color-btn-hover-text-primary', 'color-btn-hover-bg-primary', TEXT],
  ['brand button label', 'color-btn-text-brand', 'color-btn-bg-brand', TEXT],
  ['secondary button label', 'color-btn-text-outline-primary', 'color-bg-base', TEXT],
  ['secondary button boundary', 'color-btn-border-outline-primary', 'color-bg-base', UI],
  ['control boundary (Control Grey) on a card', 'color-gray-500', 'color-bg-base', UI],
  ['control boundary (Control Grey) on the page ground', 'color-gray-500', 'color-body-bg', UI],
  ['focus ring on a card', 'color-primary-500', 'color-bg-base', UI],
  ['focus ring on the page ground', 'color-primary-500', 'color-body-bg', UI],
  ['tooltip text', 'color-tooltip-text', 'color-tooltip-bg-base', TEXT],
  ['alert text on success', 'color-alert-content', 'color-alert-bg-success', TEXT],
  ['alert text on info', 'color-alert-content', 'color-alert-bg-info', TEXT],
  ['alert text on danger', 'color-alert-content', 'color-alert-bg-danger', TEXT],
  ['alert text on warning', 'color-alert-content', 'color-alert-bg-warning', TEXT],
  ['success text on its ground', 'color-success-500', 'color-success-100', TEXT],
  ['info text on its ground', 'color-info-500', 'color-info-100', TEXT],
  ['danger text on its ground', 'color-danger-500', 'color-danger-100', TEXT],
  ['warning text on its ground', 'color-warning-500', 'color-warning-100', TEXT],
  ['warning boundary on its ground', 'color-warning-200', 'color-warning-100', UI],
  ['code on a card', 'color-code-base', 'color-bg-base', TEXT],
];

let failed = 0;
for (const variant of ['light', 'dark']) {
  const vars = variables('core.css', `${variant}.css`);
  for (const [what, fg, bg, min] of pairs) {
    const background = rgba(resolve(vars, `--pgn-${bg}`));
    const solidBackground = background[3] < 1 ? over(background, rgba(resolve(vars, '--pgn-color-bg-base'))) : background;
    const foreground = over(rgba(resolve(vars, `--pgn-${fg}`)), solidBackground);
    const r = ratio(foreground, solidBackground);
    const ok = r >= min;
    failed += ok ? 0 : 1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${variant.padEnd(5)} ${r.toFixed(2).padStart(5)} (>= ${min}) ${what}`);
  }
}
if (failed) {
  console.error(`${failed} colour pair(s) below WCAG 2.2 AA`);
  process.exit(1);
}
