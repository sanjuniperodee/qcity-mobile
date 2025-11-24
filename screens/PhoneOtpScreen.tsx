import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Dimensions } from 'react-native';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { colors, spacing, radius, shadows } from '../theme/tokens';
import { StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <Container style={styles.content}>
        <Text style={styles.title}>Подтверждение телефона</Text>
        <Text style={styles.subtitle}>Код отправлен на {phone}</Text>
        <View style={styles.inputContainer}>
          <FormField
            value={code}
            onChangeText={setCode}
            placeholder="Код из SMS"
            keyboardType="numeric"
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button fullWidth onPress={handleConfirm}>Продолжить</Button>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  content: {
    alignItems: 'center',
    width: '90%',
    maxWidth: 480,
  },
  title: {
    fontSize: 28,
    fontFamily: 'bold',
    marginBottom: spacing.md,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'regular',
    color: colors.textMuted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: colors.error,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
});


