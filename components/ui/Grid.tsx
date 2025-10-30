import React from 'react';
import { View, ViewStyle } from 'react-native';
import { spacing } from '../../theme/tokens';
import { useResponsive } from '../../hooks/useResponsive';

type GridProps = {
  children: React.ReactNode[] | React.ReactNode;
  gap?: number;
  columns?: number;
  style?: ViewStyle;
};

export function Grid({ children, gap = spacing.md, columns, style }: GridProps) {
  const { columns: autoCols } = useResponsive();
  const cols = columns || autoCols;
  const items = React.Children.toArray(children);

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -gap / 2 }, style]}>
      {items.map((child, idx) => (
        <View key={idx} style={{ width: `${100 / cols}%`, paddingHorizontal: gap / 2, marginBottom: gap }}>
          {child}
        </View>
      ))}
    </View>
  );
}

export function Row({ children, gap = spacing.md, style }: { children: React.ReactNode; gap?: number; style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', marginHorizontal: -gap / 2 }, style]}>
      {React.Children.map(children, (child, idx) => (
        <View key={idx} style={{ paddingHorizontal: gap / 2 }}>{child}</View>
      ))}
    </View>
  );
}

export function Col({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>;
}


