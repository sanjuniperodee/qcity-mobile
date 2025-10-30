import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parseApiError } from '../utils/apiError';

export default function ResetPasswordScreen() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { width } = Dimensions.get('window');
  const route = useRoute();
  const navigation = useNavigation();
  const { email, type } = route.params as { email: string; type?: string };

  const handleResetPassword = async () => {
    setCodeError('');
    setPasswordError('');
    if (!code.trim() || !newPassword.trim()) {
      if (!code.trim()) setCodeError('Введите код');
      if (!newPassword.trim()) setPasswordError('Введите новый пароль');
      return;
    }

    try {
      setIsLoading(true);
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
        // Маппинг ошибок на поля
        const msg = parsed.message.toLowerCase();
        if (msg.includes('код')) setCodeError(parsed.message);
        if (msg.includes('парол')) setPasswordError(parsed.message);
        if (parsed.fieldErrors.code?.length) setCodeError(parsed.fieldErrors.code[0]);
        if (parsed.fieldErrors.new_password?.length) setPasswordError(parsed.fieldErrors.new_password[0]);
        if (!parsed.fieldErrors.code?.length && !parsed.fieldErrors.new_password?.length && !msg.includes('код') && !msg.includes('парол')) {
          Alert.alert('Ошибка', parsed.message);
        }
      }
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Ошибка', String(error));
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:20, marginBottom:6 }}>Сброс пароля</Text>
      <Text style={{ color:'#666', marginBottom:16 }}>
        {type === 'phone' ? 'Введите код из SMS' : 'Введите код из email'}
      </Text>
      <TextInput
        style={{width: width-40, height:50, borderWidth:1, borderRadius:10, paddingHorizontal:10, marginBottom:15}}
        value={code}
        onChangeText={setCode}
        placeholder={type === 'phone' ? 'Код из SMS' : 'Код из email'}
        keyboardType="numeric"
      />
      {codeError ? <Text style={{ color: 'red', marginBottom: 8 }}>{codeError}</Text> : null}
      <TextInput
        style={{width: width-40, height:50, borderWidth:1, borderRadius:10, paddingHorizontal:10, marginBottom:15}}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Новый пароль"
        secureTextEntry
      />
      {passwordError ? <Text style={{ color: 'red', marginBottom: 8 }}>{passwordError}</Text> : null}
      <TouchableOpacity disabled={isLoading} onPress={handleResetPassword} style={{backgroundColor:'#F09235', opacity: isLoading ? 0.7 : 1, padding:15, borderRadius:10, width:width-40, alignItems:'center'}}>
        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={{color:'#FFF'}}>Сменить пароль</Text>}
      </TouchableOpacity>
    </View>
  );
}
