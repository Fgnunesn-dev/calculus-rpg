import 'dotenv/config';
import { analyzeExam } from '../server/examAnalysis';
import { buildTutorContents } from '../server/tutorMemory';
import { GoogleGenAI } from '@google/genai';
// Synthetic one-page PDF. No user documents, grades or identifiers are transmitted.
function syntheticPdf() {
  const stream = 'BT /F1 12 Tf 50 750 Td (Practice exam. Total score: 2/2.) Tj 0 -25 Td (Question 1: Compute limit sin\(x\)/x as x tends to zero.) Tj 0 -25 Td (Student answer: 1. Teacher correction: correct. Score: 2/2.) Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf); pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}
try {
  const result = await analyzeExam(syntheticPdf(), 'application/pdf');
  if (!result.questions.length || (result.observedScore !== null && result.observedScore !== 2)) throw new Error('invalid-exam-output');
  console.log('LIVE_PDF_ANALYSIS_OK', result.questions.length);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 60000 } });
  const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite', contents: buildTutorContents([{ id: '1', sender: 'user', content: 'Para este exercício fictício, a=137.', timestamp: 'now' }, { id: '2', sender: 'tutor', content: 'Vamos usar esse valor.', timestamp: 'now' }], 'Qual era o valor de a? Responda apenas o número.'), config: { maxOutputTokens: 128 } });
  if (!response.text?.includes('137')) throw new Error('memory-context-mismatch');
  console.log('LIVE_CONVERSATION_MEMORY_OK');
} catch (error: any) { console.log('LIVE_SMOKE_FAILED', Number(error.status) || 'invalid-response'); process.exitCode = 1; }
