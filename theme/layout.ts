import { Dimensions } from 'react-native';
import { spacing } from './tokens';

export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

export const getDevice = () => {
  const { width } = Dimensions.get('window');
  if (width >= breakpoints.desktop) return 'desktop' as const;
  if (width >= breakpoints.tablet) return 'tablet' as const;
  return 'phone' as const;
};

export const container = {
  maxWidth: 1024,
  horizontal: spacing.lg,
};


