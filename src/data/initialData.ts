import { ExerciseItem, SkillNode } from "../types/calculus";

export const INITIAL_SKILLS: SkillNode[] = [
  {
    "id": "algebra-fatoracao",
    "name": "Fatoração & Racionalização",
    "category": "algebra",
    "description": "Fatorar polinômios (diferença de quadrados, soma de cubos, raízes) e multiplicar por conjugado para desarmar 0/0.",
    "prerequisites": [],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "limites-laterais",
    "name": "Limites Laterais & Existência",
    "category": "limits",
    "description": "Cálculo e interpretação de lim_{x -> a^-} f(x) e lim_{x -> a^+} f(x) em gráficos e funções por partes.",
    "prerequisites": [
      "algebra-fatoracao"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "limites-indeterminados",
    "name": "Limites Indeterminados (0/0 e Inf - Inf)",
    "category": "limits",
    "description": "Eliminar indeterminações algébricas sem usar L'Hôpital (obrigatório para 1ª Prova da Profa. Graça).",
    "prerequisites": [
      "algebra-fatoracao"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "limites-trigonometricos",
    "name": "Limites Trigonométricos Fundamentais",
    "category": "limits",
    "description": "Aplicação do limite fundamental lim_{x -> 0} (sen x)/x = 1 e identidades trigonométricas para 1 - cos x.",
    "prerequisites": [
      "limites-indeterminados"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "continuidade-pontos",
    "name": "Continuidade & Extensão Contínua",
    "category": "limits",
    "description": "Três condições de continuidade em x_0 e determinação de parâmetros (a, b) em funções por partes.",
    "prerequisites": [
      "limites-laterais",
      "limites-indeterminados"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "teorema-confronto",
    "name": "Teorema do Confronto (Sanduíche)",
    "category": "limits",
    "description": "Produto de função limitada por infinitésimo: lim f(x)g(x) = 0 quando f -> 0 e g é limitada.",
    "prerequisites": [
      "limites-indeterminados"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "derivada-definicao",
    "name": "Derivada pela Definição Formal",
    "category": "derivatives_basics",
    "description": "Cálculo do limite do quociente de Newton lim_{x -> x_0} (f(x)-f(x_0))/(x-x_0) e limites laterais para pontos angulosos.",
    "prerequisites": [
      "limites-indeterminados",
      "continuidade-pontos"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "regras-derivacao-basicas",
    "name": "Regras de Derivação (Potência, Produto, Quociente)",
    "category": "derivatives_basics",
    "description": "Derivadas de polinômios, funções racionais, exponenciais e trigonométricas básicas.",
    "prerequisites": [
      "derivada-definicao"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "reta-tangente-normal",
    "name": "Equação da Reta Tangente & Normal",
    "category": "derivatives_basics",
    "description": "Interpretação geométrica da derivada: m = f'(x_0), equações y - y_0 = m(x - x_0) e retas perpendiculares m_1 * m_2 = -1.",
    "prerequisites": [
      "regras-derivacao-basicas"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "regra-da-cadeia",
    "name": "Regra da Cadeia & Derivação Composta",
    "category": "derivatives_advanced",
    "description": "(f o g)'(x) = f'(g(x)) * g'(x) e composição de múltiplas funções com funções trigonométricas inversas.",
    "prerequisites": [
      "regras-derivacao-basicas"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "derivacao-implicita",
    "name": "Derivação Implícita & Derivada da Inversa",
    "category": "derivatives_advanced",
    "description": "Derivar equações F(x, y) = 0 em relação a x isolando dy/dx e fórmula (f^-1)'(f(x)) = 1/f'(x).",
    "prerequisites": [
      "regra-da-cadeia"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "regra-lhospital",
    "name": "Regra de L'Hôpital",
    "category": "derivatives_advanced",
    "description": "Aplicação da regra para formas 0/0, inf/inf e transformações de 0 * inf e 1^inf.",
    "prerequisites": [
      "regra-da-cadeia"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "taxas-relacionadas",
    "name": "Taxas de Variação Relacionadas",
    "category": "derivatives_advanced",
    "description": "Modelagem de grandezas que variam no tempo (cone de areia, drenagem, gás PV=c, mancha de óleo).",
    "prerequisites": [
      "regra-da-cadeia",
      "derivacao-implicita"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  },
  {
    "id": "analise-variacao-extremos",
    "name": "Estudo da Variação, Extremos & Gráficos",
    "category": "function_analysis",
    "description": "Teoremas de Fermat, Rolle e Lagrange (TVM), testes de 1ª e 2ª derivada, concavidade, pontos de inflexão e assíntotas.",
    "prerequisites": [
      "reta-tangente-normal",
      "regra-da-cadeia"
    ],
    "masteryScore": 0,
    "status": "unlearned",
    "totalAttempts": 0,
    "successfulAttempts": 0,
    "evidence": []
  }
];

export const INITIAL_EXERCISES: ExerciseItem[] = [
  {
    "id": "ex-prova1-q1a",
    "listNumber": 0,
    "questionNumber": "1ª Prova — Q1.a",
    "title": "Limite no Infinito com Diferença de Radicais",
    "topic": "Limites",
    "subtopic": "Forma Indeterminada Infinito - Infinito",
    "difficulty": "intermediario",
    "xpReward": 60,
    "associatedSkills": [
      "limites-indeterminados",
      "algebra-fatoracao"
    ],
    "enunciadoLatex": "\\lim_{x \\to +\\infty} \\left( x - \\sqrt{x^2 + 8x} \\right)",
    "contextNotes": "Questão do acervo de Cálculo A. NÃO É PERMITIDO usar L'Hôpital (regra da prova da Profa. Graça).",
    "sourceDocument": "1ª Prova — Cálculo A (MATA02) 2026.2",
    "sourcePage": 1,
    "expectedAnswerLatex": "-4",
    "officialResolutionSteps": [
      "Identifique a indeterminação: quando x -> +infty, temos infty - infty.",
      "Multiplique e divida pela expressão conjugada: (x + \\sqrt{x^2+8x}).",
      "No numerador: (x - \\sqrt{x^2+8x})(x + \\sqrt{x^2+8x}) = x^2 - (x^2 + 8x) = -8x.",
      "No denominador, fatore x: x + \\sqrt{x^2(1 + 8/x)} = x(1 + \\sqrt{1 + 8/x}) (pois x > 0).",
      "Simplifique o termo x comum: \\frac{-8x}{x(1 + \\sqrt{1 + 8/x})} = \\frac{-8}{1 + \\sqrt{1 + 8/x}}.",
      "Calcule o limite quando x -> +infty: \\frac{-8}{1 + 1} = -4."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Que tipo de indeterminação você obtém ao substituir x por +\\infty?",
      "Lembre-se da técnica do conjugado: (A - B)(A + B) = A^2 - B^2.",
      "Multiplique o numerador e denominador por (x + \\sqrt{x^2 + 8x}).",
      "Após cancelar x^2 no numerador, coloque x em evidência no denominador para cancelar o x.",
      "O numerador simplifica para -8x e o denominador para x(1 + \\sqrt{1+8/x}), resultando em -8/2 = -4."
    ]
  },
  {
    "id": "ex-prova1-q1b",
    "listNumber": 0,
    "questionNumber": "1ª Prova — Q1.b",
    "title": "Limite Trigonométrico Fundamental",
    "topic": "Limites",
    "subtopic": "Indeterminação 0/0 com Cosseno",
    "difficulty": "intermediario",
    "xpReward": 55,
    "associatedSkills": [
      "limites-trigonometricos",
      "limites-indeterminados"
    ],
    "enunciadoLatex": "\\lim_{x \\to 0} \\frac{5x^2}{1 - \\cos x}",
    "contextNotes": "Proibido L'Hôpital nesta avaliação. Use identidades trigonométricas ou conjugado.",
    "sourceDocument": "1ª Prova — Cálculo A (MATA02) 2026.2",
    "sourcePage": 1,
    "expectedAnswerLatex": "10",
    "officialResolutionSteps": [
      "Substituindo x = 0, temos 0 / (1 - 1) = 0/0 (indeterminação).",
      "Multiplique numerador e denominador pelo conjugado (1 + \\cos x).",
      "Denominador: (1 - \\cos x)(1 + \\cos x) = 1 - \\cos^2 x = \\text{sen}^2 x.",
      "Reorganize: 5 \\cdot \\left(\\frac{x}{\\text{sen } x}\\right)^2 \\cdot (1 + \\cos x).",
      "Pelo limite trigonométrico fundamental: \\lim_{x \\to 0} \\frac{x}{\\text{sen } x} = 1.",
      "Logo, 5 \\cdot (1)^2 \\cdot (1 + 1) = 5 \\cdot 2 = 10."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Substituindo x=0 temos 0/0. Como transformar (1 - cos x) em sen(x)?",
      "Lembre-se da identidade fundamental: sen^2(x) + cos^2(x) = 1.",
      "Multiplique por (1 + cos x) / (1 + cos x).",
      "O denominador se torna sen^2(x). Agrupe o x^2 do numerador com sen^2(x).",
      "Temos 5 * (x/sen x)^2 * (1 + cos x). Como x/sen x -> 1 e cos 0 = 1, o resultado é 5 * 1 * 2 = 10."
    ]
  },
  {
    "id": "ex-prova1-q1d",
    "listNumber": 0,
    "questionNumber": "1ª Prova — Q1.d",
    "title": "Limite com Logaritmo e Teorema do Confronto",
    "topic": "Limites",
    "subtopic": "Infinitésimo x Função Limitada",
    "difficulty": "desafio",
    "xpReward": 75,
    "associatedSkills": [
      "teorema-confronto",
      "limites-indeterminados"
    ],
    "enunciadoLatex": "\\lim_{x \\to -\\infty} \\ln\\left( \\frac{x^3 + 5x + 7}{4 - 2x + x^3} \\right) \\cdot \\text{sen}(x)",
    "contextNotes": "Atenção ao argumento do logaritmo natural e à limitação da função seno.",
    "sourceDocument": "1ª Prova — Cálculo A (MATA02) 2026.2",
    "sourcePage": 1,
    "expectedAnswerLatex": "0",
    "officialResolutionSteps": [
      "Analise o limite do argumento interno da fração: \\lim_{x \\to -\\infty} \\frac{x^3 + 5x + 7}{x^3 - 2x + 4} = 1.",
      "Pela continuidade da função ln: \\lim_{x \\to -\\infty} \\ln\\left(\\dots\\right) = \\ln(1) = 0.",
      "Agora observe o fator \\text{sen}(x): ele NÃO possui limite no infinito, porém é estritamente limitado: -1 \\le \\text{sen}(x) \\le 1 para todo x real.",
      "Pelo Teorema do Confronto (ou teorema do infinitésimo por função limitada): se f(x) -> 0 e |g(x)| <= M, então lim f(x)g(x) = 0.",
      "Portanto, o limite é rigorosamente 0."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Analise primeiro o comportamento de \\frac{x^3+5x+7}{4-2x+x^3} quando x tende a -\\infty.",
      "Qual é o valor de \\ln(1)?",
      "O que sabemos sobre os valores possíveis de \\text{sen}(x) para qualquer x?",
      "Aplique o teorema: O produto de uma função que tende a zero por uma função limitada tende a zero.",
      "Como \\ln(1) = 0 e -1 \\le \\text{sen}(x) \\le 1, o limite total é 0."
    ]
  },
  {
    "id": "ex-prova1-q2",
    "listNumber": 0,
    "questionNumber": "1ª Prova — Q2",
    "title": "Determinação de Constantes para Continuidade",
    "topic": "Continuidade",
    "subtopic": "Função por Partes e Fatoração",
    "difficulty": "intermediario",
    "xpReward": 70,
    "associatedSkills": [
      "continuidade-pontos",
      "algebra-fatoracao",
      "limites-laterais"
    ],
    "enunciadoLatex": "f(x) = \\begin{cases} \\frac{x^2 + ax + b}{x + 1}, & \\text{se } x < -1 \\\\ x^2 - 5, & \\text{se } x \\ge -1 \\end{cases} \\quad \\text{Determine } a, b \\in \\mathbb{R} \\text{ para que } f \\text{ seja contínua em } x = -1.",
    "contextNotes": "Valor da questão na prova: 2,0 pontos. Exige justificativa formal.",
    "sourceDocument": "1ª Prova — Cálculo A (MATA02) 2026.2",
    "sourcePage": 1,
    "expectedAnswerLatex": "a = -2, \\; b = -3",
    "officialResolutionSteps": [
      "Para ser contínua em x = -1, é necessário que: f(-1) = \\lim_{x \\to -1^+} f(x) = \\lim_{x \\to -1^-} f(x).",
      "1) Pela definição da função: f(-1) = (-1)^2 - 5 = 1 - 5 = -4.",
      "2) Limite pela direita: \\lim_{x \\to -1^+} (x^2 - 5) = -4.",
      "3) Limite pela esquerda: \\lim_{x \\to -1^-} \\frac{x^2 + ax + b}{x + 1} deve existir e ser igual a -4.",
      "Como o denominador tende a 0 ((-1) + 1 = 0), para o limite ser finito (-4), o numerador também deve tender a 0 em x = -1.",
      "Portanto, (-1)^2 + a(-1) + b = 0 \\implies 1 - a + b = 0 \\implies b = a - 1.",
      "Substituindo b: x^2 + ax + (a - 1) = (x + 1)(x + a - 1).",
      "O limite fica: \\lim_{x \\to -1^-} \\frac{(x + 1)(x + a - 1)}{x + 1} = \\lim_{x \\to -1^-} (x + a - 1) = -1 + a - 1 = a - 2.",
      "Igualando ao valor necessário (-4): a - 2 = -4 \\implies a = -2.",
      "Calculando b: b = a - 1 = (-2) - 1 = -3."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Qual é o valor de f(-1) usando o ramo para x >= -1?",
      "Para que o quociente com denominador tendendo a 0 resulte em um número real, o numerador também precisa zerar em x = -1.",
      "Iguale o numerador a zero em x = -1 para obter uma relação entre a e b: b = a - 1.",
      "Fatore o numerador com a raiz conhecida (x + 1) e simplifique com o denominador.",
      "O limite simplificado dá a - 2. Como f(-1) = -4, temos a - 2 = -4 => a = -2 e b = -3."
    ]
  },
  {
    "id": "ex-prova1-q3",
    "listNumber": 0,
    "questionNumber": "1ª Prova — Q3",
    "title": "Reta Tangente Perpendicular a Reta Dada",
    "topic": "Derivadas",
    "subtopic": "Equação da Reta Tangente",
    "difficulty": "intermediario",
    "xpReward": 50,
    "associatedSkills": [
      "reta-tangente-normal",
      "regras-derivacao-basicas"
    ],
    "enunciadoLatex": "f(x) = 2x^2 - 3x + 1. \\; \\text{Determine a equação da reta tangente ao gráfico que seja perpendicular à reta } x + 3y = 7.",
    "contextNotes": "Valor: 1,0 ponto. Lembre que retas perpendiculares satisfazem m_1 * m_2 = -1.",
    "sourceDocument": "1ª Prova — Cálculo A (MATA02) 2026.2",
    "sourcePage": 1,
    "expectedAnswerLatex": "y = 3x - \\frac{7}{2} \\quad \\text{ou} \\quad 6x - 2y - 7 = 0",
    "officialResolutionSteps": [
      "Isolando y na reta dada: 3y = -x + 7 \\implies y = -\\frac{1}{3}x + \\frac{7}{3}. O coeficiente angular é m_r = -\\frac{1}{3}.",
      "Como a reta tangente é perpendicular, seu coeficiente angular deve ser m_t = -\\frac{1}{m_r} = -\\frac{1}{-1/3} = 3.",
      "O coeficiente angular da tangente em x_0 é a derivada f'(x_0).",
      "Calculando a derivada: f'(x) = 4x - 3.",
      "Igualando a m_t: 4x_0 - 3 = 3 \\implies 4x_0 = 6 \\implies x_0 = \\frac{3}{2}.",
      "Calculando o ponto de tangência y_0 = f(3/2): f(3/2) = 2(3/2)^2 - 3(3/2) + 1 = 2(9/4) - 9/2 + 1 = 9/2 - 9/2 + 1 = 1.",
      "Ponto de tangência: (3/2, 1).",
      "Equação da reta tangente: y - y_0 = m_t(x - x_0) \\implies y - 1 = 3\\left(x - \\frac{3}{2}\\right) \\implies y = 3x - \\frac{7}{2}."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Qual é o coeficiente angular da reta x + 3y = 7?",
      "Se duas retas são perpendiculares, qual a relação entre suas inclinações?",
      "A inclinação desejada é m = 3. Onde a derivada f'(x) é igual a 3?",
      "Resolva 4x - 3 = 3 para achar x_0, e depois calcule y_0 = f(x_0).",
      "Temos x_0 = 3/2 e f(3/2) = 1. A reta é y - 1 = 3(x - 3/2) => y = 3x - 7/2."
    ]
  },
  {
    "id": "ex-prova1-q4",
    "listNumber": 0,
    "questionNumber": "1ª Prova — Q4",
    "title": "Derivabilidade de Função por Partes pela Definição",
    "topic": "Derivadas",
    "subtopic": "Quociente de Newton e Derivadas Laterais",
    "difficulty": "desafio",
    "xpReward": 70,
    "associatedSkills": [
      "derivada-definicao",
      "continuidade-pontos"
    ],
    "enunciadoLatex": "f(x) = \\begin{cases} \\frac{4}{x} - 4, & \\text{se } x > 1 \\\\ 2x - 2, & \\text{se } x \\le 1 \\end{cases} \\quad \\text{Usando a definição de derivada, verifique se } f \\text{ é derivável em } x = 1.",
    "contextNotes": "Valor: 1,0 ponto. OBRIGATÓRIO usar o limite do quociente de Newton (f(x)-f(1))/(x-1).",
    "sourceDocument": "1ª Prova — Cálculo A (MATA02) 2026.2",
    "sourcePage": 1,
    "expectedAnswerLatex": "\\text{Não é derivável em } x = 1 \\; (f'_-(1) = 2 \\ne f'_+(1) = -4)",
    "officialResolutionSteps": [
      "Primeiro note que f(1) = 2(1) - 2 = 0.",
      "Para que f seja derivável em x = 1, o limite bilateral \\lim_{x \\to 1} \\frac{f(x) - f(1)}{x - 1} deve existir, o que exige f'_-(1) = f'_+(1).",
      "Calculando a derivada lateral à esquerda f'_-(1):",
      "f'_-(1) = \\lim_{x \\to 1^-} \\frac{(2x - 2) - 0}{x - 1} = \\lim_{x \\to 1^-} \\frac{2(x - 1)}{x - 1} = 2.",
      "Calculando a derivada lateral à direita f'_+(1):",
      "f'_+(1) = \\lim_{x \\to 1^+} \\frac{(4/x - 4) - 0}{x - 1} = \\lim_{x \\to 1^+} \\frac{\\frac{4 - 4x}{x}}{x - 1} = \\lim_{x \\to 1^+} \\frac{-4(x - 1)}{x(x - 1)} = \\lim_{x \\to 1^+} \\frac{-4}{x} = -4.",
      "Como f'_-(1) = 2 \\ne -4 = f'_+(1), as derivadas laterais são distintas.",
      "Conclusão: f NÃO é derivável em x = 1 (existe um ponto anguloso no gráfico)."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Qual é a fórmula formal da derivada f'(x_0) usando limite?",
      "Calcule primeiro f(1). Qual ramo define f(1)?",
      "Monte o limite lateral à esquerda com f(x) = 2x - 2: lim_{x -> 1^-} (2x-2 - 0)/(x-1).",
      "Monte o limite lateral à direita com f(x) = 4/x - 4 e simplifique a fração complexa.",
      "As derivadas laterais resultam em 2 e -4. Como são diferentes, f não é derivável em 1."
    ]
  },
  {
    "id": "ex-lista1-q05k",
    "listNumber": 1,
    "questionNumber": "1ª Lista — 05.k",
    "title": "Limite Algébrico com Dupla Racionalização",
    "topic": "Limites",
    "subtopic": "Racionalização de Numerador e Denominador",
    "difficulty": "desafio",
    "xpReward": 65,
    "associatedSkills": [
      "algebra-fatoracao",
      "limites-indeterminados"
    ],
    "enunciadoLatex": "\\lim_{x \\to 4} \\frac{3 - \\sqrt{5 + x}}{1 - \\sqrt{5 - x}}",
    "sourceDocument": "1ª Lista de Exercícios de Cálculo A",
    "sourcePage": 1,
    "expectedAnswerLatex": "-\\frac{1}{3}",
    "officialResolutionSteps": [
      "Em x = 4: numerador 3 - \\sqrt{9} = 0, denominador 1 - \\sqrt{1} = 0 (forma 0/0).",
      "Multiplique numerador e denominador pelos dois conjugados: (3 + \\sqrt{5+x}) e (1 + \\sqrt{5-x}).",
      "Numerador: (9 - (5+x)) = 4 - x.",
      "Denominador: (1 - (5-x)) = x - 4 = -(4 - x).",
      "Cancelando (4 - x), sobra: -\\frac{1 + \\sqrt{5-x}}{3 + \\sqrt{5+x}}.",
      "Substituindo x = 4: -\\frac{1 + 1}{3 + 3} = -\\frac{2}{6} = -\\frac{1}{3}."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Observe que ambos numerador e denominador possuem radicais que geram zero.",
      "Multiplique pelo conjugado de ambos simultaneamente.",
      "Note que (9 - (5+x)) = 4 - x e (1 - (5-x)) = -(4 - x).",
      "Cancele o fator comum (4 - x) que causava a indeterminação 0/0.",
      "Substitua x = 4 na expressão restante: -(1+1)/(3+3) = -2/6 = -1/3."
    ]
  },
  {
    "id": "ex-lista1-q11d",
    "listNumber": 1,
    "questionNumber": "1ª Lista — 11.d",
    "title": "Limite Trigonométrico com Tangente e Seno",
    "topic": "Limites",
    "subtopic": "Limites Trigonométricos",
    "difficulty": "intermediario",
    "xpReward": 50,
    "associatedSkills": [
      "limites-trigonometricos"
    ],
    "enunciadoLatex": "\\lim_{x \\to 0} \\frac{\\text{tg } x - \\text{sen } x}{\\text{sen}^2 x}",
    "sourceDocument": "1ª Lista de Exercícios de Cálculo A",
    "sourcePage": 3,
    "expectedAnswerLatex": "0",
    "officialResolutionSteps": [
      "Escreva tg x = sen x / cos x.",
      "O numerador se torna sen x (1/cos x - 1) = sen x (1 - cos x) / cos x.",
      "Dividindo por sen^2 x: \\frac{1 - \\cos x}{\\cos x \\cdot \\text{sen } x}.",
      "Multiplicando por (1 + cos x)/(1 + cos x): \\frac{\\text{sen}^2 x}{\\cos x \\cdot \\text{sen } x \\cdot (1 + \\cos x)} = \\frac{\\text{sen } x}{\\cos x (1 + \\cos x)}.",
      "Quando x -> 0, sen 0 = 0 e o denominador vai para 1 * 2 = 2. Logo 0/2 = 0."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Converta tg(x) para sen(x)/cos(x).",
      "Coloque sen(x) em evidência no numerador.",
      "Cancele um termo sen(x) entre numerador e denominador.",
      "Analise o que acontece com (1 - cos x)/sen x quando x tende a 0.",
      "O limite avalia para 0/2 = 0."
    ]
  },
  {
    "id": "ex-lista2-q1a",
    "listNumber": 2,
    "questionNumber": "2ª Lista — 1.a",
    "title": "Regra da Cadeia para Potência Composta",
    "topic": "Derivadas",
    "subtopic": "Regra da Cadeia",
    "difficulty": "iniciante",
    "xpReward": 40,
    "associatedSkills": [
      "regra-da-cadeia",
      "regras-derivacao-basicas"
    ],
    "enunciadoLatex": "f(u) = u^2, \\quad u(x) = x^3 - 4. \\quad \\text{Determine } (f \\circ u)'(x) \\text{ e } (f \\circ u)'(1).",
    "sourceDocument": "2ª Lista de Exercícios de Cálculo A",
    "sourcePage": 1,
    "expectedAnswerLatex": "(f \\circ u)'(x) = 6x^2(x^3 - 4), \\quad (f \\circ u)'(1) = -18",
    "officialResolutionSteps": [
      "Pela regra da cadeia: (f o u)'(x) = f'(u(x)) * u'(x).",
      "f'(u) = 2u, logo f'(u(x)) = 2(x^3 - 4).",
      "u'(x) = 3x^2.",
      "(f o u)'(x) = 2(x^3 - 4) * 3x^2 = 6x^2(x^3 - 4).",
      "Para x = 1: 6(1)^2(1^3 - 4) = 6 * (-3) = -18."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Qual é a fórmula da regra da cadeia para a derivada de f(u(x))?",
      "Calcule f'(u) e u'(x) separadamente.",
      "Substitua u(x) = x^3 - 4 na expressão de f'(u).",
      "Multiplique f'(u(x)) por u'(x).",
      "Substitua x = 1 para encontrar o valor numérico final (-18)."
    ]
  },
  {
    "id": "ex-lista2-q7a",
    "listNumber": 2,
    "questionNumber": "2ª Lista — 7.a",
    "title": "Derivação Implícita do Círculo",
    "topic": "Derivadas",
    "subtopic": "Derivação Implícita",
    "difficulty": "intermediario",
    "xpReward": 50,
    "associatedSkills": [
      "derivacao-implicita",
      "regra-da-cadeia"
    ],
    "enunciadoLatex": "x^2 + y^2 = 4. \\quad \\text{Calcule } \\frac{dy}{dx} \\text{ no ponto } P(1, \\sqrt{3}) \\text{ e } \\frac{dx}{dy} \\text{ no ponto } Q(\\sqrt{3}, 1).",
    "sourceDocument": "2ª Lista de Exercícios de Cálculo A",
    "sourcePage": 2,
    "expectedAnswerLatex": "\\frac{dy}{dx} = -\\frac{x}{y}, \\; y'_P = -\\frac{\\sqrt{3}}{3}; \\quad \\frac{dx}{dy} = -\\frac{y}{x}, \\; x'_Q = -\\frac{\\sqrt{3}}{3}",
    "officialResolutionSteps": [
      "Derivando implicitamente em relação a x: d/dx(x^2 + y^2) = d/dx(4).",
      "2x + 2y * (dy/dx) = 0 => 2y * (dy/dx) = -2x => dy/dx = -x/y.",
      "No ponto P(1, \\sqrt{3}): dy/dx = -1/\\sqrt{3} = -\\sqrt{3}/3.",
      "Derivando implicitamente em relação a y: 2x * (dx/dy) + 2y = 0 => dx/dy = -y/x.",
      "No ponto Q(\\sqrt{3}, 1): dx/dy = -1/\\sqrt{3} = -\\sqrt{3}/3."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Lembre-se que y é função de x: a derivada de y^2 em relação a x é 2y * y'.",
      "Isole y' na equação linear resultante.",
      "Substitua as coordenadas x = 1 e y = \\sqrt{3}.",
      "Racionalize o denominador multiplicando por \\sqrt{3}/\\sqrt{3}.",
      "O resultado é y'_P = -\\sqrt{3}/3."
    ]
  },
  {
    "id": "ex-lista2-q11d",
    "listNumber": 2,
    "questionNumber": "2ª Lista — 11.d",
    "title": "Taxa de Variação Relacionada: Mancha de Óleo Circular",
    "topic": "Aplicações de Derivadas",
    "subtopic": "Taxas de Variação Relacionadas",
    "difficulty": "intermediario",
    "xpReward": 60,
    "associatedSkills": [
      "taxas-relacionadas",
      "regra-da-cadeia"
    ],
    "enunciadoLatex": "\\text{Uma mancha de óleo se alastra circularmente. Sabendo que a taxa de variação do raio é } \\frac{dr}{dt} = 22\\text{ m/h}, \\text{ determine a taxa de variação da área } \\frac{dA}{dt} \\text{ em função de } r.",
    "sourceDocument": "2ª Lista de Exercícios de Cálculo A",
    "sourcePage": 3,
    "expectedAnswerLatex": "\\frac{dA}{dt} = 44\\pi r \\text{ m}^2/\\text{h}",
    "officialResolutionSteps": [
      "A área de um círculo de raio r é A = \\pi r^2.",
      "Como tanto a área quanto o raio são funções do tempo t, derivamos ambos em relação a t:",
      "dA/dt = d/dt(\\pi r^2) = \\pi \\cdot 2r \\cdot \\frac{dr}{dt}.",
      "O enunciado fornece dr/dt = 22 m/h.",
      "Substituindo: dA/dt = 2\\pi r \\cdot (22) = 44\\pi r."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Qual é a fórmula geométrica que relaciona a área A e o raio r de um círculo?",
      "Aplique a regra da cadeia derivando A = \\pi r^2 em relação ao tempo t.",
      "Lembre-se do fator dr/dt: dA/dt = 2\\pi r (dr/dt).",
      "Substitua o valor de dr/dt fornecido no enunciado (22 m/h).",
      "Multiplicando 2 * 22 * \\pi * r temos 44\\pi r."
    ]
  },
  {
    "id": "ex-lista2-q16b",
    "listNumber": 2,
    "questionNumber": "2ª Lista — 16.b",
    "title": "Problema de Otimização: Retângulo de Área Máxima com Perímetro Fixo",
    "topic": "Aplicações de Derivadas",
    "subtopic": "Máximos e Mínimos Aplicados",
    "difficulty": "desafio",
    "xpReward": 70,
    "associatedSkills": [
      "analise-variacao-extremos"
    ],
    "enunciadoLatex": "\\text{Molde um fio de arame de comprimento } L \\text{ em forma de um retângulo cuja área seja a maior possível. Encontre a área máxima obtida.}",
    "sourceDocument": "2ª Lista de Exercícios de Cálculo A",
    "sourcePage": 5,
    "expectedAnswerLatex": "\\text{Área máxima} = \\frac{L^2}{16}",
    "officialResolutionSteps": [
      "Sejam x e y as dimensões do retângulo. O perímetro é 2x + 2y = L => y = L/2 - x.",
      "A função de área a maximizar é A(x) = x * y = x(L/2 - x) = (L/2)x - x^2.",
      "O domínio físico de x é 0 < x < L/2.",
      "Derivando em relação a x: A'(x) = L/2 - 2x.",
      "Ponto crítico: A'(x) = 0 => L/2 - 2x = 0 => x = L/4.",
      "Teste da 2ª derivada: A''(x) = -2 < 0 (confirma máximo local e absoluto).",
      "A outra dimensão é y = L/2 - L/4 = L/4 (um quadrado!).",
      "Área máxima: A(L/4) = (L/4) * (L/4) = L^2 / 16."
    ],
    "hasOfficialAnswer": true,
    "userStatus": "nao_tentado",
    "sampleHints": [
      "Escreva a equação do perímetro com as dimensões x e y.",
      "Isole uma das variáveis (y = L/2 - x) e substitua na fórmula da área A = x*y.",
      "Calcule a derivada A'(x) para encontrar os pontos críticos.",
      "Iguale A'(x) a zero para achar a dimensão ótima x.",
      "Substitua x = L/4 na área para obter L^2/16."
    ]
  }
];
