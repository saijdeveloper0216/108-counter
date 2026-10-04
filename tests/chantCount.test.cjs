const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { normalizeChantCount, incrementChantCount, decrementChantCount, divideChantCount, formatChantCount } = require('../src/utils/chantCount.ts');
const { sanitizeCounters, counterReducer, INITIAL_COUNTERS } = require('../src/utils/counterState.ts');

test('decimal arithmetic agrees with an independent bigint oracle for varied long counts', () => {
  for (let length = 1; length <= 120; length++) {
    for (const value of ['9'.repeat(length), '1' + '0'.repeat(length), '1234567890'.repeat(Math.ceil(length / 10)).slice(0, length)]) {
      const oracle = BigInt(value);
      assert.equal(incrementChantCount(value), String(oracle + 1n));
      assert.equal(decrementChantCount(value), String(oracle - 1n));
      assert.deepEqual(divideChantCount(value, 108), { quotient: String(oracle / 108n), remainder: Number(oracle % 108n) });
    }
  }
  assert.equal(decrementChantCount('0'), '0');
});

test('legacy numeric saves migrate while malformed counts are rejected', () => {
  assert.equal(normalizeChantCount(12345678), '12345678');
  assert.equal(normalizeChantCount('00012345678'), '12345678');
  for (const invalid of [-1, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '', '-5', '1e20', '12.5', '123,456', null]) assert.equal(normalizeChantCount(invalid), '0');
});

test('large totals survive persistence, increment, undo, and mode-specific history clearing', () => {
  const value = '999999999999999999999999999999';
  let state = { ...INITIAL_COUNTERS, ...sanitizeCounters({ jaap: { totalCount: value, history: [] } }) };
  state = counterReducer(state, { type: 'increment', mode: 'jaap', at: '2026-10-04T06:00:00Z', id: 'large' });
  assert.equal(state.jaap.totalCount, '1000000000000000000000000000000');
  const restored = sanitizeCounters(JSON.parse(JSON.stringify(state)));
  state = counterReducer({ ...restored, showCompletion: false }, { type: 'undo', mode: 'jaap' });
  assert.equal(state.jaap.totalCount, value);
  const multiple = String(108n * 999999999999999999999n);
  state = { ...INITIAL_COUNTERS, ...sanitizeCounters({ jaap: { totalCount: String(BigInt(multiple) - 1n), history: [] } }) };
  state = counterReducer(state, { type: 'increment', mode: 'jaap', at: '2026-10-04T06:00:00Z', id: 'boundary' });
  assert.equal(state.jaap.history[0].malaNumber, '999999999999999999999');
  assert.equal(sanitizeCounters(JSON.parse(JSON.stringify(state))).jaap.history.length, 1);
  const cleared = counterReducer(state, { type: 'clearHistory', mode: 'jaap' });
  assert.equal(cleared.jaap.totalCount, multiple);
  assert.equal(cleared.jaap.history.length, 0);
  assert.equal(cleared.mala, state.mala);
  assert.equal(counterReducer(state, { type: 'undo', mode: 'jaap' }).jaap.history.length, 0);
});

test('formatted counts show every digit without abbreviation or numeric rounding', () => {
  assert.equal(formatChantCount('12345678'), '12,345,678');
  const long = '1234567890123456789012345678901234567890';
  assert.equal(formatChantCount(long).replaceAll(',', ''), long);
});
