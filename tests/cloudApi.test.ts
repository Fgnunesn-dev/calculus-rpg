import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApplication } from '../server';
import { createRequireUser } from '../server/auth';
import { DocumentDatabase } from '../server/documentDb';
import { S3StorageService } from '../server/s3Storage';
import { TutorMemory } from '../server/tutorMemory';
import { FirestoreLearningStore } from '../server/learningStore';
import { fakeFirestore } from './helpers/firestore';
const analysis = { title: 'Prova teste', summary: 'Resumo.', observedScore: null, maximumScore: null, weaknesses: ['Fatoração'], strengths: ['Gráficos'], restrictions: [], recommendedModuleIds: ['algebra'], questions: [{ number: '1', topic: 'Limites', statement: 'Limite teste.', feedback: 'Justifique.', practicePrompt: 'Pratique.', earnedScore: null, maximumScore: null }] };
const authenticate = createRequireUser(async token => { if (!['alice', 'bob'].includes(token)) throw new Error('invalid'); return { uid: token }; });
async function instance(transport: typeof fetch, cacheFails = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'calculus-cloud-'));
  const documents = new DocumentDatabase(path.join(root, 'db')), memory = new TutorMemory(path.join(root, 'chat')), storage = new S3StorageService(path.join(root, 'files'));
  if (cacheFails) storage.putObject = async () => { throw new Error('disk-failed'); };
  const calls: any[] = [];
  process.env.GEMINI_API_KEY ||= 'unused-test-key';
  const app = createApplication({ authenticate, documents, memory, storage, learningStore: new FirestoreLearningStore(transport), ai: { models: { generateContent: async (input: any) => { calls.push(input); return { text: 'Continuando a conversa.' }; } } }, analyze: async () => analysis });
  const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const request = (url: string, owner = 'alice', options: RequestInit = {}) => fetch(base + url, { ...options, headers: { Authorization: `Bearer ${owner}`, ...options.headers } });
  return { request, documents, memory, calls, close: () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) };
}
function file() { const form = new FormData(); form.append('file', new Blob(['%PDF-1.4\nFixture'], { type: 'application/pdf' }), 'fixture.pdf'); return form; }
const chat = (message: string): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });

test('reports and tutor context survive a Render-like loss of all local disk state', async t => {
  const cloud = fakeFirestore(), first = await instance(cloud.transport);
  try {
    const uploaded = await first.request('/api/exams', 'alice', { method: 'POST', body: file() }); assert.equal(uploaded.status, 201); assert.equal((await uploaded.json()).originalAvailable, true);
    assert.equal((await first.request('/api/tutor/chat', 'alice', chat('Minha função é x²+7x.'))).status, 200);
  } finally { await first.close(); }
  const restarted = await instance(cloud.transport); t.after(restarted.close);
  assert.equal(restarted.documents.getAll().length, 0); assert.equal(restarted.memory.read('alice').length, 0);
  const reports = await (await restarted.request('/api/exams')).json();
  assert.equal(reports.persistence, 'firestore'); assert.equal(reports.exams.length, 1); assert.equal(reports.exams[0].originalAvailable, false);
  assert.deepEqual(reports.exams[0].analysis.weaknesses, ['Fatoração']); assert.deepEqual(reports.exams[0].analysis.strengths, ['Gráficos']);
  assert.equal((await (await restarted.request('/api/exams', 'bob')).json()).exams.length, 0);
  assert.equal((await (await restarted.request('/api/tutor/history')).json()).messages.length, 2);
  assert.equal((await (await restarted.request('/api/tutor/history', 'bob')).json()).messages.length, 0);
  assert.equal((await restarted.request('/api/tutor/chat', 'alice', chat('E a derivada?'))).status, 200);
  assert.match(restarted.calls.at(-1).contents[0].parts[0].text, /7x/);
});
test('Firestore denial blocks cloud workflows without announcing a false local success', async t => {
  const app = await instance(async () => Response.json({ error: 'denied' }, { status: 403 })); t.after(app.close);
  assert.equal((await app.request('/api/exams')).status, 503);
  assert.equal((await app.request('/api/tutor/history')).status, 503);
  const send = await app.request('/api/tutor/chat', 'alice', chat('Olá'));
  assert.equal(send.status, 503); assert.match((await send.json()).error, /firestore.rules/);
  assert.equal(app.calls.length, 0); assert.equal(app.memory.read('alice').length, 0);
  assert.equal((await app.request('/api/exams', 'alice', { method: 'POST', body: file() })).status, 503);
});
test('a saved diagnosis remains successful if the temporary PDF cache fails', async t => {
  const cloud = fakeFirestore(), app = await instance(cloud.transport, true); t.after(app.close);
  const response = await app.request('/api/exams', 'alice', { method: 'POST', body: file() });
  assert.equal(response.status, 201); assert.equal((await response.json()).originalAvailable, false);
  assert.equal((await (await app.request('/api/exams')).json()).exams.length, 1);
});
test('existing owner-scoped local history migrates once and remains private', async t => {
  const cloud = fakeFirestore(), app = await instance(cloud.transport); t.after(app.close);
  app.memory.write('alice', [{ id: 'old-q', sender: 'user', content: 'Meu parâmetro era 7.', timestamp: '2026-10-29T10:00:00Z' }, { id: 'old-a', sender: 'tutor', content: 'Entendido.', timestamp: '2026-10-29T10:00:00Z' }]);
  app.documents.create({ id: 'legacy-exam', ownerUid: 'alice', originalName: 'legacy.pdf', filename: 'legacy.pdf', mimeType: 'application/pdf', sizeBytes: 0, uploadedAt: '2026-10-29T09:00:00Z', s3Bucket: 'test', s3Key: 'users/alice/legacy.pdf', s3Url: '/api/documents/legacy-exam/file', status: 'completed', rawExtractedText: '', ocrEngine: 'none', detectedExercises: [], analysis });
  assert.equal((await (await app.request('/api/tutor/history')).json()).messages.length, 2);
  assert.equal((await (await app.request('/api/tutor/history')).json()).messages.length, 2);
  assert.equal((await (await app.request('/api/tutor/history', 'bob')).json()).messages.length, 0);
  const reports = await (await app.request('/api/exams')).json(); assert.equal(reports.exams[0].id, 'legacy-exam'); assert.deepEqual(reports.exams[0].analysis.weaknesses, ['Fatoração']);
  assert.equal((await (await app.request('/api/exams', 'bob')).json()).exams.length, 0);
  assert.equal(cloud.requests.filter(request => request.method === 'PATCH').length, 2);
});
