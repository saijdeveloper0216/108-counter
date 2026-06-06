import { LinearGradient } from 'expo-linear-gradient';
import { Image, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../constants/theme';

type JaapMandalaGlassProps = {
  size: number;
};

const mandalaSource = require('../../assets/jaap-mandala-enhanced.png');

const discGradient = ['#ffb366', '#ff9933', '#c9782a'] as const;

export function JaapMandalaGlass({ size }: JaapMandalaGlassProps) {
  const radius = size / 2;
  const center = size / 2;

  return (
    <View
      pointerEvents="none"
      style={[styles.frame, { width: size, height: size, borderRadius: radius }]}
    >
      <LinearGradient
        colors={[discGradient[0], discGradient[1], discGradient[2]]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Image
        source={mandalaSource}
        style={[styles.image, styles.imageDetail]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />

      <Image
        source={mandalaSource}
        style={[styles.image, Platform.OS === 'ios' ? styles.imageColorIos : styles.imageColorAndroid]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />

      <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="jaapGoldRim" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={discGradient[0]} stopOpacity="0" />
            <Stop offset="70%" stopColor={discGradient[1]} stopOpacity="0" />
            <Stop offset="82%" stopColor={discGradient[0]} stopOpacity="0.62" />
            <Stop offset="92%" stopColor={discGradient[1]} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={colors.gold} stopOpacity="0.96" />
          </RadialGradient>
        </Defs>
        <Circle cx={center} cy={center} r={radius} fill="url(#jaapGoldRim)" />
      </Svg>

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0)']}
        locations={[0, 0.22, 0.45]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.innerRing, { borderRadius: radius - 1 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    width: '132%',
    height: '132%',
    left: '-16%',
    top: '-16%',
  },
  imageDetail: {
    opacity: Platform.select({ ios: 0.78, android: 0.68, default: 0.72 }),
    mixBlendMode: 'multiply',
  },
  imageColorIos: {
    opacity: 0.52,
    mixBlendMode: 'overlay',
  },
  imageColorAndroid: {
    opacity: 0.44,
    mixBlendMode: 'soft-light',
  },
  innerRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.28)',
  },
});
