import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonTarget, validateLesson, generateLesson, reviewNotes } from '../server/guidedLesson';
import { createApplication } from '../server';
import { createRequireUser } from '../server/auth';

const lesson = { title: 'Fatoração', steps: Array.from({ length: 4 }, (_, i) => ({ title: `Passo ${i + 1}`, explanation: 'Fatores são expressões multiplicadas.', example: '$x^2-9=(x-3)(x+3)$', checkpoint: 'Podemos cancelar parcelas?', answer: 'Não. Só podemos cancelar fatores não nulos.' })) };

test('a transient 503 is retried once without hiding a persistent failure', async () => {
  let calls = 0;
  const ai = { models: { generateContent: async () => { calls++; if (calls === 1) throw { status: 503 }; return { text: JSON.stringify(lesson) }; } } };
  assert.equal((await generateLesson(ai, 'algebra', 0)).steps.length, 4);
  assert.equal(calls, 2);
  let failed = 0;
  await assert.rejects(() => generateLesson({ models: { generateContent: async () => { failed++; throw { status: 503 }; } } }, 'algebra', 0));
  assert.equal(failed, 2);
});

test('guided lessons accept only curriculum topics and complete bounded steps', () => {
  assert.equal(lessonTarget('limits', 0)?.topic, 'Ideia de limite por tabelas e gráficos');
  for (const [id, index] of [['limits', -1], ['limits', 999], ['limits', '0'], ['invented', 0]]) assert.equal(lessonTarget(id, index), null);
  assert.equal(validateLesson(lesson).steps.length, 4);
  for (const raw of [{ ...lesson, steps: [] }, { ...lesson, steps: Array(9).fill(lesson.steps[0]) }, { ...lesson, steps: [{ ...lesson.steps[0], explanation: '' }, ...lesson.steps.slice(1)] }, { ...lesson, steps: [{ ...lesson.steps[0], answer: 'a'.repeat(1001) }, ...lesson.steps.slice(1)] }]) assert.throws(() => validateLesson(raw));
});

test('notes are treated as student content and only the requested notes are analyzed', async t => {
  const requests: any[] = [];
  const ai = { models: { generateContent: async (input: any) => { requests.push(input); return { text: JSON.stringify({ feedback: 'Cancelar fatores exige denominador não nulo.' }) }; } } };
  await assert.rejects(() => reviewNotes(ai, 'algebra', ''));
  await assert.rejects(() => reviewNotes(ai, 'algebra', 'a'.repeat(6001)));
  const authenticate = createRequireUser(async token => { if (token !== 'alice') throw new Error('invalid'); return { uid: 'alice' }; });
  const server = createApplication({ authenticate, learningStore: null, ai }).listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  t.after(() => new Promise<void>(resolve => server.close(() => resolve())));
  const request = (body: unknown, token = 'alice') => fetch(`http://127.0.0.1:${(server.address() as any).port}/api/tutor/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  assert.equal((await request({ notes: 'x' }, '')).status, 401);
  assert.equal((await request({ moduleId: 'algebra', notes: '' })).status, 400);
  assert.equal((await request({ moduleId: 'invented', notes: 'x' })).status, 400);
  const result = await request({ moduleId: 'algebra', notes: 'Dúvida: posso cancelar parcelas?' });
  assert.equal(result.status, 200);
  assert.equal((await result.json()).feedback, 'Cancelar fatores exige denominador não nulo.');
  assert.equal(requests.length, 1);
  assert.match(requests[0].contents[0].parts[0].text, /não confiável/);
  assert.match(requests[0].contents[0].parts[0].text, /posso cancelar parcelas/);
});

test('lesson generation grounds explanations in the exact topic and course constraints', async () => {
  let request: any;
  const ai = { models: { generateContent: async (input: any) => { request = input; return { text: JSON.stringify(lesson) }; } } };
  assert.equal((await generateLesson(ai, 'indeterminate', 0)).steps.length, 4);
  assert.match(request.contents[0].parts[0].text, /sem L’Hôpital/);
  assert.match(request.contents[0].parts[0].text, /Fatoração em formas 0\/0/);
  await assert.rejects(() => generateLesson(ai, 'invented', 0));
});

test('lesson API requires verified login, validates input, caches successful lessons and retries failures', async t => {
  let calls = 0, fail = false;
  const authenticate = createRequireUser(async token => { if (token !== 'alice') throw new Error('invalid'); return { uid: 'alice' }; });
  const app = createApplication({ authenticate, learningStore: null, ai: { models: { generateContent: async () => { calls++; if (fail) throw new Error('private-provider-details'); return { text: JSON.stringify(lesson) }; } } } });
  const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  t.after(() => new Promise<void>(resolve => server.close(() => resolve())));
  const request = (body: unknown, token = 'alice') => fetch(`http://127.0.0.1:${(server.address() as any).port}/api/tutor/lesson`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  assert.equal((await request({}, '')).status, 401);
  assert.equal((await request({}, 'forged')).status, 401);
  assert.equal((await request({ moduleId: 'limits', lessonIndex: '0' })).status, 400);
  assert.equal((await request({ moduleId: 'limits', lessonIndex: 0 })).status, 200);
  assert.deepEqual(await (await request({ moduleId: 'limits', lessonIndex: 0 })).json(), lesson);
  assert.equal(calls, 1);
  fail = true;
  const failed = await request({ moduleId: 'limits', lessonIndex: 1 });
  assert.equal(failed.status, 503); assert.doesNotMatch(await failed.text(), /private-provider-details/);
  fail = false;
  assert.equal((await request({ moduleId: 'limits', lessonIndex: 1 })).status, 200);
  assert.equal(calls, 3);
});
