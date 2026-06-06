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
import type { ShlokaCategory } from '../types/content';
import { LANGUAGE_LABELS, SHLOKA_CATEGORY_LABELS, SHLOKA_LANGUAGES } from '../types/content';
import type { ShlokasStackParamList } from '../navigation/ShlokasStack';
import { triggerSelectionHaptic } from '../utils/haptics';
import { useBottomTabLayout } from '../utils/layout';

type Props = NativeStackScreenProps<ShlokasStackParamList, 'ShlokaDetail'>;

const CATEGORY_ICONS: Record<ShlokaCategory, keyof typeof Ionicons.glyphMap> = {
  harathi: 'flame-outline',
  mantra: 'infinite-outline',
  chalisa: 'book-outline',
};

export function ShlokaDetailScreen({ navigation, route }: Props) {
  const { scrollBottomPadding } = useBottomTabLayout();
  const [language, setLanguage] = useState(SHLOKA_LANGUAGES[0]);
  const shloka = useMemo(
    () => allShlokas.find((entry) => entry.id === route.params.shlokaId),
    [route.params.shlokaId],
  );

  if (!shloka) {
    return (
      <ScreenShell>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Shloka not found.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          eyebrow={SHLOKA_CATEGORY_LABELS[shloka.category]}
          title={shloka.title}
          icon={CATEGORY_ICONS[shloka.category]}
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]}
      >
        {shloka.deity ? <Text style={styles.deity}>{shloka.deity}</Text> : null}
        <Text style={styles.description}>{shloka.description}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.languageRow}
        >
          {SHLOKA_LANGUAGES.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: language === item }}
              onPress={() => {
                void triggerSelectionHaptic();
                setLanguage(item);
              }}
              style={[styles.languageChip, language === item && styles.languageChipActive]}
            >
              <Text style={[styles.languageChipText, language === item && styles.languageChipTextActive]}>
                {LANGUAGE_LABELS[item]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <LinearGradient colors={['rgba(255,215,0,0.1)', 'rgba(0,0,0,0.28)']} style={styles.verseBox}>
          <Text style={styles.verseOm}>ॐ</Text>
          {shloka.languages[language].map((line, index) => (
            <Text key={`${shloka.id}-${language}-${index}`} style={styles.verseLine}>
              {line}
            </Text>
          ))}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundTop },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    backgroundColor: colors.backgroundTop,
  },
  container: { flex: 1, backgroundColor: colors.backgroundTop },
  content: { padding: 20 },
  deity: { fontSize: 14, color: colors.saffronLight, fontStyle: 'italic', marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 21, color: colors.creamMuted, marginBottom: 16 },
  languageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  languageChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  languageChipActive: { backgroundColor: 'rgba(255, 153, 51, 0.25)', borderColor: colors.gold },
  languageChipText: { fontSize: 13, fontWeight: '600', color: colors.creamMuted },
  languageChipTextActive: { color: colors.gold },
  verseBox: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.18)',
  },
  verseOm: {
    fontSize: 32,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: 12,
  },
  verseLine: {
    fontSize: 16,
    lineHeight: 28,
    color: colors.cream,
    marginBottom: 10,
  },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  fallbackText: { fontSize: 16, color: colors.creamMuted, marginBottom: 16 },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 153, 51, 0.25)',
  },
  backButtonText: { color: colors.cream, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});
