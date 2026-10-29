export function parseDiagnosis(value: unknown) {
  const result = value as Record<string, unknown>;
  if (!result || typeof result.isCorrect !== 'boolean' || typeof result.explanation !== 'string' || !result.explanation.trim()) throw new Error('Resposta de diagnóstico inválida.');
  const allowed = ['erro_conceitual', 'erro_algebrico', 'erro_sinal', 'erro_aritmetico', 'formula_incorreta', 'metodo_inadequado', 'interpretacao_equivocada', 'falha_notacao', 'falta_justificativa', 'acerto_sem_dominio'];
  return { isCorrect: result.isCorrect, explanation: result.explanation.slice(0, 6000), remediation: typeof result.remediation === 'string' ? result.remediation.slice(0, 6000) : '', classification: typeof result.classification === 'string' && allowed.includes(result.classification) ? result.classification : undefined };
}
