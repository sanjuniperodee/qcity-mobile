import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/tokens';
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    paddingTop: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  label: {
    color: colors.textMuted,
  },
  focused: {
    color: colors.primary,
  },
});


