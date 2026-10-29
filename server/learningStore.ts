import config from '../firebase-applet-config.json' with { type: 'json' };
import { ChatTurn } from './tutorMemory';
import { ExamReport } from '../src/types/exam';
import { validateAnalysis } from './examAnalysis';

export interface LearningStore {
  exams(uid: string, token: string): Promise<ExamReport[]>;
  saveExam(uid: string, token: string, report: ExamReport): Promise<void>;
  removeExam(uid: string, token: string, id: string): Promise<void>;
  chat(uid: string, token: string, pairs?: number): Promise<ChatTurn[]>;
  saveExchange(uid: string, token: string, turns: ChatTurn[], id: string): Promise<void>;
}
export class LearningStoreError extends Error {}
type Collection = 'examReports' | 'tutorExchanges';
export class FirestoreLearningStore implements LearningStore {
  private base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/${encodeURIComponent(config.firestoreDatabaseId || '(default)')}/documents`;
  constructor(private transport: typeof fetch = fetch) {}
  private segment(value: string) {
    if (!value || value.length > 128 || /[\\/]/.test(value) || value === '.' || value === '..') throw new LearningStoreError('Identificador de memória inválido.');
    return encodeURIComponent(value);
  }
  private async call(url: string, token: string, method = 'GET', body?: unknown) {
    if (!token) throw new LearningStoreError('Entre novamente para acessar sua memória na nuvem.');
    let response: Response;
    try { response = await this.transport(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) }); }
    catch { throw new LearningStoreError('Não foi possível conectar à memória na nuvem. Seu histórico anterior foi preservado.'); }
    if (!response.ok) {
      if (method === 'DELETE' && response.status === 404) return undefined;
      if (response.status === 403) throw new LearningStoreError('O Firestore recusou o acesso à memória. Publique as regras atualizadas de firestore.rules no banco configurado e tente novamente.');
      if (response.status === 401) throw new LearningStoreError('Sua sessão expirou. Entre novamente para salvar sua memória.');
      if (response.status === 429) throw new LearningStoreError('A cota do Firestore foi atingida. Sua memória existente continua salva; tente mais tarde.');
      throw new LearningStoreError('Não foi possível ler ou salvar sua memória no Firestore. Tente novamente.');
    }
    return response.status === 204 ? undefined : response.json();
  }
  private async records(uid: string, token: string, collection: Collection, limit: number) {
    const rows = await this.call(`${this.base}/users/${this.segment(uid)}:runQuery`, token, 'POST', { structuredQuery: { from: [{ collectionId: collection }], orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }], limit } });
    if (!Array.isArray(rows)) throw new LearningStoreError('A memória retornou uma resposta inválida.');
    return rows.filter(row => row.document).map(row => {
      const fields = row.document.fields;
      const payload = fields?.payload?.stringValue;
      if (typeof payload !== 'string') throw new LearningStoreError('Um registro da memória está incompleto.');
      try { return JSON.parse(payload); } catch { throw new LearningStoreError('Um registro da memória não pôde ser lido.'); }
    });
  }
  private async save(uid: string, token: string, collection: Collection, id: string, createdAt: string, value: unknown) {
    const payload = JSON.stringify(value);
    if (Buffer.byteLength(payload, 'utf8') > 800000) throw new LearningStoreError('Este registro excede o tamanho permitido. Divida a prova ou a mensagem em partes menores.');
    await this.call(`${this.base}/users/${this.segment(uid)}/${collection}/${this.segment(id)}`, token, 'PATCH', { fields: { id: { stringValue: id }, createdAt: { stringValue: createdAt }, version: { integerValue: '1' }, payload: { stringValue: payload } } });
  }
  async exams(uid: string, token: string): Promise<ExamReport[]> {
    return (await this.records(uid, token, 'examReports', 100)).map(report => {
      if (typeof report.id !== 'string' || typeof report.originalName !== 'string' || typeof report.uploadedAt !== 'string') throw new LearningStoreError('Diagnóstico salvo incompleto.');
      return { id: report.id, originalName: report.originalName, uploadedAt: report.uploadedAt, analysis: validateAnalysis(report.analysis) };
    });
  }
  async saveExam(uid: string, token: string, report: ExamReport) { await this.save(uid, token, 'examReports', report.id, report.uploadedAt, report); }
  async removeExam(uid: string, token: string, id: string) { await this.call(`${this.base}/users/${this.segment(uid)}/examReports/${this.segment(id)}`, token, 'DELETE'); }
  async chat(uid: string, token: string, pairs = 100): Promise<ChatTurn[]> {
    const exchanges = await this.records(uid, token, 'tutorExchanges', Math.max(1, Math.min(pairs, 100)));
    return exchanges.reverse().flatMap(exchange => {
      if (!Array.isArray(exchange.turns) || exchange.turns.length !== 2 || exchange.turns[0].sender !== 'user' || exchange.turns[1].sender !== 'tutor' || exchange.turns.some((turn: any) => typeof turn.content !== 'string' || typeof turn.id !== 'string' || typeof turn.timestamp !== 'string')) throw new LearningStoreError('Uma conversa salva está incompleta.');
      return exchange.turns as ChatTurn[];
    });
  }
  async saveExchange(uid: string, token: string, turns: ChatTurn[], id: string) {
    if (turns.length !== 2 || turns[0].sender !== 'user' || turns[1].sender !== 'tutor') throw new LearningStoreError('Uma conversa deve conter a pergunta e a resposta.');
    await this.save(uid, token, 'tutorExchanges', id, turns[0].timestamp, { turns });
  }
}
