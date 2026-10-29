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
      if (math.length > 12000) throw new Error('Expressão muito longa');
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: true,
        strict: false,
        trust: false,
        maxExpand: 200,
        maxSize: 20
      });
    } catch {
      return '<span class="text-amber-300" role="note">Expressão matemática não reconhecida. Solicite uma reformulação.</span>';
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
