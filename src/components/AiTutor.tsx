import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, BookOpen, HelpCircle, 
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { TutorChatMessage } from '../types/calculus';
import { MathView } from './MathView';

export const AiTutor: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'aprender' | 'praticar' | 'investigar_erro' | 'revisar' | 'desafio' | 'modo_prova'>('aprender');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'tutor',
      mode: 'aprender',
      content: `Olá, Fabricio! Sou o seu **Tutor de IA de Cálculo A**, alinhado ao programa oficial da **Profa. Graça Luzia Dominguez Santos** no IME/UFBA.

Estou com acesso às suas duas listas de exercícios, às notas de aula sobre variação de funções e à correção da sua 1ª Prova (onde identificamos pontos cruciais em limites com conjugado e continuidade).

Como posso te guiar hoje? Você pode escolher um dos modos acima ou clicar em uma das dúvidas frequentes da disciplina.`,
      timestamp: '12:00',
      suggestedPrompts: [
        'Explique por que multiplicar pelo conjugado elimina a indeterminação [0/0] ou [∞ - ∞]',
        'Como provar que lim_{x->-infty} ln(...) * sen(x) = 0 pelo Teorema do Confronto?',
        'Qual a diferença entre derivabilidade e continuidade na função por partes da Q4 da prova?',
        'Como achar a reta tangente perpendicular a uma reta dada na Q3?'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: TutorChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: activeMode,
          hintLevel: activeMode === 'praticar' ? hintLevel : 1,
          contextTopic: 'Cálculo A (MATA02) — UFBA'
        })
      });

      const data = await response.json();

      const tutorMsg: TutorChatMessage = {
        id: `msg-${Date.now()}-reply`,
        sender: 'tutor',
        mode: activeMode,
        content: data.content || 'Resposta recebida do mentor pedagógico.',
        hintLevel: data.hintLevel,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, tutorMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: TutorChatMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'system',
        content: 'Não foi possível conectar ao tutor de IA no momento. Verifique a conexão com o servidor.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const modes = [
    { id: 'aprender', label: '1. Aprender', desc: 'Explicações e intuição geométrica' },
    { id: 'praticar', label: '2. Praticar', desc: 'Exercícios com 5 níveis de dicas' },
    { id: 'investigar_erro', label: '3. Investigar Erro', desc: 'Análise da sua tentativa real' },
    { id: 'revisar', label: '4. Revisar', desc: 'Recuperação espaçada' },
    { id: 'desafio', label: '5. Desafio', desc: 'Problemas sem assistência imediata' },
    { id: 'modo_prova', label: '6. Modo Prova', desc: 'Simulação com rigor da UFBA' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-[#121828] border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
              MENTORIA INTELIGENTE DE CÁLCULO A
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400 font-mono">Grounded nos Documentos da UFBA</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            AI Tutor — Professor Particular
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hierarquia pedagógica de 5 níveis de dicas. Nunca fornece a resposta final sem que você construa o raciocínio.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Diretrizes Profa. Graça (2026.2)</span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {modes.map((m) => {
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMode(m.id as any)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-purple-950/80 border-purple-600 text-purple-200 shadow-md shadow-purple-950/40'
                  : 'bg-[#121828] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold font-mono">{m.label}</div>
              <div className="text-[10px] text-slate-500 line-clamp-1">{m.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isTutor = msg.sender === 'tutor';
            const isSystem = msg.sender === 'system';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isTutor ? 'items-start' : isSystem ? 'justify-center' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar */}
                {isTutor && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isTutor
                      ? 'bg-[#141b2d] border border-slate-700/80 text-slate-200'
                      : isSystem
                      ? 'bg-rose-950/30 border border-rose-800/50 text-rose-300'
                      : 'bg-purple-600 text-white shadow-md'
                  }`}
                >
                  {isTutor && msg.mode && (
                    <div className="text-[10px] uppercase font-mono font-bold text-purple-400 mb-1 flex items-center justify-between">
                      <span>Modo: {msg.mode}</span>
                      <span className="text-slate-500">{msg.timestamp}</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content}
                  </div>

                  {msg.suggestedPrompts && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-1.5">
                      <div className="text-[10px] font-mono text-purple-300 font-semibold">
                        Perguntas frequentes para esta sessão:
                      </div>
                      <div className="flex flex-col gap-1">
                        {msg.suggestedPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            className="text-left text-[11px] p-1.5 rounded-lg bg-slate-900/80 hover:bg-purple-950/70 border border-slate-700/60 text-slate-300 hover:text-purple-200 transition-colors"
                          >
                            → {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="flex gap-3 items-center text-xs text-purple-300 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              </div>
              <span>O Tutor está elaborando uma intervenção pedagógica...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800 mt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua dúvida ou cole seu raciocínio passo a passo..."
              disabled={isSending}
              className="flex-1 bg-[#121828] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Enviar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
