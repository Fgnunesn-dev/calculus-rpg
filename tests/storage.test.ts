import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DocumentDatabase } from '../server/documentDb';
test('corrupt databases fail closed without silently discarding records', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'calculus-corrupt-'));
  fs.writeFileSync(path.join(directory, 'documents.json'), '{broken');
  assert.throws(() => new DocumentDatabase(directory));
  assert.equal(fs.readFileSync(path.join(directory, 'documents.json'), 'utf8'), '{broken');
});
test('failed disk writes do not commit unsaved documents to in-memory state', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'calculus-diskfail-'));
  const database = new DocumentDatabase(directory);
  fs.mkdirSync(path.join(directory, 'documents.json'));
  assert.throws(() => database.create({ id: 'unsaved', ownerUid: 'alice' } as any));
  assert.equal(database.getById('unsaved'), null);
});
