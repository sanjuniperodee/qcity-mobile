import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [inputType, setInputType] = useState(''); // 'email' or 'phone'
  const { width } = Dimensions.get('window');
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    return phoneRegex.test(phone);
  };

  const detectInputType = (input) => {
    if (validateEmail(input)) {
      setInputType('email');
      return 'email';
    } else if (validatePhone(input)) {
      setInputType('phone');
      return 'phone';
    }
    return null;
  };

  const handleRequestCode = async () => {
    if (!email.trim()) {
      Alert.alert('Ошибка', 'Введите email или номер телефона');
      return;
    }

    const detectedType = detectInputType(email);
    if (!detectedType) {
      Alert.alert('Ошибка', 'Введите корректный email или номер телефона (+7 XXX XXX XX XX)');
      return;
    }

    try {
      const response = await fetch('https://market.qorgau-city.kz/api/password-reset/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [detectedType === 'email' ? 'email' : 'phone']: email 
        }),
      });

      if (response.ok) {
        const successMessage = detectedType === 'email' 
          ? 'Код отправлен на почту' 
          : 'Код отправлен на телефон';
        Alert.alert('Успех', successMessage);
        navigation.navigate('ResetPassword', { email, type: detectedType });
      } else {
        Alert.alert('Ошибка', `${detectedType === 'email' ? 'Email' : 'Телефон'} не найден`);
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
        placeholder="Email или номер телефона"
        keyboardType="default"
      />
      <TouchableOpacity onPress={handleRequestCode} style={{marginTop:20, backgroundColor:'#F09235', padding:15, borderRadius:10, width:width-40, alignItems:'center'}}>
        <Text style={{color:'#FFF'}}>Отправить код</Text>
      </TouchableOpacity>
    </View>
  );
}
