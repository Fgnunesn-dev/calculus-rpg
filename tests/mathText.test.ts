import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MathText } from '../src/components/MathText';
import { MathView } from '../src/components/MathView';
test('legacy limit prompts render as mathematical notation', () => {
  const html = renderToStaticMarkup(React.createElement(MathText, { text: 'Calcule lim_{x->-infty} desta função.' }));
  assert.match(html, /class="katex"/);
  assert.match(html, /<mi[^>]*>∞<\/mi>/);
  assert.match(html, /desta função/);
});
test('mixed prose, inline fractions, display math and bold retain structure', () => {
  const html = renderToStaticMarkup(React.createElement(MathText, { text: String.raw`**Atenção**: $\frac{1}{2}$ e $$\sqrt{4}=2$$.` }));
  assert.equal((html.match(/class="katex"/g) || []).length, 2);
  assert.match(html, /<strong>Atenção<\/strong>/);
});
test('invalid formulas cannot inject HTML or display raw source', () => {
  const html = renderToStaticMarkup(React.createElement(MathView, { math: String.raw`\invalid{<img src=x onerror=alert(1)>}` }));
  assert.doesNotMatch(html, /<img|onerror|\\invalid/);
  assert.match(html, /Expressão matemática não reconhecida/);
});
test('legacy hints render nested radicals and bare fractions without exposing commands', () => {
  const html = renderToStaticMarkup(React.createElement(MathText, { text: String.raw`Multiplique por (x + \sqrt{x^2+8x}) e confira \frac{-8}{1+\sqrt{1+8/x}}.` }));
  assert.equal((html.match(/class="katex"/g) || []).length, 2);
  assert.doesNotMatch(html, /Expressão matemática não reconhecida/);
});
