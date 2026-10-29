import React from 'react';
import { MathView } from './MathView';

// Accept the old prompt notation as well as standard LaTeX delimiters.
export function normalizeMathText(value: string): string {
  return value.replace(/(?<![\\\w])lim_\{([^}]+)\}/g, (_, limit: string) => `$\\lim_{${limit.replace(/->/g, '\\to ').replace(/(?<!\\)infty/g, '\\infty')}}$`);
}
function renderPlain(text: string, key: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const commands = /\\[A-Za-z]+/g;
  let cursor = 0, match: RegExpExecArray | null;
  const groupEnd = (start: number) => {
    if (text[start] !== '{') return Math.min(text.length, start + 1);
    let depth = 0;
    for (let j = start; j < text.length; j++) { if (text[j] === '{') depth++; if (text[j] === '}' && --depth === 0) return j + 1; }
    return text.length;
  };
  while ((match = commands.exec(text))) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    let end = commands.lastIndex;
    const count = match[0] === '\\frac' ? 2 : ['\\sqrt', '\\text', '\\mathrm', '\\mathbb', '\\operatorname'].includes(match[0]) ? 1 : 0;
    for (let n = 0; n < count; n++) { while (text[end] === ' ') end++; end = groupEnd(end); }
    while (text[end] === '_' || text[end] === '^') end = groupEnd(end + 1);
    if (text[end] === '{') end = groupEnd(end);
    const formula = text.slice(match.index, end);
    if (formula === '\\left' || formula === '\\right') { /* redundant sizing outside delimited math */ }
    else nodes.push(<MathView key={`${key}-${match.index}`} math={formula} />);
    cursor = end; commands.lastIndex = end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
export function MathText({ text, className = '' }: { text: string; className?: string }) {
  const parts = normalizeMathText(text).split(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?<!\\)\$(?!\$)[^$\n]+?\$)/g);
  return <span className={`math-text whitespace-pre-wrap break-words ${className}`}>{parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) return <MathView key={i} math={part.slice(2, -2)} />;
    if (part.startsWith('\\[') || part.startsWith('\\(')) return <MathView key={i} math={part.slice(2, -2)} />;
    if (part.startsWith('$') && part.endsWith('$')) return <MathView key={i} math={part.slice(1, -1)} />;
    return <React.Fragment key={i}>{part.split(/(\*\*[^*]+\*\*)/g).map((piece, j) => piece.startsWith('**') && piece.endsWith('**') ? <strong key={j}>{renderPlain(piece.slice(2, -2), `${i}-${j}`)}</strong> : <React.Fragment key={j}>{renderPlain(piece, `${i}-${j}`)}</React.Fragment>)}</React.Fragment>;
  })}</span>;
}
