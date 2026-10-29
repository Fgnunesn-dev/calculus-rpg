# Login Google, progresso e análise de provas

## 1. Liberar o login no ambiente local

O erro observado neste ambiente foi `auth/unauthorized-domain`.

1. Abra https://console.firebase.google.com/project/useful-sorter-pv8b6/authentication/settings.
2. Em **Authentication → Settings → Authorized domains**, adicione `localhost` (somente o domínio, sem `http://` e sem `:3000`).
3. Em **Authentication → Sign-in method**, habilite **Google** e configure o e-mail de suporte, caso ainda não esteja habilitado.
4. Abra http://localhost:3000 no Chrome ou Edge e clique em **Entrar com Google**. O navegador interno pode bloquear a janela de autenticação.
5. Ao publicar, adicione também o domínio real do site.

É necessário acesso administrativo ao projeto Firebase. Se esse projeto não estiver na sua conta, crie um Firebase próprio, habilite Authentication e Firestore e substitua `firebase-applet-config.json` pelos dados do seu aplicativo web. O servidor usa o mesmo `projectId` para verificar os tokens. Nunca coloque uma chave de conta de serviço no frontend.

## 2. Aplicar as regras do progresso

Na seção **Firestore Database**, selecione o banco `ai-studio-calculusrpg-b0acb931-cf8a-4bbe-9cb9-bffe34917db5` (ou o ID configurado no arquivo JSON). Na aba **Rules**, publique o conteúdo de `firestore.rules` deste projeto.

Cada pessoa acessa somente `/users/{seu uid}`. O perfil e as habilidades ficam no documento do usuário; a organização fica em `/users/{uid}/state/planner`. O indicador de sincronização informa se o salvamento na nuvem foi concluído. Sem login, a trilha fica apenas neste navegador. Contas novas começam sem notas, tentativas e dificuldades herdadas do perfil de demonstração.

As regras foram atualizadas localmente, mas não foram publicadas no Firebase por esta sessão. O login real e a sincronização entre dispositivos precisam ser conferidos depois da configuração na conta administrativa.

## 3. Habilitar a IA

Crie um arquivo `.env` na raiz do projeto com:

```dotenv
GEMINI_API_KEY=sua_chave_real
GEMINI_MODEL=gemini-3.8-flash
```

Obtenha a chave no Google AI Studio e confirme que o modelo e a cota estão disponíveis na sua conta. A chave fica somente no servidor. Reinicie o servidor após alterar `.env`. O modelo pode ser substituído por outro compatível com PDF/imagens e saída JSON na sua conta.

Sem a chave, a análise de provas retorna uma mensagem de indisponibilidade e não gera um diagnóstico fictício.

## 4. Usar uma prova para criar o painel

Após entrar: **Minhas provas → selecionar PDF/JPG/PNG → Analisar e montar meu painel**.

Envie a prova completa em um PDF ou uma imagem legível, até 25 MB. Inclua suas respostas e as correções. A tela informa que o arquivo será enviado ao Gemini. O diagnóstico retorna resumo, notas somente quando legíveis, questões, evidências de dificuldades, pontos de apoio, restrições de método e módulos recomendados. A recomendação abre o módulo correspondente da trilha e cada questão oferece um exercício de reforço.

O painel usa a análise da prova selecionada. Se houver apenas enunciados, o serviço é instruído a propor estudo por tópicos e declarar que não há evidência para diagnosticar erros pessoais. Todo resultado de IA deve ser conferido com o documento original.

## Armazenamento e publicação

As conversas do tutor são salvas por conta em `data/tutor-conversations/`, fora do controle de versão e da pasta pública. O servidor usa o histórico de até 80 mensagens recentes, limitado a aproximadamente 48 mil caracteres, além da pergunta atual; o arquivo guarda as últimas 200 mensagens. A API de histórico exige o mesmo token Firebase do chat. Trocar de tela não desmonta a conversa em andamento; ao recarregar a página, o histórico salvo é recuperado. Mensagens anteriores à implementação desta persistência que já foram perdidas não podem ser reconstruídas automaticamente.

Os novos arquivos ficam em `data/private-files/`, fora da pasta pública. As análises são persistidas em `data/documents.json`, com `ownerUid`. Todas as operações da API de documentos e provas verificam o token Firebase e a propriedade do registro; registros antigos sem proprietário não são compartilhados nem atribuídos automaticamente a alguém.

A prova e os uploads antigos da demonstração foram preservados em `data/legacy-private/`. Não há migração automática para uma conta: envie a prova novamente após entrar.

Ao hospedar para outras pessoas, execute o backend Node em produção, preserve a pasta `data` em armazenamento persistente, use HTTPS e publique as regras do Firestore. Não basta hospedar somente `dist/`, pois as APIs de análise e os arquivos privados precisam do servidor. O servidor de desenvolvimento no localhost é para análise local. Limites de uso e custos da IA devem ser configurados na conta do provedor antes de uma abertura pública ampla.

## Validação realizada

- TypeScript e build de produção.
- Testes de contas sem histórico herdado, identidade validada, propriedade dos documentos e análise sem notas inventadas pelo parser.
- Requisições sem token e com token inválido bloqueadas pela API.
- Login Google real e análise Gemini real dependem das configurações externas acima; não foram simulados como resultados de produção.

Referências: https://firebase.google.com/docs/auth/web/google-signin e https://firebase.google.com/docs/auth/admin/verify-id-tokens.
