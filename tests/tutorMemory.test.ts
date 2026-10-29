import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TutorMemory, buildTutorContents, ChatTurn } from '../server/tutorMemory';

test('follow-up includes the original exercise and previous model reply in order', () => {
  const turns: ChatTurn[] = [{ id: '1', sender: 'user', content: 'Considere f(x)=x²+7x.', timestamp: 'now' }, { id: '2', sender: 'tutor', content: 'Vamos derivar a função.', timestamp: 'now' }];
  const contents = buildTutorContents(turns, 'E a segunda derivada?');
  assert.deepEqual(contents.map(t => t.role), ['user', 'model', 'user']);
  assert.match(contents[0].parts[0].text, /x²\+7x/);
  assert.equal(contents[2].parts[0].text, 'E a segunda derivada?');
});
test('memory survives service restart and stays isolated by account', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'calculus-tutor-'));
  const first = new TutorMemory(directory);
  first.write('alice', [{ id: '1', sender: 'user', content: 'Meu parâmetro é 7.', timestamp: 'now' }]);
  first.write('alice', [...first.read('alice'), { id: '2', sender: 'tutor', content: 'Vamos usar 7.', timestamp: 'now' }]);
  const restarted = new TutorMemory(directory);
  assert.equal(restarted.read('alice').length, 2);
  assert.equal(restarted.read('alice')[0].content, 'Meu parâmetro é 7.');
  assert.deepEqual(restarted.read('bob'), []);
});
test('long histories are bounded and preserve the newest question', () => {
  const history: ChatTurn[] = Array.from({ length: 240 }, (_, i) => ({ id: String(i), sender: i % 2 ? 'tutor' : 'user', content: 'x'.repeat(2000), timestamp: 'now' }));
  const contents = buildTutorContents(history, 'Pergunta atual');
  assert.ok(contents.length <= 81);
  assert.equal(contents[0].role, 'user');
  assert.equal(contents.at(-1)?.parts[0].text, 'Pergunta atual');
  assert.ok(contents.reduce((n, t) => n + t.parts[0].text.length, 0) <= 48000);
});
