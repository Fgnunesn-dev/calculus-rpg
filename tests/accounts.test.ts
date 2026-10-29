import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequireUser } from '../server/auth';
import { ownsDocument } from '../server/documentAccess';
import { validateAnalysis } from '../server/examAnalysis';
import { newUserSkills, newUserStats } from '../src/data/newUser';

test('new accounts have no inherited attempts or personal history', () => {
  assert.equal(newUserStats().currentXp, 0);
  assert.ok(newUserSkills().every(s => s.totalAttempts === 0 && s.masteryScore === 0 && s.evidence.length === 0));
});
test('a private document belongs exclusively to its authenticated owner', () => {
  assert.equal(ownsDocument({ ownerUid: 'alice' }, 'alice'), true);
  assert.equal(ownsDocument({ ownerUid: 'alice' }, 'bob'), false);
  assert.equal(ownsDocument({}, 'alice'), false);
  assert.equal(ownsDocument({}, undefined), false);
});
test('auth middleware rejects missing and forged tokens and uses verified identity', async () => {
  const middleware = createRequireUser(async token => { if (token !== 'valid') throw new Error('invalid signature'); return { uid: 'alice' }; });
  for (const authorization of [undefined, 'Bearer forged', 'Bearer valid']) {
    let status = 200, advanced = false;
    const response: any = { locals: {}, status(code: number) { status = code; return this; }, json() {} };
    await middleware({ headers: { authorization }, body: { uid: 'bob' } } as any, response, () => { advanced = true; });
    assert.equal(status, authorization === 'Bearer valid' ? 200 : 401);
    assert.equal(advanced, authorization === 'Bearer valid');
    assert.equal(response.locals.uid, authorization === 'Bearer valid' ? 'alice' : undefined);
  }
});
test('analysis rejects unreadable results and never coerces unknown grades to zero', () => {
  assert.throws(() => validateAnalysis({ questions: [] }));
  const result = validateAnalysis({ title: 'Prova', summary: 'Apenas enunciados legíveis.', observedScore: '8', maximumScore: null, weaknesses: [], strengths: [], restrictions: [], recommendedModuleIds: ['algebra', 'nonexistent'], questions: [{ number: '1', topic: 'Limites', statement: 'Calcule um limite.', feedback: 'Resposta não identificada.', practicePrompt: 'Outro limite.', earnedScore: null, maximumScore: -1 }] });
  assert.equal(result.observedScore, null);
  assert.equal(result.questions[0].earnedScore, null);
  assert.equal(result.questions[0].maximumScore, null);
  assert.deepEqual(result.recommendedModuleIds, ['algebra']);
});
