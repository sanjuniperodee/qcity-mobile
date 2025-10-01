import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const { width } = Dimensions.get('window');
  const navigation = useNavigation();

  const handleRequestCode = async () => {
    if (!email.trim()) {
      Alert.alert('Ошибка', 'Введите email');
      return;
    }

    try {
      const response = await fetch('http://market.qorgau-city.kz/api/password-reset/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        Alert.alert('Успех', 'Код отправлен на почту');
        navigation.navigate('ResetPassword', { email });
      } else {
        Alert.alert('Ошибка', 'Email не найден');
      }
    } catch (error) {
      Alert.alert('Ошибка', String(error));
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:20, marginBottom:20 }}>Восстановление пароля</Text>
      <TextInput
        style={{width: width-40, height:50, borderWidth:1, borderRadius:10, paddingHorizontal:10}}
        value={email}
        onChangeText={setEmail}
        placeholder="Введите email"
        keyboardType="email-address"
      />
      <TouchableOpacity onPress={handleRequestCode} style={{marginTop:20, backgroundColor:'#F09235', padding:15, borderRadius:10, width:width-40, alignItems:'center'}}>
        <Text style={{color:'#FFF'}}>Отправить код</Text>
      </TouchableOpacity>
    </View>
  );
}
