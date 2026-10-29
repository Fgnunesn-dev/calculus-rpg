# CALCULUS RPG — Plataforma Inteligente de Cálculo A (UFBA)

Plataforma full-stack adaptativa e personalizada de aprendizagem de Cálculo A, desenhada especificamente para estudantes de Engenharia da UFBA matriculados na disciplina com a **Profa. Graça Luzia Dominguez Santos**.

Combina tutoria pedagógica com inteligência artificial, pipeline de ingestão documental com armazenamento compatível com S3 e OCR, autópsia forense de provas anteriores e mecânicas de progressão inspiradas em RPGs modernos.

---

## 1. Arquitetura do Sistema

```
[Cliente Web (React + TS + Tailwind v4 + KaTeX)]
       │
       ▼ (REST / FormData / JSON)
[Servidor Full-Stack (Node.js + Express / tsx)]
       │
       ├──► [S3 Storage Adapter] ──► Bucket 'calculus-rpg-documents' (Local / AWS S3 / MinIO)
       ├──► [Document Database]  ──► Repositório persistente com schema e metadados
       ├──► [Pipeline OCR]       ──► Extração de texto bruto, fórmulas LaTeX e questões (Gemini / Tesseract)
       └──► [Tutor & Diagnóstico] ──► Mentor com 6 modos e hierarquia de 5 níveis de dicas
```

### Tecnologias Utilizadas
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, KaTeX (renderização de fórmulas), Lucide Icons, Canvas/SVG interativo para gráficos e retas tangentes.
- **Backend**: Node.js, Express, Multer para parsing multipart, Tsx.
- **Persistência & Autenticação**: Firebase Firestore (`ai-studio-calculusrpg-b0acb931-cf8a-4bbe-9cb9-bffe34917db5`) e Firebase Authentication com Google Sign-In.
- **Regras de Segurança**: `firestore.rules` endurecidas com validação de esquema em duas fases e proteção ABAC.
- **Armazenamento S3**: Camada compatível com S3 (AWS S3, MinIO, Cloudflare R2 ou armazenamento durável local).
- **OCR & Processamento Documental**: Pipeline multi-motor com extração de texto bruto, segmentação de exercícios e detecção de fórmulas matemáticas.
- **IA Pedagógica**: Integração server-side com modelo Gemini 3.8 Flash (`gemini-3.8-flash`) com header de telemetria `aistudio-build`.

---

## 2. Estrutura de Pastas

```
├── server.ts                 # Servidor Full-Stack Express + rotas de API + Vite middleware
├── server/
│   ├── s3Storage.ts          # Serviço de armazenamento de objetos compatível com S3
│   ├── documentDb.ts         # Repositório de banco de dados documental e metadados
│   └── ocrPipeline.ts        # Pipeline assíncrono de OCR e segmentação de exercícios
├── src/
│   ├── App.tsx               # Orquestrador da aplicação e gerenciador de estado
│   ├── main.tsx              # Ponto de entrada do React
│   ├── index.css             # Estilos globais e tokens Tailwind v4
│   ├── types/
│   │   └── calculus.ts       # Interfaces e modelos de dados do Cálculo A
│   ├── data/
│   │   └── initialData.ts    # Base com dados reais da UFBA (Listas 1 e 2, 1ª Prova e Notas)
│   └── components/
│       ├── TopBar.tsx            # Navegação de 3 zonas com contrato de design estrito
│       ├── CommandCenter.tsx     # Painel principal que responde às 5 perguntas essenciais
│       ├── LearningArena.tsx     # Arena com ciclo adaptativo de 10 passos e teclado LaTeX
│       ├── AiTutor.tsx           # Mentor particular de IA com 6 modos e 5 níveis de dicas
│       ├── DocumentLibrary.tsx   # Biblioteca de materiais com upload S3 e visualizador de OCR
│       ├── DiagnosticCenter.tsx  # Autópsia forense da 1ª Prova (nota 0.8) com caneta vermelha
│       ├── SkillTree.tsx         # Árvore de talentos em constelação RPG com pré-requisitos
│       ├── FunctionGrapher.tsx   # Visualizador geométrico 2D com retas tangentes dinâmicas
│       ├── MathKeypad.tsx        # Teclado virtual com notações matemáticas de Cálculo A
│       └── MathView.tsx          # Renderizador de fórmulas KaTeX inline e em bloco
└── public/
    └── assets/aistudio/      # Documentos PDF originais da Profa. Graça Luzia Dominguez
```

