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

/** Glow extends beyond the tap target — reserve this in height math. */
export const RING_AURA_OVERFLOW = 28;

/** Counter screen top padding inside SafeAreaView. */
export const COUNTER_ROOT_TOP_PADDING = Platform.select({ android: 8, ios: 12, default: 10 }) as number;

/** 108 Mala — header, toggle, mala card, stats, tap button, actions, tab bar. */
const COUNTER_CHROME_HEIGHT = Platform.select({ android: 492, ios: 468, default: 478 }) as number;

/** Naam jaap — header, toggle, total bar, circle, tap button, actions, tab bar. */
const JAAP_CHROME_HEIGHT = Platform.select({ android: 448, ios: 428, default: 438 }) as number;

export type RingLayoutContext = {
  tabBarHeight?: number;
  topInset?: number;
};

function resolveContentHeight(windowHeight: number, layout?: RingLayoutContext) {
  const tabBar = layout?.tabBarHeight ?? 0;
  const topInset = layout?.topInset ?? 0;
  return windowHeight - tabBar - topInset - COUNTER_ROOT_TOP_PADDING;
}

function scaledRingMax(baseMax: number, contentHeight: number) {
  if (contentHeight < 720) {
    return Math.min(baseMax, 208);
  }
  if (contentHeight < 760) {
    return Math.min(baseMax, 224);
  }
  if (contentHeight < 820) {
    return Math.min(baseMax, 238);
  }
  return baseMax;
}

function computeRingSize(
  windowWidth: number,
  windowHeight: number,
  chromeHeight: number,
  maxSize: number,
  layout?: RingLayoutContext,
) {
  const contentHeight = resolveContentHeight(windowHeight, layout);
  const cappedMax = scaledRingMax(maxSize, contentHeight);
  const byWidth = windowWidth - platformLayout.counterRingWidthInset;
  const byHeight = contentHeight - chromeHeight - RING_AURA_OVERFLOW;
  let size = Math.floor(Math.max(160, Math.min(byWidth, byHeight, cappedMax)));
  if (Platform.OS === 'android') {
    size = Math.max(160, size - platformLayout.counterRingAndroidTrim);
  }
  return size;
}

/** Never let the ring exceed the flex space allocated to mainStage. */
export function fitRingToStageHeight(
  ringSize: number,
  stageHeight: number,
  {
    statsGap,
    tapGap,
    auraOverflow = RING_AURA_OVERFLOW,
  }: { statsGap: number; tapGap: number; auraOverflow?: number },
): number {
  if (stageHeight <= 0) {
    return ringSize;
  }
  const maxInStage = stageHeight - statsGap - tapGap - auraOverflow;
  return Math.max(160, Math.min(ringSize, Math.floor(maxInStage)));
}

/** Ring size: wide as the reference, but capped so buttons stay on one screen. */
export function computeCounterRingSize(
  windowWidth: number,
  windowHeight: number,
  layout?: RingLayoutContext,
): number {
  return computeRingSize(
    windowWidth,
    windowHeight,
    COUNTER_CHROME_HEIGHT,
    platformLayout.counterRingMaxSize,
    layout,
  );
}

export function computeJaapRingSize(
  windowWidth: number,
  windowHeight: number,
  layout?: RingLayoutContext,
): number {
  return computeRingSize(
    windowWidth,
    windowHeight,
    JAAP_CHROME_HEIGHT,
    platformLayout.jaapRingMaxSize,
    layout,
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
