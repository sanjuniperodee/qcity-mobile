import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, shadows } from '../../theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export default function Card({ children, style, padded = true }: Props) {
  return (
    <View style={[styles.base, padded && styles.padded, style]}> 
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg, // Apple HIG: more rounded cards
    borderWidth: 0, // Apple HIG: use shadow instead of border for depth
    borderColor: 'transparent',
    overflow: 'hidden',
    ...shadows.md, // Apple HIG: subtle shadow for depth
  },
  padded: {
    padding: spacing.md,
  },
});


