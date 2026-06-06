import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';
import { triggerSelectionHaptic } from '../utils/haptics';

type RegionPickerProps = {
  regions: readonly string[];
  selected: string;
  labels: Record<string, string>;
  onSelect: (region: string) => void;
};

export function RegionPicker({ regions, selected, labels, onSelect }: RegionPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {regions.map((region) => (
        <Pressable
          key={region}
          accessibilityRole="button"
          accessibilityState={{ selected: selected === region }}
          onPress={() => {
            void triggerSelectionHaptic();
            onSelect(region);
          }}
          style={[styles.chip, selected === region && styles.chipActive]}
        >
          <Text style={[styles.chipText, selected === region && styles.chipTextActive]}>{labels[region]}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingBottom: 16,
    paddingRight: 28,
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
