import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { fontSizes, lineHeights } from '../../theme/typography';

type Props = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  height?: number;
};

export default function CategoryTile({ icon, label, onPress, style, height = 120 }: Props) {
  const fontSize = fontSizes.sm(12);
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
          minimumFontScale={0.75}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  labelWrap: {
    minHeight: 54, // резерв под 3 строки на небольших экранах
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


