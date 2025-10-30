import { RFValue } from 'react-native-responsive-fontsize';

export const fontSizes = {
  xs: (base = 14) => RFValue(base - 2),
  sm: (base = 14) => RFValue(base),
  md: (base = 14) => RFValue(base + 2),
  lg: (base = 14) => RFValue(base + 6),
  xl: (base = 14) => RFValue(base + 10),
};

export const lineHeights = {
  sm: (size: number) => Math.round(size * 1.2),
  md: (size: number) => Math.round(size * 1.35),
  lg: (size: number) => Math.round(size * 1.5),
};


