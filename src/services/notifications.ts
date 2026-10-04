import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, formatFestivalDate, formatTimeLabel, getUpcomingFestivals } from '../data/festivals';
import type { AppSettings } from '../types/settings';

if (Platform.OS !== 'web') Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const REMINDER_IDS_KEY = '@108counter/notification-ids';
const ANDROID_CHANNEL_ID = 'festival-reminders';

function parseTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

function combineDateTime(dateString: string, time: string) {
  const { hours, minutes } = parseTime(time);
  const date = new Date(`${dateString}T12:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Festival Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

export async function getNotificationPermissionStatus() {
  if (Platform.OS === 'web') return 'undetermined' as const;
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;
  await ensureAndroidNotificationChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    if (requested.status !== 'granted') {
      return false;
    }
  }

  await ensureAndroidNotificationChannel();
  return true;
}

async function saveScheduledIds(ids: string[]) {
  await AsyncStorage.setItem(REMINDER_IDS_KEY, JSON.stringify(ids));
}

async function loadScheduledIds() {
  const raw = await AsyncStorage.getItem(REMINDER_IDS_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export async function cancelFestivalReminders() {
  if (Platform.OS === 'web') return;
  const ids = await loadScheduledIds();
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await saveScheduledIds([]);
}

export async function scheduleFestivalReminders(settings: AppSettings) {
  if (Platform.OS === 'web') return { scheduled: 0 };
  await cancelFestivalReminders();

  if (!settings.remindersEnabled) {
    return { scheduled: 0 };
  }

  const granted = await requestNotificationPermission();
  if (!granted) {
    return { scheduled: 0, permissionDenied: true };
  }

  const upcoming = getUpcomingFestivals(settings.calendarLocale, settings.region).slice(0, 40);
  const ids: string[] = [];
  const now = Date.now();
  const timeLabel = formatTimeLabel(settings.reminderTime);
  const dayOffset = settings.reminderTiming === 'day_before' ? -1 : 0;

  for (const festival of upcoming) {
    const notifyAt = combineDateTime(addDays(festival.date, dayOffset), settings.reminderTime);
    if (notifyAt.getTime() <= now) {
      continue;
    }

    const isDayBefore = settings.reminderTiming === 'day_before';
    const title = isDayBefore ? `Tomorrow: ${festival.name}` : `Today: ${festival.name}`;
    const body = isDayBefore
      ? `${formatFestivalDate(festival.date)} · Reminder at ${timeLabel}`
      : `${formatFestivalDate(festival.date)} · ${festival.description}`;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { festivalId: festival.id, type: 'reminder', timing: settings.reminderTiming },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notifyAt,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      },
    });
    ids.push(id);
  }

  await saveScheduledIds(ids);
  return { scheduled: ids.length };
}


const PRACTICE_REMINDER_ID = '108counter-daily-practice';
const PRACTICE_CHANNEL_ID = 'daily-practice';

/** Independent repeating reminder; never cancels the user's festival reminders. */
export async function schedulePracticeReminder(settings: AppSettings) {
  if (Platform.OS === 'web') return { scheduled: 0 };
  await Notifications.cancelScheduledNotificationAsync(PRACTICE_REMINDER_ID);
  if (!settings.practiceReminderEnabled) return { scheduled: 0 };
  if (!await requestNotificationPermission()) return { scheduled: 0, permissionDenied: true };
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(PRACTICE_CHANNEL_ID, {
      name: 'Daily Chanting', importance: Notifications.AndroidImportance.DEFAULT, sound: 'default',
    });
  }
  const { hours, minutes } = parseTime(settings.practiceReminderTime);
  await Notifications.scheduleNotificationAsync({
    identifier: PRACTICE_REMINDER_ID,
    content: {
      title: 'A moment for your daily sadhana',
      body: `Your intention: ${settings.dailyMalaGoal} mala${settings.dailyMalaGoal === 1 ? '' : 's'}. Begin with one peaceful chant.`,
      data: { type: 'daily-practice' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours, minute: minutes,
      channelId: Platform.OS === 'android' ? PRACTICE_CHANNEL_ID : undefined,
    },
  });
  return { scheduled: 1 };
}
