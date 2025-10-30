import { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { breakpoints } from '../theme/layout';

export function useResponsive() {
  const { width } = Dimensions.get('window');

  return useMemo(() => {
    const isPhone = width < breakpoints.tablet;
    const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
    const isWeb = width >= breakpoints.desktop;

    const columns = isPhone ? 1 : isTablet ? 2 : 3;

    return { width, isPhone, isTablet, isWeb, columns };
  }, [width]);
}


