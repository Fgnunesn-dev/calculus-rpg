# Preservação do aprendizado sem disco pago

Esta versão usa o Firestore por padrão para manter diagnósticos e conversas independentemente do disco do Render. O projeto `calculus-rpg` e seu banco `(default)` foram configurados no plano Spark, sem ativar faturamento. O plano gratuito continua sujeito às cotas do banco elegível do projeto.

## Ativação obrigatória

No console Firebase, selecione o projeto `calculus-rpg` e o banco `(default)`. Em **Firestore Database → Rules**, publique o conteúdo completo e atualizado de `firestore.rules` deste repositório.

As regras atualizadas acrescentam coleções privadas por conta:

- `/users/{uid}/examReports/{reportId}`: diagnóstico, questões, evidências de pontos fortes/fracos, restrições e recomendações.
- `/users/{uid}/tutorExchanges/{exchangeId}`: um par de pergunta/resposta por documento.

O servidor reutiliza o ID token Firebase já verificado e as requisições REST obedecem às regras do usuário. Não é necessário enviar uma chave de conta de serviço, adicionar Supabase ou copiar credenciais administrativas para o Render. Não publique regras abertas para resolver erros de permissão.

Se o Firestore estiver indisponível, negar permissão ou atingir a cota, o site informa a falha. Não há fallback automático que anuncie sucesso enquanto salva apenas em um disco temporário. A resposta de chat só é entregue como sucesso depois do salvamento do par na nuvem. Cada diagnóstico só é anunciado como salvo depois de persistir no Firestore.

## O que permanece e o que é temporário

| Informação | Destino |
| --- | --- |
| XP, nível, habilidades e progresso pessoal | Firestore, no perfil da conta |
| Checklist e caderno da trilha | Firestore, no estado do plano |
| Diagnóstico, pontos fortes e fracos e rota recomendada | Firestore, em examReports |
| Conversas do tutor | Firestore, em tutorExchanges |
| PDF ou foto original | Cache privado temporário no servidor |

Um diagnóstico continua acessível quando o PDF original desaparecer. Nesse caso, o botão para abrir o original é substituído por um aviso. A análise e seus pontos fortes/fracos permanecem disponíveis.

Os pares de conversa são gravados individualmente para não acumular todo o histórico em um documento com limite de 1 MiB. A tela carrega até 200 mensagens recentes; o tutor usa até 80, com limite adicional de caracteres. A lista de provas mostra até 100 diagnósticos recentes. Registros mais antigos não são apagados automaticamente por esses limites de leitura.

## Migração de dados que ainda estão no ambiente antigo

Após publicar as regras, abra **o localhost atualizado**, entre na conta Google que criou os registros e acesse o site. As APIs de provas e histórico copiam automaticamente apenas os diagnósticos e as conversas locais que pertencem ao UID autenticado. IDs estáveis tornam a migração repetida idempotente. Dados de demonstração sem proprietário não são atribuídos a uma pessoa.

Faça isso antes de desligar ou perder o ambiente antigo. Um deploy novo no Render não consegue ler o disco do seu computador. Dados que já desapareceram não podem ser reconstruídos por esta migração. Os originais PDF/imagem não são copiados para o Firestore.

## Verificação e limites

Os testes usam uma simulação da API REST e duas instâncias de servidor com discos locais distintos: após perder completamente o primeiro disco, a segunda instância recupera conversas, diagnósticos, pontos fortes e fracos. Também verificam isolamento por conta, migração local, limites de tamanho e comportamento em falhas de nuvem ou de cache de arquivos.

As regras foram publicadas no novo projeto. Login real e restauração de uma conversa após recarregar foram confirmados no localhost. Um segundo login e outro dispositivo ainda não foram testados. Os testes simulados não confirmam o estado do serviço remoto.

Referências: https://firebase.google.com/docs/firestore/use-rest-api e https://firebase.google.com/docs/firestore/quotas.

## Troca do projeto Starter para Spark

O projeto anterior do AI Studio foi mantido. O UID do mesmo e-mail pode mudar entre projetos Firebase: os dados antigos não são automaticamente atribuídos ao novo UID. Não altere proprietários de registros sem verificar a identidade nas duas contas. Os arquivos locais e o banco antigo devem ser preservados até uma migração específica. Uma conta nova no Spark pode iniciar sem o progresso do projeto anterior.

## Diagnóstico inicial pelas resoluções

Novas análises incluem avaliações por módulo, com passos observados do estudante e referência à questão. O painel mostra conhecimento demonstrado, em desenvolvimento, revisão necessária e tópicos ainda não avaliados. A árvore exibe evidências da prova e a organização sugere prioridades. A avaliação não concede XP nem inventa tentativas ou percentuais de domínio. As evidências mais recentes de cada tópico prevalecem; ausência de resposta não apaga um diagnóstico anterior. Provas antigas sem avaliação estruturada precisam ser reenviadas para gerar esse novo diagnóstico.

Validação: 39 testes automatizados, TypeScript e build de produção; chamada real ao Gemini com duas provas sintéticas confirmou acerto de fatoração, erro de limite e ausência de diagnóstico pessoal quando há apenas enunciados. Nenhum diagnóstico sintético foi salvo numa conta real.
