import { GoogleGenAI } from '@google/genai';
import { createWorker } from 'tesseract.js';
import { documentDb, StoredExercise } from './documentDb.js';

export interface OcrProcessingResult {
  rawText: string;
  engine: 'gemini_vision' | 'tesseract' | 'native_pdf';
  detectedExercises: StoredExercise[];
}

export class OcrPipelineService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  /**
   * Process a document through the OCR pipeline asynchronously
   */
  async processDocument(docId: string, fileBuffer: Buffer, mimeType: string): Promise<void> {
    try {
      // Mark as processing
      documentDb.update(docId, { status: 'processing' });

      let result: OcrProcessingResult;

      if (this.ai && process.env.GEMINI_API_KEY) {
        try {
          result = await this.processWithGeminiVision(fileBuffer, mimeType);
        } catch (geminiErr) {
          console.warn('Gemini OCR failed, falling back to local OCR engine:', geminiErr);
          result = await this.processWithFallbackOcr(fileBuffer, mimeType);
        }
      } else {
        result = await this.processWithFallbackOcr(fileBuffer, mimeType);
      }

      // Update database record with extracted text and detected exercises
      documentDb.update(docId, {
        status: 'completed',
        rawExtractedText: result.rawText,
        ocrEngine: result.engine,
        detectedExercises: result.detectedExercises,
        extractedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error(`OCR processing failed for document ${docId}:`, err);
      documentDb.update(docId, {
        status: 'failed',
        errorMessage: err.message || 'Falha no processamento OCR',
      });
    }
  }

  /**
   * Process document using Gemini Vision (supports PDF, PNG, JPG, LaTeX math extraction)
   */
  private async processWithGeminiVision(fileBuffer: Buffer, mimeType: string): Promise<OcrProcessingResult> {
    if (!this.ai) throw new Error('Gemini AI not initialized');

    const base64Data = fileBuffer.toString('base64');

    const prompt = `Você é um motor OCR especializado em documentos acadêmicos de Cálculo A (Universidade Federal da Bahia - UFBA).
Sua tarefa é extrair com precisão cirúrgica todo o texto, fórmulas matemáticas (em notação LaTeX limpa, e.g. \\lim, \\frac, \\sqrt, f'(x)), e identificar cada exercício contido.

Instruções:
1. Extraia o texto completo exatamente como aparece, preservando títulos, enunciados, anotações e fórmulas.
2. Para cada questão/exercício identificado, formate no final uma seção especial delimitada por ===EXERCICIOS_DETECTADOS=== no formato JSON.

Exemplo de formato final de saída:
[Texto completo extraído com fórmulas em LaTeX]

===EXERCICIOS_DETECTADOS===
[
  {
    "number": "01.a",
    "title": "Limite no infinito",
    "enunciado": "Calcule lim_{x -> +infty} (x - sqrt(x^2+8x))",
    "topic": "Limites",
    "confidence": 0.98
  }
]
`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
    });

    const outputText = response.text || '';

    // Split raw text and detected exercises
    let rawText = outputText;
    let detectedExercises: StoredExercise[] = [];

    if (outputText.includes('===EXERCICIOS_DETECTADOS===')) {
      const parts = outputText.split('===EXERCICIOS_DETECTADOS===');
      rawText = parts[0].trim();
      const jsonCandidate = parts[1].trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      try {
        const parsed = JSON.parse(jsonCandidate);
        if (Array.isArray(parsed)) {
          detectedExercises = parsed.map((item, idx) => ({
            id: `ex-${Date.now()}-${idx}`,
            number: item.number || `${idx + 1}`,
            title: item.title || `Exercício ${idx + 1}`,
            enunciado: item.enunciado || item.statement || '',
            topic: item.topic || 'Cálculo A',
            confidence: Number(item.confidence) || 0.95,
          }));
        }
      } catch (jsonErr) {
        console.warn('Could not parse detected exercises JSON from Gemini:', jsonErr);
      }
    }

    // If no exercises parsed from delimiter, try simple regex detection
    if (detectedExercises.length === 0) {
      detectedExercises = this.extractExercisesFromText(rawText);
    }

    return {
      rawText,
      engine: 'gemini_vision',
      detectedExercises,
    };
  }

  /**
   * Fallback OCR using Tesseract.js for images or regex parsing for text PDFs
   */
  private async processWithFallbackOcr(fileBuffer: Buffer, mimeType: string): Promise<OcrProcessingResult> {
    if (mimeType.startsWith('image/')) {
      const worker = await createWorker('por');
      try {
        const ret = await worker.recognize(fileBuffer);
        const text = ret.data.text || '';
        await worker.terminate();

        const detectedExercises = this.extractExercisesFromText(text);

        return {
          rawText: text,
          engine: 'tesseract',
          detectedExercises,
        };
      } catch (tessErr) {
        await worker.terminate();
        throw tessErr;
      }
    } else {
      // For PDF without Gemini API: extract printable text strings
      const asciiText = fileBuffer
        .toString('latin1')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .slice(0, 5000);

      const rawText = asciiText.length > 100 
        ? `[Extração de Texto Bruto do PDF]:\n${asciiText}`
        : `[Documento PDF recebido]: ${fileBuffer.length} bytes armazenados com sucesso no S3. O processamento avançado de fórmulas requer OCR de alta resolução ou chave Gemini.`;

      const detectedExercises = this.extractExercisesFromText(rawText);

      return {
        rawText,
        engine: 'native_pdf',
        detectedExercises,
      };
    }
  }

  /**
   * Helper to parse exercise numbering from raw text
   */
  private extractExercisesFromText(text: string): StoredExercise[] {
    const exercises: StoredExercise[] = [];
    const lines = text.split('\n');
    let currentNumber = '';
    let currentEnunciado: string[] = [];

    const questaoRegex = /^(?:(\d+)[ªaA]?\s*Quest[aã]o|Quest[aã]o\s*(\d+)|(\d{1,2})\.\s*|([a-z]\))\s*)/i;

    for (const line of lines) {
      const match = line.trim().match(questaoRegex);
      if (match) {
        if (currentNumber && currentEnunciado.length > 0) {
          exercises.push({
            id: `ex-${Date.now()}-${exercises.length}`,
            number: currentNumber,
            title: `Questão ${currentNumber}`,
            enunciado: currentEnunciado.join(' ').trim(),
            topic: 'Cálculo A',
            confidence: 0.85,
          });
          currentEnunciado = [];
        }
        currentNumber = match[1] || match[2] || match[3] || match[4] || `${exercises.length + 1}`;
        currentEnunciado.push(line.trim());
      } else if (currentNumber) {
        currentEnunciado.push(line.trim());
      }
    }

    if (currentNumber && currentEnunciado.length > 0) {
      exercises.push({
        id: `ex-${Date.now()}-${exercises.length}`,
        number: currentNumber,
        title: `Questão ${currentNumber}`,
        enunciado: currentEnunciado.join(' ').trim(),
        topic: 'Cálculo A',
        confidence: 0.85,
      });
    }

    return exercises;
  }
}

export const ocrPipeline = new OcrPipelineService();