---

## 3. Modelo de Dados

### Entidade `StoredDocument`
- `id`: Identificador único (UUID)
- `originalName`: Nome original do arquivo (e.g. `1alista-ClculoA-2026-2.pdf`)
- `mimeType`: Tipo MIME (`application/pdf`, `image/jpeg`, `image/png`)
- `sizeBytes`: Tamanho em bytes
- `uploadedAt`: Data e hora ISO do envio
- `s3Bucket`: Nome do bucket S3 de destino
- `s3Key`: Chave do objeto no bucket S3 (e.g. `uploads/2026/doc-123.pdf`)
- `s3Url`: URI de acesso público ou pré-assinado
- `status`: Estado do processamento (`pending` | `processing` | `completed` | `failed`)
- `rawExtractedText`: Conteúdo textual integral extraído pelo OCR
- `ocrEngine`: Motor responsável (`gemini_vision` | `tesseract` | `native_pdf`)
- `detectedExercises`: Lista de questões extraídas com número, enunciado e grau de confiança

---

## 4. Como Executar

### Pré-requisitos
- Node.js >= 24.12 (compatível com as dependências atuais de Firebase e Vite)
- Variável `GEMINI_API_KEY` (injetada automaticamente pelo ambiente)

### Comandos
```bash
# Instalação de dependências
npm install

# Execução em desenvolvimento (servidor full-stack na porta 3000)
npm run dev

# Verificação de tipos e sintaxe
npm run lint

# Build de produção
npm run build
```

### Organização e trilha de estudos

A aba **Organização** contém 14 módulos e 55 etapas: fundamentos, núcleo de Cálculo A e continuação até cálculo vetorial. Cada módulo inclui critérios de resolução, exemplo autoral, acesso à arena e referências de leitura. A continuação é complementar e não representa confirmação de conteúdo cobrado na disciplina.

Checklist, anotações por módulo, meta semanal e dias de estudo ficam separados por conta e são sincronizados com o Firestore quando o login e as regras estão configurados. Há uma cópia local por UID; visitantes usam um espaço local separado. A marcação manual não concede XP ou maestria. O registro do dia pode ser desfeito.

As referências externas incluem o curso de Cálculo 1 do GMA/UFF e os livros gratuitos da OpenStax. São links de leitura; os enunciados das listas e as restrições de método da professora têm prioridade. Os oito desafios adicionais e os exemplos da trilha são autorais, identificados como complementares.

Para habilitar a correção por IA, configure `GEMINI_API_KEY` em um arquivo `.env` local a partir de `.env.example`. Sem a chave, a arena informa que a avaliação está indisponível; não inventa um diagnóstico nem concede XP. A validação com IA recebe a justificativa do estudante e as restrições do exercício. O serviço externo não foi validado sem credenciais.

### Contas pessoais e provas

O painel começa vazio para cada pessoa. Após o login Google, **Minhas provas** permite enviar um PDF ou imagem para criar um diagnóstico e uma rota de estudo pessoais. As APIs validam o token Firebase e restringem cada documento ao proprietário. Consulte [CONFIGURACAO.md](CONFIGURACAO.md) para habilitar o domínio local, publicar as regras do Firestore e configurar a chave da IA. O erro de login observado foi `auth/unauthorized-domain`; é necessário adicionar `localhost` no console Firebase.

---

## 5. Endpoints da API

- `POST /api/documents/upload`: Upload de arquivos (PDF, JPG, PNG) para o S3 com inicialização do pipeline OCR.
- `GET /api/documents`: Lista todos os documentos registrados e metadados S3.
- `GET /api/documents/:id`: Recupera documento com texto bruto extraído e questões identificadas.
- `POST /api/documents/:id/reprocess`: Dispara reprocessamento do OCR para um documento existente.
- `POST /api/tutor/chat`: Conversa pedagógica com o Tutor de IA em 6 modos.
- `POST /api/tutor/diagnose-step`: Análise diagnóstica de passos algébricos com taxonomia de erros.

### Memória persistente no Render Free

Conversas e diagnósticos agora usam o Firestore por padrão, separados por conta, enquanto os PDFs originais ficam em cache temporário. Publique as novas regras antes de usar esta versão. O guia MEMORIA-NUVEM.md explica a ativação, as cotas e a migração do histórico local ainda existente. Não é necessária outra chave administrativa nem um disco pago para preservar o aprendizado.
