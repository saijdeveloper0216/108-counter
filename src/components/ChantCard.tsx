import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { formatChantCount } from '../utils/chantCount';
import { devotionalSerif } from './GoldMandala';

type Props = { count: string; width: number; height: number; isJaap: boolean; disabled: boolean; motionEnabled: boolean; ambientEnabled: boolean; onCount: () => void };
export function ChantCard({ count, width, height, isJaap, disabled, motionEnabled, ambientEnabled, onCount }: Props) {
  const [measuredWidth, setMeasuredWidth] = useState(width);
  const scale = useSharedValue(1);
  const ripple = useSharedValue(1);
  const glow = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(glow);
    glow.value = ambientEnabled ? withRepeat(withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }), -1, true) : 0;
    return () => { cancelAnimation(glow); };
  }, [ambientEnabled, glow]);
  useEffect(() => {
    if (!motionEnabled) { cancelAnimation(scale); cancelAnimation(ripple); scale.value = 1; ripple.value = 1; }
  }, [motionEnabled, ripple, scale]);
  const touchStyle = useAnimatedStyle(() => ({ transform: [{ perspective: 1000 }, { scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.16 + glow.value * 0.18 }));
  const rippleStyle = useAnimatedStyle(() => ({ opacity: (1 - ripple.value) * 0.7, transform: [{ scale: 1 + ripple.value * 0.045 }] }));
  const formatted = isJaap ? formatChantCount(count) : count;
  const longCount = count.length > 12;
  const fontSize = longCount ? Math.min(32, height * 0.32) : Math.max(18, Math.min(height * 0.36, (measuredWidth - 48) / (formatted.length * 0.60)));
  const labelSize = height < 130 ? 9 : 11;
  const tapSize = height < 130 ? 13 : 18;
  const number = <Text testID="count-value" accessibilityLabel={`${count} chants`} allowFontScaling={false}
    numberOfLines={longCount ? undefined : 1} adjustsFontSizeToFit={!longCount} minimumFontScale={0.6}
    style={[styles.number, { fontSize, lineHeight: fontSize * 1.2 }, longCount && { width: undefined, paddingHorizontal: 12 }]}>{formatted}</Text>;
  return <Pressable testID="counter-orb" accessibilityRole="button" accessibilityLabel={isJaap ? 'Increment jaap count' : 'Increment mala count'}
    accessibilityHint={longCount ? 'Adds one chant. Swipe the number sideways to read every digit.' : 'Adds one chant. Undo reverses an accidental tap.'}
    accessibilityState={{ disabled }} disabled={disabled} onPressIn={() => { if (motionEnabled) scale.value = withTiming(0.978, { duration: 90 }); }}
    onPressOut={() => { if (motionEnabled) scale.value = withSpring(1, { damping: 15, stiffness: 210 }); }}
    onPress={() => { onCount(); if (motionEnabled) { ripple.value = 0; ripple.value = withTiming(1, { duration: 550 }); } }} onLayout={event => setMeasuredWidth(event.nativeEvent.layout.width)} style={{ width: '100%', height, flexShrink: 0 }}>
    <Animated.View pointerEvents="none" style={[styles.aura, glowStyle]} />
    <Animated.View style={[styles.frame, touchStyle]}>
      <View collapsable={false} style={styles.face}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image accessible={false} source={require('../../assets/ui/chant-panel.png')} resizeMode="stretch"
            style={{ position: 'absolute', left: -measuredWidth * 0.02, top: -height * 0.06, width: measuredWidth * 1.04, height: height * 1.12 }} />
        </View>
        <View style={[styles.textContent, { paddingVertical: height * 0.1 }]}>
          <View testID="chant-label-row" style={{ height: Math.max(16, height * 0.16), justifyContent: 'center', width: '100%' }}>
            <Text allowFontScaling={false} numberOfLines={1} style={[styles.label, { fontSize: labelSize, lineHeight: labelSize * 1.4 }]}>{isJaap ? 'TOTAL CHANTS' : 'MALA CHANTS'}</Text>
          </View>
          <View testID="chant-number-row" style={styles.numberArea}>
            {longCount ? <ScrollView horizontal showsHorizontalScrollIndicator style={styles.numberScroll} contentContainerStyle={{ alignItems: 'center' }}>{number}</ScrollView> : number}
          </View>
          <View testID="chant-tap-row" style={[styles.tapRow, { height: Math.max(18, height * 0.18) }]}>
            <View style={styles.rule} /><Text allowFontScaling={false} numberOfLines={1} style={[styles.tap, { fontSize: tapSize, lineHeight: tapSize * 1.3 }]}>{disabled ? count === '108' && !isJaap ? 'Mala complete' : 'Restoring…' : 'Tap to chant'}</Text><View style={styles.rule} />
          </View>
        </View>
      </View>
      <Animated.View pointerEvents="none" style={[styles.ripple, rippleStyle]} />
    </Animated.View>
  </Pressable>;
}
const styles = StyleSheet.create({
  frame: { flex: 1, borderRadius: 25, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  aura: { ...StyleSheet.absoluteFillObject, borderRadius: 28, backgroundColor: 'transparent', shadowColor: '#f9ba43', shadowOpacity: 0.8, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } },
  border: { flex: 1, padding: 3, borderRadius: 25 }, face: { flex: 1, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  textContent: { ...StyleSheet.absoluteFillObject, paddingHorizontal: 24, alignItems: 'center', zIndex: 1 },
  numberArea: { flex: 1, minHeight: 0, width: '100%', alignItems: 'center', justifyContent: 'center' },
  innerBorder: { position: 'absolute', top: 5, left: 5, bottom: 5, right: 5, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(248,201,111,0.5)' },
  label: { color: '#f8dfa7', fontSize: 10, fontFamily: devotionalSerif, letterSpacing: 3.2, textAlign: 'center', width: '100%', includeFontPadding: false, textAlignVertical: 'center' },
  number: { width: '100%', color: '#fff4d1', fontFamily: devotionalSerif, fontVariant: ['tabular-nums'], textAlign: 'center', includeFontPadding: false, textShadowColor: '#140500', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 3 },
  numberScroll: { flexGrow: 0, width: '100%', height: '100%' }, tapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  tap: { color: '#f8e2b2', fontFamily: devotionalSerif, fontSize: 19, includeFontPadding: false, textAlignVertical: 'center' }, rule: { width: 26, height: 1, backgroundColor: '#b47b32', opacity: 0.6 },
  ripple: { ...StyleSheet.absoluteFillObject, borderRadius: 25, borderColor: '#ffedb6', borderWidth: 2 },
});
