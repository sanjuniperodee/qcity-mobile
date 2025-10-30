import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { container } from '../../theme/layout';

export default function Container({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    maxWidth: container.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: container.horizontal,
  },
});


