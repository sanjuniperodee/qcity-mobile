import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hitSlop, colors } from '../../theme/tokens';

export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={hitSlop} style={{ paddingHorizontal: 8 }}>
      <Ionicons name="chevron-back" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}


