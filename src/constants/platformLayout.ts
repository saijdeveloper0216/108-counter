import { Platform, type ViewStyle } from 'react-native';

/** Pixel / gesture-nav devices often report 0 bottom inset without initialWindowMetrics. */
export const ANDROID_MIN_BOTTOM_INSET = 28;

export const SCREEN_HORIZONTAL_PADDING = 20;

export const platformLayout = {
  screenHorizontalPadding: SCREEN_HORIZONTAL_PADDING,
  screenGap: Platform.select({ android: 14, ios: 16, default: 16 }) as number,
  tabBarBodyHeight: Platform.select({ android: 58, ios: 50, default: 52 }) as number,
  tabBarTopPadding: Platform.select({ android: 10, ios: 8, default: 8 }) as number,
  tabBarLabelSize: Platform.select({ android: 11, ios: 11, default: 11 }) as number,
  headerTitleSize: 26,
  /** Room for header, mode toggle, mala card, stats, buttons, and tab bar. */
  counterRingMaxSize: Platform.select({ android: 252, ios: 268, default: 268 }) as number,
  counterRingWidthInset: 80,
  counterRingAndroidTrim: 8,
  counterDisplaySize: Platform.select({ android: 58, ios: 68, default: 68 }) as number,
  /** Gap between stats row and the ring. */
  counterStatsRingGap: Platform.select({ android: 12, ios: 12, default: 12 }) as number,
  /** Gap between the ring and Tap to count. */
  counterRingTapGap: Platform.select({ android: 16, ios: 14, default: 14 }) as number,
  /** Naam jaap: tighter gap between circle and Tap to continue. */
  jaapRingTapGap: Platform.select({ android: 14, ios: 12, default: 12 }) as number,
  jaapRingMaxSize: Platform.select({ android: 268, ios: 280, default: 280 }) as number,
};

/** 108 Mala — includes mala card, stats, tap button, and tab bar. */
const COUNTER_CHROME_HEIGHT = Platform.select({ android: 438, ios: 418, default: 428 }) as number;

/** Naam jaap — header, toggle, total bar, circle, tap button, actions, tab bar. */
const JAAP_CHROME_HEIGHT = Platform.select({ android: 400, ios: 382, default: 392 }) as number;

function computeRingSize(windowWidth: number, windowHeight: number, chromeHeight: number, maxSize: number) {
  const byWidth = windowWidth - platformLayout.counterRingWidthInset;
  const byHeight = windowHeight - chromeHeight;
  let size = Math.floor(Math.max(160, Math.min(byWidth, byHeight, maxSize)));
  if (Platform.OS === 'android') {
    size = Math.max(160, size - platformLayout.counterRingAndroidTrim);
  }
  return size;
}

/** Ring size: wide as the reference, but capped so buttons stay on one screen. */
export function computeCounterRingSize(windowWidth: number, windowHeight: number): number {
  return computeRingSize(
    windowWidth,
    windowHeight,
    COUNTER_CHROME_HEIGHT,
    platformLayout.counterRingMaxSize,
  );
}

export function computeJaapRingSize(windowWidth: number, windowHeight: number): number {
  return computeRingSize(
    windowWidth,
    windowHeight,
    JAAP_CHROME_HEIGHT,
    platformLayout.jaapRingMaxSize,
  );
}

export function androidScrollContent(paddingBottom: number): ViewStyle {
  return Platform.OS === 'android'
    ? {
        flexGrow: 1,
        paddingBottom,
      }
    : { paddingBottom };
}
