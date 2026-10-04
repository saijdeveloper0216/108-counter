const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(result.outputText, filename);
};
const { counterReducer, INITIAL_COUNTERS, sanitizeCounters, getPracticeStats } = require('../src/utils/counterState.ts');
const { sanitizeSettings } = require('../src/types/settings.ts');
const tap = (state, mode = 'mala', at = '2026-10-03T12:00:00', id = 'tap') => counterReducer(state, { type: 'increment', mode, at, id });
const entry = (day) => ({ id: day, completedAt: `${day}T12:00:00`, malaNumber: 1 });

test('rapid taps stop at 108 and record a single completion', () => {
  let state = INITIAL_COUNTERS;
  for (let i = 0; i < 150; i++) state = tap(state, 'mala', undefined, String(i));
  assert.equal(state.mala.count, 108);
  assert.equal(state.mala.completedMalas, 1);
  assert.equal(state.mala.history.length, 1);
  assert.equal(state.showCompletion, true);
});
test('undoing 108 removes its completion; recounting creates one replacement', () => {
  let state = { ...INITIAL_COUNTERS, mala: { count: 107, completedMalas: 0, history: [] } };
  state = tap(state);
  state = counterReducer(state, { type: 'undo', mode: 'mala' });
  assert.equal(state.mala.count, 107);
  assert.equal(state.mala.completedMalas, 0);
  assert.equal(state.mala.history.length, 0);
  assert.equal(state.showCompletion, false);
  assert.equal(tap(state).mala.history.length, 1);
});
test('next mala preserves the completed round and its history', () => {
  let state = { ...INITIAL_COUNTERS, mala: { count: 107, completedMalas: 2, history: [entry('2026-10-02')] } };
  state = counterReducer(tap(state), { type: 'nextRound' });
  assert.equal(state.mala.count, 0);
  assert.equal(state.mala.completedMalas, 3);
  assert.equal(state.mala.history.length, 2);
});
test('daily reset preserves history and leaves continuous jaap untouched', () => {
  const history = [entry('2026-10-02')];
  const state = { ...INITIAL_COUNTERS, malaTrackedDay: '2026-10-02', mala: { count: 50, completedMalas: 1, history },
    jaap: { totalCount: '30', completedMalas: '0', history: [] } };
  const next = counterReducer(state, { type: 'dailyReset', day: '2026-10-03' });
  assert.equal(next.mala.count, 0);
  assert.equal(next.mala.completedMalas, 0);
  assert.deepEqual(next.mala.history, history);
  assert.equal(next.jaap.totalCount, '30');
  assert.equal(counterReducer(next, { type: 'dailyReset', day: '2026-10-03' }), next);
});
test('continuous jaap completes rounds and undo rolls back the boundary', () => {
  let state = { ...INITIAL_COUNTERS, jaap: { totalCount: '107', completedMalas: '0', history: [] } };
  state = tap(state, 'jaap');
  assert.equal(state.jaap.completedMalas, '1');
  assert.equal(state.jaap.history.length, 1);
  assert.equal(state.showCompletion, false);
  state = counterReducer(state, { type: 'undo', mode: 'jaap' });
  assert.equal(state.jaap.totalCount, '107');
  assert.equal(state.jaap.history.length, 0);
});
test('continuous jaap crosses the former 10-crore cap and keeps exact digits', () => {
  let state = { ...INITIAL_COUNTERS, jaap: { totalCount: '99999999', completedMalas: '925925', history: [] } };
  state = tap(tap(state, 'jaap'), 'jaap');
  assert.equal(state.jaap.totalCount, '100000001');
  assert.equal(counterReducer(state, { type: 'undo', mode: 'jaap' }).jaap.totalCount, '100000000');
});
test('old saves retain counts and migrate absent jaap history', () => {
  const saved = sanitizeCounters({ mala: { count: 75, completedMalas: 2, history: [entry('2026-10-02')] },
    jaap: { totalCount: 216, completedMalas: 2 } });
  assert.equal(saved.mala.count, 75);
  assert.equal(saved.mala.history.length, 1);
  assert.equal(saved.jaap.totalCount, '216');
  assert.deepEqual(saved.jaap.history, []);
});
test('invalid saved numbers and history are rejected', () => {
  const saved = sanitizeCounters({ mala: { count: NaN, completedMalas: -3, history: [null] }, jaap: { totalCount: Infinity } });
  assert.equal(saved.mala.count, 0);
  assert.equal(saved.mala.completedMalas, 0);
  assert.equal(saved.jaap.totalCount, '0');
  assert.deepEqual(saved.mala.history, []);
});
test('daily goal combines both modes; yesterday keeps an unfinished-day streak', () => {
  const state = { ...INITIAL_COUNTERS, mala: { count: 0, completedMalas: 2, history: [entry('2026-10-02'), entry('2026-10-01')] },
    jaap: { totalCount: '108', completedMalas: '1', history: [entry('2026-10-02')] } };
  assert.deepEqual(getPracticeStats(state, new Date('2026-10-03T12:00:00')), { todayMalas: 0, streak: 2 });
  assert.deepEqual(getPracticeStats(state, new Date('2026-10-02T12:00:00')), { todayMalas: 2, streak: 2 });
  assert.equal(getPracticeStats(state, new Date('2026-10-04T12:00:00')).streak, 0);
});
test('reopening at 108 offers the completion actions again', () => {
  const next = counterReducer(INITIAL_COUNTERS, { type: 'hydrate', state: sanitizeCounters({ mala: { count: 108, completedMalas: 1, history: [] } }) });
  assert.equal(next.showCompletion, true);
});
test('new settings validate goal, time, and motion without changing old choices', () => {
  const next = sanitizeSettings({ counterMode: 'jaap', malaDailyReset: true, dailyMalaGoal: 0, practiceReminderTime: '99:88', animationsEnabled: false });
  assert.equal(next.dailyMalaGoal, 1);
  assert.equal(next.practiceReminderTime, '07:00');
  assert.equal(next.animationsEnabled, false);
  assert.equal(next.counterMode, 'jaap');
  assert.equal(next.malaDailyReset, true);
});

test('resetting continuous count preserves previous daily practice records', () => {
  const history = [entry('2026-10-03')];
  const state = { ...INITIAL_COUNTERS, jaap: { totalCount: '108', completedMalas: '1', history } };
  const next = counterReducer(state, { type: 'resetCount', mode: 'jaap' });
  assert.equal(next.jaap.totalCount, '0');
  assert.deepEqual(next.jaap.history, history);
  assert.equal(getPracticeStats(next, new Date('2026-10-03T12:00:00')).todayMalas, 1);
});
