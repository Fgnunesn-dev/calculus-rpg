import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false
      });
    } catch {
      return `<span class="text-rose-400 font-mono">${math}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div 
        className={`my-2 overflow-x-auto text-slate-100 py-1 ${className}`} 
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    );
  }

  return (
    <span 
      className={`inline-block align-middle text-slate-100 ${className}`} 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};
