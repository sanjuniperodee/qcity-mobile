import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { hitSlop, colors } from '../../theme/tokens';

export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={hitSlop} style={{ paddingHorizontal: 8 }}>
      <Image source={require('../../assets/goback.png')} style={{ width: 22, height: 22, tintColor: colors.primary, resizeMode: 'contain' }} />
    </TouchableOpacity>
  );
}


