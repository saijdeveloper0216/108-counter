import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  highlight?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
  trailing?: ReactNode;
  onBack?: () => void;
  /** Tighter spacing for screens that must fit without scrolling (e.g. Counter). */
  dense?: boolean;
};

const HEADER_TITLE_SIZE = 26;
const HEADER_SUBTITLE_SIZE = 13;

const androidText = Platform.OS === 'android' ? { includeFontPadding: false as const } : {};

export function ScreenHeader({
  title,
  subtitle,
  eyebrow,
  highlight,
  icon,
  accent = colors.gold,
  trailing,
  onBack,
  dense = false,
}: ScreenHeaderProps) {
  const highlightLength = highlight?.length ?? 0;
  const titleRest = highlightLength > 0 ? title.slice(highlightLength) : title;

  return (
    <View style={[styles.wrap, dense && styles.wrapDense]}>
      <LinearGradient
        colors={['rgba(255, 153, 51, 0.22)', 'rgba(255, 215, 0, 0.08)', 'rgba(255, 255, 255, 0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, dense && styles.gradientDense]}
      >
        <View style={styles.row}>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack}
              style={({ pressed }) => [styles.leadingSlot, styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-back" size={22} color={accent} />
            </Pressable>
          ) : icon ? (
            <View style={[styles.leadingSlot, styles.iconRing, { borderColor: `${accent}44` }]}>
              <LinearGradient
                colors={['rgba(255, 153, 51, 0.4)', 'rgba(255, 215, 0, 0.14)']}
                style={styles.iconGradient}
              >
                <Ionicons name={icon} size={22} color={accent} />
              </LinearGradient>
            </View>
          ) : null}

          <View style={styles.copy}>
            {eyebrow ? (
              <Text style={[styles.eyebrow, { color: colors.saffronLight }, androidText]}>{eyebrow}</Text>
            ) : null}
            {highlight ? (
              <View style={styles.titleRow}>
                <Text style={[styles.title, styles.titleHighlight, { color: accent }, androidText]}>
                  {highlight}
                </Text>
                <Text style={[styles.title, androidText]} numberOfLines={2}>
                  {titleRest}
                </Text>
              </View>
            ) : (
              <Text style={[styles.title, androidText]} numberOfLines={2}>
                {title}
              </Text>
            )}
            {subtitle ? (
              <Text style={[styles.subtitle, androidText]} numberOfLines={3}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
        </View>

        <View style={styles.flourish}>
          <View style={[styles.flourishLine, { backgroundColor: accent }]} />
          <Text style={[styles.flourishDiamond, { color: accent }]}>◆</Text>
          <View style={[styles.flourishLine, { backgroundColor: accent }]} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.22)',
    ...Platform.select({
      ios: {
        shadowColor: colors.saffron,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: {
        elevation: 10,
        backgroundColor: 'rgba(32, 8, 6, 0.55)',
      },
      default: {},
    }),
  },
  wrapDense: {
    marginBottom: 8,
  },
  gradient: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  gradientDense: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
  },
  leadingSlot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  iconRing: {
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 153, 51, 0.08)',
  },
  iconGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    lineHeight: 14,
  },
  title: {
    fontSize: HEADER_TITLE_SIZE,
    fontWeight: '800',
    color: colors.cream,
    letterSpacing: 0.3,
    lineHeight: 30,
  },
  titleHighlight: {
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    fontSize: HEADER_SUBTITLE_SIZE,
    lineHeight: 18,
    color: colors.creamMuted,
    letterSpacing: 0.4,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    alignSelf: 'center',
  },
  flourish: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  flourishLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth >= 1 ? 1 : StyleSheet.hairlineWidth,
    maxHeight: 1,
    opacity: 0.55,
  },
  flourishDiamond: {
    fontSize: 10,
    lineHeight: 12,
    opacity: 0.9,
    ...androidText,
  },
  pressed: {
    opacity: 0.85,
  },
});
