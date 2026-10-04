import { Alert, Platform } from 'react-native';

/** Native confirmation sheet plus a working confirmation in the browser preview. */
export function confirmAction(title: string, message: string, confirmLabel: string, action: () => void, destructive = false) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(`${title}\n\n${message}`)) action();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: action },
  ]);
}
