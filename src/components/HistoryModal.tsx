import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, copy } from '../constants/theme';
import type { HistoryEntry } from '../types/history';

type HistoryModalProps = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onResetMalas?: () => void;
  history: HistoryEntry[];
  onClose: () => void;
  onClearHistory: () => void;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function HistoryModal({ visible, title = copy.historyTitle, subtitle, onResetMalas, history, onClose, onClearHistory }: HistoryModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close history" onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.cream} />
            </Pressable>
          </View>

          {subtitle && <Text style={{ color: colors.creamMuted, marginBottom: 12 }}>{subtitle}</Text>}
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={40} color={colors.creamMuted} />
              <Text style={styles.emptyText}>{copy.historyEmpty}</Text>
            </View>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {history.map((entry) => (
                <View key={entry.id} style={styles.row}>
                  <View style={styles.rowBadge}>
                    <Text numberOfLines={1} adjustsFontSizeToFit style={styles.rowBadgeText}>{entry.malaNumber}</Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text numberOfLines={2} style={styles.rowTitle}>
                      {copy.malaLabel} {entry.malaNumber}
                    </Text>
                    <Text style={styles.rowDate}>{formatDate(entry.completedAt)}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={22} color={colors.gold} />
                </View>
              ))}
            </ScrollView>
          )}

          {onResetMalas && <Pressable accessibilityRole="button" accessibilityLabel="Reset completed malas" onPress={onResetMalas} style={styles.clearButton}><Text style={styles.clearButtonText}>Reset completed malas</Text></Pressable>}
          {history.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.clearHistory}
              onPress={onClearHistory}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
            >
              <Text style={styles.clearButtonText}>{copy.clearHistory}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  card: {
    maxHeight: '78%',
    backgroundColor: '#2d0f0f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.creamMuted,
    textAlign: 'center',
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: 10,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.15)',
  },
  rowBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  rowBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gold,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
  },
  rowDate: {
    marginTop: 2,
    fontSize: 12,
    color: colors.creamMuted,
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.35)',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.saffronLight,
  },
  pressed: {
    opacity: 0.85,
  },
});
