import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { TOTAL_COUNT } from '../constants/theme';
import type { VibrationIntensity } from '../types/settings';

const MILESTONES = new Set([27, 54, 81, 108]);
const SECTION_ENDS = new Set([9, 18, 36, 45, 63, 72, 90, 99]);
const MINI_MILESTONES = new Set([12, 24, 48, 60, 84, 96]);

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

function styleForIntensity(intensity: VibrationIntensity, level: 'soft' | 'mid' | 'strong') {
  if (intensity === 'gentle') {
    return level === 'strong'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
  }
  if (intensity === 'strong') {
    return level === 'soft'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Heavy;
  }
  return level === 'strong'
    ? Haptics.ImpactFeedbackStyle.Heavy
    : level === 'mid'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
}

async function pulse(
  intensity: VibrationIntensity,
  level: 'soft' | 'mid' | 'strong',
  gap = 0,
) {
  if (intensity === 'none') {
    return;
  }
  await Haptics.impactAsync(styleForIntensity(intensity, level));
  if (gap > 0) {
    await delay(gap);
  }
}

export async function triggerCountHaptic(nextCount: number, intensity: VibrationIntensity = 'balanced') {
  if (Platform.OS === 'web' || intensity === 'none') {
    return;
  }

  if (nextCount >= TOTAL_COUNT) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await pulse(intensity, 'strong', 80);
    await pulse(intensity, 'mid', 80);
    await pulse(intensity, 'strong', 80);
    await pulse(intensity, 'mid');
    return;
  }

  if (MILESTONES.has(nextCount)) {
    await pulse(intensity, 'mid', 65);
    await pulse(intensity, 'soft', 65);
    await pulse(intensity, 'mid', 65);
    await pulse(intensity, 'soft');
    return;
  }

  if (MINI_MILESTONES.has(nextCount)) {
    await pulse(intensity, 'soft', 45);
    await pulse(intensity, 'mid');
    return;
  }

  if (SECTION_ENDS.has(nextCount)) {
    await pulse(intensity, 'mid', 55);
    await pulse(intensity, 'soft');
    return;
  }

  const beadInSection = nextCount % 9;
  if (beadInSection === 0) {
    await pulse(intensity, 'mid');
    return;
  }

  if (beadInSection === 5) {
    await Haptics.selectionAsync();
    return;
  }

  if (beadInSection % 3 === 0) {
    await pulse(intensity, 'soft', intensity === 'gentle' ? 50 : 30);
    await pulse(intensity, 'soft');
    return;
  }

  if (intensity === 'gentle') {
    await Haptics.selectionAsync();
    return;
  }

  await pulse(intensity, 'soft');
}

export async function triggerActionHaptic(
  type: 'light' | 'medium' | 'heavy' | 'success' = 'light',
  intensity: VibrationIntensity = 'balanced',
) {
  if (Platform.OS === 'web' || intensity === 'none') {
    return;
  }

  if (type === 'success') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }

  const level = type === 'heavy' ? 'strong' : type === 'medium' ? 'mid' : 'soft';
  await pulse(intensity, level);
}

export async function triggerSelectionHaptic() {
  if (Platform.OS === 'web') {
    return;
  }

  await Haptics.selectionAsync();
}
