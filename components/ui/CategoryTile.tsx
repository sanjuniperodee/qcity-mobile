import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { fontSizes, lineHeights } from '../../theme/typography';

type Props = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  height?: number;
};

export default function CategoryTile({ icon, label, onPress, style, height = Platform.select({ web: 96, default: 112 }) as number }: Props) {
  const fontSize = Platform.select({ web: 12, default: 13 }) as number;
  const lh = lineHeights.md(fontSize);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.base, { height }, style]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.labelWrap}>
        <Text
          style={[styles.label, { fontSize, lineHeight: lh }]}
          numberOfLines={3}
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.mutedBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    height: Platform.select({ web: 28, default: 32 }) as number,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  labelWrap: {
    minHeight: 42, // резерв под 3 строки на небольших экранах
    width: '100%',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    color: colors.text,
    fontFamily: 'medium',
    width: '100%',
    paddingHorizontal: spacing.xs,
  },
});


