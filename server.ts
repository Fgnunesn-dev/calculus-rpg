import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { s3Storage } from './server/s3Storage.js';
import { documentDb, StoredDocument } from './server/documentDb.js';
import { ocrPipeline } from './server/ocrPipeline.js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve S3 local storage bucket public files
app.use('/s3-storage', express.static(path.join(process.cwd(), 'public', 's3-storage')));

// Configure Multer for in-memory buffer handling before S3 storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Envie apenas PDF, JPG ou PNG.'));
    }
  },
});

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// API ROUTES: DOCUMENTS & S3 UPLOAD & OCR
// ==========================================

/**
 * POST /api/documents/upload
 * Uploads a document (PDF, JPG, PNG) to S3-compatible storage,
 * saves metadata in database and triggers the OCR extraction pipeline.
 */
app.post('/api/documents/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      return;
    }

    const file = req.file;
    const documentId = `doc-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const fileExt = path.extname(file.originalname).toLowerCase() || (file.mimetype === 'application/pdf' ? '.pdf' : '.png');
    const s3Key = `uploads/${new Date().getFullYear()}/${documentId}${fileExt}`;

    // 1. Store in S3-compatible storage
    const s3Object = await s3Storage.putObject({
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: encodeURIComponent(file.originalname),
        uploadedBy: 'Fabricio Gabriel',
      },
    });

    // 2. Register in Document Database
    const newDoc: StoredDocument = {
      id: documentId,
      originalName: file.originalname,
      filename: `${documentId}${fileExt}`,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      s3Bucket: s3Object.bucket,
      s3Key: s3Object.key,
      s3Url: s3Object.url,
      status: 'processing',
      rawExtractedText: '',
      ocrEngine: 'none',
      detectedExercises: [],
      metadata: {
        course: req.body.course || 'Cálculo A (MATA02)',
        professor: req.body.professor || 'Graça Luzia Dominguez Santos',
        semester: req.body.semester || '2026.2',
        type: req.body.type || (file.mimetype === 'application/pdf' ? 'Lista / Prova' : 'Anotação / Foto de Questão'),
      },
    };

    documentDb.create(newDoc);

    // 3. Trigger asynchronous OCR pipeline
    ocrPipeline.processDocument(documentId, file.buffer, file.mimetype).catch((err) => {
      console.error(`Background OCR pipeline failed for ${documentId}:`, err);
    });

    res.status(201).json({
      message: 'Arquivo armazenado com sucesso no S3. O pipeline de OCR foi iniciado.',
      document: newDoc,
      s3Info: {
        bucket: s3Object.bucket,
        key: s3Object.key,
        etag: s3Object.etag,
        url: s3Object.url,
        isRemoteS3: s3Storage.isRemote(),
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Erro interno no upload do arquivo.' });
  }
});

/**
 * GET /api/documents
 * List all registered documents with S3 and OCR status
 */
app.get('/api/documents', (_req: Request, res: Response) => {
  const documents = documentDb.getAll();
  res.json({
    total: documents.length,
    s3Bucket: s3Storage.getBucketName(),
    documents,
  });
});

/**
 * GET /api/documents/:id
 * Retrieve a single document with its full OCR raw text and detected exercises
 */
app.get('/api/documents/:id', (req: Request, res: Response): void => {
  const doc = documentDb.getById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Documento não encontrado.' });
    return;
  }
  res.json(doc);
});

/**
 * POST /api/documents/:id/reprocess
 * Re-trigger OCR extraction on a stored file
 */
app.post('/api/documents/:id/reprocess', async (req: Request, res: Response): Promise<void> => {
  const doc = documentDb.getById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Documento não encontrado.' });
    return;
  }

  const fileData = await s3Storage.getObject(doc.s3Key);
  if (!fileData) {
    res.status(404).json({ error: 'Arquivo binário não encontrado no S3.' });
    return;
  }

  ocrPipeline.processDocument(doc.id, fileData.body, doc.mimeType).catch(console.error);

  res.json({
    message: 'Reprocessamento OCR iniciado.',
    documentId: doc.id,
  });
});

/**
 * DELETE /api/documents/:id
 * Remove document from database
 */
app.delete('/api/documents/:id', (req: Request, res: Response): void => {
  const deleted = documentDb.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Documento não encontrado.' });
    return;
  }
  res.json({ message: 'Documento excluído com sucesso.' });
});

// ==========================================
// API ROUTES: AI TUTOR & DIAGNOSTIC ENGINE
// ==========================================

/**
 * POST /api/tutor/chat
 * Multi-mode pedagogical tutor grounded in UFBA Calculus A materials
 */
app.post('/api/tutor/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, mode = 'aprender', contextTopic, currentLatex, hintLevel = 1 } = req.body;

    if (!message && !currentLatex) {
      res.status(400).json({ error: 'Mensagem necessária.' });
      return;
    }

    if (!ai) {
      // Fallback pedagogical response if no API key
      res.json({
        content: `[Tutor Calculus RPG]: No modo **${mode.toUpperCase()}**, para o tópico ${contextTopic || 'Cálculo A'}, lembre-se das diretrizes da Profa. Graça Luzia Dominguez:
