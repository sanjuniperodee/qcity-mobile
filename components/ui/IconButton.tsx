import React from 'react';
import { TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { colors, radius, spacing, hitSlop } from '../../theme/tokens';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
};

export default function IconButton({ children, onPress, size = 40, style }: Props) {
  return (
    <TouchableOpacity
      hitSlop={hitSlop}
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2 }, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.mutedBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});


