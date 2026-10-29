type Expression = (x: number) => number;
const functions: Record<string, (x: number) => number> = { sin: Math.sin, sen: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan, ln: Math.log, log: Math.log10, exp: Math.exp, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs };
export function compileMath(source: string): (x: number) => number | null {
  if (!source.trim() || source.length > 256) throw new Error('Use uma expressão matemática de até 256 caracteres.');
  const tokens: string[] = [];
  let offset = 0;
  while (offset < source.length) {
    if (/\s/.test(source[offset])) { offset++; continue; }
    const match = /^(?:(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-z]+|[()+\-*/^])/i.exec(source.slice(offset));
    if (!match) throw new Error('Use apenas números, x, operadores e funções matemáticas.');
    tokens.push(match[0].toLowerCase()); offset += match[0].length;
  }
  let index = 0, depth = 0;
  const peek = () => tokens[index];
  const atom = (): Expression => {
    if (++depth > 32) throw new Error('Expressão muito complexa.');
    const token = tokens[index++]; let result: Expression;
    if (token === '(') { result = sum(); if (tokens[index++] !== ')') throw new Error('Feche todos os parênteses.'); }
    else if (token === 'x') result = x => x;
    else if (token === 'pi' || token === 'e') { const value = token === 'pi' ? Math.PI : Math.E; result = () => value; }
    else if (token && /^\d|^\./.test(token)) { const value = Number(token); result = () => value; }
    else if (Object.hasOwn(functions, token)) {
      if (tokens[index++] !== '(') throw new Error('Use parênteses após a função.');
      const argument = sum(); if (tokens[index++] !== ')') throw new Error('Feche todos os parênteses.');
      result = x => functions[token](argument(x));
    } else throw new Error('Função ou símbolo não reconhecido.');
    depth--; return result;
  };
  const power = (): Expression => { const left = atom(); if (peek() === '^') { index++; const right = unary(); return x => left(x) ** right(x); } return left; };
  const unary = (): Expression => { if (peek() === '+' || peek() === '-') { if (++depth > 32) throw new Error('Expressão muito complexa.'); const sign = tokens[index++]; const value = unary(); depth--; return sign === '-' ? x => -value(x) : value; } return power(); };
  const product = (): Expression => {
    let result = unary();
    while (peek() === '*' || peek() === '/' || (peek() && /^(?:[a-z]|\d|\.|\()/.test(peek()))) {
      const operation = peek() === '*' || peek() === '/' ? tokens[index++] : '*';
      const left = result, right = unary(); result = operation === '*' ? x => left(x) * right(x) : x => left(x) / right(x);
    }
    return result;
  };
  const sum = (): Expression => { let result = product(); while (peek() === '+' || peek() === '-') { const operation = tokens[index++], left = result, right = product(); result = operation === '+' ? x => left(x) + right(x) : x => left(x) - right(x); } return result; };
  const expression = sum(); if (index !== tokens.length) throw new Error('Expressão inválida.');
  return x => { const value = expression(x); return Number.isFinite(value) ? value : null; };
}
