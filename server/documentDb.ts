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

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
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
      } catch (err) {
        console.error('Failed to parse documents.json, starting empty', err);
      }
    }

    // Seed default UFBA documents if empty
    if (this.documents.size === 0) {
      this.seedDefaultUfbaDocuments();
    }
  }

  private seedDefaultUfbaDocuments() {
    const seedDocs: StoredDocument[] = [
      {
        id: "doc-ufba-prova1",
        originalName: "CamScanner_29-10-26_16.05.pdf",
        filename: "CamScanner_29-10-26_16.05_cfd12b73.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1548200,
        uploadedAt: "2026-09-25T14:30:00.000Z",
        s3Bucket: "calculus-rpg-documents",
        s3Key: "ufba-2026-2/provas/CamScanner_29-10-26_16.05_cfd12b73.pdf",
        s3Url: "/assets/aistudio/CamScanner_29-10-26_16.05_cfd12b73.pdf",
        status: "completed",
        ocrEngine: "gemini_vision",
        extractedAt: "2026-09-25T14:35:12.000Z",
        pageCount: 3,
        metadata: {
          course: "Cálculo A (MATA02)",
          professor: "Graça Luzia Dominguez Santos",
          semester: "2026.2",
          type: "1ª Prova Oficial (Versão C) - Correção e Autópsia"
        },
        rawExtractedText: `Departamento de Matemática - IME/UFBA
DISCIPLINA: Cálculo A - MATA02 - Sem. 2026.2 (*) - T07 - 1ª Prova - Data: 25/09/2026
PROFA: Graça Luzia Dominguez Santos
NOME: Fabricio Gabriel Nunes Nascimento
OBS: 1) Todas as respostas devem ser justificadas. 2) Não é permitido o uso de calculadoras. 3) Não serão considerados os limites resolvidos usando derivadas (L'Hôpital).

VERSÃO C
1ª Questão (4,0): Resolva os seguintes limites:
a) lim_{x -> +infty} (x - sqrt(x^2 + 8x))
b) lim_{x -> 0} (5x^2) / (1 - cos(x))
c) lim_{x -> -1} (sqrt(x^2 + 5) - sqrt(3x + 6)) / (x + 1)
d) lim_{x -> -infty} ln((x^3 + 5x + 7) / (4 - 2x + x^3)) * sen(x)

2ª Questão (2,0): Determine as constantes a e b de modo que a função f seja contínua em x = -1, sendo:
f(x) = { (x^2 + ax + b) / (x + 1), se x < -1; x^2 - 5, se x >= -1 }

3ª Questão (1,0): Determine uma equação da reta tangente ao gráfico da função f(x) = 2x^2 - 3x + 1 que seja perpendicular à reta x + 3y = 7.

4ª Questão (1,0): Usando a definição de derivada, verifique se a função f(x) = { 4/x - 4, se x > 1; 2x - 2, se x <= 1 } é derivável em x = 1.

5ª Questão (2,0): Usando as regras de derivação, determine as derivadas das funções a seguir:
a) f(x) = (2x^3 - 4x^-2)^(1/2 x)
b) g(x) = (cbrt(x + 2 tg(x))) / cos(x)`,
        detectedExercises: [
          {
            id: "ex-p1-1a",
            number: "1.a",
            title: "Limite com radicais no infinito",
            enunciado: "lim_{x -> +infty} (x - sqrt(x^2 + 8x))",
            topic: "Limites",
            confidence: 0.98
          },
          {
            id: "ex-p1-1b",
            number: "1.b",
            title: "Limite trigonométrico 0/0",
            enunciado: "lim_{x -> 0} (5x^2)/(1 - cos(x))",
            topic: "Limites Trigonométricos",
            confidence: 0.98
          },
          {
            id: "ex-p1-1c",
            number: "1.c",
            title: "Limite com raízes em x -> -1",
            enunciado: "lim_{x -> -1} (sqrt(x^2 + 5) - sqrt(3x + 6))/(x + 1)",
            topic: "Limites e Continuidade",
            confidence: 0.97
          },
          {
            id: "ex-p1-1d",
            number: "1.d",
            title: "Limite com logaritmo e função limitada",
            enunciado: "lim_{x -> -infty} ln((x^3 + 5x + 7)/(4 - 2x + x^3)) * sen(x)",
            topic: "Teorema do Confronto",
            confidence: 0.96
          },
          {
            id: "ex-p1-2",
            number: "2",
            title: "Continuidade de função por partes",
            enunciado: "f(x) = { (x^2+ax+b)/(x+1), x < -1; x^2-5, x >= -1 }. Determine a e b para continuidade em x = -1.",
            topic: "Continuidade",
            confidence: 0.99
          },
          {
            id: "ex-p1-3",
            number: "3",
            title: "Reta tangente perpendicular",
            enunciado: "f(x) = 2x^2 - 3x + 1, tangente perpendicular a x + 3y = 7.",
            topic: "Derivadas e Retas",
            confidence: 0.99
          },
          {
            id: "ex-p1-4",
            number: "4",
            title: "Derivada pela definição",
            enunciado: "f(x) = { 4/x - 4, x > 1; 2x - 2, x <= 1 }. Verifique derivabilidade em x = 1.",
            topic: "Derivada Formal",
            confidence: 0.99
          }
        ]
      },
      {
        id: "doc-ufba-lista1",
        originalName: "1alista-ClculoA-2026-2-_corrigida.pdf",
        filename: "1alista-ClculoA-2026-2-_corrigida_f79986f0.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2439100,
        uploadedAt: "2026-09-01T10:00:00.000Z",
        s3Bucket: "calculus-rpg-documents",
        s3Key: "ufba-2026-2/listas/1alista-ClculoA-2026-2-_corrigida_f79986f0.pdf",
        s3Url: "/assets/aistudio/1alista-ClculoA-2026-2-_corrigida_f79986f0.pdf",
        status: "completed",
        ocrEngine: "native_pdf",
        extractedAt: "2026-09-01T10:02:45.000Z",
        pageCount: 9,
        metadata: {
          course: "Cálculo A (MATA02)",
          professor: "Graça Luzia Dominguez Santos",
          semester: "2026.2",
          type: "1ª Lista Oficial de Exercícios"
        },
        rawExtractedText: `INSTITUTO DE MATEMÁTICA DA UFBA - DEPARTAMENTO DE MATEMÁTICA
CÁLCULO A - Atualizada em 2026.2 - 1ª LISTA DE EXERCÍCIOS
01. Esboce o gráfico de f, determine lim_{x -> a^-} f(x), lim_{x -> a^+} f(x) e lim_{x -> a} f(x)...
02. Determine, se possível, a in R para que exista o limite...
05. Calcule os limites a seguir...
15. Usando a definição, verifique se as funções são deriváveis...
21. Determine as equações das retas tangente e normal...
[RESPOSTAS DA 1ª LISTA INCLUSAS]`,
        detectedExercises: [
          {
            id: "ex-l1-05k",
            number: "05.k",
            title: "Limite com radicais",
            enunciado: "lim_{x -> 4} (3 - sqrt(5 + x)) / (1 - sqrt(5 - x))",
            topic: "Limites",
            confidence: 0.99
          },
          {
            id: "ex-l1-11d",
            number: "11.d",
            title: "Limite trigonométrico com tangente",
            enunciado: "lim_{x -> 0} (tg(x) - sen(x)) / sen^2(x)",
            topic: "Limites Trigonométricos",
            confidence: 0.98
          }
        ]
      },
      {
        id: "doc-ufba-lista2",
        originalName: "2a._lista-ClculoA-2026-2.pdf",
        filename: "2a._lista-ClculoA-2026-2_2ef81fe2.pdf",
        mimeType: "application/pdf",
        sizeBytes: 3120400,
        uploadedAt: "2026-10-01T11:00:00.000Z",
        s3Bucket: "calculus-rpg-documents",
        s3Key: "ufba-2026-2/listas/2a._lista-ClculoA-2026-2_2ef81fe2.pdf",
        s3Url: "/assets/aistudio/2a._lista-ClculoA-2026-2_2ef81fe2.pdf",
        status: "completed",
        ocrEngine: "native_pdf",
        extractedAt: "2026-10-01T11:04:10.000Z",
        pageCount: 14,
        metadata: {
          course: "Cálculo A (MATA02)",
          professor: "Graça Luzia Dominguez Santos",
          semester: "2026.2",
          type: "2ª Lista Oficial de Exercícios"
        },
        rawExtractedText: `INSTITUTO DE MATEMÁTICA DA UFBA - DEPARTAMENTO DE MATEMÁTICA
CÁLCULO A - 2ª LISTA DE EXERCÍCIOS
1ª Questão: Para cada uma das funções seguintes, determine as derivadas indicadas:
a) f(u) = u^2, u(x) = x^3 - 4, (f o u)'(x) e (f o u)'(1)...
7ª Questão: Derivação implícita...
10ª Questão: Regras de L'Hôpital...
11ª Questão: Taxas de Variação...
16ª Questão: Problemas de Máximos e Mínimos (Otimização)...
[GABARITO COMPLETO DA 2ª LISTA INCLUSO]`,
        detectedExercises: [
          {
            id: "ex-l2-1a",
            number: "1.a",
            title: "Regra da cadeia",
            enunciado: "f(u) = u^2, u(x) = x^3 - 4. Determine (f o u)'(x) e (f o u)'(1).",
            topic: "Regra da Cadeia",
            confidence: 0.99
          },
          {
            id: "ex-l2-7a",
            number: "7.a",
            title: "Derivação implícita de círculo",
            enunciado: "x^2 + y^2 = 4, dy/dx no ponto P(1, sqrt(3)).",
            topic: "Derivação Implícita",
            confidence: 0.99
          },
          {
            id: "ex-l2-11d",
            number: "11.d",
            title: "Taxa de variação de mancha de óleo",
            enunciado: "dr/dt = 22 m/h. Calcule dA/dt em função de r.",
            topic: "Taxas de Variação Relacionadas",
            confidence: 0.98
          },
          {
            id: "ex-l2-16b",
            number: "16.b",
            title: "Otimização de retângulo com arame L",
            enunciado: "Molde arame de comprimento L em retângulo de área máxima.",
            topic: "Otimização de Extremos",
            confidence: 0.98
          }
        ]
      },
      {
        id: "doc-ufba-notas-variacao",
        originalName: "Estudo_de_variao_de_funes_-_Clculo_A_-_2026-2.pdf",
        filename: "Estudo_de_variao_de_funes_-_Clculo_A_-_2026-2_32bea6d8.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1980000,
        uploadedAt: "2026-10-15T09:00:00.000Z",
        s3Bucket: "calculus-rpg-documents",
        s3Key: "ufba-2026-2/notas/Estudo_de_variao_de_funes_-_Clculo_A_-_2026-2_32bea6d8.pdf",
        s3Url: "/assets/aistudio/Estudo_de_variao_de_funes_-_Clculo_A_-_2026-2_32bea6d8.pdf",
        status: "completed",
        ocrEngine: "native_pdf",
        extractedAt: "2026-10-15T09:03:00.000Z",
        pageCount: 18,
        metadata: {
          course: "Cálculo A (MATA02)",
          professor: "Graça Luzia Dominguez Santos",
          semester: "2026.2",
          type: "Notas de Aula: Estudo da Variação das Funções"
        },
        rawExtractedText: `INSTITUTO DE MATEMÁTICA DA UFBA - DEPARTAMENTO DE MATEMÁTICA
Cálculo A - Profa: Graça Luzia Dominguez Santos
ESTUDO DA VARIAÇÃO DAS FUNÇÕES
Máximos e Mínimos Locais
Definição: Dada uma função f, seja c in D(f)...
Condição necessária para extremos locais (Teorema de Fermat)...
Teorema de Rolle...
Teorema do Valor Médio (Lagrange)...
Teste da derivada primeira e segunda para extremos locais...
Concavidade do gráfico e pontos de inflexão...
Assíntotas verticais, horizontais e oblíquas...
Roteiro para o esboço de gráficos...`,
        detectedExercises: []
      }
    ];

    for (const doc of seedDocs) {
      this.documents.set(doc.id, doc);
    }
    this.saveDatabase();
  }

  private saveDatabase() {
    try {
      const arr = Array.from(this.documents.values());
      fs.writeFileSync(this.dbFilePath, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save documents.json', err);
    }
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
    this.documents.set(doc.id, doc);
    this.saveDatabase();
    return doc;
  }

  update(id: string, partial: Partial<StoredDocument>): StoredDocument | null {
    const existing = this.documents.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...partial };
    this.documents.set(id, updated);
    this.saveDatabase();
    return updated;
  }

  delete(id: string): boolean {
    const deleted = this.documents.delete(id);
    if (deleted) {
      this.saveDatabase();
    }
    return deleted;
  }
}

export const documentDb = new DocumentDatabase();
