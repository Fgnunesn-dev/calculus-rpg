import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAnalysis } from '../server/examAnalysis';
import { examProgress, skillsWithExamEvidence } from '../src/lib/examProgress';
import { newUserSkills } from '../src/data/newUser';
import { ExamAssessment, ExamReport } from '../src/types/exam';

const base = { title: 'Prova', summary: 'Evidências da resolução.', observedScore: null, maximumScore: null, weaknesses: [], strengths: [], restrictions: [], recommendedModuleIds: ['algebra'], questions: [{ number: '1', topic: 'Álgebra', statement: 'Fatore.', feedback: 'Confira a fatoração.', practicePrompt: 'Fatore outra expressão.', earnedScore: null, maximumScore: null }] };
const observation = (status: ExamAssessment['status'] = 'partial'): ExamAssessment => ({ moduleId: 'algebra', skillIds: ['algebra-fatoracao'], status, evidence: 'Cancelou parcelas em vez de fatores.', studentWork: 'Cancelamento visível na segunda linha da questão 1.', questionNumbers: ['1'] });
const report = (id: string, date: string, assessments?: ExamAssessment[]): ExamReport => ({ id, originalName: 'prova.pdf', uploadedAt: date, analysis: validateAnalysis({ ...base, assessments }) });

test('assessments require student work, evidence and a real question reference', () => {
  for (const change of [{ studentWork: '' }, { evidence: '' }, { questionNumbers: ['99'] }]) {
    const result = validateAnalysis({ ...base, assessments: [{ ...observation('demonstrated'), ...change }] });
    assert.equal(result.assessments?.[0].status, 'not_assessed');
    assert.equal(examProgress([{ id: 'a', originalName: 'x', uploadedAt: '2026-01-01', analysis: result }]).assessed, 0);
  }
  assert.deepEqual(validateAnalysis({ ...base, assessments: [{ ...observation(), moduleId: 'invented' }] }).assessments, []);
  assert.deepEqual(validateAnalysis({ ...base, assessments: [{ ...observation(), status: 'expert' }] }).assessments, []);
  assert.deepEqual(validateAnalysis({ ...base, assessments: [{ ...observation(), skillIds: ['admin'] }] }).assessments?.[0].skillIds, []);
});

test('latest evidence revises a topic; absence of evidence never marks it as failed', () => {
  const early = report('a', '2026-01-01', [observation('demonstrated')]);
  const recent = report('b', '2026-02-01', [observation('needs_review')]);
  const unknown = report('c', '2026-03-01', [observation('not_assessed')]);
  const result = examProgress([unknown, recent, early]);
  assert.equal(result.assessed, 1);
  assert.equal(result.review, 1);
  assert.equal(result.demonstrated, 0);
  assert.equal(result.modules.find(m => m.module.id === 'limits')?.assessment, undefined);
  assert.deepEqual(result.recommended, ['algebra']);
  assert.equal(examProgress([early]).level, 'Consistente nos tópicos avaliados');
  assert.equal(examProgress([report('old', '2025-01-01')]).assessed, 0);
});

test('exam diagnosis appears on skills without inventing exercise attempts or XP mastery', () => {
  const skills = newUserSkills();
  const result = skillsWithExamEvidence(skills, [report('a', '2026-01-01', [observation('demonstrated')])]);
  assert.equal(result[0].examDiagnostic?.status, 'demonstrated');
  assert.equal(result[0].masteryScore, 0);
  assert.equal(result[0].totalAttempts, 0);
  assert.equal(result[0].status, 'unlearned');
  assert.equal(skills[0].examDiagnostic, undefined);
  assert.ok(skillsWithExamEvidence(skills, []).every(s => !s.examDiagnostic));
});
