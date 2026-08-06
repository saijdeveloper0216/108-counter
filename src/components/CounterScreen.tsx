import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MAX_JAAP_COUNT } from '../constants/counter';
import { colors, copy, TOTAL_COUNT } from '../constants/theme';
import {
  computeCounterRingSize,
  computeJaapRingSize,
  COUNTER_ROOT_TOP_PADDING,
  fitRingToStageHeight,
  platformLayout,
} from '../constants/platformLayout';
import type { CounterMode } from '../types/counter';
import { formatJaapTotalBar, jaapTotalBarFontSize } from '../utils/formatCount';
import { useBottomTabLayout } from '../utils/layout';
import { CounterModeToggle } from './CounterModeToggle';
import { JaapMandalaGlass } from './JaapMandalaGlass';
import { MalaRing, computeMalaMandalaSize } from './MalaRing';
import { ScreenHeader } from './ScreenHeader';

type CounterScreenProps = {
  counterMode: CounterMode;
  count: number;
  ringCount: number;
  completedMalas: number;
  showCompletion: boolean;
  isJaapMaxed: boolean;
  hapticsEnabled: boolean;
  historyCount: number;
  onCount: () => void;
  onUndo: () => void;
  onResetCount: () => void;
  onResetMalas: () => void;
  onNextRound: () => void;
  onToggleHaptics: () => void;
  onOpenHistory: () => void;
  onModeChange: (mode: CounterMode) => void;
};

