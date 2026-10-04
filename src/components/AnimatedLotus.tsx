import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

const VIEWBOX_WIDTH = 180;
const VIEWBOX_HEIGHT = 145;
const PETAL_PIVOT_Y = 117;
const PETALS = [
  { d: 'M90 117 C46 116 20 86 20 55 C52 57 78 78 90 117', fold: 52, opacity: 0.58 },
  { d: 'M90 117 C134 116 160 86 160 55 C128 57 102 78 90 117', fold: -52, opacity: 0.58 },
  { d: 'M90 117 C48 103 38 66 48 32 C79 46 90 82 90 117', fold: 30, opacity: 0.8 },
  { d: 'M90 117 C132 103 142 66 132 32 C101 46 90 82 90 117', fold: -30, opacity: 0.8 },
  { d: 'M90 117 C56 85 65 39 90 15 C115 39 124 85 90 117', fold: 0, opacity: 1 },
  { d: 'M90 118 C60 139 34 116 31 94 C57 94 76 104 90 118', fold: 68, opacity: 1 },
  { d: 'M90 118 C120 139 146 116 149 94 C123 94 104 104 90 118', fold: -68, opacity: 1 },
];

type PetalProps = {
  d: string;
  fold: number;
  opacity: number;
  index: number;
  size: number;
  progress: SharedValue<number>;
};

function Petal({ d, fold, opacity, index, size, progress }: PetalProps) {
  const height = size * VIEWBOX_HEIGHT / VIEWBOX_WIDTH;
  const pivotOffset = (PETAL_PIVOT_Y - VIEWBOX_HEIGHT / 2) * size / VIEWBOX_WIDTH;
  const gradientId = `lotus-petal-${index}`;
  // Animate a standard RN View. Animated SVG props bypass react-native-svg's
  // string-to-matrix parser, which makes SVG transform strings crash on Android.
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: pivotOffset },
      { rotate: `${fold * (1 - progress.value)}deg` },
      { translateY: -pivotOffset },
    ],
  }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, style]}>
      <Svg width={size} height={height} viewBox="0 0 180 145">
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#ffe4a5" />
            <Stop offset="100%" stopColor="#ad6e32" />
          </LinearGradient>
        </Defs>
        <Path d={d} fill={`url(#${gradientId})`} opacity={opacity} />
      </Svg>
    </Animated.View>
  );
}

export function AnimatedLotus({ motionEnabled = true, size = 150 }: { motionEnabled?: boolean; size?: number }) {
  const open = useSharedValue(motionEnabled ? 0 : 1);
  useEffect(() => {
    open.value = motionEnabled ? withTiming(1, { duration: 1100 }) : 1;
  }, [motionEnabled, open]);
  const height = size * VIEWBOX_HEIGHT / VIEWBOX_WIDTH;
  const style = useAnimatedStyle(() => ({
    opacity: 0.2 + open.value * 0.8,
    transform: [
      { scale: 0.65 + open.value * 0.35 },
      { translateY: (1 - open.value) * 12 },
    ],
  }));
  return (
    <View pointerEvents="none" style={{ width: size, height }}>
      <Animated.View style={[StyleSheet.absoluteFillObject, style]}>
        <Svg width={size} height={height} viewBox="0 0 180 145">
          <Ellipse cx={90} cy={126} rx={59} ry={6} fill="#d4a557" opacity={0.12} />
        </Svg>
        {PETALS.map((petal, index) => (
          <Petal key={index} {...petal} index={index} size={size} progress={open} />
        ))}
      </Animated.View>
    </View>
  );
}
