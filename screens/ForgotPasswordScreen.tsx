import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Dimensions } from 'react-native';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { colors } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { parseApiError } from '../utils/apiError';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [inputType, setInputType] = useState(''); // 'email' or 'phone'
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [phoneDigits, setPhoneDigits] = useState('');
  const { width } = Dimensions.get('window');
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (value: string) => {
    const digits = (value || '').replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('77');
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
    const area = `7${r.slice(0,2)}`;
    const block1 = r.slice(2,5);
    const block2 = r.slice(5,7);
    const block3 = r.slice(7,9);
    let out = `+7 (${area}`;
    if (r.length < 2) return out;
    out += `) ${block1}`;
    if (block1.length < 3) return out;
    out += `-${block2}`;
    if (block2.length < 2) return out;
    out += `-${block3}`;
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
      setError(t('alerts.error.empty_fields'));
      return;
    }

    const detectedType = method === 'email' ? 'email' : (validatePhone(email) ? 'phone' : null);
    if (!detectedType) {
      setError(t('alerts.error.invalid_contact'));
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
        setError('');
        (navigation as any).navigate('ResetPassword', { email, type: detectedType });
      } else {
        const parsed = await parseApiError(response);
        setError(parsed.message);
      }
    } catch (error) {
      setError(t('common.network'));
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Container style={{ alignItems:'center' }}>
        <Text style={{ fontSize:20, marginBottom:20 }}>Восстановление пароля</Text>
        <View style={{marginBottom:10, flexDirection:'row'}}>
          <TouchableOpacity onPress={() => { setMethod('email'); setEmail(''); setPhoneDigits(''); }} style={{ marginRight:10, paddingVertical:6, paddingHorizontal:10, borderWidth:1, borderColor: method==='email' ? colors.primary : '#D6D6D6', borderRadius:8, backgroundColor: method==='email' ? colors.mutedBg : '#FFF' }}>
            <Text style={{ color:colors.primary }}>Почта</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setMethod('phone'); setEmail(''); setPhoneDigits(''); }} style={{ paddingVertical:6, paddingHorizontal:10, borderWidth:1, borderColor: method==='phone' ? colors.primary : '#D6D6D6', borderRadius:8, backgroundColor: method==='phone' ? colors.mutedBg : '#FFF' }}>
            <Text style={{ color:colors.primary }}>Телефон</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: '100%' }}>
          <FormField
            value={email}
            onChangeText={(v) => method==='phone' ? handlePhoneChange(v) : setEmail(v)}
            placeholder={method==='phone' ? '+7 (7XX) XXX-XX-XX' : 'Email'}
            keyboardType={method==='phone' ? 'phone-pad' : 'default'}
            maxLength={method==='phone' ? 18 : 100}
          />
        </View>
        {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
        <Button fullWidth onPress={handleRequestCode}>
          Отправить код
        </Button>
      </Container>
    </View>
  );
}
