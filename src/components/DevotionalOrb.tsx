import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { MalaRing } from './MalaRing';
import { colors } from '../constants/theme';
import { formatJaapTotalBar, jaapTotalBarFontSize } from '../utils/formatCount';

type Props = {
  count: number; ringCount: number; size: number; isJaap: boolean; disabled: boolean;
  motionEnabled: boolean; ambientEnabled: boolean; onCount: () => void;
};

export function DevotionalOrb({ count, ringCount, size, isJaap, disabled, motionEnabled, ambientEnabled, onCount }: Props) {
  const scale = useSharedValue(1);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const breath = useSharedValue(0);
  const ripple = useSharedValue(1);
  const discSize = size * 0.775;
  const displayBeads = isJaap && count > 0 && ringCount === 0 ? 108 : ringCount;
  useEffect(() => {
    cancelAnimation(breath);
    breath.value = ambientEnabled
      ? withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true)
      : 0;
    return () => cancelAnimation(breath);
  }, [ambientEnabled, breath]);
  useEffect(() => {
    if (!motionEnabled) {
      cancelAnimation(scale); cancelAnimation(tiltX); cancelAnimation(tiltY); cancelAnimation(ripple);
      scale.value = 1; tiltX.value = 0; tiltY.value = 0; ripple.value = 1;
    }
  }, [motionEnabled, scale, tiltX, tiltY, ripple]);
  const touchStyle = useAnimatedStyle(() => ({ transform: [
    { perspective: 900 }, { rotateX: `${tiltX.value}deg` },
    { rotateY: `${tiltY.value}deg` }, { scale: scale.value },
  ] }));
  const auraStyle = useAnimatedStyle(() => ({ opacity: 0.3 + breath.value * 0.3,
    transform: [{ scale: 1 + breath.value * 0.055 }] }));
  const rippleStyle = useAnimatedStyle(() => ({ opacity: (1 - ripple.value) * 0.65,
    transform: [{ scale: 0.95 + ripple.value * 0.4 }] }));
  const release = () => {
    if (!motionEnabled) return;
    scale.value = withSpring(1, { damping: 14, stiffness: 230 });
    tiltX.value = withSpring(0); tiltY.value = withSpring(0);
  };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={isJaap ? 'Increment jaap count' : 'Increment mala count'}
      accessibilityHint="Adds one chant. You can undo an accidental tap."
      accessibilityState={{ disabled }} disabled={disabled} testID="counter-orb"
      onPressIn={(event) => {
        if (!motionEnabled) return;
        const { locationX, locationY } = event.nativeEvent;
        tiltX.value = withTiming(-(locationY / size - 0.5) * 9, { duration: 80 });
        tiltY.value = withTiming((locationX / size - 0.5) * 9, { duration: 80 });
        scale.value = withTiming(0.965, { duration: 80 });
      }} onPressOut={release}
      onPress={() => {
        onCount();
        if (motionEnabled) { ripple.value = 0; ripple.value = withTiming(1, { duration: 550 }); }
      }} style={{ width: size, height: size }}>
      <Animated.View pointerEvents="none" style={[styles.aura, { width: discSize + 38, height: discSize + 38,
        borderRadius: size, left: (size - discSize - 38) / 2, top: (size - discSize - 38) / 2 }, auraStyle]} />
      <Animated.View pointerEvents="none" style={[{ width: size, height: size }, touchStyle]}>
        <View style={[styles.disc, { width: discSize, height: discSize, borderRadius: discSize / 2,
          left: (size - discSize) / 2, top: (size - discSize) / 2 }]}>
          <Svg width={discSize} height={discSize} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="discCopper" cx="34%" cy="18%" rx="86%" ry="86%">
                <Stop offset="0%" stopColor="#91541e" />
                <Stop offset="38%" stopColor="#582608" />
                <Stop offset="82%" stopColor="#2d0b03" />
                <Stop offset="100%" stopColor="#b17628" />
              </RadialGradient>
            </Defs>
            <Circle cx={discSize / 2} cy={discSize / 2} r={discSize / 2 - 1} fill="url(#discCopper)" stroke="#e8b450" strokeWidth={2} />
            <Circle cx={discSize / 2} cy={discSize / 2} r={discSize / 2 - 7} fill="none" stroke="#eed09b" strokeOpacity={0.28} strokeWidth={0.7} />
            <Circle cx={discSize / 2} cy={discSize / 2} r={discSize / 2 - 11} fill="none" stroke="#14090b" strokeWidth={3} />
          </Svg>
          <Image source={require('../../assets/jaap-mandala-enhanced.png')} resizeMode="cover" style={styles.mandala} />
          <LinearGradient colors={['rgba(255,236,184,0.12)', 'transparent', 'rgba(0,0,0,0.3)']}
            style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }} />
          <View style={[styles.countContent, { paddingHorizontal: discSize * 0.1 }]}>

            <Text allowFontScaling={false} style={[styles.om, { fontSize: discSize * 0.16, lineHeight: discSize * 0.2, marginBottom: discSize * 0.012 }]}>ॐ</Text>
            <Text testID="count-value" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.35}
              maxFontSizeMultiplier={1.2} style={[styles.count, { fontSize: isJaap ? Math.min(discSize * 0.24, jaapTotalBarFontSize(count)) : discSize * 0.29, lineHeight: discSize * 0.36 }]}>
              {isJaap ? formatJaapTotalBar(count) : count}
            </Text>
            <View style={[styles.divider, { width: discSize * 0.18, marginVertical: discSize * 0.035 }]} />
            <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={[styles.label, { fontSize: Math.min(9, discSize * 0.05), letterSpacing: discSize < 150 ? 0.6 : 2 }]}>{isJaap ? 'TOTAL NAAM JAAP' : 'OF 108 CHANTS'}</Text>
          </View>
        </View>
        <Animated.View style={[styles.ripple, { width: discSize, height: discSize, borderRadius: discSize / 2,
          left: (size - discSize) / 2, top: (size - discSize) / 2 }, rippleStyle]} />
        <MalaRing count={displayBeads} size={size} motionEnabled={motionEnabled} />
      </Animated.View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  aura: { position: 'absolute', backgroundColor: '#a76c2c', shadowColor: '#d7a34a', shadowOpacity: 0.35,
    shadowRadius: 30, shadowOffset: { width: 0, height: 0 } },
  disc: { position: 'absolute', overflow: 'hidden', backgroundColor: '#251113',
    shadowColor: '#000', shadowOpacity: 0.7, shadowRadius: 18, shadowOffset: { width: 0, height: 16 }, elevation: 12 },
  mandala: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.09 },
  countContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
  om: { fontFamily: 'Devotional', color: '#e7c182', opacity: 0.8, lineHeight: 48, marginBottom: 3 },
  count: { width: '100%', textAlign: 'center', color: '#fff4d1', fontFamily: 'DisplaySerif', fontVariant: ['tabular-nums'], letterSpacing: -2,
    textShadowColor: '#140806', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 3 },
  divider: { width: 30, height: 1, backgroundColor: '#ceaa63', opacity: 0.6, marginVertical: 8 },
  label: { color: colors.creamMuted, fontSize: 9, fontWeight: '600', letterSpacing: 2 },
  ripple: { position: 'absolute', borderColor: '#ffe0a0', borderWidth: 1.4 },
});
