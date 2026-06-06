import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { ANDROID_MIN_BOTTOM_INSET, platformLayout } from '../constants/platformLayout';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CounterTabScreen } from '../screens/CounterTabScreen';
import { ShlokasStack } from '../navigation/ShlokasStack';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootTabParamList = {
  Counter: undefined;
  Shlokas: undefined;
  Calendar: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabBackground() {
  return (
    <LinearGradient
      colors={['rgba(26, 5, 5, 0)', 'rgba(26, 5, 5, 0.35)', 'rgba(26, 5, 5, 0.85)']}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === 'android' ? Math.max(insets.bottom, ANDROID_MIN_BOTTOM_INSET) : insets.bottom;
  const tabBarHeight =
    platformLayout.tabBarBodyHeight + platformLayout.tabBarTopPadding + bottomInset + 8;

  return (
    <Tab.Navigator
      safeAreaInsets={{ top: 0, right: 0, bottom: bottomInset, left: 0 }}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.creamMuted,
        tabBarBackground: () => <TabBackground />,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'android' ? 'rgba(26, 5, 5, 0.92)' : 'transparent',
          borderTopWidth: Platform.OS === 'android' ? 1 : 0,
          borderTopColor: 'rgba(255, 215, 0, 0.12)',
          elevation: Platform.OS === 'android' ? 12 : 0,
          shadowOpacity: 0,
          height: tabBarHeight,
          paddingTop: platformLayout.tabBarTopPadding,
          paddingBottom: bottomInset + 4,
        },
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tab.Screen
        name="Counter"
        component={CounterTabScreen}
        options={{
          tabBarLabel: 'Counter',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.omTabIcon, { color, fontSize: focused ? 24 : 22 }]}>ॐ</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Shlokas"
        component={ShlokasStack}
        options={{
          tabBarLabel: 'Shlokas',
          sceneStyle: { backgroundColor: colors.backgroundTop },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={Platform.OS === 'android' ? 24 : size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar-outline"
              size={Platform.OS === 'android' ? 24 : size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              size={Platform.OS === 'android' ? 24 : size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: platformLayout.tabBarLabelSize,
    fontWeight: '600',
    marginTop: Platform.OS === 'android' ? 0 : 2,
    marginBottom: Platform.OS === 'android' ? 4 : 0,
    includeFontPadding: false,
  },
  tabBarItem: {
    paddingVertical: Platform.OS === 'android' ? 4 : 2,
  },
  tabBarIcon: {
    marginBottom: Platform.OS === 'android' ? -2 : 0,
  },
  omTabIcon: {
    fontWeight: '700',
    lineHeight: Platform.OS === 'android' ? 28 : 26,
    includeFontPadding: false,
  },
});
