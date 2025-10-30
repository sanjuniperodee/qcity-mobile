import { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { breakpoints } from '../theme/layout';

export function useResponsive() {
  const { width } = Dimensions.get('window');

  return useMemo(() => {
    const isPhone = width < breakpoints.tablet;
    const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
    const isWeb = width >= breakpoints.desktop;

    // Give more width per tile on phones for long RU labels
    const columns = isPhone ? 2 : isTablet ? 3 : 4;

    return { width, isPhone, isTablet, isWeb, columns };
  }, [width]);
}


