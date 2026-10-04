import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigationState } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { allShlokas, shlokasByCategory } from '../data/shlokas';
import { colors } from '../constants/theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import type { ShlokaCategory } from '../types/content';
import { SHLOKA_CATEGORY_LABELS } from '../types/content';
import type { ShlokasStackParamList } from '../navigation/ShlokasStack';
import { triggerSelectionHaptic } from '../utils/haptics';
import { useBottomTabLayout } from '../utils/layout';

type Props = NativeStackScreenProps<ShlokasStackParamList, 'ShlokasList'>;

const CATEGORIES: ShlokaCategory[] = ['harathi', 'mantra', 'chalisa', 'ashtakam', 'stotra'];

const CATEGORY_ICONS: Record<ShlokaCategory, keyof typeof Ionicons.glyphMap> = {
  harathi: 'flame-outline',
  mantra: 'infinite-outline',
  chalisa: 'book-outline',
  ashtakam: 'flower-outline',
  stotra: 'reader-outline',
};

export function ShlokasListScreen({ navigation }: Props) {
  const { scrollBottomPadding } = useBottomTabLayout();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ShlokaCategory | 'all'>('all');
  const [coverForTransition, setCoverForTransition] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const detailIsOpen = useNavigationState((state) => state.index > 0);
  const hideListContent = coverForTransition || detailIsOpen;

  useFocusEffect(
    useCallback(() => {
      setCoverForTransition(false);
    }, []),
  );

  useEffect(() => {
    if (!hideListContent) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: scrollOffsetRef.current, animated: false });
      });
    }
  }, [hideListContent]);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  const selectCategory = useCallback((category: ShlokaCategory | 'all') => {
    void triggerSelectionHaptic();
    setActiveCategory(category);
    scrollOffsetRef.current = 0;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const filtered = useMemo(() => {
    const entries = activeCategory === 'all' ? allShlokas : shlokasByCategory[activeCategory];
    const words = query.trim().toLowerCase().split(/\s+/);
    return entries.filter(s => words.every(word => `${s.title} ${s.deity ?? ''}`.toLowerCase().includes(word)));
  }, [activeCategory, query]);

  if (hideListContent) {
    return (
      <ScreenShell>
        <SafeAreaView style={styles.safeArea} edges={['top']} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <ScreenHeader
          title="Shlokas"
          subtitle="Tap any verse to open full reading view"
          icon="book-outline"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterChip
            label="All"
            selected={activeCategory === 'all'}
            onPress={() => selectCategory('all')}
          />
          {CATEGORIES.map((category) => (
            <FilterChip
              key={category}
              label={SHLOKA_CATEGORY_LABELS[category]}
              icon={CATEGORY_ICONS[category]}
              selected={activeCategory === category}
              onPress={() => selectCategory(category)}
            />
          ))}
        </ScrollView>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search a prayer or deity"
          placeholderTextColor={colors.creamMuted}
          accessibilityLabel="Search prayers"
          autoCorrect={false}
          style={styles.search}
        />
        <Text style={styles.results}>{filtered.length} readings · choose your reading script inside</Text>
        {filtered.length === 0 && <Text style={styles.results}>No matching prayers.</Text>}
        {filtered.map((shloka) => (
          <Pressable
            key={shloka.id}
            accessibilityLabel={shloka.title}
            accessibilityRole="button"
            onPress={() => {
              void triggerSelectionHaptic();
              if (Platform.OS === 'android') {
                setCoverForTransition(true);
                requestAnimationFrame(() => {
                  navigation.navigate('ShlokaDetail', { shlokaId: shloka.id });
                });
                return;
              }
              navigation.navigate('ShlokaDetail', { shlokaId: shloka.id });
            }}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardCopy}>
              <View style={styles.titleRow}>
                <View style={styles.categoryBadge}>
                  <Ionicons name={CATEGORY_ICONS[shloka.category]} size={12} color={colors.gold} />
                  <Text style={styles.categoryBadgeText}>{SHLOKA_CATEGORY_LABELS[shloka.category]}</Text>
                </View>
                {shloka.deity ? <Text style={styles.deityText}>{shloka.deity}</Text> : null}
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {shloka.title}
              </Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {shloka.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.gold} style={styles.cardChevron} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
    </ScreenShell>
  );
}

function FilterChip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.filterChip, selected && styles.filterChipActive]}
    >
      {icon ? <Ionicons name={icon} size={14} color={selected ? colors.gold : colors.creamMuted} /> : null}
      <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: { color: colors.cream, fontSize: 16, padding: 14, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, marginBottom: 12 },
  results: { color: colors.creamMuted, fontSize: 12, marginBottom: 16 },
  container: { flex: 1, backgroundColor: colors.backgroundTop },
  safeArea: { flex: 1, backgroundColor: colors.backgroundTop },
  content: { padding: 20 },
  filterRow: { gap: 8, paddingBottom: 16, paddingRight: 24 },
  cardChevron: { marginTop: 4 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.22)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 153, 51, 0.25)',
    borderColor: colors.gold,
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: colors.creamMuted },
  filterChipTextActive: { color: colors.gold },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.2)',
  },
  cardCopy: { flex: 1 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 6 },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
  },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', color: colors.gold, textTransform: 'uppercase' },
  deityText: { fontSize: 11, color: colors.saffronLight, fontStyle: 'italic' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.cream, lineHeight: 22 },
  cardDescription: { marginTop: 4, fontSize: 13, lineHeight: 19, color: colors.creamMuted },
  pressed: { opacity: 0.85 },
});
