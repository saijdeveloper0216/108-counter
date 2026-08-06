import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { colors } from '../constants/theme';

export type CalendarDayMark = {
  festival?: boolean;
  lunar?: 'purnima' | 'amavasya';
  selected?: boolean;
  disabled?: boolean;
};

type CalendarDayCellProps = {
  date?: DateData;
  state?: string;
  marking?: CalendarDayMark;
  onPress?: (date: DateData) => void;
};

export function CalendarDayCell({ date, state, marking, onPress }: CalendarDayCellProps) {
  if (!date) {
    return <View style={styles.empty} />;
  }

  const isDisabled = state === 'disabled';
  const isToday = state === 'today';
  const isSelected = marking?.selected;
  const textColor = isDisabled
    ? 'rgba(255,248,231,0.25)'
    : isSelected
      ? colors.maroon
      : isToday
        ? colors.saffronLight
        : colors.cream;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={date.dateString}
      disabled={isDisabled}
      onPress={() => onPress?.(date)}
      style={[styles.wrap, isSelected && styles.wrapSelected]}
    >
      <Text style={[styles.dayText, { color: textColor }]}>{date.day}</Text>
      <View style={styles.markerRow}>
        {marking?.lunar === 'purnima' ? <View style={styles.purnimaMoon} /> : null}
        {marking?.lunar === 'amavasya' ? <View style={styles.amavasyaMoon} /> : null}
        {marking?.festival ? <View style={styles.festivalDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    width: 32,
    height: 46,
  },
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    minHeight: 46,
    borderRadius: 18,
    paddingTop: 2,
  },
  wrapSelected: {
    backgroundColor: colors.saffron,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    includeFontPadding: false,
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 8,
    marginTop: 2,
  },
  purnimaMoon: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.55)',
  },
  amavasyaMoon: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  festivalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
});
