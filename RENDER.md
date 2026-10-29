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

## Dados persistentes

Para conservar provas, análises e conversas, use um Web Service pago e adicione um Persistent Disk montado em:

```text
/opt/render/project/src/data
```

Esse caminho pressupõe o runtime nativo Node e Root Directory vazio, como na tabela. Apenas arquivos sob o mount são preservados.

É possível testar a interface no Free, mas esse plano não aceita disco persistente. Nesse caso, provas, análises e conversas gravadas em disco serão perdidas em reinícios, redeploys e suspensão por inatividade. O progresso sincronizado com Firestore é independente desse disco.

## Depois do deploy

1. Abra a URL `https://nome-do-servico.onrender.com` fornecida pelo Render.
2. No Firebase, acesse Authentication → Settings → Authorized domains e adicione `nome-do-servico.onrender.com`, sem protocolo e sem barra final.
3. Confirme que Google está habilitado em Sign-in method e que as regras de `firestore.rules` estão publicadas no banco indicado em `firebase-applet-config.json`.
4. Teste login, anotações na trilha, uma conversa de duas mensagens e upload de uma prova. Recarregue a página para confirmar a persistência.

O localhost e seus arquivos atuais não são migrados automaticamente para o serviço. A publicação no Render não foi realizada nesta sessão; o arquivo descreve a configuração a usar.

Referências oficiais: https://render.com/docs/deploy-node-express-app, https://render.com/docs/disks e https://render.com/docs/free.
