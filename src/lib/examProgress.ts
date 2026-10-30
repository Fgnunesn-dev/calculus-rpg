import { ExamAssessment, ExamReport } from '../types/exam';
import { SkillNode } from '../types/calculus';
import { STUDY_MODULES } from '../data/studyPath';

export const assessmentLabels = { demonstrated: 'Demonstrado na prova', partial: 'Em desenvolvimento', needs_review: 'Precisa de revisão', not_assessed: 'Ainda não avaliado' };
export function examProgress(reports: ExamReport[]) {
  const latest = new Map<string, ExamAssessment & { source: string; date: string }>();
  for (const report of [...reports].sort((a, b) => Date.parse(a.uploadedAt) - Date.parse(b.uploadedAt))) {
    for (const item of report.analysis.assessments || []) {
      if (item.status === 'not_assessed' || !item.studentWork || !item.evidence || !item.questionNumbers.length) continue;
      if (!STUDY_MODULES.some(m => m.id === item.moduleId)) continue;
      latest.set(item.moduleId, { ...item, source: report.analysis.title, date: report.uploadedAt });
    }
  }
  const modules = STUDY_MODULES.map(module => ({ module, assessment: latest.get(module.id) }));
  const assessed = [...latest.values()];
  const demonstrated = assessed.filter(a => a.status === 'demonstrated').length;
  const review = assessed.filter(a => a.status === 'needs_review').length;
  const partial = assessed.filter(a => a.status === 'partial').length;
  const level = !assessed.length ? 'Aguardando resoluções' : review > assessed.length / 2 ? 'Base em construção' : demonstrated === assessed.length ? 'Consistente nos tópicos avaliados' : 'Em desenvolvimento';
  const recommended = modules.filter(m => m.assessment?.status === 'needs_review').concat(modules.filter(m => m.assessment?.status === 'partial')).map(m => m.module.id);
  return { modules, assessed: assessed.length, demonstrated, review, partial, level, recommended };
}

// Exam evidence is separate from actual exercise attempts, mastery percentages and XP.
export function skillsWithExamEvidence(skills: SkillNode[], reports: ExamReport[]): SkillNode[] {
  const evidence = new Map<string, NonNullable<SkillNode['examDiagnostic']>>();
  for (const report of [...reports].sort((a, b) => Date.parse(a.uploadedAt) - Date.parse(b.uploadedAt))) {
    for (const item of report.analysis.assessments || []) {
      if (item.status === 'not_assessed' || !item.studentWork || !item.evidence || !item.questionNumbers.length) continue;
      for (const id of item.skillIds) evidence.set(id, { status: item.status, evidence: item.evidence, source: `${report.analysis.title} · questão ${item.questionNumbers.join(', ')}` });
    }
  }
  return skills.map(skill => ({ ...skill, examDiagnostic: evidence.get(skill.id) }));
}
