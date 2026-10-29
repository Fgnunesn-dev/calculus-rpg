import test from 'node:test';
import assert from 'node:assert/strict';
import { compileMath } from '../src/lib/safeMath';
import { matchesFileType, rateLimit } from '../server/security';
import { parseDiagnosis } from '../server/diagnosis';
test('graph parser supports normal functions, implicit products and precedence', () => {
  for (const [expression, x, expected] of [['x^3-3*x^2+5', 2, 1], ['2(x+1)', 2, 6], ['-x^2', 3, -9], ['2^3^2', 0, 512], ['sen(pi/2)+ln(e)', 0, 2], ['x^-2', 2, 0.25]] as const) assert.ok(Math.abs(compileMath(expression)(x)! - expected) < 0.000001, expression);
  assert.equal(compileMath('sqrt(x)')(-1), null);
  assert.equal(compileMath('1/x')(0), null);
});
test('graph parser rejects code execution and excessive complexity', () => {
  for (const expression of ['alert(1)', 'globalThis.fetch(1)', 'x;process.exit()', 'constructor.constructor(1)', '(()=>1)()', 'x'.repeat(300), '('.repeat(40) + '1' + ')'.repeat(40)]) assert.throws(() => compileMath(expression), expression);
});
test('file headers must match a supported MIME type', () => {
  assert.equal(matchesFileType(Buffer.from('<script>alert(1)</script>'), 'application/pdf'), false);
  assert.equal(matchesFileType(Buffer.from('%PDF-1.4\n'), 'application/pdf'), true);
  assert.equal(matchesFileType(Buffer.from('<svg/>'), 'image/svg+xml'), false);
  assert.equal(matchesFileType(Buffer.from([137,80,78,71,13,10,26,10]), 'image/png'), true);
});
test('rate limits reset and do not combine different accounts', () => {
  let now = 0; const middleware = rateLimit(1, 1000, () => now);
  function request(uid: string) { let status = 200, passed = false; const res: any = { locals: { uid }, setHeader() {}, status(value: number) { status = value; return this; }, json() {} }; middleware({ ip: 'shared' } as any, res, () => { passed = true; }); return { status, passed }; }
  assert.equal(request('alice').passed, true); assert.equal(request('alice').status, 429); assert.equal(request('bob').passed, true); now = 1001; assert.equal(request('alice').passed, true);
});
test('AI string booleans and malformed diagnoses cannot grant a correct result', () => {
  assert.throws(() => parseDiagnosis({ isCorrect: 'false', explanation: 'Wrong' }));
  assert.throws(() => parseDiagnosis({ isCorrect: true }));
  assert.equal(parseDiagnosis({ isCorrect: false, explanation: 'Ainda falta uma justificativa.' }).isCorrect, false);
});
