# Publicação no Render

Use **New → Web Service**, conecte o repositório `Fgnunesn-dev/calculus-rpg` e selecione a branch `codex/security-functional-audit`. A main ainda contém a versão anterior. Não use Static Site: o backend é necessário para IA e documentos privados.

| Campo | Valor |
| --- | --- |
| Language | Node |
| Branch | codex/security-functional-audit |
| Root Directory | vazio |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/` |

Em **Environment**, adicione:

| Nome | Valor |
| --- | --- |
| NODE_VERSION | `24` |
| NODE_ENV | `production` |
| GEMINI_API_KEY | sua chave, inserida diretamente no painel do Render |
| GEMINI_MODEL | `gemini-3.5-flash-lite` |

Não adicione a chave ao GitHub. Não é necessário definir PORT: o servidor usa a variável fornecida pelo Render e escuta em todas as interfaces no modo de produção. O comando de build instala também as dependências de desenvolvimento, pois o projeto usa tsx para iniciar o servidor TypeScript.

## Memória persistente no Render Free

Pode usar **Free** sem disco pago para preservar o aprendizado. O backend usa o Firestore por padrão para diagnósticos (incluindo pontos fortes/fracos, notas legíveis e recomendações) e conversas. XP, habilidades, checklist e anotações continuam no Firestore como antes.

**Antes de usar esta versão**, publique o conteúdo atualizado de `firestore.rules` no banco indicado em `firebase-applet-config.json`. As novas coleções privadas são `/users/{uid}/examReports` e `/users/{uid}/tutorExchanges`. O servidor usa o token Firebase do usuário: não precisa de chave administrativa nova nem de Supabase. Sem as novas regras, a API exibe um erro e não anuncia salvamento na nuvem.

Os arquivos PDF/JPG/PNG originais continuam temporários no disco do Render. Eles podem desaparecer ao suspender, reiniciar ou republicar. Isso não apaga os diagnósticos e conversas já salvos no Firestore; a interface informa quando o original não está disponível. Para preservar os binários também, seria necessário armazenamento de arquivos externo ou disco persistente pago.

A gratuidade depende da cota do banco Firestore elegível do projeto. Confirme a cota e o plano no console; esta alteração não ativa cobrança nem cria outro banco. O Render continua sujeito à suspensão por inatividade do plano Free e o Gemini mantém suas próprias cotas.

## Depois do deploy

1. Abra a URL `https://nome-do-servico.onrender.com` fornecida pelo Render.
2. No Firebase, acesse Authentication → Settings → Authorized domains e adicione `nome-do-servico.onrender.com`, sem protocolo e sem barra final.
3. Confirme que Google está habilitado em Sign-in method e que as regras de `firestore.rules` estão publicadas no banco indicado em `firebase-applet-config.json`.
4. Teste login, anotações na trilha, uma conversa de duas mensagens e upload de uma prova. Recarregue a página para confirmar a persistência.

Ao acessar o servidor local atualizado com sua conta, históricos e diagnósticos locais que pertencem ao seu UID são copiados para o Firestore. Faça isso antes de encerrar ou apagar o ambiente antigo. Dados locais não podem ser recuperados se o ambiente antigo já foi perdido. Os PDFs originais não são migrados. A publicação no Render não foi realizada nesta sessão; o arquivo descreve a configuração a usar.

Referências oficiais: https://render.com/docs/deploy-node-express-app, https://render.com/docs/disks e https://render.com/docs/free.
