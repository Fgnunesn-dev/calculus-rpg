import fs from 'fs';
import path from 'path';

export interface StoredExercise {
  id: string;
  number: string;
  title: string;
  enunciado: string;
  topic?: string;
  confidence: number;
}

export interface StoredDocument {
  ownerUid?: string;
  analysis?: import('../src/types/exam').ExamAnalysis;
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  s3Bucket: string;
  s3Key: string;
  s3Url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  rawExtractedText: string;
  ocrEngine: 'gemini_vision' | 'tesseract' | 'native_pdf' | 'none';
  extractedAt?: string;
  detectedExercises: StoredExercise[];
  pageCount?: number;
  errorMessage?: string;
  metadata?: {
    course?: string;
    professor?: string;
    semester?: string;
    type?: string;
  };
}

export class DocumentDatabase {
  private dbFilePath: string;
  private documents: Map<string, StoredDocument> = new Map();

  constructor(directory?: string) {
    const dataDir = directory || path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbFilePath = path.join(dataDir, 'documents.json');
    this.loadDatabase();
  }

  private loadDatabase() {
    if (fs.existsSync(this.dbFilePath)) {
      try {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const data: StoredDocument[] = JSON.parse(raw);
        for (const doc of data) {
          this.documents.set(doc.id, doc);
        }
      } catch { throw new Error('Não foi possível ler a base de documentos. O arquivo original foi preservado; restaure um backup antes de iniciar.'); }
    }

  }

  private saveDatabase(records = this.documents) {
    const temporary = this.dbFilePath + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(Array.from(records.values()), null, 2), 'utf8');
    fs.renameSync(temporary, this.dbFilePath);
  }

  getAll(): StoredDocument[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  getById(id: string): StoredDocument | null {
    return this.documents.get(id) || null;
  }

  create(doc: StoredDocument): StoredDocument {
    const next = new Map(this.documents); next.set(doc.id, doc);
    this.saveDatabase(next); this.documents = next;
    return doc;
  }

  update(id: string, partial: Partial<StoredDocument>): StoredDocument | null {
    const existing = this.documents.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...partial };
    const next = new Map(this.documents); next.set(id, updated);
    this.saveDatabase(next); this.documents = next;
    return updated;
  }

  delete(id: string): boolean {
    const next = new Map(this.documents); const deleted = next.delete(id);
    if (deleted) { this.saveDatabase(next); this.documents = next; }
    return deleted;
  }
}

export const documentDb = new DocumentDatabase();
