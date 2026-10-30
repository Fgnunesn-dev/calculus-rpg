# Login Google, progresso e análise de provas

## 1. Liberar o login no ambiente local

O projeto atual é `calculus-rpg`, no plano gratuito Spark. Google está habilitado e `localhost` consta nos domínios autorizados. O projeto anterior do AI Studio Starter bloqueava a ativação da Token Service API; ele foi preservado, mas não é mais a configuração ativa.

1. Abra https://console.firebase.google.com/project/calculus-rpg/authentication/settings.
2. Em **Authentication → Settings → Authorized domains**, adicione `localhost` (somente o domínio, sem `http://` e sem `:3000`).
3. Em **Authentication → Sign-in method**, habilite **Google** e configure o e-mail de suporte, caso ainda não esteja habilitado.
4. Abra http://localhost:3000 no Chrome ou Edge e clique em **Entrar com Google**. O navegador interno pode bloquear a janela de autenticação.
5. Ao publicar, adicione também o domínio real do site.

É necessário acesso administrativo ao projeto Firebase. Se esse projeto não estiver na sua conta, crie um Firebase próprio, habilite Authentication e Firestore e substitua `firebase-applet-config.json` pelos dados do seu aplicativo web. O servidor usa o mesmo `projectId` para verificar os tokens. Nunca coloque uma chave de conta de serviço no frontend.

## 2. Aplicar as regras do progresso

Na seção **Firestore Database**, selecione o banco `(default)` (ou o ID configurado no arquivo JSON). Na aba **Rules**, publique o conteúdo de `firestore.rules` deste projeto.

Cada pessoa acessa somente `/users/{seu uid}`. O perfil e as habilidades ficam no documento do usuário; a organização fica em `/users/{uid}/state/planner`. O indicador de sincronização informa se o salvamento na nuvem foi concluído. Sem login, a trilha fica apenas neste navegador. Contas novas começam sem notas, tentativas e dificuldades herdadas do perfil de demonstração.

As regras deste repositório foram publicadas no banco `(default)` do projeto `calculus-rpg`. Login Google real confirmado no localhost. Uma mensagem real do tutor foi salva e recuperada do Firestore após recarregar a página. A sincronização em um segundo dispositivo ainda não foi testada.

## 3. Habilitar a IA

Crie um arquivo `.env` na raiz do projeto com:

```dotenv
GEMINI_API_KEY=sua_chave_real
GEMINI_MODEL=gemini-3.5-flash-lite
```

Obtenha a chave no Google AI Studio e confirme que o modelo e a cota estão disponíveis na sua conta. A chave fica somente no servidor. Reinicie o servidor após alterar `.env`. O modelo pode ser substituído por outro compatível com PDF/imagens e saída JSON na sua conta.

Sem a chave, a análise de provas retorna uma mensagem de indisponibilidade e não gera um diagnóstico fictício.

## 4. Usar uma prova para criar o painel

Após entrar: **Minhas provas → selecionar PDF/JPG/PNG → Analisar e montar meu painel**.

Envie a prova completa em um PDF ou uma imagem legível, até 25 MB. Inclua suas respostas e as correções. A tela informa que o arquivo será enviado ao Gemini. O diagnóstico retorna resumo, notas somente quando legíveis, questões, evidências de dificuldades, pontos de apoio, restrições de método e módulos recomendados. A recomendação abre o módulo correspondente da trilha e cada questão oferece um exercício de reforço.

O painel usa a análise da prova selecionada. Se houver apenas enunciados, o serviço é instruído a propor estudo por tópicos e declarar que não há evidência para diagnosticar erros pessoais. Todo resultado de IA deve ser conferido com o documento original.

## Armazenamento e publicação

As conversas e os diagnósticos agora são salvos no Firestore por conta. Publique as regras atualizadas antes de usar esta versão. Consulte [MEMORIA-NUVEM.md](MEMORIA-NUVEM.md) para ativação, limites e migração dos dados locais ainda existentes. O backend usa o token do usuário, sem chave administrativa nova.

Os PDFs e imagens originais continuam em cache privado temporário em data/private-files. O diagnóstico, os pontos fortes/fracos e a conversa permanecem na nuvem mesmo quando esses originais desaparecerem. O arquivo data/documents.json é apenas índice local dos originais disponíveis e fonte de migração de diagnósticos antigos.

A prova e os uploads antigos da demonstração foram preservados em `data/legacy-private/`. Não há migração automática para uma conta: envie a prova novamente após entrar.

Ao hospedar para outras pessoas, execute o backend Node em produção, use HTTPS e publique as regras do Firestore. O Render Free pode preservar o aprendizado na nuvem; disco persistente só é necessário se quiser preservar também os arquivos binários originais nesta arquitetura. Não basta hospedar somente `dist/`, pois as APIs de análise e os arquivos privados precisam do servidor. O servidor de desenvolvimento no localhost é para análise local. Limites de uso e custos da IA devem ser configurados na conta do provedor antes de uma abertura pública ampla.

## Validação realizada

- TypeScript e build de produção.
- Testes de contas sem histórico herdado, identidade validada, propriedade dos documentos e análise sem notas inventadas pelo parser.
- Requisições sem token e com token inválido bloqueadas pela API.
- Login Google e conversa Gemini reais foram confirmados no localhost, com recuperação do histórico após recarregar. Upload e análise de provas são cobertos pelos testes automatizados; não foi enviada uma prova pessoal ao novo projeto durante esta configuração.

Referências: https://firebase.google.com/docs/auth/web/google-signin e https://firebase.google.com/docs/auth/admin/verify-id-tokens.