1. Sempre verifique o tipo de indeterminação antes de aplicar qualquer técnica (e.g. 0/0 ou \\infty - \\infty).
2. Na 1ª Prova, nunca use L'Hôpital! Use conjugados, fatoração ou o limite fundamental lim_{x->0} sen(x)/x = 1.
3. Demonstre cada passo algébrico com rigor.`,
        latex: currentLatex || '\\lim_{x \\to 0} \\frac{\\text{sen}(x)}{x} = 1',
        hintLevel,
      });
      return;
    }

    const systemPrompt = `Você é o Tutor de IA do CALCULUS RPG, mentor particular de Cálculo A (MATA02) do Instituto de Matemática da UFBA para o estudante Fabricio Gabriel (Engenharia de Transportes).
A professora da disciplina é a Profa. Graça Luzia Dominguez Santos.

REGRAS PEDAGÓGICAS ABSOLUTAS:
1. No modo "praticar" ou "aprender", NUNCA dê a resposta pronta imediatamente. Use a hierarquia de 5 níveis de ajuda:
   - Nível 1: Pergunta orientadora reflexiva.
   - Nível 2: Lembrete do conceito/fórmula relevante.
   - Nível 3: Indicação da próxima etapa algébrica.
   - Nível 4: Resolução parcial comentada.
   - Nível 5: Resolução completa detalhada (apenas se explicitamente solicitada).
2. Não invente conteúdos fora da ementa da Profa. Graça.
3. Se o estudante errou, identifique a categoria exata (conceitual, algébrico, sinal, notação, etc.) e investigue a causa raiz.
4. Responda em Português do Brasil de forma estimulante, elegante, precisa e direta, compatível com a estética de treinamento de alto nível do CALCULUS RPG.
5. Sempre formate expressões matemáticas em LaTeX elegante (usando $...$ para inline e $$...$$ para blocos).
Modo Atual: ${mode}. Nível de Dica Atual: ${hintLevel}. Tópico em Foco: ${contextTopic || 'Geral'}.`;

    const contents = [
      { text: systemPrompt },
      { text: `Estudante: ${message || 'Por favor, avalie esta expressão:'} ${currentLatex ? `\nExpressão Matemática: ${currentLatex}` : ''}` },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
    });

    const reply = response.text || 'Entendido. Vamos analisar passo a passo.';

    res.json({
      content: reply,
      mode,
      hintLevel,
    });
  } catch (error: any) {
    console.error('Tutor chat error:', error);
    res.status(500).json({ error: error.message || 'Erro ao consultar o tutor.' });
  }
});

/**
 * POST /api/tutor/diagnose-step
 * Diagnoses an algebraic step or student attempt
 */
app.post('/api/tutor/diagnose-step', async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemLatex, studentStepLatex, expectedAnswerLatex } = req.body;

    if (!studentStepLatex) {
      res.status(400).json({ error: 'Passo do estudante necessário para diagnóstico.' });
      return;
    }

    if (!ai) {
      res.json({
        isCorrect: false,
        classification: 'erro_algebrico',
        confidence: 0.88,
        explanation: 'Verifique se você fatorou corretamente todos os termos do numerador.',
        remediation: 'Multiplique pelo conjugado para eliminar a raiz.',
      });
      return;
    }

    const prompt = `Atue como o motor de diagnóstico matemático de Cálculo A.
Problema Original: ${problemLatex || 'Não especificado'}
Gabarito Esperado: ${expectedAnswerLatex || 'Não especificado'}
Passo / Resolução do Estudante: ${studentStepLatex}

Analise a tentativa do estudante e responda em JSON com os seguintes campos:
{
  "isCorrect": boolean,
  "classification": "erro_conceitual" | "erro_algebrico" | "erro_sinal" | "erro_aritmetico" | "formula_incorreta" | "metodo_inadequado" | "interpretacao_equivocada" | "falha_notacao" | "falta_justificativa" | "acerto_sem_dominio",
  "confidence": number, // entre 0 e 1
  "explanation": "Explicação concisa do que ocorreu no passo",
  "remediation": "Orientação pedagógica para corrigir o raciocínio",
  "nextSuggestedStepLatex": "Expressão LaTeX do próximo passo correto recomendado"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    console.error('Diagnose step error:', err);
    res.status(500).json({ error: err.message || 'Erro ao diagnosticar passo.' });
  }
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC SERVE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calculus RPG full-stack server running on http://0.0.0.0:${PORT}`);
    console.log(`S3 Storage initialized (Bucket: ${s3Storage.getBucketName()})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
