import React from 'react';
import { TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { colors, radius, spacing, hitSlop } from '../../theme/tokens';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
};

// Apple HIG: Minimum touch target is 44x44 points
export default function IconButton({ children, onPress, size = 44, style }: Props) {
  const minSize = Math.max(size, 44); // Ensure minimum touch target
  return (
    <TouchableOpacity
      hitSlop={hitSlop}
      activeOpacity={0.6} // Apple HIG: standard active opacity
      onPress={onPress}
      style={[styles.base, { width: minSize, height: minSize, borderRadius: radius.round }, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bgSecondary, // Apple HIG: subtle background
    alignItems: 'center',
    justifyContent: 'center',
    // Apple HIG: subtle shadow for depth
    ...shadows.sm,
  },
});


