import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';

/** Opaque full-screen wrapper so stack transitions never show the tab gradient through. */
export function ScreenShell({ children }: { children: ReactNode }) {
  return <View style={styles.shell}>{children}</View>;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.backgroundTop,
  },
});
