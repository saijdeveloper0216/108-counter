import { Image, StyleSheet, View } from 'react-native';

/** Artwork is separate from native controls: counts and labels are never baked in. */
export function GoldMandala({ size }: { size: number }) {
  return <View testID="counter-mandala-art" pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
    <Image accessible={false} source={require('../../assets/ui/om-mandala.png')} resizeMode="contain" style={{ width: size, height: size }} />
  </View>;
}

export function DevotionalBorder() {
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
    <Image source={require('../../assets/ui/maroon-bells.png')} resizeMode="stretch" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
  </View>;
}

export const devotionalSerif = 'DisplaySerif';
