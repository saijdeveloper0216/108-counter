import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type TraditionInsightCardProps = {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
};

export function TraditionInsightCard({
  title,
  body,
  icon = 'flower-outline',
  accent = colors.saffron,
}: TraditionInsightCardProps) {
  return (
    <LinearGradient
      colors={['rgba(255,153,51,0.14)', 'rgba(255,215,0,0.06)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { borderColor: accent }]}>
          <Text style={styles.om}>ॐ</Text>
          <Ionicons name={icon} size={16} color={accent} style={styles.iconOverlay} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.22)',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  om: {
    fontSize: 18,
    color: colors.gold,
    fontWeight: '700',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.creamMuted,
  },
});
