import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface ChatTurn { id: string; sender: 'user' | 'tutor'; content: string; timestamp: string; mode?: string; }
export function buildTutorContents(history: ChatTurn[], message: string, currentLatex?: string) {
  const selected: ChatTurn[] = [];
  let length = message.length + (currentLatex?.length || 0);
  for (const turn of history.slice(-80).reverse()) {
    if (!['user', 'tutor'].includes(turn.sender) || typeof turn.content !== 'string') continue;
    if (length + turn.content.length > 48000) break;
    selected.unshift(turn); length += turn.content.length;
  }
  // Gemini conversation starts with a user turn, even when the window is trimmed.
  while (selected[0]?.sender === 'tutor') selected.shift();
  return [...selected.map(turn => ({ role: turn.sender === 'user' ? 'user' : 'model', parts: [{ text: turn.content }] })), { role: 'user', parts: [{ text: `${message}${currentLatex ? `\nExpressão matemática: ${currentLatex}` : ''}` }] }];
}
export class TutorMemory {
  constructor(private directory = path.resolve('data', 'tutor-conversations')) { fs.mkdirSync(directory, { recursive: true }); }
  private file(uid: string) { return path.join(this.directory, `${crypto.createHash('sha256').update(uid).digest('hex')}.json`); }
  read(uid: string): ChatTurn[] {
    const file = this.file(uid);
    if (!fs.existsSync(file)) return [];
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(value)) throw new Error('Histórico inválido');
    return value;
  }
  write(uid: string, history: ChatTurn[]) {
    const file = this.file(uid), temporary = `${file}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(history.slice(-200)), 'utf8');
    fs.renameSync(temporary, file);
  }
}
