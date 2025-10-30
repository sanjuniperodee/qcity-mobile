import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { shadows } from '../../theme/tokens';

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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  padded: {
    padding: spacing.md,
  },
});


