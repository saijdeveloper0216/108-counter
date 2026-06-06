import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ANDROID_MIN_BOTTOM_INSET, platformLayout } from '../constants/platformLayout';

function resolveBottomInset(rawBottom: number) {
  if (Platform.OS !== 'android') {
    return rawBottom;
  }
  return Math.max(rawBottom, ANDROID_MIN_BOTTOM_INSET);
}

export function useBottomTabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = resolveBottomInset(insets.bottom);
  const tabBarHeight =
    platformLayout.tabBarBodyHeight + platformLayout.tabBarTopPadding + bottomInset + 6;
  const scrollBottomPadding = tabBarHeight + (Platform.OS === 'android' ? 28 : 20);

  return {
    topInset: insets.top,
    bottomInset,
    tabBarHeight,
    scrollBottomPadding,
    screenPaddingHorizontal: platformLayout.screenHorizontalPadding,
  };
}
