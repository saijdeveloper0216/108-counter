import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TraditionInsightCard } from '../components/TraditionInsightCard';
import { TimePickerRow } from '../components/TimePickerRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { useSettings } from '../context/SettingsContext';
import { colors } from '../constants/theme';
import {
  getFeedbackButtonIcon,
  getFeedbackButtonLabel,
  getFeedbackUrl,
} from '../constants/feedback';
import { getAppVersion, getPrivacyPolicyUrl, SUPPORT_EMAIL } from '../constants/legal';
import {
  APP_TRADITION_PROMISE,
  LUNAR_CALENDAR_INFO,
  TRADITION_TIPS,
} from '../data/traditions';
import {
  cancelFestivalReminders,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  scheduleFestivalReminders,
} from '../services/notifications';
import { CALENDAR_LOCALE_LABELS } from '../types/content';
import { copy } from '../constants/theme';
import type { CounterMode } from '../types/counter';
import { VIBRATION_LABELS, FESTIVAL_REMINDER_TIMING_LABELS, type FestivalReminderTiming, type VibrationIntensity } from '../types/settings';
import { confirmAction } from '../utils/confirmAction';
import { triggerSelectionHaptic } from '../utils/haptics';
import { useBottomTabLayout } from '../utils/layout';

const INTENSITIES: VibrationIntensity[] = ['none', 'gentle', 'balanced', 'strong'];

function vibrationIcon(intensity: VibrationIntensity): keyof typeof Ionicons.glyphMap {
  switch (intensity) {
    case 'none':
      return 'volume-mute-outline';
    case 'gentle':
      return 'leaf-outline';
    case 'balanced':
      return 'radio-button-on';
    case 'strong':
      return 'pulse';
  }
}

const TRADITION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  '108-sacred': 'sparkles-outline',
  'mala-japa': 'ellipse-outline',
  parikrama: 'footsteps-outline',
  harathi: 'flame-outline',
  masam: 'moon-outline',
};

