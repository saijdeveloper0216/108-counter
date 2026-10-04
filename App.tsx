import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { SettingsProvider } from './src/context/SettingsContext';
import { AppTabs } from './src/navigation/AppTabs';
import { colors } from './src/constants/theme';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.backgroundTop,
    card: colors.backgroundTop,
    text: colors.cream,
    border: 'rgba(255, 215, 0, 0.18)',
    primary: colors.gold,
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    DisplaySerif: require('./assets/fonts/DisplaySerif.ttf'),
    Devotional: require('./assets/fonts/Devotional.ttf'),
    TeluguReading: require('./assets/fonts/Telugu.ttf'),
    TamilReading: require('./assets/fonts/Tamil.ttf'),
    KannadaReading: require('./assets/fonts/Kannada.ttf'),
    MalayalamReading: require('./assets/fonts/Malayalam.ttf'),
  });
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SettingsProvider>
        <LinearGradient colors={[colors.backgroundTop, colors.backgroundBottom]} style={styles.gradient}>
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <NavigationContainer theme={navTheme}>
            <AppTabs />
          </NavigationContainer>
        </LinearGradient>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
