import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_EXERCISES } from '../src/data/initialData';
import { PATH_EXERCISES, STUDY_MODULES } from '../src/data/studyPath';
import { arenaSubjects, catalogEntry, filterExercises, ArenaFilters } from '../src/lib/arenaCatalog';
const all = [...INITIAL_EXERCISES, ...PATH_EXERCISES];
const filters: ArenaFilters = { category: 'all', subject: '', topic: '', difficulty: '' };
test('every curriculum module has an exercise classified in the catalog', () => {
  for (const module of STUDY_MODULES) {
    const exercise = all.find(ex => ex.id === `path-${module.id}` || ({ indeterminate: 'ex-prova1-q1a', continuity: 'ex-prova1-q2', definition: 'ex-prova1-q4', rules: 'ex-lista2-q1a', implicit: 'ex-lista2-q7a', analysis: 'ex-lista2-q16b' } as Record<string, string>)[module.id] === ex.id);
    assert.ok(exercise, module.id);
    assert.notEqual(catalogEntry(exercise!).subject, 'personal');
  }
  assert.equal(filterExercises(all, filters).length, all.length);
  assert.ok(all.every(ex => arenaSubjects.some(s => s.id === catalogEntry(ex).subject)));
});
test('exam category combines subject, topic and difficulty without mixing lists or authored questions', () => {
  const matches = filterExercises(all, { category: 'exam', subject: 'limits', topic: 'infinity', difficulty: 'intermediario' });
  assert.deepEqual(matches.map(ex => ex.id), ['ex-prova1-q1a']);
  assert.ok(filterExercises(all, { ...filters, category: 'exam', subject: 'derivatives' }).every(ex => ex.listNumber === 0));
  assert.deepEqual(filterExercises(all, { ...filters, category: 'exam', subject: 'integrals' }), []);
  assert.deepEqual(filterExercises(all, { ...filters, topic: 'infinity', difficulty: 'iniciante' }), []);
  assert.ok(filterExercises(all, { ...filters, category: 'path', subject: 'vector' }).length);
});
test('personal reinforcements stay discoverable and cannot be mislabeled as exam questions', () => {
  const personal = { ...all[0], id: 'custom-123', listNumber: undefined, sourceDocument: 'Upload Recente do Estudante' };
  assert.equal(catalogEntry(personal).category, 'personal');
  assert.equal(catalogEntry(personal).subject, 'personal');
  assert.deepEqual(filterExercises([personal], { ...filters, category: 'exam' }), []);
});
