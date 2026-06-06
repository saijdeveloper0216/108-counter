import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';
import { ShlokaDetailScreen } from '../screens/ShlokaDetailScreen';
import { ShlokasListScreen } from '../screens/ShlokasListScreen';

export type ShlokasStackParamList = {
  ShlokasList: undefined;
  ShlokaDetail: { shlokaId: string };
};

const Stack = createNativeStackNavigator<ShlokasStackParamList>();

const stackScreenStyle = {
  backgroundColor: colors.backgroundTop,
};

/** Android-native push that avoids showing the previous screen through the transition. */
const ANDROID_PUSH_ANIMATION = 'simple_push' as const;

export function ShlokasStack() {
  return (
    <View style={styles.root}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: stackScreenStyle,
          freezeOnBlur: true,
          animation: Platform.OS === 'android' ? ANDROID_PUSH_ANIMATION : 'default',
          animationDuration: Platform.OS === 'android' ? 280 : undefined,
        }}
      >
        <Stack.Screen name="ShlokasList" component={ShlokasListScreen} />
        <Stack.Screen
          name="ShlokaDetail"
          component={ShlokaDetailScreen}
          options={{
            animation: Platform.OS === 'android' ? ANDROID_PUSH_ANIMATION : 'default',
            animationDuration: Platform.OS === 'android' ? 280 : undefined,
            contentStyle: stackScreenStyle,
          }}
        />
      </Stack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundTop,
  },
});