export function SettingsScreen() {
  const { scrollBottomPadding } = useBottomTabLayout();
  const { settings, updateSettings, setVibrationIntensity } = useSettings();
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    void getNotificationPermissionStatus().then((status) => {
      setPermission(status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined');
    });
  }, []);

  const applySettings = async (patch: Partial<typeof settings>) => {
    const result = await updateSettings(patch);
    setScheduledCount(result.scheduled);
    return result;
  };

  const handlePermissionRequest = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (!granted) {
      Alert.alert('Permission needed', 'Enable notifications in system settings to receive festival reminders.');
    }
  };

  const handleReminderToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      setPermission(granted ? 'granted' : 'denied');
      if (!granted) {
        Alert.alert(
          'Notifications required',
          'Please allow notifications to receive festival reminders.',
        );
        return;
      }
      const result = await applySettings({ remindersEnabled: true });
      if (result.permissionDenied) {
        Alert.alert('Permission needed', 'Allow notifications to schedule festival reminders.');
      }
      return;
    }

    await cancelFestivalReminders();
    setScheduledCount(0);
    await applySettings({ remindersEnabled: false });
  };

  const handleFeedbackPress = async () => {
    const url = getFeedbackUrl();
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Could not open feedback',
        'Please try again, or open the feedback form from your browser.',
      );
    }
  };

  const handlePrivacyPress = async () => {
    const url = getPrivacyPolicyUrl();
    if (!url) {
      Alert.alert(
        'Privacy policy',
        'Privacy policy URL is not configured yet. See docs/PLAY_STORE.md in the project.',
      );
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open link', 'Please try again in your browser.');
    }
  };

  const handleSupportEmailPress = async () => {
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    } catch {
      Alert.alert('Could not open email', SUPPORT_EMAIL);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]}
      >
        <ScreenHeader
          title="Settings"
          subtitle="Daily practice, reminders & motion"
          icon="settings-outline"
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Practice</Text>
          <Text style={styles.cardDescription}>Set a gentle intention. Completed malas in either counting mode contribute to your goal.</Text>
          <Text style={styles.pickerLabel}>Daily mala goal</Text>
          <View style={styles.intensityRow}>
            {[1, 3, 5, 11].map((goal) => (
              <Pressable key={goal} accessibilityRole="button" accessibilityLabel={`Daily goal ${goal} malas`}
                accessibilityState={{ selected: settings.dailyMalaGoal === goal }}
                onPress={() => void applySettings({ dailyMalaGoal: goal })}
                style={[styles.intensityChip, settings.dailyMalaGoal === goal && styles.intensityChipActive]}>
                <Text style={[styles.intensityText, settings.dailyMalaGoal === goal && styles.intensityTextActive]}>{goal} mala{goal === 1 ? '' : 's'}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.rowLabel}>Daily chanting reminder</Text>
            <Switch accessibilityLabel="Daily chanting reminder" value={settings.practiceReminderEnabled}
              disabled={Platform.OS === 'web'} trackColor={{ false: '#5c0a0a', true: colors.saffron }}
              onValueChange={(enabled) => {
                void (async () => {
                  if (enabled && !await requestNotificationPermission()) {
                    Alert.alert('Notifications required', 'Allow notifications in system settings to receive your daily chanting reminder.');
                    return;
                  }
                  await applySettings({ practiceReminderEnabled: enabled });
                })().catch(() => Alert.alert('Reminder unavailable', 'Please try setting your reminder again.'));
              }} />
          </View>
          {settings.practiceReminderEnabled && <TimePickerRow label="Chanting time" value={settings.practiceReminderTime}
            onChange={(practiceReminderTime) => void applySettings({ practiceReminderTime })} />}
          {Platform.OS === 'web' && <Text style={styles.helperText}>Test notifications on an Android or iPhone device.</Text>}
          <View style={styles.switchRow}>
            <Text style={styles.rowLabel}>Animated interactions</Text>
            <Switch accessibilityLabel="Animated interactions" value={settings.animationsEnabled}
              trackColor={{ false: '#5c0a0a', true: colors.saffron }}
              onValueChange={(animationsEnabled) => void applySettings({ animationsEnabled })} />
          </View>
          <Text style={styles.helperText}>Motion respects your device's reduced-motion setting. Ambient glow pauses when you leave the counter.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Festival Reminders</Text>
          <Text style={styles.cardDescription}>
            One reminder per festival at the time you choose — the day before or on the festival day.
          </Text>

          <View style={styles.permissionRow}>
            <View style={styles.permissionCopy}>
              <Text style={styles.rowLabel}>Notification permission</Text>
              <Text style={styles.permissionStatus}>
                {permission === 'granted' ? 'Allowed' : permission === 'denied' ? 'Denied' : 'Not requested'}
              </Text>
            </View>
            {permission !== 'granted' && (
              <Pressable style={styles.permissionButton} onPress={() => void handlePermissionRequest()}>
                <Text style={styles.permissionButtonText}>Allow</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.rowLabel}>Festival reminders</Text>
            <Switch
              value={settings.remindersEnabled}
              onValueChange={(value) => void handleReminderToggle(value)}
              trackColor={{ false: '#5c0a0a', true: colors.saffron }}
              thumbColor={
                Platform.OS === 'android'
                  ? settings.remindersEnabled
                    ? colors.maroon
                    : colors.cream
                  : settings.remindersEnabled
                    ? colors.gold
                    : '#f4f3f4'
              }
            />
          </View>

          {settings.remindersEnabled && (
            <>
              <Text style={styles.pickerLabel}>When to remind</Text>
              <View style={styles.timingRow}>
                {(['day_before', 'on_day'] as FestivalReminderTiming[]).map((timing) => (
                  <Pressable
                    key={timing}
                    accessibilityRole="button"
                    accessibilityState={{ selected: settings.reminderTiming === timing }}
                    onPress={() => {
                      void triggerSelectionHaptic();
                      void applySettings({ reminderTiming: timing });
                    }}
                    style={[
                      styles.timingChip,
                      settings.reminderTiming === timing && styles.timingChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timingChipText,
                        settings.reminderTiming === timing && styles.timingChipTextActive,
                      ]}
                    >
                      {FESTIVAL_REMINDER_TIMING_LABELS[timing]}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TimePickerRow
                label="Reminder time"
                value={settings.reminderTime}
                onChange={(reminderTime) => void applySettings({ reminderTime })}
              />
              <Text style={styles.helperText}>
                {scheduledCount} reminders scheduled for upcoming festivals in{' '}
                {CALENDAR_LOCALE_LABELS[settings.calendarLocale]}.
              </Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{copy.counterModeTitle}</Text>
          <Text style={styles.cardDescription}>
            Choose 108 mala rounds or continuous naam jaap (up to 10 crore). Each mode saves its own
            count.
          </Text>
          <View style={[styles.intensityRow, styles.modeRow]}>
            {(['mala', 'jaap'] as CounterMode[]).map((mode) => (
              <Pressable
                key={mode}
                accessibilityRole="button"
                accessibilityState={{ selected: settings.counterMode === mode }}
                onPress={() => {
                  void triggerSelectionHaptic();
                  if (mode !== settings.counterMode) {
                    confirmAction(copy.switchModeTitle, copy.switchModeMessage, 'Switch', () => {
                      void applySettings({ counterMode: mode });
                    });
                  }
                }}
                style={[
                  styles.intensityChip,
                  styles.modeChip,
                  settings.counterMode === mode && styles.intensityChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.intensityText,
                    settings.counterMode === mode && styles.intensityTextActive,
                  ]}
                >
                  {mode === 'mala' ? copy.modeMala : copy.modeJaap}
                </Text>
                <Text style={styles.modeChipHint}>
                  {mode === 'mala' ? copy.counterModeMalaHint : copy.counterModeJaapHint}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.dailyResetSection}>
            <View style={styles.switchRow}>
              <View style={styles.dailyResetCopy}>
                <Text style={styles.rowLabel}>{copy.malaDailyResetTitle}</Text>
                <Text style={styles.dailyResetHint}>{copy.malaDailyResetDescription}</Text>
              </View>
              <Switch
                value={settings.malaDailyReset}
                onValueChange={(value) => {
                  void triggerSelectionHaptic();
                  void applySettings({ malaDailyReset: value });
                }}
                trackColor={{ false: '#5c0a0a', true: colors.saffron }}
                thumbColor={
                  Platform.OS === 'android'
                    ? settings.malaDailyReset
                      ? colors.maroon
                      : colors.cream
                    : settings.malaDailyReset
                      ? colors.gold
                      : '#f4f3f4'
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Counter Vibration</Text>
          <Text style={styles.cardDescription}>Choose how strong each count pulse feels, or turn vibration off.</Text>
          <View style={styles.intensityRow}>
            {INTENSITIES.map((intensity) => (
              <Pressable
                key={intensity}
                accessibilityRole="button"
                accessibilityState={{ selected: settings.vibrationIntensity === intensity }}
                onPress={() => {
                  if (intensity !== 'none') {
                    void triggerSelectionHaptic();
                  }
                  void setVibrationIntensity(intensity);
                }}
                style={[
                  styles.intensityChip,
                  settings.vibrationIntensity === intensity && styles.intensityChipActive,
                ]}
              >
                <Ionicons
                  name={vibrationIcon(intensity)}
                  size={16}
                  color={settings.vibrationIntensity === intensity ? colors.gold : colors.creamMuted}
                />
                <Text
                  style={[
                    styles.intensityText,
                    settings.vibrationIntensity === intensity && styles.intensityTextActive,
                  ]}
                >
                  {VIBRATION_LABELS[intensity]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hindu Traditions</Text>
          <Text style={styles.cardDescription}>
            Learn about the sacred practices behind this app.
          </Text>

          {TRADITION_TIPS.filter((tip) => tip.id === '108-sacred').map((tip) => (
            <TraditionInsightCard
              key={tip.id}
              title={tip.title}
              body={tip.body}
              icon={TRADITION_ICONS[tip.id]}
            />
          ))}

          <TraditionInsightCard
            title={LUNAR_CALENDAR_INFO.title}
            body={LUNAR_CALENDAR_INFO.body}
            icon="moon-outline"
          />

          {TRADITION_TIPS.filter((tip) => tip.id !== '108-sacred' && tip.id !== 'masam').map((tip) => (
            <TraditionInsightCard
              key={tip.id}
              title={tip.title}
              body={tip.body}
              icon={TRADITION_ICONS[tip.id]}
            />
          ))}

        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal & support</Text>
          <Text style={styles.cardDescription}>
            Privacy policy and contact details for Google Play and app support.
          </Text>
          <Pressable style={styles.legalRow} onPress={() => void handlePrivacyPress()}>
            <Ionicons name="document-text-outline" size={20} color={colors.gold} />
            <Text style={styles.legalRowText}>Privacy policy</Text>
            <Ionicons name="open-outline" size={16} color={colors.creamMuted} />
          </Pressable>
          <Pressable style={styles.legalRow} onPress={() => void handleSupportEmailPress()}>
            <Ionicons name="mail-outline" size={20} color={colors.gold} />
            <Text style={styles.legalRowText}>{SUPPORT_EMAIL}</Text>
          </Pressable>
          <Text style={styles.versionText}>Version {getAppVersion()}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.promiseBox}>
            <Ionicons name="heart-outline" size={20} color={colors.gold} />
            <View style={styles.promiseCopy}>
              <Text style={styles.promiseTitle}>{APP_TRADITION_PROMISE.title}</Text>
              <Text style={styles.promiseBody}>{APP_TRADITION_PROMISE.body}</Text>
              <Pressable style={styles.feedbackButton} onPress={() => void handleFeedbackPress()}>
                <Ionicons name={getFeedbackButtonIcon()} size={16} color={colors.gold} />
                <Text style={styles.feedbackButtonText}>{getFeedbackButtonLabel()}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.18)',
    gap: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.gold },
  cardDescription: { fontSize: 14, lineHeight: 20, color: colors.creamMuted },
  permissionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  permissionCopy: { flex: 1 },
  permissionStatus: { marginTop: 4, fontSize: 13, color: colors.saffronLight },
  permissionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 153, 51, 0.25)',
  },
  permissionButtonText: { fontSize: 14, fontWeight: '700', color: colors.cream },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.cream, flex: 1, paddingRight: 12 },
  helperText: { fontSize: 13, color: colors.creamMuted },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.creamMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  timingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timingChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.22)',
    alignItems: 'center',
  },
  timingChipActive: {
    backgroundColor: 'rgba(255, 153, 51, 0.22)',
    borderColor: colors.gold,
  },
  timingChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.creamMuted,
  },
  timingChipTextActive: {
    color: colors.gold,
  },
  intensityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  intensityChip: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 72,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.22)',
  },
  intensityChipActive: {
    backgroundColor: 'rgba(255, 153, 51, 0.22)',
    borderColor: colors.gold,
  },
  intensityText: { fontSize: 12, fontWeight: '600', color: colors.creamMuted },
  intensityTextActive: { color: colors.gold },
  modeRow: {
    flexWrap: 'nowrap',
  },
  modeChip: {
    flexBasis: '48%',
    minWidth: 0,
  },
  modeChipHint: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    color: colors.creamMuted,
    paddingHorizontal: 4,
  },
  dailyResetSection: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.12)',
  },
  dailyResetCopy: {
    flex: 1,
    paddingRight: 12,
  },
  dailyResetHint: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.creamMuted,
  },
  promiseBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 153, 51, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.28)',
  },
  promiseCopy: { flex: 1 },
  promiseTitle: { fontSize: 15, fontWeight: '700', color: colors.gold, marginBottom: 4 },
  promiseBody: { fontSize: 13, lineHeight: 20, color: colors.creamMuted },
  feedbackButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
  },
  feedbackButtonText: { fontSize: 13, fontWeight: '700', color: colors.gold },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.12)',
  },
  legalRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
  },
  versionText: {
    marginTop: 12,
    fontSize: 12,
    color: colors.creamMuted,
  },
});
