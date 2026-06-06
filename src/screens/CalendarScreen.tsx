import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarLocalePicker } from '../components/CalendarLocalePicker';
import { useSettings } from '../context/SettingsContext';
import {
  formatFestivalDate,
  getActiveTimezone,
  getCalendarHeaderSubtitle,
  getCalendarTimezoneLabel,
  getFestivalViewsForRegion,
  getFestivalsForRegion,
  getMarkedDates,
  getTodayString,
} from '../data/festivals';
import { getMasamForDate, getMasamsForMonth } from '../data/masams';
import { getMasamSignificance } from '../data/traditions';
import { colors } from '../constants/theme';
import { CALENDAR_LOCALE_LABELS, type CalendarLocale } from '../types/content';
import { ScreenHeader } from '../components/ScreenHeader';
import { useBottomTabLayout } from '../utils/layout';

const CALENDAR_LOCALES: CalendarLocale[] = ['india', 'usa'];
const CALENDAR_REGION = 'all' as const;

function monthKeyFromParts(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function CalendarScreen() {
  const { scrollBottomPadding } = useBottomTabLayout();
  const { settings, updateSettings } = useSettings();
  const activeTimezone = getActiveTimezone(settings.calendarLocale, settings.usaTimezone);
  const headerSubtitle = getCalendarHeaderSubtitle(settings.calendarLocale, settings.usaTimezone);
  const timezoneLabel = getCalendarTimezoneLabel(settings.calendarLocale, settings.usaTimezone);
  const calendarPlaceLabel = CALENDAR_LOCALE_LABELS[settings.calendarLocale];
  const today = getTodayString(activeTimezone);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonthKey, setVisibleMonthKey] = useState(today.slice(0, 7));

  const festivals = useMemo(
    () => getFestivalsForRegion(settings.calendarLocale, CALENDAR_REGION),
    [settings.calendarLocale],
  );
  const festivalViews = useMemo(
    () => getFestivalViewsForRegion(settings.calendarLocale, CALENDAR_REGION, festivals),
    [settings.calendarLocale, festivals],
  );
  const selectedMasam = getMasamForDate(selectedDate);
  const monthMasams = useMemo(() => getMasamsForMonth(visibleMonthKey), [visibleMonthKey]);

  const markedDates = useMemo(() => {
    const marks = getMarkedDates(festivals) as Record<
      string,
      { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }
    >;
    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {}),
      marked: Boolean(marks[selectedDate]?.marked),
      selected: true,
      selectedColor: colors.saffron,
      dotColor: colors.gold,
    };
    return marks;
  }, [festivals, selectedDate]);

  const monthFestivals = useMemo(
    () =>
      festivalViews
        .filter((festival) => festival.date.startsWith(visibleMonthKey))
        .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name)),
    [festivalViews, visibleMonthKey],
  );

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    setVisibleMonthKey(day.dateString.slice(0, 7));
  };

  const handleMonthChange = (month: DateData) => {
    setVisibleMonthKey(monthKeyFromParts(month.year, month.month));
  };

  const handleCalendarLocaleChange = (locale: string) => {
    void updateSettings({ calendarLocale: locale as CalendarLocale });
  };

  const selectedDayFestivals = festivalViews.filter((festival) => festival.date === selectedDate);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]}
      >
        <ScreenHeader
          title="Calendar"
          subtitle={`Hindu festivals & masams · ${headerSubtitle}`}
          icon="calendar-outline"
        />

        <Text style={styles.pickerLabel}>Calendar</Text>
        <CalendarLocalePicker
          locales={CALENDAR_LOCALES}
          selected={settings.calendarLocale}
          labels={CALENDAR_LOCALE_LABELS}
          onSelect={handleCalendarLocaleChange}
        />

        {settings.calendarLocale === 'usa' ? (
          <Text style={styles.timezoneNote}>
            Festival dates follow US local panchang for {timezoneLabel}. Some temples may observe a day earlier or
            later.
          </Text>
        ) : (
          <Text style={styles.timezoneNote}>
            Festival dates follow the Indian lunar calendar (IST). State tags note where observance is especially
            common.
          </Text>
        )}

        {selectedMasam && (
          <View style={styles.masamBanner}>
            <Text style={styles.masamLabel}>Current Masam</Text>
            <Text style={styles.masamName}>{selectedMasam.name}</Text>
            <Text style={styles.masamTelugu}>{selectedMasam.teluguName}</Text>
            <Text style={styles.masamSignificance}>
              {getMasamSignificance(selectedMasam.name)}
            </Text>
            <Text style={styles.masamDates}>
              {formatFestivalDate(selectedMasam.startDate, activeTimezone)} –{' '}
              {formatFestivalDate(selectedMasam.endDate, activeTimezone)}
            </Text>
          </View>
        )}

        <Calendar
          current={`${visibleMonthKey}-01`}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
          theme={{
            calendarBackground: 'rgba(255, 255, 255, 0.04)',
            dayTextColor: colors.cream,
            monthTextColor: colors.gold,
            textSectionTitleColor: colors.creamMuted,
            selectedDayBackgroundColor: colors.saffron,
            selectedDayTextColor: colors.maroon,
            todayTextColor: colors.saffronLight,
            arrowColor: colors.gold,
            textDisabledColor: 'rgba(255,248,231,0.25)',
          }}
          style={styles.calendar}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Masams in {formatMonthLabel(visibleMonthKey)}</Text>
          {monthMasams.length === 0 ? (
            <Text style={styles.emptyText}>No masam data for this month.</Text>
          ) : (
            monthMasams.map((masam) => (
              <View key={masam.id} style={styles.masamCard}>
                <Text style={styles.masamCardTitle}>{masam.name}</Text>
                <Text style={styles.masamCardTelugu}>{masam.teluguName}</Text>
                <Text style={styles.masamCardDates}>
                  {formatFestivalDate(masam.startDate, activeTimezone)} –{' '}
                  {formatFestivalDate(masam.endDate, activeTimezone)}
                </Text>
              </View>
            ))
          )}
        </View>

        {selectedDayFestivals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Festivals on {formatFestivalDate(selectedDate, activeTimezone)}</Text>
            {selectedDayFestivals.map((festival) => (
              <FestivalCard
                key={festival.id}
                name={festival.name}
                description={festival.description}
                stateTags={festival.stateTags}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Festivals in {calendarPlaceLabel} · {formatMonthLabel(visibleMonthKey)}
          </Text>
          {monthFestivals.length === 0 ? (
            <Text style={styles.emptyText}>No festivals listed for this month.</Text>
          ) : (
            monthFestivals.map((festival) => (
              <FestivalCard
                key={festival.id}
                name={festival.name}
                description={festival.description}
                date={formatFestivalDate(festival.date, activeTimezone)}
                stateTags={festival.stateTags}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatStateLabel(states: string[]): string {
  if (states.length === 1) {
    return states[0];
  }
  return states.join(' · ');
}

function FestivalCard({
  name,
  description,
  date,
  stateTags = [],
}: {
  name: string;
  description: string;
  date?: string;
  stateTags?: string[];
}) {
  return (
    <View style={styles.festivalCard}>
      <Text style={styles.festivalName}>{name}</Text>
      {stateTags.length > 0 ? (
        <Text style={styles.festivalState}>{formatStateLabel(stateTags)}</Text>
      ) : null}
      {date ? <Text style={styles.festivalDate}>{date}</Text> : null}
      <Text style={styles.festivalDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: 20 },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.creamMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  timezoneNote: {
    marginBottom: 16,
    fontSize: 12,
    lineHeight: 18,
    color: colors.creamMuted,
    fontStyle: 'italic',
  },
  masamBanner: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 153, 51, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.28)',
  },
  masamLabel: { fontSize: 12, color: colors.creamMuted, textTransform: 'uppercase', letterSpacing: 1 },
  masamName: { marginTop: 4, fontSize: 22, fontWeight: '800', color: colors.gold },
  masamTelugu: { marginTop: 2, fontSize: 16, color: colors.saffronLight },
  masamSignificance: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: colors.creamMuted,
  },
  masamDates: { marginTop: 8, fontSize: 13, color: colors.creamMuted },
  calendar: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.18)',
  },
  section: { marginBottom: 20, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.gold, marginBottom: 4 },
  emptyText: { fontSize: 14, color: colors.creamMuted },
  masamCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.18)',
  },
  masamCardTitle: { fontSize: 16, fontWeight: '700', color: colors.cream },
  masamCardTelugu: { marginTop: 2, fontSize: 14, color: colors.saffronLight },
  masamCardDates: { marginTop: 6, fontSize: 12, color: colors.creamMuted },
  festivalCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.18)',
  },
  festivalName: { fontSize: 16, fontWeight: '700', color: colors.cream },
  festivalState: { marginTop: 4, fontSize: 12, color: colors.saffronLight, fontWeight: '600' },
  festivalDate: { marginTop: 4, fontSize: 12, color: colors.saffronLight },
  festivalDescription: { marginTop: 6, fontSize: 14, lineHeight: 20, color: colors.creamMuted },
});
