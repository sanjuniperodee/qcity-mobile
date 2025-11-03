import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Dimensions } from 'react-native';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { colors } from '../theme/tokens';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parseApiError } from '../utils/apiError';
import { useTranslation } from 'react-i18next';

export default function PhoneOtpScreen() {
  const { width } = Dimensions.get('window');
  const navigation = useNavigation();
  const route = useRoute();
  const { phone, password } = route.params as { phone: string; password: string };
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!code.trim()) {
      setError('Введите код из SMS');
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
        setError(parsed.message);
        return;
      }
      // После успешного подтверждения идём на профиль для завершения регистрации
      // Бэкенд register принимает phone без кода, так как код уже подтвержден
      (navigation as any).navigate('Profile', { login: phone, password, type: 'phone' });
    } catch (e) {
      setError('Сеть недоступна');
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Container style={{ alignItems:'center' }}>
        <Text style={{ fontSize:20, marginBottom:20 }}>Подтверждение телефона</Text>
        <Text style={{ marginBottom:10, color:colors.textMuted }}>Код отправлен на {phone}</Text>
        <View style={{ width: '100%' }}>
          <FormField
            value={code}
            onChangeText={setCode}
            placeholder="Код из SMS"
            keyboardType="numeric"
          />
        </View>
        {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
        <Button fullWidth onPress={handleConfirm}>Продолжить</Button>
      </Container>
    </View>
  );
}


