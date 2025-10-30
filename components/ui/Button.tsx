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

const sizeToMinHeight: Record<ButtonSize, number> = {
  xs: 36,
  sm: 40,
  md: 48,
  lg: 56,
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
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.mutedBg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  icon: {
    marginHorizontal: spacing.xs,
  },
});

export default Button;


