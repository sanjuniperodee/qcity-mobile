import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [inputType, setInputType] = useState(''); // 'email' or 'phone'
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [phoneDigits, setPhoneDigits] = useState('');
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

  const normalizeKzPhone = (val: string) => {
    const digits = (val || '').replace(/\D/g, '');
    if (digits.startsWith('77') && digits.length === 11) return `+${digits}`;
    if (digits.startsWith('7') && digits.length === 11) return `+${digits}`;
    return val;
  };

  const formatKzPhoneFromDigits = (rest: string) => {
    const r = (rest || '').slice(0,9);
    const p1 = r.slice(0,3);
    const p2 = r.slice(3,6);
    const p3 = r.slice(6,8);
    const p4 = r.slice(8,9);
    let out = `+7 (7${p1}`;
    if (p1.length < 3) return out;
    out += `) ${p2}`;
    if (p2.length < 3) return out;
    out += `-${p3}`;
    if (p3.length < 2) return out;
    out += `-${p4}`;
    return out;
  };

  const handlePhoneChange = (value: string) => {
    const only = (value || '').replace(/\D/g, '');
    const rest = only.replace(/^77?/, '').slice(0,9);
    setPhoneDigits(rest);
    const masked = formatKzPhoneFromDigits(rest);
    setEmail(masked || '+7 (7');
  };

  const handleRequestCode = async () => {
    if (!email.trim()) {
      Alert.alert('Ошибка', 'Введите email или номер телефона');
      return;
    }

    const detectedType = method === 'email' ? 'email' : (validatePhone(email) ? 'phone' : null);
    if (!detectedType) {
      Alert.alert('Ошибка', 'Введите корректный email или номер телефона (+7 XXX XXX XX XX)');
      return;
    }

    try {
      const response = await fetch('https://market.qorgau-city.kz/api/password-reset/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [detectedType === 'email' ? 'email' : 'phone']: detectedType === 'phone' ? normalizeKzPhone(email) : email 
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
      <View style={{marginBottom:10, flexDirection:'row'}}>
        <TouchableOpacity onPress={() => setMethod('email')} style={{ marginRight:10, paddingVertical:6, paddingHorizontal:10, borderWidth:1, borderColor: method==='email' ? '#F09235' : '#D6D6D6', borderRadius:8 }}>
          <Text style={{ color:'#F09235' }}>Почта</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMethod('phone')} style={{ paddingVertical:6, paddingHorizontal:10, borderWidth:1, borderColor: method==='phone' ? '#F09235' : '#D6D6D6', borderRadius:8 }}>
          <Text style={{ color:'#F09235' }}>Телефон</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={{width: width-40, height:50, borderWidth:1, borderRadius:10, paddingHorizontal:10}}
        value={email}
        onChangeText={(v) => method==='phone' ? handlePhoneChange(v) : setEmail(v)}
        placeholder={method==='phone' ? '+7 (7XX) XXX-XX-XX' : 'Email'}
        keyboardType={method==='phone' ? 'phone-pad' : 'default'}
        maxLength={method==='phone' ? 18 : 100}
      />
      <TouchableOpacity onPress={handleRequestCode} style={{marginTop:20, backgroundColor:'#F09235', padding:15, borderRadius:10, width:width-40, alignItems:'center'}}>
        <Text style={{color:'#FFF'}}>Отправить код</Text>
      </TouchableOpacity>
    </View>
  );
}
