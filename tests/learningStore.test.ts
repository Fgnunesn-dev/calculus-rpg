import test from 'node:test';
import assert from 'node:assert/strict';
import { FirestoreLearningStore, LearningStoreError } from '../server/learningStore';

import { fakeFirestore } from './helpers/firestore';
const analysis = { title: 'Prova sintética', summary: 'Diagnóstico sintético.', observedScore: null, maximumScore: null, weaknesses: ['Revisar fatoração'], strengths: ['Leitura de gráficos'], restrictions: [], recommendedModuleIds: ['algebra'], questions: [{ number: '1', topic: 'Limites', statement: 'Limite sintético.', feedback: 'Fatorar antes de cancelar.', practicePrompt: 'Pratique fatoração.', earnedScore: null, maximumScore: null }] };

test('Firestore preserves strengths, weaknesses and ordered conversations across store restarts', async () => {
  const service = fakeFirestore(), first = new FirestoreLearningStore(service.transport);
  await first.saveExam('alice', 'alice', { id: 'exam-one', originalName: 'fixture.pdf', uploadedAt: '2026-10-29T10:00:00Z', analysis });
  for (const [id, time] of [['one', '10'], ['two', '11']]) await first.saveExchange('alice', 'alice', [{ id: `${id}-q`, sender: 'user', content: `Pergunta ${id}`, timestamp: `2026-10-29T${time}:00:00Z` }, { id: `${id}-a`, sender: 'tutor', content: `Resposta ${id}`, timestamp: `2026-10-29T${time}:00:00Z` }], id);
  const restarted = new FirestoreLearningStore(service.transport);
  assert.deepEqual((await restarted.exams('alice', 'alice'))[0].analysis.weaknesses, ['Revisar fatoração']);
  assert.deepEqual((await restarted.exams('alice', 'alice'))[0].analysis.strengths, ['Leitura de gráficos']);
  assert.deepEqual((await restarted.chat('alice', 'alice')).map(turn => turn.id), ['one-q', 'one-a', 'two-q', 'two-a']);
  assert.deepEqual(await restarted.chat('bob', 'bob'), []);
  await assert.rejects(() => restarted.chat('alice', 'bob'), LearningStoreError);
  assert.ok(service.requests.every(request => !request.url.includes('Bearer')));
  await restarted.removeExam('alice', 'alice', 'exam-one'); assert.deepEqual(await restarted.exams('alice', 'alice'), []);
});
test('idempotent legacy imports do not duplicate records', async () => {
  const service = fakeFirestore(), store = new FirestoreLearningStore(service.transport);
  const report = { id: 'legacy-report', originalName: 'old.pdf', uploadedAt: '2026-10-29T10:00:00Z', analysis };
  await store.saveExam('alice', 'alice', report); await store.saveExam('alice', 'alice', report);
  assert.equal((await store.exams('alice', 'alice')).length, 1);
});
test('cloud failure never silently reports local-only persistence as success', async () => {
  for (const status of [403, 429, 503]) {
    const store = new FirestoreLearningStore(async () => Response.json({ error: 'sensitive-provider-message' }, { status }));
    await assert.rejects(() => store.saveExam('alice', 'token', { id: 'exam-one', originalName: 'fixture.pdf', uploadedAt: 'now', analysis }), (error: any) => error instanceof LearningStoreError && !error.message.includes('sensitive-provider-message'));
  }
});
test('invalid paths, malformed records and oversized cloud payloads are rejected', async () => {
  const service = fakeFirestore(), store = new FirestoreLearningStore(service.transport);
  await assert.rejects(() => store.exams('../bob', 'alice'), LearningStoreError);
  await assert.rejects(() => store.saveExam('alice', '', { id: 'exam', originalName: 'fixture.pdf', uploadedAt: 'now', analysis }), LearningStoreError);
  await assert.rejects(() => store.saveExchange('alice', 'alice', [{ id: '1', sender: 'user', content: 'x'.repeat(800001), timestamp: 'now' }, { id: '2', sender: 'tutor', content: 'Resposta', timestamp: 'now' }], 'large'), LearningStoreError);
  const broken = new FirestoreLearningStore(async () => Response.json([{ document: { fields: { payload: { stringValue: '{broken' } } } }]));
  await assert.rejects(() => broken.chat('alice', 'alice'), LearningStoreError);
});
