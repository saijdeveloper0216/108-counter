import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { CounterMode } from '../types/counter';

type CounterModeToggleProps = {
  mode: CounterMode;
  onModeChange: (mode: CounterMode) => void;
};

/** Explicit native dimensions: no percentage-sized children, gradients or flex-sized label wrappers. */
export function CounterModeToggle({ mode, onModeChange }: CounterModeToggleProps) {
  const { width } = useWindowDimensions();
  const selectorWidth = Math.round(Math.min(520, width - 40) * 0.84);
  const buttonWidth = (selectorWidth - 6) / 2;
  const selected = mode === 'jaap' ? 'jaap' : 'mala';

  const renderMode = (value: CounterMode, label: string) => {
    const active = selected === value;
    return (
      <TouchableOpacity key={value} testID={`counter-mode-${value}`} activeOpacity={0.85}
        accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }}
        onPress={() => onModeChange(value)}
        style={[styles.button, { width: buttonWidth, backgroundColor: active ? '#efc46c' : '#300b09',
          borderColor: active ? '#ffe5a4' : '#300b09' }]}>
        <Text allowFontScaling={false} numberOfLines={1}
          style={[styles.label, { width: buttonWidth - 12, color: active ? '#351006' : '#ffe8bd' }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View testID="counter-mode-selector" collapsable={false} style={[styles.row, { width: selectorWidth }]}>
      {renderMode('mala', '108 Mala')}
      {renderMode('jaap', 'Naam Jaap')}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 46, alignSelf: 'center', flexShrink: 0, flexDirection: 'row', padding: 2,
    borderWidth: 1, borderColor: '#b37a39', borderRadius: 23, backgroundColor: '#300b09' },
  button: { height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  label: { height: 24, lineHeight: 24, fontSize: 16, fontWeight: '600', includeFontPadding: false,
    textAlign: 'center', textAlignVertical: 'center' },
});
