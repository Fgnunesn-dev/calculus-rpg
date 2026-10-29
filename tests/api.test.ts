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

test('API integration: authentication, account isolation, uploads, exams, memory and errors', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'calculus-api-'));
  const documents = new DocumentDatabase(path.join(directory, 'db'));
  const storage = new S3StorageService(path.join(directory, 'files'));
  const memory = new TutorMemory(path.join(directory, 'memory'));
  process.env.GEMINI_API_KEY ||= 'test-only-unused-key';
  const calls: any[] = [];
  const ai = { models: { generateContent: async (request: any) => { calls.push(request); return { text: request.config?.responseMimeType === 'application/json' ? JSON.stringify({ isCorrect: false, explanation: 'Justifique os passos.', remediation: 'Use a definição.' }) : 'Vamos continuar com a função anterior.' }; } } };
  const analysis = { title: 'Prova fictícia', summary: 'Respostas não fornecidas.', observedScore: null, maximumScore: null, weaknesses: [], strengths: [], restrictions: ['Sem L’Hôpital'], recommendedModuleIds: ['limits'], questions: [{ number: '1', topic: 'Limites', statement: 'Calcule o limite.', feedback: 'Sem resposta para diagnosticar.', practicePrompt: 'Outro limite.', earnedScore: null, maximumScore: null }] };
  const authenticate = createRequireUser(async token => { if (!['alice', 'bob'].includes(token)) throw new Error('invalid'); return { uid: token }; });
  const app = createApplication({ authenticate, storage, documents, memory, learningStore: null, ai, analyze: async () => analysis, ocr: { processDocument: async () => {} } as any });
  const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  t.after(() => new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve())));
  const origin = `http://127.0.0.1:${(server.address() as any).port}`;
  const request = (url: string, uid?: string, options: RequestInit = {}) => fetch(origin + url, { ...options, headers: { ...(uid ? { Authorization: `Bearer ${uid}` } : {}), ...options.headers } });
  const post = (url: string, data: unknown, uid = 'alice') => request(url, uid, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  function upload(text: string, mime = 'application/pdf', filename = 'test.pdf') { const form = new FormData(); form.append('file', new Blob([text], { type: mime }), filename); return form; }
  await t.test('all private endpoint families reject missing and invalid tokens', async () => {
    for (const url of ['/api/documents', '/api/exams', '/api/tutor/history']) { assert.equal((await request(url)).status, 401); assert.equal((await request(url, 'forged')).status, 401); }
    assert.equal((await post('/api/tutor/chat', { message: 'Oi' }, 'forged')).status, 401);
  });
  let documentId = '';
  await t.test('valid uploads round-trip only for the owner', async () => {
    const response = await request('/api/documents/upload', 'alice', { method: 'POST', body: upload('%PDF-1.4\nFixture only') });
    assert.equal(response.status, 201); const body = await response.json(); documentId = body.document.id;
    assert.equal(body.document.ownerUid, 'alice');
    assert.equal((await request(`/api/documents/${documentId}`, 'bob')).status, 404);
    assert.equal((await request(`/api/documents/${documentId}/file`, 'bob')).status, 404);
    assert.equal((await request(`/api/documents/${documentId}/reprocess`, 'bob', { method: 'POST' })).status, 404);
    assert.equal((await request(`/api/documents/${documentId}`, 'bob', { method: 'DELETE' })).status, 404);
    const file = await request(`/api/documents/${documentId}/file`, 'alice'); assert.equal(file.status, 200); assert.match(await file.text(), /^%PDF-/);
    assert.equal((await (await request('/api/documents', 'bob')).json()).documents.length, 0);
    assert.equal((await request(`/api/documents/${documentId}/reprocess`, 'alice', { method: 'POST' })).status, 200);
  });
  await t.test('spoofed uploads, unsupported types and missing files fail safely', async () => {
    assert.equal((await request('/api/documents/upload', 'alice', { method: 'POST', body: upload('<html>bad</html>') })).status, 400);
    assert.equal((await request('/api/documents/upload', 'alice', { method: 'POST', body: upload('<svg/>', 'image/svg+xml') })).status, 400);
    assert.equal((await request('/api/documents/upload', 'alice', { method: 'POST', body: new FormData() })).status, 400);
  });
  await t.test('oversized files and oversized JSON are rejected', async () => {
    const oversized = upload('%PDF-' + 'x'.repeat(25 * 1024 * 1024));
    const response = await request('/api/documents/upload', 'alice', { method: 'POST', body: oversized });
    assert.equal(response.status, 400); assert.match((await response.json()).error, /25 MB/);
    assert.equal((await post('/api/tutor/chat', { message: 'x'.repeat(140000) })).status, 413);
  });
  await t.test('exam analysis creates a private report and owner-only original', async () => {
    const response = await request('/api/exams', 'alice', { method: 'POST', body: upload('%PDF-1.4\nSynthetic exam') }); assert.equal(response.status, 201);
    const report = await response.json(); assert.equal(report.analysis.observedScore, null);
    assert.equal((await (await request('/api/exams', 'alice')).json()).exams.length, 1);
    assert.equal((await (await request('/api/exams', 'bob')).json()).exams.length, 0);
    assert.equal((await request(`/api/documents/${report.id}/file`, 'bob')).status, 404);
  });
  await t.test('chat sends prior turns and restores only the current user history', async () => {
    assert.equal((await post('/api/tutor/chat', { message: 'f(x)=x²+7x' })).status, 200);
    assert.equal((await post('/api/tutor/chat', { message: 'E a derivada?' })).status, 200);
    const contents = calls.at(-1).contents;
    assert.deepEqual(contents.map((turn: any) => turn.role), ['user', 'model', 'user']);
    assert.match(contents[0].parts[0].text, /7x/);
    assert.equal((await (await request('/api/tutor/history', 'alice')).json()).messages.length, 4);
    assert.equal((await (await request('/api/tutor/history', 'bob')).json()).messages.length, 0);
  });
  await t.test('bad inputs, invalid JSON and unknown APIs return controlled errors', async () => {
    assert.equal((await post('/api/tutor/chat', { message: {} })).status, 400);
    assert.equal((await post('/api/tutor/chat', { message: 'x'.repeat(6001) })).status, 400);
    assert.equal((await post('/api/tutor/diagnose-step', { studentStepLatex: [] })).status, 400);
    assert.equal((await post('/api/tutor/diagnose-step', { studentStepLatex: '2x', problemLatex: 'x²' })).status, 200);
    const invalid = await request('/api/tutor/chat', 'alice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' }); assert.equal(invalid.status, 400); assert.doesNotMatch(await invalid.text(), /stack|server\.ts/);
    assert.equal((await request('/api/unknown', 'alice')).status, 404);
    assert.equal((await request('/data/documents.json')).status, 404);
    const response = await request('/api/documents', 'alice'); assert.equal(response.headers.get('x-content-type-options'), 'nosniff'); assert.equal(response.headers.get('x-powered-by'), null); assert.equal(response.headers.get('cache-control'), 'private, no-store');
  });
  await t.test('owner deletion removes access and traversal keys are rejected', async () => {
    assert.equal((await request(`/api/documents/${documentId}`, 'alice', { method: 'DELETE' })).status, 200);
    assert.equal((await request(`/api/documents/${documentId}/file`, 'alice')).status, 404);
    await assert.rejects(() => storage.getObject('../db/documents.json'));
    await assert.rejects(() => storage.putObject({ Key: '../escape.pdf', Body: Buffer.from('%PDF-'), ContentType: 'application/pdf' }));
    assert.equal(new DocumentDatabase(path.join(directory, 'db')).getById(documentId), null);
  });
  await t.test('costly requests are rate limited without blocking report reads', async () => {
    for (let i = 0; i < 6; i++) assert.equal((await request('/api/exams', 'bob', { method: 'POST', body: new FormData() })).status, 400);
    const limited = await request('/api/exams', 'bob', { method: 'POST', body: new FormData() });
    assert.equal(limited.status, 429); assert.ok(limited.headers.get('retry-after'));
    assert.equal((await request('/api/exams', 'bob')).status, 200);
  });
});
