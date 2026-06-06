import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, copy } from '../constants/theme';
import type { CounterMode } from '../types/counter';

type CounterModeToggleProps = {
  mode: CounterMode;
  onModeChange: (mode: CounterMode) => void;
};

export function CounterModeToggle({ mode, onModeChange }: CounterModeToggleProps) {
  return (
    <View style={styles.row}>
      {(['mala', 'jaap'] as const).map((value) => {
        const active = mode === value;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onModeChange(value)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {value === 'mala' ? copy.modeMala : copy.modeJaap}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.18)',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.14)',
    borderColor: 'rgba(255, 215, 0, 0.45)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.creamMuted,
  },
  chipTextActive: {
    color: colors.gold,
  },
  pressed: {
    opacity: 0.88,
  },
});
