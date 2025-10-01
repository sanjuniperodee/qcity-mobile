import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

export const ToggleGroup = ({ options, selected, onChange }) => {
  return (
    <View style={{ width: '100%', flexDirection: 'row' }}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          style={{
            flex: 1,
            paddingVertical: 10,
            backgroundColor: selected === option.value ? '#F09235' : '#F7F8F9',
            borderTopLeftRadius: index === 0 ? 10 : 0,
            borderBottomLeftRadius: index === 0 ? 10 : 0,
            borderTopRightRadius: index === options.length - 1 ? 10 : 0,
            borderBottomRightRadius: index === options.length - 1 ? 10 : 0,
            alignItems: 'center',
            borderColor: '#c4c4c4',
            borderWidth: 1,
            marginLeft: index > 0 ? -2 : 0,
          }}
        >
          <Text style={{ color: selected === option.value ? '#F7F8F9' : '#888', fontSize: 16 }}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
