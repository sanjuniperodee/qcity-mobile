import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hitSlop, colors, spacing, radius } from '../../theme/tokens';

// Apple HIG: Use system icons and ensure minimum touch target
export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      hitSlop={hitSlop} 
      activeOpacity={0.6}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name="chevron-back" 
          size={24} 
          color={colors.primary} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    // Ensure minimum touch target
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


