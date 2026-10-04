import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { allShlokas } from '../data/shlokas';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { colors } from '../constants/theme';
import type { Language, ShlokaCategory } from '../types/content';
import { LANGUAGE_LABELS, SHLOKA_CATEGORY_LABELS, SHLOKA_LANGUAGES } from '../types/content';
import type { ShlokasStackParamList } from '../navigation/ShlokasStack';
import { triggerSelectionHaptic } from '../utils/haptics';
import { useBottomTabLayout } from '../utils/layout';

type Props = NativeStackScreenProps<ShlokasStackParamList, 'ShlokaDetail'>;
const CATEGORY_ICONS: Record<ShlokaCategory, keyof typeof Ionicons.glyphMap> = {
  harathi: 'flame-outline', mantra: 'infinite-outline', chalisa: 'book-outline', ashtakam: 'flower-outline', stotra: 'reader-outline',
};
const FONTS: Partial<Record<Language, string>> = { sanskrit: 'Devotional', hindi: 'Devotional', telugu: 'TeluguReading', tamil: 'TamilReading', kannada: 'KannadaReading', malayalam: 'MalayalamReading' };
export function ShlokaDetailScreen({ navigation, route }: Props) {
  const { scrollBottomPadding } = useBottomTabLayout();
  const [language, setLanguage] = useState<Language>('sanskrit');
  const shloka = useMemo(() => allShlokas.find(s => s.id === route.params.shlokaId), [route.params.shlokaId]);
  if (!shloka) return <ScreenShell><SafeAreaView style={styles.safeArea}><Text style={styles.description}>Reading not found.</Text><Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>Go back</Text></Pressable></SafeAreaView></ScreenShell>;
  const languages = <View style={styles.scriptWrap}>
    <Text style={styles.scriptNote}>Reading script · original chant words, not translated meanings</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.languageRow}>
      {SHLOKA_LANGUAGES.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: language === item }}
        onPress={() => { void triggerSelectionHaptic(); setLanguage(item); }}
        style={[styles.languageChip, language === item && styles.languageChipActive]}>
        <Text style={[styles.languageChipText, language === item && styles.languageChipTextActive]}>{LANGUAGE_LABELS[item]}</Text>
      </Pressable>)}
    </ScrollView>
  </View>;
  return <ScreenShell><SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.headerWrap}><ScreenHeader eyebrow={SHLOKA_CATEGORY_LABELS[shloka.category]} title={shloka.title} icon={CATEGORY_ICONS[shloka.category]} onBack={() => navigation.goBack()} /></View>
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]}>
      <Text style={styles.deity}>{shloka.deity}</Text>
      <Text style={styles.description}>{shloka.description}</Text>
      {languages}
      <LinearGradient colors={['rgba(255,215,0,0.1)', 'rgba(0,0,0,0.28)']} style={styles.verseBox}>
        {shloka.languages[language].map((line, i) => <Text key={`${shloka.id}-${language}-${i}`} style={[styles.verseLine, { fontFamily: FONTS[language] }]}>{line}</Text>)}
      </LinearGradient>
    </ScrollView>
  </SafeAreaView></ScreenShell>;
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundTop }, headerWrap: { paddingHorizontal: 16, paddingTop: 4 },
  container: { flex: 1 }, content: { padding: 20 }, deity: { color: colors.saffronLight, fontSize: 14, marginBottom: 8 },
  description: { color: colors.creamMuted, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  scriptWrap: { paddingHorizontal: 0 }, scriptNote: { color: colors.creamMuted, fontSize: 11, marginHorizontal: 16, marginBottom: 8 },
  languageRow: { gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  languageChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)' },
  languageChipActive: { backgroundColor: 'rgba(255,153,51,0.25)', borderColor: colors.gold },
  languageChipText: { color: colors.creamMuted, fontSize: 13, fontWeight: '600' }, languageChipTextActive: { color: colors.gold },
  verseBox: { padding: 18, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,215,0,0.18)' },
  verseLine: { color: colors.cream, fontSize: 18, lineHeight: 32, marginBottom: 12 },
  link: { color: colors.gold, lineHeight: 22, paddingVertical: 6 },
});
