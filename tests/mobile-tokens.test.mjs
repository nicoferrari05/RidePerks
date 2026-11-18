import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auth, platform } from "../mobile/src/theme/tokens.ts";

// The phone app copies the web's colors (mobile/src/theme/tokens.ts). These
// tests fail when one side changes without the other, so both keep looking
// the same.

const css = (file) => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const isColor = (value) => /^(#[0-9a-f]{3,8}|rgba?\([^)]*\))$/i.test(value);
const norm = (value) => value.replace(/\s+/g, "").toLowerCase();

function block(source, selector) {
  const start = source.indexOf(selector + " {");
  assert.notEqual(start, -1, "missing " + selector);
  return source.slice(start, source.indexOf("}", start));
}

function vars(text, prefix) {
  const out = {};
  const re = new RegExp("--" + prefix + "([a-z0-9-]+):\\s*([^;]+);", "g");
  for (const [, name, value] of text.matchAll(re)) out[camel(name)] = value.trim();
  return out;
}

const platformCss = css("app/platform.css");
const light = vars(block(platformCss, ".rp-app"), "rp-");
const dark = vars(block(platformCss, 'html[data-rp-theme="dark"] .rp-app'), "rp-");

test("app platform colors match the web, light mode", () => {
  for (const [key, value] of Object.entries(light)) {
    if (!isColor(value)) continue;
    assert.ok(key in platform.light, "app is missing --rp-" + key);
    assert.equal(norm(platform.light[key]), norm(value), "--rp-" + key);
  }
  for (const key of Object.keys(platform.light))
    assert.ok(key in light, key + " is not a web token");
});

test("app platform colors match the web, dark mode", () => {
  for (const key of Object.keys(platform.dark)) {
    const value = dark[key] ?? light[key];
    assert.equal(norm(platform.dark[key]), norm(value), "dark --rp-" + key);
  }
});

test("app sign-in colors match the web's sign-in screens", () => {
  const globals = css("app/globals.css");
  const theme = vars(block(globals, "@theme"), "color-");
  const authBlock = vars(block(globals, ".rp-auth"), "color-");
  const expect = {
    bg: authBlock.background,
    text: authBlock.foreground,
    muted: authBlock.mutedForeground,
    border: authBlock.border,
    primary: authBlock.primary,
    primaryFg: authBlock.primaryForeground,
    link: authBlock.ember,
    errorBg: theme.emberSoft,
    errorText: theme.ember2,
  };
  for (const [key, value] of Object.entries(expect)) {
    assert.ok(value, "web token for " + key + " not found");
    assert.equal(norm(auth[key]), norm(value), key);
  }
});
