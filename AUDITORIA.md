# Revisão de segurança e funcionalidade — 29/10/2026

## Resultado e alcance

A suíte automatizada passou em 28 testes. TypeScript passou. O npm audit retornou zero vulnerabilidades conhecidas após atualizar esbuild e a dependência transitiva gRPC. Dois testes reais com Gemini passaram: análise de um PDF sintético de uma questão e recuperação de um parâmetro informado em uma conversa anterior. Os dados usados nesses testes eram fictícios.

Isso não constitui garantia de ausência de vulnerabilidades nem certificação de todos os fluxos em produção. A integração do navegador retornou `browser.user is unavailable`, impedindo a validação automática dos cliques. O login Google real, a publicação das regras e a sincronização Firestore entre duas contas/dispositivos precisam de uma rodada de validação no ambiente administrativo e no domínio final.

## Correções

- O gráfico deixou de executar `new Function`: agora aceita apenas uma gramática matemática com números, x, constantes e funções permitidas, com limites de comprimento e profundidade.
- APIs verificam token Firebase e propriedade dos documentos, incluindo leitura do original, reprocessamento e exclusão. Conversas são privadas por UID.
- Uploads verificam assinatura binária, MIME permitido, tamanho, quantidade de arquivos e campos. A extensão armazenada vem do MIME validado.
- Caminhos de armazenamento rejeitam travessia de diretórios, caminhos absolutos e separadores inválidos. Arquivos privados ficam fora de public e são negados também pelo servidor Vite.
- Limites de requisições protegem autenticação e chamadas de IA/OCR. Respostas privadas usam no-store. Respostas de erro não expõem stack traces ou mensagens internas do provedor.
- Cabeçalhos de segurança e CSP de produção foram adicionados, mantendo suporte a pop-ups do Google. Desenvolvimento passa a escutar apenas em 127.0.0.1.
- Diagnósticos de IA exigem booleano real e explicação; uma string como "false" não pode ser interpretada como acerto.
- Arena bloqueia envios concorrentes e recompensa repetida na mesma resolução, aguardando o salvamento antes de anunciar sucesso.
- O adaptador local deixou de informar que usa S3 remoto quando somente configurações de ambiente estavam presentes.
- A leitura de PDFs não tenta mais apresentar bytes binários como extração de texto quando a IA está indisponível. O arquivo é preservado e o processamento informa falha.
- A base documental usa gravação atômica, só atualiza o estado em memória após salvar e não inicia silenciosamente vazia se o JSON estiver corrompido.
- Fórmulas têm limite de expansão e não permitem recursos HTML confiáveis. Renderização matemática e proteção contra injeção têm testes.
- O plano de estudos preserva a cópia local mais recente após uma falha de sincronização, em vez de substituí-la automaticamente por uma versão remota antiga.

## Matriz de validação

| Função | Verificação realizada | Resultado / limite |
| --- | --- | --- |
| Autenticação | Token ausente, forjado e identidade validada em middleware injetado no teste | Passou; OAuth Google real não exercitado |
| Isolamento de contas | Alice/Bob em listagem, detalhe, arquivo, reprocessamento, exclusão e histórico | Passou com identidades de teste |
| Upload e leitura | Multipart PDF válido, original recuperado, assinatura falsa, SVG e arquivo ausente | Passou com arquivos sintéticos |
| Análise de provas e painel | API completa com IA simulada; PDF sintético também analisado pelo Gemini real | Passou; cliques/renderização final do relatório pendentes |
| Tutor | Histórico enviado com papéis user/model; persistência e retomada; teste real de referência anterior | Passou |
| Arena | Validação de campos e resposta estruturada; prevenção de valor booleano falso e chamadas concorrentes revisada | API e parser passaram; interação visual pendente |
| Matemática | Limites antigos, frações, radicais, negrito e fórmulas inválidas | Passou |
| Gráfico | Precedência, potências, funções trigonométricas, domínio e tentativas de executar código | Passou |
| Organização | Revisão de escopo por UID, salvamento local/remoto e falhas de sincronização | Revisado; Firestore real e interface pendentes |
| Dependências | npm audit | 0 vulnerabilidades conhecidas |
| Compilação | TypeScript e build Vite | Passou; aviso de tamanho do bundle permanece |

## Execução

Use Node 24.12 ou superior:

```sh
npm install
npm test
npm run lint
npm run build
npm audit
```

O teste opcional `node --import tsx scripts/live-ai-smoke.ts` usa a chave local de Gemini, envia somente dados fictícios e pode consumir cota da API. A suíte padrão não usa serviços externos para analisar provas.

## Pontos para publicação

- Publique as regras do Firestore no banco correto e teste duas contas reais no domínio final. As regras em disco não confirmam o estado do Firebase remoto.
- Hospede o backend Node em produção, com HTTPS e disco persistente para data. CSP e limites de requisições não substituem controle de custos no provedor, backups e monitoramento.
- O progresso é pessoal e editável pelo proprietário da conta. Não é um sistema de notas oficiais, premiação financeira ou ranking resistente a adulteração por clientes.
- Os PDFs/fotos pessoais e o banco documental presentes no repositório original foram retirados do conjunto versionado nesta branch. As cópias locais foram preservadas. Isso não apaga versões já existentes no histórico Git remoto; histórico antigo deve ser tratado separadamente se sua exposição foi indesejada.
- A chave de Gemini, conversas, arquivos de usuários e bancos locais não entram no commit. A configuração web pública do Firebase é identificadora do projeto e continua no frontend; o controle de acesso depende das regras e dos tokens.
