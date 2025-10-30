import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSafeInsets() {
  const insets = useSafeAreaInsets();
  return insets;
}


