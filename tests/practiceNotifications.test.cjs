const fs = require('node:fs');
const Module = require('node:module');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const scheduled = new Map();
const storage = new Map();
const events = [];
const notifications = {
  setNotificationHandler() {},
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 'daily', DATE: 'date' },
  async getPermissionsAsync() { events.push('permission'); return { status: 'granted' }; },
  async requestPermissionsAsync() { return { status: 'granted' }; },
  async setNotificationChannelAsync(id) { events.push(`channel:${id}`); },
  async cancelScheduledNotificationAsync(id) { scheduled.delete(id); },
  async scheduleNotificationAsync(request) {
    const id = request.identifier || String(scheduled.size);
    scheduled.set(id, request); return id;
  },
};
const original = Module._load;
Module._load = function(request, ...rest) {
  if (request === 'expo-notifications') return notifications;
  if (request === 'react-native') return { Platform: { OS: 'android' } };
  if (request === '@react-native-async-storage/async-storage') return {
    getItem: async (key) => storage.get(key) ?? null,
    setItem: async (key, value) => storage.set(key, value),
  };
  if (request === '../data/festivals') return {};
  return original.call(this, request, ...rest);
};
const { schedulePracticeReminder } = require('../src/services/notifications.ts');
Module._load = original;

test('daily reminders replace themselves, use the chosen time, and keep festival reminders', async () => {
  const settings = { practiceReminderEnabled: true, practiceReminderTime: '07:35', dailyMalaGoal: 3 };
  scheduled.set('festival-1', { content: { title: 'Festival' } });
  await schedulePracticeReminder(settings);
  await schedulePracticeReminder({ ...settings, practiceReminderTime: '08:20' });
  assert.equal(scheduled.size, 2);
  const practice = scheduled.get('108counter-daily-practice');
  assert.equal(practice.trigger.type, 'daily');
  assert.equal(practice.trigger.hour, 8);
  assert.equal(practice.trigger.minute, 20);
  assert.match(practice.content.body, /3 malas/);
  assert.ok(events.indexOf('channel:festival-reminders') < events.indexOf('permission'));
  await schedulePracticeReminder({ ...settings, practiceReminderEnabled: false });
  assert.equal(scheduled.size, 1);
  assert.ok(scheduled.has('festival-1'));
});
