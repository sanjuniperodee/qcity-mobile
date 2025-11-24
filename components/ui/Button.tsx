import React from 'react';
import { Text, TouchableOpacity, ViewStyle, StyleSheet, View, StyleProp } from 'react-native';
import { colors, radius, spacing, hitSlop } from '../../theme/tokens';
import { fontSizes, lineHeights } from '../../theme/typography';

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

// Apple HIG: Minimum touch target is 44x44 points
const sizeToMinHeight: Record<ButtonSize, number> = {
  xs: 36, // Compact - only for special cases
  sm: 44, // Apple HIG minimum
  md: 50, // Standard
  lg: 56, // Large
};

export function Button({
  children,
  onPress,
  size = 'md',
  variant = 'primary',
  fullWidth,
  disabled,
  style,
  iconLeft,
  iconRight,
}: Props) {
  const minHeight = sizeToMinHeight[size];
  const baseStyle: StyleProp<ViewStyle> = [
    styles.base,
    { minHeight },
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    fullWidth && { alignSelf: 'stretch' },
    disabled && { opacity: 0.6 },
    style,
  ];

  const textColor = variant === 'primary' ? colors.primaryText : colors.text;
  const fontSize = size === 'xs' ? 12 : size === 'sm' ? 14 : 16;
  const lh = lineHeights.md(fontSize);

  return (
    <TouchableOpacity
      hitSlop={hitSlop}
      activeOpacity={0.7}
      onPress={disabled ? undefined : onPress}
      style={baseStyle}
    >
      {iconLeft ? <View style={styles.icon}>{iconLeft}</View> : null}
      <Text style={{ color: textColor, fontSize, lineHeight: lh }} numberOfLines={1}>
        {children}
      </Text>
      {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg, // Apple HIG: more rounded buttons
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    // Apple HIG: subtle shadow for depth
    ...shadows.sm,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  icon: {
    marginHorizontal: spacing.xs,
  },
});

export default Button;


