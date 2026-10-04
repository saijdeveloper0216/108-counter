import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, RadialGradient, Stop } from 'react-native-svg';
import { TOTAL_COUNT } from '../constants/theme';

type MalaRingProps = { count: number; size: number; motionEnabled?: boolean };

export function computeMalaMandalaSize(ringSize: number): number {
  return Math.floor(ringSize * 0.77);
}

export function MalaRing({ count, size, motionEnabled = true }: MalaRingProps) {
  const center = size / 2;
  const ringRadius = size * 0.447;
  const beadRadius = size * 0.0105;
  const angle = useSharedValue(0);
  const previous = useRef(count);
  useEffect(() => {
    const target = Math.max(0, count - 1) * Math.PI * 2 / TOTAL_COUNT;
    if (!motionEnabled || count === 0 || (previous.current === TOTAL_COUNT && count === 1)) angle.value = target;
    else angle.value = withTiming(target, { duration: 150 });
    previous.current = count;
  }, [count, motionEnabled, angle]);
  const activeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.sin(angle.value) * ringRadius },
      { translateY: -Math.cos(angle.value) * ringRadius },
    ],
  }));
  const activeSize = Math.max(15, size * 0.059);
  return (
    <>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="beadGold" cx="30%" cy="22%" rx="72%" ry="72%">
            <Stop offset="0%" stopColor="#fff9dc" />
            <Stop offset="33%" stopColor="#efc66b" />
            <Stop offset="72%" stopColor="#b57530" />
            <Stop offset="100%" stopColor="#563117" />
          </RadialGradient>
          <RadialGradient id="beadRest" cx="28%" cy="20%" rx="75%" ry="75%">
            <Stop offset="0%" stopColor="#a77a47" />
            <Stop offset="45%" stopColor="#60402b" />
            <Stop offset="100%" stopColor="#291917" />
          </RadialGradient>
        </Defs>
        <Circle cx={center} cy={center} r={ringRadius} stroke="#644422" strokeWidth={1} fill="none" />
        <Circle cx={center} cy={center} r={size * 0.48} stroke="#e2ba68" strokeOpacity={0.12} strokeWidth={0.7} fill="none" />
        {Array.from({ length: TOTAL_COUNT }, (_, i) => {
          const radians = i / TOTAL_COUNT * Math.PI * 2 - Math.PI / 2;
          const x = center + ringRadius * Math.cos(radians);
          const y = center + ringRadius * Math.sin(radians);
          const filled = i < count;
          return (
            <G key={i}>
              <Circle cx={x + 0.6} cy={y + 1.2} r={beadRadius + 0.4} fill="#070405" opacity={0.7} />
              <Circle cx={x} cy={y} r={beadRadius} fill={filled ? 'url(#beadGold)' : 'url(#beadRest)'} stroke={filled ? '#efcf89' : '#775332'} strokeWidth={0.45} />
            </G>
          );
        })}
      </Svg>
      {count > 0 && (
        <Animated.View pointerEvents="none" style={[
          styles.active, { width: activeSize, height: activeSize, borderRadius: activeSize / 2,
            left: center - activeSize / 2, top: center - activeSize / 2 }, activeStyle,
        ]}>
          <Svg width={activeSize} height={activeSize}>
            <Defs>
              <RadialGradient id="focusBead" cx="28%" cy="23%" rx="75%" ry="75%">
                <Stop offset="0%" stopColor="#fffce9" />
                <Stop offset="25%" stopColor="#fbe3a3" />
                <Stop offset="60%" stopColor="#c58b3f" />
                <Stop offset="100%" stopColor="#5f3616" />
              </RadialGradient>
            </Defs>
            <Circle cx={activeSize / 2} cy={activeSize / 2} r={activeSize / 2 - 1} fill="url(#focusBead)" stroke="#ffdd8d" strokeWidth={1} />
          </Svg>
        </Animated.View>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  active: { position: 'absolute', shadowColor: '#f9c76d', shadowOpacity: 0.8, shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 }, elevation: 5 },
});
