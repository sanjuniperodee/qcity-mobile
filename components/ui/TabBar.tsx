import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, shadows } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabItem = { key: string; label: string; focused?: boolean; onPress?: () => void };

export default function TabBar({ items }: { items: TabItem[] }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.base, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}> 
      {items.map((item) => (
        <TouchableOpacity key={item.key} onPress={item.onPress} style={styles.item} activeOpacity={0.7}>
          <Text style={[styles.label, item.focused && styles.focused]} numberOfLines={1}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 0.5, // Apple HIG: subtle separator
    borderTopColor: colors.separator, // Apple HIG: system separator color
    backgroundColor: colors.bg, // Apple HIG: system background
    paddingTop: spacing.sm,
    // Apple HIG: subtle shadow above tab bar
    ...shadows.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 44, // Apple HIG: minimum touch target
  },
  label: {
    color: colors.textTertiary, // Apple HIG: tertiary text for inactive
    fontSize: 12, // Apple HIG: tab bar labels are smaller
    fontFamily: 'medium',
  },
  focused: {
    color: colors.primary, // Apple HIG: primary color for active tab
  },
});