export function CounterScreen({
  counterMode,
  count,
  ringCount,
  completedMalas,
  showCompletion,
  isJaapMaxed,
  hapticsEnabled,
  historyCount,
  onCount,
  onUndo,
  onResetCount,
  onResetMalas,
  onNextRound,
  onToggleHaptics,
  onOpenHistory,
  onModeChange,
}: CounterScreenProps) {
  const isJaap = counterMode === 'jaap';
  const { width, height } = useWindowDimensions();
  const { tabBarHeight } = useBottomTabLayout();
  const insets = useSafeAreaInsets();
  const [mainStageHeight, setMainStageHeight] = useState(0);
  const ringLayout = useMemo(
    () => ({ tabBarHeight, topInset: insets.top }),
    [tabBarHeight, insets.top],
  );
  const statsGap = platformLayout.counterStatsRingGap;
  const tapGap = isJaap ? platformLayout.jaapRingTapGap : platformLayout.counterRingTapGap;
  const preferredRingSize = useMemo(
    () =>
      isJaap
        ? computeJaapRingSize(width, height, ringLayout)
        : computeCounterRingSize(width, height, ringLayout),
    [width, height, isJaap, ringLayout],
  );
  const ringSize = useMemo(
    () => fitRingToStageHeight(preferredRingSize, mainStageHeight, { statsGap, tapGap }),
    [preferredRingSize, mainStageHeight, statsGap, tapGap],
  );

  useEffect(() => {
    setMainStageHeight(0);
  }, [isJaap]);

  const handleMainStageLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    setMainStageHeight((current) => (Math.abs(current - nextHeight) > 1 ? nextHeight : current));
  }, []);
  const malaBarProgress =
    completedMalas > 0 ? 1 : Math.max(0.06, count / 108);
  const jaapDisplay = formatJaapTotalBar(count);
  const tapDisabled = isJaap ? isJaapMaxed : count >= 108;
  const jaapMandalaSize = ringSize;
  const malaMandalaSize = computeMalaMandalaSize(ringSize);
  const currentMalaNumber =
    count === 0 || count >= TOTAL_COUNT ? completedMalas : completedMalas + 1;
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.4);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const handleCountPress = () => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 90 }),
      withTiming(1, { duration: 140 }),
    );
    onCount();
  };

  return (
    <View style={styles.root}>
      {isJaap ? (
        <View style={styles.contentShell}>
          <View style={styles.topBlock}>
            <ScreenHeader
              dense
              title={copy.appTitle}
              highlight="108"
              subtitle={copy.jaapSubtitle}
              trailing={
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: hapticsEnabled }}
                  accessibilityLabel={copy.haptics}
                  onPress={onToggleHaptics}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                >
                  <Ionicons
                    name={hapticsEnabled ? 'pulse' : 'pulse-outline'}
                    size={22}
                    color={hapticsEnabled ? colors.gold : colors.creamMuted}
                  />
                </Pressable>
              }
            />
            <CounterModeToggle mode={counterMode} onModeChange={onModeChange} />

            <View style={styles.jaapTotalBar}>
              <Text style={styles.jaapTotalBarLabel}>{copy.jaapTotal}</Text>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.65}
                numberOfLines={1}
                style={[styles.jaapTotalBarValue, { fontSize: jaapTotalBarFontSize(count) }]}
              >
                {jaapDisplay}
              </Text>
            </View>
          </View>

          <View
            onLayout={handleMainStageLayout}
            style={[
              styles.mainStage,
              {
                paddingTop: statsGap,
                paddingBottom: tapGap,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increment jaap count"
              onPress={handleCountPress}
              disabled={tapDisabled}
              style={({ pressed }) => [
                styles.jaapTapTarget,
                { width: ringSize, height: ringSize },
                tapDisabled && styles.jaapTapTargetDisabled,
                pressed && !tapDisabled && styles.jaapPressed,
              ]}
            >
              <Animated.View
                style={[
                  styles.jaapAura,
                  glowStyle,
                  {
                    width: ringSize + 28,
                    height: ringSize + 28,
                    borderRadius: (ringSize + 28) / 2,
                  },
                ]}
              />
              <View
                style={[
                  styles.jaapOuterRing,
                  {
                    width: ringSize + 10,
                    height: ringSize + 10,
                    borderRadius: (ringSize + 10) / 2,
                  },
                ]}
              />
              <LinearGradient
                colors={['#ffb366', '#ff9933', '#c9782a']}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={[styles.jaapDisc, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
              />
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0)']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={[styles.jaapDiscSheen, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
              />
              <Animated.View style={[styles.centerOverlay, pulseStyle]}>
                <JaapMandalaGlass size={jaapMandalaSize} />
              </Animated.View>
            </Pressable>
          </View>

          <View style={styles.bottomBlock}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increment jaap count"
              onPress={handleCountPress}
              disabled={tapDisabled}
              style={({ pressed }) => [
                styles.countButton,
                tapDisabled && styles.countButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={[colors.saffronLight, colors.saffron, colors.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.countButtonGradient}
              >
                <Text style={styles.countButtonText}>
                  {tapDisabled ? copy.jaapMaxReached : copy.tapHint}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.actionsRow}>
              <ActionButton icon="arrow-undo" label={copy.undo} onPress={onUndo} disabled={count === 0} />
              <ActionButton icon="refresh" label={copy.resetJaap} onPress={onResetCount} />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.contentShell}>
          <View style={styles.topBlock}>
            <ScreenHeader
              dense
              title={copy.appTitle}
              highlight="108"
              subtitle={copy.subtitle}
              trailing={
                <View style={styles.headerActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.history}
                    onPress={onOpenHistory}
                    style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="time-outline" size={22} color={colors.gold} />
                    {historyCount > 0 && (
                      <View style={styles.historyBadge}>
                        <Text style={styles.historyBadgeText}>{historyCount}</Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: hapticsEnabled }}
                    accessibilityLabel={copy.haptics}
                    onPress={onToggleHaptics}
                    style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                  >
                    <Ionicons
                      name={hapticsEnabled ? 'pulse' : 'pulse-outline'}
                      size={22}
                      color={hapticsEnabled ? colors.gold : colors.creamMuted}
                    />
                  </Pressable>
                </View>
              }
            />

            <CounterModeToggle mode={counterMode} onModeChange={onModeChange} />

            <View style={styles.malaCard}>
              <View style={styles.malaInfo}>
                <Text style={styles.malaLabel}>{copy.malaCompleted}</Text>
                <View style={styles.malaTrack}>
                  <View style={[styles.malaFill, { width: `${malaBarProgress * 100}%` }]} />
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.resetMalas}
                onPress={onResetMalas}
                disabled={completedMalas === 0 && historyCount === 0}
                style={({ pressed }) => [
                  styles.malaResetButton,
                  completedMalas === 0 && historyCount === 0 && styles.buttonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="refresh" size={16} color={colors.gold} />
                <Text style={styles.malaResetText}>{copy.resetMalas}</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <StatCard label={copy.countLabel} value={String(count)} />
              <StatCard label={copy.malaLabel} value={String(currentMalaNumber)} />
            </View>
          </View>

          <View
            onLayout={handleMainStageLayout}
            style={[
              styles.mainStage,
              {
                paddingTop: statsGap,
                paddingBottom: tapGap,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increment counter"
              onPress={handleCountPress}
              disabled={tapDisabled}
              style={({ pressed }) => [
                styles.jaapTapTarget,
                { width: ringSize, height: ringSize },
                tapDisabled && styles.jaapTapTargetDisabled,
                pressed && !tapDisabled && styles.jaapPressed,
              ]}
            >
              <Animated.View
                style={[
                  styles.jaapAura,
                  glowStyle,
                  {
                    width: ringSize + 28,
                    height: ringSize + 28,
                    borderRadius: (ringSize + 28) / 2,
                  },
                ]}
              />
              <View
                style={[
                  styles.jaapOuterRing,
                  {
                    width: ringSize + 10,
                    height: ringSize + 10,
                    borderRadius: (ringSize + 10) / 2,
                  },
                ]}
              />
              <LinearGradient
                colors={['#ffb366', '#ff9933', '#c9782a']}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={[styles.jaapDisc, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
              />
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0)']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={[styles.jaapDiscSheen, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
              />
              <Animated.View style={[styles.centerOverlay, pulseStyle]}>
                <JaapMandalaGlass size={malaMandalaSize} />
              </Animated.View>
              <MalaRing count={ringCount} size={ringSize} />
            </Pressable>
          </View>

          <View style={styles.bottomBlock}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increment counter"
              onPress={handleCountPress}
              disabled={tapDisabled}
              style={({ pressed }) => [
                styles.countButton,
                tapDisabled && styles.countButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={[colors.saffronLight, colors.saffron, colors.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.countButtonGradient}
              >
                <Text style={styles.countButtonText}>{copy.tapHint}</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.actionsRow}>
              <ActionButton icon="arrow-undo" label={copy.undo} onPress={onUndo} disabled={count === 0} />
              <ActionButton icon="refresh" label={copy.resetCount} onPress={onResetCount} />
            </View>
          </View>
        </View>
      )}

      <Modal visible={showCompletion} transparent animationType="fade" onRequestClose={onNextRound}>
        <View style={styles.modalBackdrop}>
          <LinearGradient colors={['#2d0f0f', '#1a0505']} style={styles.modalCard}>
            <Text style={styles.modalOm}>ॐ</Text>
            <Text style={styles.modalTitle}>{copy.completeTitle}</Text>
            <Text style={styles.modalMala}>
              {copy.malaLabel} {completedMalas}
            </Text>
            <Text style={styles.modalMessage}>{copy.completeMessage}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onNextRound}
              style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={[colors.gold, colors.saffron]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>{copy.continue}</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        disabled && styles.actionButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={18} color={disabled ? colors.creamMuted : colors.gold} />
      <Text style={[styles.actionLabel, disabled && styles.actionLabelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: platformLayout.screenHorizontalPadding,
    paddingTop: COUNTER_ROOT_TOP_PADDING,
  },
  contentShell: {
    flex: 1,
  },
  topBlock: {
    flexShrink: 0,
  },
  jaapTotalBar: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 4,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.22)',
  },
  jaapTotalBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.creamMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  jaapTotalBarValue: {
    width: '100%',
    marginTop: 4,
    fontWeight: '800',
    color: colors.gold,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  mainStage: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jaapTapTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  jaapTapTargetDisabled: {
    opacity: 0.55,
  },
  jaapPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  jaapAura: {
    position: 'absolute',
    backgroundColor: colors.saffron,
  },
  jaapOuterRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.35)',
  },
  jaapDisc: {
    position: 'absolute',
  },
  jaapDiscSheen: {
    position: 'absolute',
  },
  bottomBlock: {
    flexShrink: 0,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.18)',
  },
  historyBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.maroon,
  },
  malaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.28)',
  },
  malaInfo: {
    flex: 1,
    marginRight: 12,
  },
  malaLabel: {
    fontSize: 12,
    color: colors.creamMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  malaTrack: {
    height: 6,
    marginTop: 8,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  malaFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  malaResetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  malaResetText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.cream,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.15)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gold,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.creamMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countButton: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: colors.buttonShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  countButtonDisabled: {
    opacity: 0.55,
  },
  countButtonGradient: {
    minHeight: Platform.OS === 'android' ? 58 : 60,
    paddingVertical: Platform.OS === 'android' ? 18 : 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.maroon,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cream,
  },
  actionLabelDisabled: {
    color: colors.creamMuted,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  modalOm: {
    fontSize: 48,
    color: colors.gold,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.cream,
    marginBottom: 6,
  },
  modalMala: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.creamMuted,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.maroon,
  },
});
