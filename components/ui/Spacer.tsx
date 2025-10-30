import React from 'react';
import { View } from 'react-native';

export default function Spacer({ size = 16, horizontal = false }: { size?: number; horizontal?: boolean }) {
  return <View style={horizontal ? { width: size } : { height: size }} />;
}


