import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parseApiError } from '../utils/apiError';

export default function ResetPasswordScreen() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { width } = Dimensions.get('window');
  const route = useRoute();
  const navigation = useNavigation();
  const { email, type } = route.params as { email: string; type?: string };

  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword.trim()) {
      Alert.alert('Ошибка', 'Введите код и новый пароль');
      return;
    }

    try {
      const normalizeKzPhone = (value: string) => {
        const digits = (value || '').replace(/\D/g, '');
        if (digits.length === 11 && digits.startsWith('77')) return `+${digits}`;
        return value;
      };
      const response = await fetch('https://market.qorgau-city.kz/api/password-reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [type === 'phone' ? 'phone' : 'email']: type === 'phone' ? normalizeKzPhone(email) : email, 
          code, 
          new_password: newPassword 
        }),
      });

      if (response.ok) {
        Alert.alert('Успех', 'Пароль изменён');
        navigation.navigate('Login');
      } else {
        const parsed = await parseApiError(response);
        Alert.alert('Ошибка', parsed.message);
      }
    } catch (error) {
      Alert.alert('Ошибка', String(error));
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:20, marginBottom:20 }}>Сброс пароля</Text>
      <TextInput
        style={{width: width-40, height:50, borderWidth:1, borderRadius:10, paddingHorizontal:10, marginBottom:15}}
        value={code}
        onChangeText={setCode}
        placeholder="Код из email"
        keyboardType="numeric"
      />
      <TextInput
        style={{width: width-40, height:50, borderWidth:1, borderRadius:10, paddingHorizontal:10, marginBottom:15}}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Новый пароль"
        secureTextEntry
      />
      <TouchableOpacity onPress={handleResetPassword} style={{backgroundColor:'#F09235', padding:15, borderRadius:10, width:width-40, alignItems:'center'}}>
        <Text style={{color:'#FFF'}}>Сменить пароль</Text>
      </TouchableOpacity>
    </View>
  );
}
