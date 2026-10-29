import React, { useState, useMemo } from 'react';
import { Eye, Activity } from 'lucide-react';
import { MathView } from './MathView';

interface FunctionGrapherProps {
  initialFunction?: string;
  title?: string;
}

export const FunctionGrapher: React.FC<FunctionGrapherProps> = ({
  initialFunction = 'x^3 - 3*x^2 + 5',
  title = 'Visualizador Geométrico de Funções & Reta Tangente'
}) => {
  const [funcExpr, setFuncExpr] = useState<string>(initialFunction);
  const [tangentX, setTangentX] = useState<number>(1.5);
  const [xMin, setXMin] = useState<number>(-3);
  const [xMax, setXMax] = useState<number>(4);
  const [yMin, setYMin] = useState<number>(-4);
  const [yMax, setYMax] = useState<number>(8);
  const [showTangent, setShowTangent] = useState<boolean>(true);

  // Safe numerical evaluator for Calculus functions
  const evalFunc = useMemo(() => {
    return (x: number): number | null => {
      try {
        // Safe math context
        const mathScope = {
          x,
          sin: Math.sin,
          cos: Math.cos,
          tan: Math.tan,
          ln: Math.log,
          log: Math.log10,
          exp: Math.exp,
          sqrt: Math.sqrt,
          cbrt: Math.cbrt,
          abs: Math.abs,
          pi: Math.PI,
          e: Math.E,
        };

        // Convert common notation (e.g. x^2 to Math.pow(x,2), sen to sin, tg to tan)
        let sanitized = funcExpr
          .replace(/sen\(/gi, 'sin(')
          .replace(/tg\(/gi, 'tan(')
          .replace(/(\d+)\s*x/g, '$1*x')
          .replace(/x\^(\d+)/g, 'Math.pow(x, $1)')
          .replace(/\^/g, '**');

        const fn = new Function(...Object.keys(mathScope), `return ${sanitized};`);
        const val = fn(...Object.values(mathScope));
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
          return val;
        }
        return null;
      } catch {
        return null;
      }
    };
  }, [funcExpr]);

  // Numerical derivative f'(x)
  const evalDeriv = useMemo(() => {
    return (x: number): number | null => {
      const h = 0.0001;
      const fPlus = evalFunc(x + h);
      const fMinus = evalFunc(x - h);
      if (fPlus !== null && fMinus !== null) {
        return (fPlus - fMinus) / (2 * h);
      }
      return null;
    };
  }, [evalFunc]);

  // SVG coordinate transformation
  const width = 500;
  const height = 300;
  const padding = 20;

  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const toSvgY = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  // Generate curve path
  const curvePath = useMemo(() => {
    const points: string[] = [];
    const steps = 200;
    const dx = (xMax - xMin) / steps;
    let isDrawing = false;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = evalFunc(x);

      if (y !== null && y >= yMin - 10 && y <= yMax + 10) {
        const sx = toSvgX(x);
        const sy = toSvgY(y);
        if (!isDrawing) {
          points.push(`M ${sx.toFixed(1)} ${sy.toFixed(1)}`);
          isDrawing = true;
        } else {
          points.push(`L ${sx.toFixed(1)} ${sy.toFixed(1)}`);
        }
      } else {
        isDrawing = false;
      }
    }
    return points.join(' ');
  }, [evalFunc, xMin, xMax, yMin, yMax]);

  // Tangent line coordinates
  const currentY = evalFunc(tangentX);
  const currentSlope = evalDeriv(tangentX);

  const tangentLine = useMemo(() => {
    if (currentY === null || currentSlope === null) return null;
    const deltaX = 1.5;
    const x1 = tangentX - deltaX;
    const y1 = currentY - currentSlope * deltaX;
    const x2 = tangentX + deltaX;
    const y2 = currentY + currentSlope * deltaX;

    return {
      x1: toSvgX(x1),
      y1: toSvgY(y1),
      x2: toSvgX(x2),
      y2: toSvgY(y2),
    };
  }, [tangentX, currentY, currentSlope, xMin, xMax, yMin, yMax]);

  const presetFunctions = [
    { label: "f(x) = x³ - 3x² + 5 (Aula Profa. Graça)", expr: "x^3 - 3*x^2 + 5", xMin: -2, xMax: 4, yMin: -2, yMax: 10 },
    { label: "f(x) = 2x² - 3x + 1 (1ª Prova Q3)", expr: "2*x^2 - 3*x + 1", xMin: -1, xMax: 3, yMin: -2, yMax: 8 },
    { label: "f(x) = (x² - 4x + 3)/x² (Lista 2 Q15.c)", expr: "(x^2 - 4*x + 3)/(x^2)", xMin: -4, xMax: 6, yMin: -3, yMax: 5 },
    { label: "f(x) = sen(x)", expr: "sen(x)", xMin: -4, xMax: 4, yMin: -2, yMax: 2 },
  ];

  return (
    <div className="bg-[#121828] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 font-display">{title}</h3>
        </div>

        {/* Preset selector */}
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              const selected = presetFunctions.find(p => p.expr === e.target.value);
              if (selected) {
                setFuncExpr(selected.expr);
                setXMin(selected.xMin);
                setXMax(selected.xMax);
                setYMin(selected.yMin);
                setYMax(selected.yMax);
              }
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            {presetFunctions.map((p, i) => (
              <option key={i} value={p.expr}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative bg-[#090d16] border border-slate-800 rounded-xl overflow-hidden flex justify-center items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none max-h-[320px]">
          {/* Grid lines */}
          <line
            x1={toSvgX(xMin)}
            y1={toSvgY(0)}
            x2={toSvgX(xMax)}
            y2={toSvgY(0)}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <line
            x1={toSvgX(0)}
            y1={toSvgY(yMin)}
            x2={toSvgX(0)}
            y2={toSvgY(yMax)}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Grid Ticks */}
          {[-4, -2, 2, 4].map((tick) => (
            tick >= xMin && tick <= xMax && (
              <g key={`xtick-${tick}`}>
                <line x1={toSvgX(tick)} y1={toSvgY(0) - 3} x2={toSvgX(tick)} y2={toSvgY(0) + 3} stroke="#64748b" />
                <text x={toSvgX(tick)} y={toSvgY(0) + 12} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {tick}
                </text>
              </g>
            )
          ))}

          {/* Function Curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Tangent Line */}
          {showTangent && tangentLine && (
            <line
              x1={tangentLine.x1}
              y1={tangentLine.y1}
              x2={tangentLine.x2}
              y2={tangentLine.y2}
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          )}

          {/* Tangent Point */}
          {currentY !== null && (
            <g>
              <circle
                cx={toSvgX(tangentX)}
                cy={toSvgY(currentY)}
                r="4.5"
                fill="#ec4899"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Live HUD Readout */}
        <div className="absolute top-3 left-3 bg-[#0d1322]/90 border border-slate-800 p-2.5 rounded-lg text-xs font-mono backdrop-blur-md space-y-1">
          <div className="text-cyan-300 font-semibold">
            f(x) = {funcExpr}
          </div>
          {currentY !== null && (
            <div className="text-slate-300 text-[11px]">
              Ponto P: ({tangentX.toFixed(2)}, {currentY.toFixed(2)})
            </div>
          )}
          {currentSlope !== null && (
            <div className="text-purple-300 text-[11px]">
              Inclinação m = f'({tangentX.toFixed(2)}) = {currentSlope.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <span className="text-xs text-slate-400 whitespace-nowrap font-mono">
            Ponto x₀: <strong className="text-cyan-300">{tangentX.toFixed(2)}</strong>
          </span>
          <input
            type="range"
            min={xMin}
            max={xMax}
            step="0.1"
            value={tangentX}
            onChange={(e) => setTangentX(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowTangent(!showTangent)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showTangent 
                ? 'bg-purple-950/70 border-purple-700/60 text-purple-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Reta Tangente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
