import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { colors, copy } from '../constants/theme';
import type { CounterMode } from '../types/counter';
import { useCounterMotion } from '../hooks/useCounterMotion';
import { CounterModeToggle } from './CounterModeToggle';
import { ChantCard } from './ChantCard';
import { DevotionalOrb } from './DevotionalOrb';
import { LotusIcon } from './DevotionalIcons';
import { DevotionalBorder, GoldMandala, devotionalSerif } from './GoldMandala';
import { formatChantCount } from '../utils/chantCount';
import { AnimatedLotus } from './AnimatedLotus';

const STORE_URL = 'https://play.google.com/store/apps/details?id=com.counter108.app';
type CounterScreenProps = {
  counterMode: CounterMode; count: string; ringCount: number; completedMalas: number;
  showCompletion: boolean; isReady: boolean; hapticsEnabled: boolean;
  historyCount: number; todayMalas: number; streak: number; dailyMalaGoal: number; animationsEnabled: boolean;
  onCount: () => void; onUndo: () => void; onResetCount: () => void; onResetMalas: () => void;
  onNextRound: () => void; onToggleHaptics: () => void; onOpenHistory: () => void;
  onModeChange: (mode: CounterMode) => void;
};

export function CounterScreen({ counterMode, count, ringCount, completedMalas, showCompletion,
  isReady, hapticsEnabled, historyCount, todayMalas, streak, dailyMalaGoal, animationsEnabled,
  onCount, onUndo, onResetCount, onResetMalas, onNextRound, onToggleHaptics, onOpenHistory, onModeChange,
}: CounterScreenProps) {
  const { width } = useWindowDimensions();
  const [heroHeight, setHeroHeight] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(580);
  const compact = availableHeight < 620;
  const tight = availableHeight < 560;
  const cardWidth = Math.min(520, width - (tight ? 32 : 40));
  const cardHeight = Math.max(100, Math.min(195, availableHeight * 0.25));
  const idealOrbSize = Math.min(235, availableHeight * 0.31);
  const orbSize = heroHeight > 0 ? Math.min(idealOrbSize, Math.max(48, (heroHeight - 46) * 0.62)) : idealOrbSize;
  const captionHeight = counterMode === 'jaap' ? 0 : 22;
  const artworkSpace = Math.max(0, heroHeight - (counterMode === 'jaap' ? cardHeight : orbSize) - captionHeight - 24);
  const mandalaSize = Math.min(cardWidth * 0.78, artworkSpace);
  const isJaap = counterMode === 'jaap';
  const { motionEnabled, ambientEnabled } = useCounterMotion(animationsEnabled);
  const disabled = !isReady || (!isJaap && count === '108');
  const goalReached = todayMalas >= dailyMalaGoal;
  const progress = Math.min(1, todayMalas / dailyMalaGoal);
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      if (!isJaap && cardRef.current && Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
        const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Share your daily sadhana' });
      } else {
        await Share.share({ message: `${isJaap ? `I've chanted ${formatChantCount(count)} times with 108 Counter.` : 'I completed 108 chants with 108 Counter.'} ${todayMalas} mala${todayMalas === 1 ? '' : 's'} today. Join me in a moment of daily devotion.\n${STORE_URL}` });
      }
    } catch {
      Alert.alert('Share your practice', Platform.OS === 'web'
        ? 'Image sharing is available in the Android and iPhone app. Find 108 Counter on Google Play.'
        : 'Could not share this time. Please try again.');
    } finally { setSharing(false); }
  };

  return (
    <LinearGradient colors={['#3a0b0a', '#240303', '#350606']} locations={[0, 0.52, 1]} style={styles.root} onLayout={(event) => setAvailableHeight(event.nativeEvent.layout.height)}>
      <DevotionalBorder />
      <View style={[styles.newContent, tight && { paddingTop: 6, paddingHorizontal: 16 }]}>
        <View style={[styles.newHeader, tight && { marginBottom: 8 }]}>
          <Text maxFontSizeMultiplier={1.2} style={[styles.newTitle, { fontSize: tight ? 27 : compact ? 34 : 42 }]}>{isJaap ? 'Naam Jaap' : '108 Counter'}</Text>
          <Text maxFontSizeMultiplier={1.2} style={[styles.newSubtitle, tight && { fontSize: 12 }]}>{isJaap ? 'Every chant counts' : 'A moment of daily devotion'}</Text>
          {isJaap && <Pressable accessibilityRole="button" accessibilityLabel="Share my practice" disabled={sharing || !isReady} onPress={() => void handleShare()} style={[styles.newHaptic, { right: undefined, left: 0 }]}>
            <Ionicons name="share-social-outline" size={16} color="#dfb76c" />
          </Pressable>}
          <Pressable accessibilityRole="switch" accessibilityState={{ checked: hapticsEnabled }} accessibilityLabel={copy.haptics} onPress={onToggleHaptics} style={styles.newHaptic}>
            <Ionicons name={hapticsEnabled ? 'pulse' : 'pulse-outline'} size={16} color="#dfb76c" />
          </Pressable>
        </View>
        <CounterModeToggle mode={counterMode} onModeChange={onModeChange} />
        <View testID="counter-hero" style={styles.newHero} onLayout={event => setHeroHeight(event.nativeEvent.layout.height)}>
          <View testID="counter-mandala-area" style={styles.mandalaArea}><GoldMandala size={mandalaSize} /></View>
          {isJaap ? <ChantCard count={count} width={cardWidth} height={cardHeight} isJaap={isJaap} disabled={disabled}
            motionEnabled={motionEnabled} ambientEnabled={ambientEnabled} onCount={onCount} />
            : <View style={{ alignItems: 'center', flexShrink: 0 }}><DevotionalOrb count={Number(count)} ringCount={ringCount} size={orbSize} isJaap={false} disabled={disabled} motionEnabled={motionEnabled} ambientEnabled={ambientEnabled} onCount={onCount} /></View>}
          {!isJaap && <Text maxFontSizeMultiplier={1.2} style={styles.malaRemaining}>Tap to chant · {108 - ringCount} remaining</Text>}
        </View>
        <LinearGradient colors={['#4a1710', '#300a09']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.newGoal, { paddingVertical: tight ? 9 : 13 }]}>
          <View style={styles.newGoalIcon}><LotusIcon size={tight ? 24 : 31} /></View>
          <View style={{ flex: 1 }}>
            <Text maxFontSizeMultiplier={1.2} style={[styles.newGoalTitle, tight && { fontSize: 14, lineHeight: 18 }]}>{goalReached ? 'Daily goal fulfilled' : 'Today’s goal'}</Text>
            <Text maxFontSizeMultiplier={1.2} style={[styles.newGoalCount, tight && { fontSize: 17, lineHeight: 22 }]} testID="daily-goal-count">{todayMalas} / {dailyMalaGoal} malas</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#c29549" />
          <View style={styles.newGoalTrack}><View style={[styles.newGoalFill, { width: `${progress * 100}%` }]} /></View>
        </LinearGradient>
      </View>
      <View style={[styles.newDock, tight && { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }]}>
        <View testID="counter-actions" style={styles.actions}>
          <Action icon="arrow-undo-outline" label="Undo" onPress={onUndo} disabled={!isReady || count === '0'} compact={tight} />
          <Action icon="refresh-outline" label="Reset" onPress={onResetCount} disabled={!isReady} compact={tight} />
          <Action icon="stats-chart" label="History" onPress={onOpenHistory} disabled={!isReady} compact={tight} />
        </View>
      </View>
      <Modal visible={showCompletion} transparent animationType={motionEnabled ? 'fade' : 'none'} onRequestClose={onNextRound}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalCard}>
              <View ref={cardRef} collapsable={false} style={styles.shareCard}>
                <Text style={styles.completionEyebrow}>A MOMENT OF DEVOTION</Text>
                <AnimatedLotus motionEnabled={motionEnabled} />
                <Text style={styles.completionTitle}>108 complete</Text>
                <Text style={styles.completionMessage}>One mala. A quieter mind.</Text>
                <View style={styles.completionRule} />
                <Text style={styles.completionToday}>{todayMalas} mala{todayMalas === 1 ? '' : 's'} today</Text>
                <Text style={styles.brand}>108 COUNTER · DAILY SADHANA</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Start next mala" onPress={onNextRound} style={styles.nextButton}>
                <LinearGradient colors={['#f2d59c', '#d4a35c']} style={styles.nextGradient}>
                  <Text style={styles.nextText}>Start next mala</Text><Ionicons name="arrow-forward" size={18} color="#311911" />
                </LinearGradient>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Share my practice" disabled={sharing}
                onPress={() => void handleShare()} style={styles.shareButton}>
                <Ionicons name="share-social-outline" size={17} color="#e7c182" /><Text style={styles.shareText}>{sharing ? 'Preparing your card…' : 'Share my practice'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onUndo} style={styles.undoComplete}><Text style={styles.undoText}>Accidental tap? Undo last count</Text></Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  );
}
function Action({ icon, label, onPress, disabled, compact }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; disabled?: boolean; compact: boolean }) {
  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonHeight = compact ? 62 : 78;
  return <Pressable testID={`counter-action-${label.toLowerCase()}`} accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress}
    onLayout={event => setButtonWidth(event.nativeEvent.layout.width)} style={({ pressed }) => [styles.newAction, { height: buttonHeight }, disabled && { opacity: 0.5 }, pressed && { transform: [{ scale: 0.97 }] }]}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image accessible={false} source={require('../../assets/ui/action-panel.png')} resizeMode="stretch"
        style={{ position: 'absolute', top: -buttonHeight * 0.21, left: -buttonWidth * 0.02, width: buttonWidth * 1.04, height: buttonHeight * 1.42 }} />
    </View>
    <View style={[styles.newActionFace, { height: buttonHeight }]}>
      <View style={styles.actionIconRow}><Ionicons name={icon} size={compact ? 22 : 26} color="#f3d28a" allowFontScaling={false} style={{ includeFontPadding: false, lineHeight: 28, textAlignVertical: 'center' }} /></View>
      <Text allowFontScaling={false} numberOfLines={1} style={[styles.newActionText, compact && { fontSize: 13 }]}>{label}</Text>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  newContent: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 12 },
  newHeader: { alignItems: 'center', marginBottom: 14, paddingHorizontal: 24 },
  newTitle: { color: '#ffe8ad', fontFamily: devotionalSerif, includeFontPadding: false, textAlign: 'center' },
  newSubtitle: { color: '#dfb975', fontFamily: devotionalSerif, fontSize: 16, lineHeight: 22, includeFontPadding: false, marginTop: 4, textAlign: 'center' },
  newHaptic: { position: 'absolute', right: 0, top: 6, padding: 10 },
  newHero: { flex: 1, minHeight: 0, justifyContent: 'flex-end', paddingBottom: 12 },
  mandalaArea: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 0, marginBottom: 12 },
  malaRemaining: { height: 22, lineHeight: 22, includeFontPadding: false, textAlign: 'center', color: '#d0a66d', fontSize: 11 },
  newGoal: { borderRadius: 19, borderWidth: 1, borderColor: '#936031', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden' },
  newGoalIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#ac7735', alignItems: 'center', justifyContent: 'center', backgroundColor: '#5d3013' },
  newGoalTitle: { color: '#f0d49d', fontFamily: devotionalSerif, fontSize: 18, lineHeight: 24, includeFontPadding: false },
  newGoalCount: { color: '#fff0cb', fontFamily: devotionalSerif, fontSize: 22, lineHeight: 28, includeFontPadding: false, marginTop: 2 },
  newGoalTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: '#522117' },
  newGoalFill: { height: 3, backgroundColor: '#efc76a' },
  newDock: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  newAction: { flexBasis: 0, flexGrow: 1, minWidth: 0, borderRadius: 14, overflow: 'hidden' },
  newActionFace: { width: '100%', alignItems: 'center', justifyContent: 'center', gap: 4, zIndex: 1 },
  actionIconRow: { height: 28, width: '100%', alignItems: 'center', justifyContent: 'center' },
  newActionText: { color: '#f4dba9', fontFamily: devotionalSerif, fontSize: 15, lineHeight: 20, includeFontPadding: false, textAlignVertical: 'center', textAlign: 'center' },
  root: { flex: 1 }, compactContent: { paddingTop: 8, paddingBottom: 4 },
  actionDock: { width: '100%', maxWidth: 540, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 6, paddingBottom: 10 }, content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 14, width: '100%', maxWidth: 540, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, eyebrow: { color: '#aa8a66', fontSize: 9, letterSpacing: 2.6, fontWeight: '600', marginBottom: 6 },
  title: { fontSize: 29, color: '#efcd90', fontWeight: '700', letterSpacing: -0.7 }, titleLight: { fontWeight: '400', color: '#f6ead6' },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#352018', borderWidth: 1, borderColor: '#62452c', alignItems: 'center', justifyContent: 'center' },
  practiceCaption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 17, marginBottom: 4 },
  captionLine: { height: 1, width: 16, backgroundColor: '#76522c', opacity: 0.6 }, captionText: { color: '#b79e82', fontSize: 11, letterSpacing: 0.1 },
  hero: { alignItems: 'center', paddingTop: 14, paddingBottom: 20 }, tapTitle: { color: '#e4ccaa', fontSize: 13, fontWeight: '500', marginTop: 8, textAlign: 'center' },
  tapSubtitle: { fontSize: 10, color: '#a58b77', marginTop: 5, letterSpacing: 0.4 },
  goalCard: { borderRadius: 18, borderWidth: 1, borderColor: '#634529', padding: 15 }, goalHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4c3522' },
  goalTitle: { color: '#ead8bb', fontSize: 12, fontWeight: '600' }, goalHint: { color: '#b59b80', fontSize: 10, marginTop: 4 },
  goalCount: { color: '#f2d9a1', fontSize: 22, fontWeight: '600' }, goalTotal: { fontSize: 13, color: '#987d63' },
  goalTrack: { height: 3, borderRadius: 2, backgroundColor: '#553827', marginTop: 13, overflow: 'hidden' }, goalFill: { height: 3, backgroundColor: '#e4bd7c' },
  stats: { flexDirection: 'row', alignItems: 'center', marginVertical: 19 }, stat: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { color: '#edddc3', fontSize: 19, fontWeight: '500' }, days: { fontSize: 11, color: '#b59b80' }, statLabel: { color: '#af9478', fontSize: 7.5, letterSpacing: 0.8 },
  statDivider: { height: 24, width: 1, backgroundColor: '#523221' }, actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, backgroundColor: '#2a1614', borderWidth: 1, borderColor: '#573b27', minHeight: 48, paddingVertical: 12 },
  actionText: { fontSize: 11, color: '#d6bea0' }, footer: { textAlign: 'center', fontSize: 9, color: '#91735c', marginTop: 14, letterSpacing: 0.6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(10,4,6,0.87)', justifyContent: 'center' }, modalScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 32 },
  modalCard: { width: '100%', maxWidth: 390, alignSelf: 'center', borderRadius: 26, backgroundColor: '#291518', borderWidth: 1, borderColor: '#936b3b', padding: 20, overflow: 'hidden' },
  shareCard: { alignItems: 'center', backgroundColor: '#291518', paddingVertical: 15, paddingHorizontal: 8 },
  completionEyebrow: { fontSize: 9, color: '#c4a171', letterSpacing: 2.4, marginBottom: 20 }, completionTitle: { fontSize: 33, fontWeight: '500', color: '#f2dba8', letterSpacing: -0.5, marginTop: 10 },
  completionMessage: { fontSize: 13, color: '#c4ab91', marginTop: 9 }, completionRule: { width: 32, height: 1, backgroundColor: '#a37947', marginVertical: 22 },
  completionToday: { color: '#ecd3a3', fontSize: 16 }, brand: { fontSize: 8, letterSpacing: 1.5, color: '#ae8c68', marginTop: 24, marginBottom: 9 },
  nextButton: { borderRadius: 13, overflow: 'hidden', marginTop: 10 }, nextGradient: { paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  nextText: { color: '#311911', fontSize: 14, fontWeight: '700' }, shareButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 16 },
  shareText: { color: '#e7c182', fontSize: 12 }, undoComplete: { padding: 6 }, undoText: { textAlign: 'center', color: colors.creamMuted, fontSize: 10 },
});
