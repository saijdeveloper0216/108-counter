import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export function useCounterMotion(animationsEnabled: boolean) {
  const focused = useIsFocused();
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => subscription.remove();
  }, []);
  return {
    motionEnabled: animationsEnabled && !reducedMotion,
    ambientEnabled: animationsEnabled && !reducedMotion && focused && active,
  };
}
