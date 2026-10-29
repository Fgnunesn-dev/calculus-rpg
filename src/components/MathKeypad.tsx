import React, { useState } from 'react';
import { Delete } from 'lucide-react';

interface MathKeypadProps {
  onInsert: (symbol: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

interface KeyGroup {
  name: string;
  keys: { label: string; insert: string; latexDisplay?: string }[];
}

type KeypadTab = 'algebra' | 'limits' | 'derivatives' | 'trig';

export const MathKeypad: React.FC<MathKeypadProps> = ({ onInsert, onBackspace, onClear }) => {
  const [activeTab, setActiveTab] = useState<KeypadTab>('algebra');

  const groups: Record<KeypadTab, KeyGroup> = {
    algebra: {
      name: 'Álgebra & Raízes',
      keys: [
        { label: 'x', insert: 'x' },
        { label: 'y', insert: 'y' },
        { label: 'x²', insert: '^2' },
        { label: 'xⁿ', insert: '^{}' },
        { label: 'a/b', insert: '\\frac{}{}' },
        { label: '√x', insert: '\\sqrt{}' },
        { label: '³√x', insert: '\\sqrt[3]{}' },
        { label: '±', insert: '\\pm ' },
        { label: '(', insert: '(' },
        { label: ')', insert: ')' },
        { label: '+', insert: ' + ' },
        { label: '−', insert: ' - ' },
        { label: '×', insert: ' \\cdot ' },
        { label: '=', insert: ' = ' },
        { label: '≠', insert: ' \\neq ' },
        { label: '≤', insert: ' \\le ' },
        { label: '≥', insert: ' \\ge ' }
      ]
    },
    limits: {
      name: 'Limites & Infinito',
      keys: [
        { label: 'lim x→x₀', insert: '\\lim_{x \\to x_0} ' },
        { label: 'lim x→0', insert: '\\lim_{x \\to 0} ' },
        { label: 'lim x→+∞', insert: '\\lim_{x \\to +\\infty} ' },
        { label: 'lim x→−∞', insert: '\\lim_{x \\to -\\infty} ' },
        { label: 'lim x→1⁻', insert: '\\lim_{x \\to 1^-} ' },
        { label: 'lim x→1⁺', insert: '\\lim_{x \\to 1^+} ' },
        { label: '∞', insert: '\\infty' },
        { label: 'Δx', insert: '\\Delta x' },
        { label: '0/0', insert: '\\left[\\frac{0}{0}\\right]' },
        { label: 'h → 0', insert: 'h \\to 0' },
        { label: '→', insert: ' \\to ' }
      ]
    },
    derivatives: {
      name: 'Derivadas & Retas',
      keys: [
        { label: "f'(x)", insert: "f'(x)" },
        { label: "f''(x)", insert: "f''(x)" },
        { label: 'dy/dx', insert: '\\frac{dy}{dx}' },
        { label: 'd/dx', insert: '\\frac{d}{dx}\\left( ' },
        { label: 'y - y₀', insert: 'y - y_0 = m(x - x_0)' },
        { label: 'm = f\'(x₀)', insert: 'm = f\'(x_0)' },
        { label: 'Newton', insert: '\\lim_{x \\to x_0} \\frac{f(x) - f(x_0)}{x - x_0}' },
        { label: 'Cadeia', insert: "f'(g(x)) \\cdot g'(x)" },
        { label: 'dt', insert: 'dt' },
        { label: 'dx', insert: 'dx' }
      ]
    },
    trig: {
      name: 'Trig & Exponencial',
      keys: [
        { label: 'sen x', insert: '\\text{sen}(x)' },
        { label: 'cos x', insert: '\\cos(x)' },
        { label: 'tg x', insert: '\\text{tg}(x)' },
        { label: 'sec x', insert: '\\sec(x)' },
        { label: 'arctg', insert: '\\text{arctg}(x)' },
        { label: 'arcsen', insert: '\\text{arcsen}(x)' },
        { label: 'ln x', insert: '\\ln(x)' },
        { label: 'eˣ', insert: 'e^x' },
        { label: 'π', insert: '\\pi' },
        { label: 'e', insert: 'e' }
      ]
    }
  };

  return (
    <div className="bg-[#121826] border border-slate-800 rounded-xl p-3 shadow-xl select-none">
      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 gap-1 overflow-x-auto">
        <div className="flex gap-1">
          {(Object.keys(groups) as (keyof typeof groups)[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-purple-950/70 text-purple-300 border border-purple-700/50 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {groups[tab].name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onBackspace}
            title="Apagar caractere anterior"
            className="p-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClear}
            title="Limpar expressão"
            className="px-2 py-1 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors font-mono"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Symbol Key Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
        {groups[activeTab].keys.map((k, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onInsert(k.insert)}
            className="py-1.5 px-2 bg-slate-800/80 hover:bg-purple-900/40 hover:border-purple-600/60 border border-slate-700/60 rounded-lg text-slate-200 font-mono text-xs transition-all flex items-center justify-center active:scale-95 shadow-sm"
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
};
