# Preservação do aprendizado sem disco pago

Esta versão usa o Firestore por padrão para manter diagnósticos e conversas independentemente do disco do Render. Não cria outro banco nem ativa faturamento. O plano gratuito continua sujeito às cotas do banco elegível do projeto.

## Ativação obrigatória

No console Firebase, selecione o projeto `useful-sorter-pv8b6` e o banco `ai-studio-calculusrpg-b0acb931-cf8a-4bbe-9cb9-bffe34917db5`. Em **Firestore Database → Rules**, publique o conteúdo completo e atualizado de `firestore.rules` deste repositório.

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

A publicação efetiva das regras e um teste com dois logins reais ainda precisam ser realizados no Firebase do proprietário. Os testes simulados não confirmam o estado do serviço remoto.

Referências: https://firebase.google.com/docs/firestore/use-rest-api e https://firebase.google.com/docs/firestore/quotas.
