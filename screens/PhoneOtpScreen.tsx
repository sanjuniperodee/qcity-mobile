import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parseApiError } from '../utils/apiError';

export default function PhoneOtpScreen() {
  const { width } = Dimensions.get('window');
  const navigation = useNavigation();
  const route = useRoute();
  const { phone, password } = route.params as { phone: string; password: string };
  const [code, setCode] = useState('');

  const handleConfirm = async () => {
    if (!code.trim()) {
      Alert.alert('Ошибка', 'Введите код из SMS');
      return;
    }
    try {
      const resp = await fetch('https://market.qorgau-city.kz/api/phone/verify/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      if (!resp.ok) {
        const parsed = await parseApiError(resp);
        Alert.alert('Ошибка', parsed.message);
        return;
      }
      // После успешного подтверждения идём на профиль для завершения регистрации
      // Бэкенд register принимает phone без кода, так как код уже подтвержден
      (navigation as any).navigate('Profile', { login: phone, password, type: 'phone' });
    } catch (e) {
      Alert.alert('Ошибка', String(e));
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:20, marginBottom:20 }}>Подтверждение телефона</Text>
      <Text style={{ marginBottom:10, color:'#555' }}>Код отправлен на {phone}</Text>
      <TextInput
        style={{width: width-40, height:50, borderWidth:1, borderRadius:10, paddingHorizontal:10}}
        value={code}
        onChangeText={setCode}
        placeholder="Код из SMS"
        keyboardType="numeric"
      />
      <TouchableOpacity onPress={handleConfirm} style={{marginTop:20, backgroundColor:'#F09235', padding:15, borderRadius:10, width:width-40, alignItems:'center'}}>
        <Text style={{color:'#FFF'}}>Продолжить</Text>
      </TouchableOpacity>
    </View>
  );
}


