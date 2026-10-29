import { MathText } from './MathText';
import { privateFetch, openPrivateFile } from '../lib/api';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, Image as ImageIcon, CheckCircle2, Clock, 
  AlertCircle, RefreshCw, Eye, Database, HardDrive, Search,
  ExternalLink, Copy, Check, Sparkles, BookOpen, ChevronRight, X
} from 'lucide-react';
import { MathView } from './MathView';

export interface StoredDocumentItem {
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
  detectedExercises: Array<{
    id: string;
    number: string;
    title: string;
    enunciado: string;
    topic?: string;
    confidence: number;
  }>;
  pageCount?: number;
  errorMessage?: string;
  metadata?: {
    course?: string;
    professor?: string;
    semester?: string;
    type?: string;
  };
}

interface DocumentLibraryProps {
  onSelectExerciseToPractice?: (exercisePrompt: string, title: string) => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ onSelectExerciseToPractice }) => {
  const [documents, setDocuments] = useState<StoredDocumentItem[]>([]);
  const [s3BucketName, setS3BucketName] = useState<string>('calculus-rpg-documents');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  // Selected document for deep inspection
  const [selectedDoc, setSelectedDoc] = useState<StoredDocumentItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'listas' | 'provas' | 'uploads'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents from backend
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await privateFetch('/api/documents');
      if (!res.ok) throw new Error('Falha ao obter documentos.');
      const data = await res.json();
      setDocuments(data.documents || []);
      if (data.s3Bucket) setS3BucketName(data.s3Bucket);
      
      // Update selected doc if open
      if (selectedDoc) {
        const refreshed = (data.documents || []).find((d: StoredDocumentItem) => d.id === selectedDoc.id);
        if (refreshed) setSelectedDoc(refreshed);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Não foi possível carregar seus documentos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Poll for OCR updates when there's a processing document
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 3000);

    return () => clearInterval(interval);
  }, [documents]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Por favor selecione um arquivo PDF, JPG ou PNG válido.');
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('course', 'Cálculo A (MATA02) — UFBA');
      formData.append('professor', 'Profa. Graça Luzia Dominguez Santos');
      formData.append('semester', '2026.2');
      formData.append('type', file.type === 'application/pdf' ? 'Lista ou Prova PDF' : 'Foto de Questão / Anotação');

      const response = await privateFetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no envio do documento.');
      }

      setUploadSuccess(`Arquivo "${file.name}" gravado no bucket S3 (${result.s3Info.bucket}). O pipeline de extração OCR foi iniciado.`);
      
      // Refresh documents
      await fetchDocuments();

      if (result.document) {
        setSelectedDoc(result.document);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao processar o upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReprocessOcr = async (docId: string) => {
    try {
      const res = await privateFetch(`/api/documents/${docId}/reprocess`, { method: 'POST' });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Reprocess failed', err);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.rawExtractedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.metadata?.type || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'listas') return doc.originalName.toLowerCase().includes('lista');
    if (activeTab === 'provas') return doc.originalName.toLowerCase().includes('prova') || doc.originalName.toLowerCase().includes('camscanner');
    if (activeTab === 'uploads') return doc.s3Key.startsWith('uploads/');
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Header with S3 Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111726] border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
              ARQUITETURA DE DADOS ACADÊMICOS
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">UFBA 2026.2</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Biblioteca de Documentos & Pipeline OCR
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Armazenamento em nuvem compatível com <strong className="text-slate-200">S3</strong> com extração automática de texto, 
            identificação de fórmulas LaTeX e separação de exercícios para a aprendizagem adaptativa.
          </p>
        </div>

        {/* S3 Storage Status Pill */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl shrink-0">
          <HardDrive className="w-5 h-5 text-purple-400" />
          <div className="text-xs">
            <div className="text-slate-400">Bucket S3 Ativo:</div>
            <div className="font-mono text-purple-300 font-semibold">{s3BucketName}</div>
          </div>
        </div>
      </div>

      {/* Upload Zone & Actions */}
      <div className="bg-[#121828]/90 border-2 border-dashed border-slate-700/80 hover:border-purple-500/60 transition-colors p-6 rounded-2xl text-center relative overflow-hidden group">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf, .jpg, .jpeg, .png, application/pdf, image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto pointer-events-none">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-300 mb-3 shadow-lg group-hover:scale-110 transition-transform">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            ) : (
              <Upload className="w-6 h-6 text-purple-400" />
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-200 mb-1">
            {isUploading ? 'Gravando no S3 e executando pipeline de OCR...' : 'Arraste ou clique para enviar um material'}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Formatos aceitos: <span className="font-semibold text-purple-300">PDF, JPG, PNG</span> (máx. 25 MB). 
            Listas da professora, fotos do caderno, enunciados de provas ou resoluções.
          </p>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
            <span>S3 Storage</span>
            <span>·</span>
            <span>OCR Multi-Engine</span>
            <span>·</span>
            <span>Detecção LaTeX</span>
          </div>
        </div>
      </div>

      {/* Notification Banners */}
      {uploadError && (
        <div className="flex items-center gap-3 p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Interactive Segmented Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#101624] p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-purple-900/60 text-purple-200 shadow-sm border border-purple-700/50' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'listas' 
                ? 'bg-purple-900/60 text-purple-200 shadow-sm border border-purple-700/50' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Listas UFBA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('provas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'provas' 
                ? 'bg-purple-900/60 text-purple-200 shadow-sm border border-purple-700/50' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Provas Anteriores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('uploads')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'uploads' 
                ? 'bg-purple-900/60 text-purple-200 shadow-sm border border-purple-700/50' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Seus Uploads
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por termo ou questão..."
            className="w-full bg-[#101624] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && documents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
            Carregando repositório de documentos...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm bg-[#101624] rounded-2xl border border-slate-800/80">
            Nenhum documento encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const isPdf = doc.mimeType === 'application/pdf';
            const isSelected = selectedDoc?.id === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`bg-[#121828] border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between group hover:border-purple-500/70 ${
                  isSelected ? 'border-purple-500 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                      {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {doc.status === 'completed' && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          OCR Pronto
                        </span>
                      )}
                      {doc.status === 'processing' && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full animate-pulse">
                          <Clock className="w-3 h-3 animate-spin" />
                          Processando
                        </span>
                      )}
                      {doc.status === 'failed' && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Erro
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2 mb-1">
                    {doc.originalName}
                  </h3>

                  <div className="text-xs text-slate-500 mb-3 line-clamp-1">
                    {doc.metadata?.type || 'Documento Acadêmico'}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mb-3">
                    <span>{formatBytes(doc.sizeBytes)}</span>
                    <span>·</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</span>
                    {doc.pageCount && (
                      <>
                        <span>·</span>
                        <span>{doc.pageCount} pág.</span>
                      </>
                    )}
                  </div>

                  {/* Detected Exercises preview */}
                  {doc.detectedExercises && doc.detectedExercises.length > 0 && (
                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 mb-3">
                      <div className="text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center justify-between">
                        <span>Questões Detectadas:</span>
                        <span className="text-purple-300 font-bold">{doc.detectedExercises.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {doc.detectedExercises.slice(0, 4).map((ex, i) => (
                          <span key={i} className="text-[10px] font-mono bg-purple-950/50 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/40">
                            Q.{ex.number}
                          </span>
                        ))}
                        {doc.detectedExercises.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-mono self-center">
                            +{doc.detectedExercises.length - 4} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] font-mono">
                    S3: {doc.s3Key.slice(0, 20)}...
                  </span>
                  <div className="text-purple-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Ver detalhes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Document Full Inspection Drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#0e1422] border-l border-slate-800 h-full overflow-y-auto flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-purple-400 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded">
                    DETALHES DO DOCUMENTO
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-mono text-slate-400">{selectedDoc.id}</span>
                </div>
                <h2 className="text-lg font-bold text-white font-display">
                  {selectedDoc.originalName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* S3 Storage & File Metadata Card */}
            <div className="bg-[#121828] border border-slate-800 rounded-xl p-4 mb-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-purple-400" />
                  Registro de Armazenamento S3
                </span>
                <span className="font-mono text-slate-400">{formatBytes(selectedDoc.sizeBytes)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Bucket:</span>
                  <span className="text-slate-200">{selectedDoc.s3Bucket}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">MIME Type:</span>
                  <span className="text-slate-200">{selectedDoc.mimeType}</span>
                </div>
                <div className="col-span-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800 overflow-hidden">
                  <span className="text-slate-500 block text-[10px]">S3 Object Key:</span>
                  <span className="text-slate-300 break-all">{selectedDoc.s3Key}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <a
                  href={selectedDoc.s3Url}
                  onClick={e => { e.preventDefault(); openPrivateFile(selectedDoc.s3Url).catch(err => setUploadError(err.message)); }}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir arquivo original no navegador</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleReprocessOcr(selectedDoc.id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reprocessar OCR</span>
                </button>
              </div>
            </div>

            {/* Detected Exercises Section */}
            {selectedDoc.detectedExercises && selectedDoc.detectedExercises.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Exercícios Identificados ({selectedDoc.detectedExercises.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400">Pratique direto na Arena</span>
                </div>

                <div className="space-y-2">
                  {selectedDoc.detectedExercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="bg-[#121828] border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-3 hover:border-purple-600/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50">
                            {ex.number}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">{ex.title}</span>
                          {ex.topic && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              · {ex.topic}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono line-clamp-2">
                          <MathText text={ex.enunciado} />
                        </p>
                      </div>

                      {onSelectExerciseToPractice && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectExerciseToPractice(ex.enunciado, ex.title);
                            setSelectedDoc(null);
                          }}
                          className="shrink-0 px-2.5 py-1 text-xs font-medium bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-lg border border-purple-700/50 transition-colors flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-300" />
                          <span>Treinar</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Extracted Text View */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Texto Bruto Extraído (OCR Pipeline)</span>
                </h3>

                <button
                  type="button"
                  onClick={() => handleCopyText(selectedDoc.rawExtractedText)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800/80 rounded-md transition-colors"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#090d16] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[350px] whitespace-pre-wrap leading-relaxed select-text">
                {selectedDoc.rawExtractedText ? (
                  selectedDoc.rawExtractedText
                ) : (
                  <span className="text-slate-500 italic">
                    Nenhum texto extraído ainda ou arquivo em processamento.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
