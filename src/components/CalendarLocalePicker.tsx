import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';
import { triggerSelectionHaptic } from '../utils/haptics';

type CalendarLocalePickerProps = {
  locales: readonly string[];
  selected: string;
  labels: Record<string, string>;
  onSelect: (locale: string) => void;
};

export function CalendarLocalePicker({ locales, selected, labels, onSelect }: CalendarLocalePickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {locales.map((locale) => (
        <Pressable
          key={locale}
          accessibilityRole="button"
          accessibilityState={{ selected: selected === locale }}
          onPress={() => {
            void triggerSelectionHaptic();
            onSelect(locale);
          }}
          style={[styles.chip, selected === locale && styles.chipActive]}
        >
          <Text style={[styles.chipText, selected === locale && styles.chipTextActive]}>{labels[locale]}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingBottom: 12,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  chipActive: {
    backgroundColor: 'rgba(255, 153, 51, 0.25)',
    borderColor: colors.gold,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.creamMuted,
  },
  chipTextActive: {
    color: colors.gold,
  },
});
