import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Dimensions, ActivityIndicator } from 'react-native';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { colors, spacing, radius, shadows } from '../theme/tokens';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parseApiError } from '../utils/apiError';

export default function ResetPasswordScreen() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { width } = Dimensions.get('window');
  const route = useRoute();
  const navigation = useNavigation();
  const { email, type } = route.params as { email: string; type?: string };

  const handleResetPassword = async () => {
    setCodeError('');
    setPasswordError('');
    setGeneralError('');
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
        (navigation as any).navigate('Login');
      } else {
        const parsed = await parseApiError(response);
        // Маппинг ошибок на поля
        const msg = parsed.message.toLowerCase();
        if (msg.includes('код')) setCodeError(parsed.message);
        if (msg.includes('парол')) setPasswordError(parsed.message);
        if (parsed.fieldErrors.code?.length) setCodeError(parsed.fieldErrors.code[0]);
        if (parsed.fieldErrors.new_password?.length) setPasswordError(parsed.fieldErrors.new_password[0]);
        if (!parsed.fieldErrors.code?.length && !parsed.fieldErrors.new_password?.length && !msg.includes('код') && !msg.includes('парол')) {
          setGeneralError(parsed.message);
        }
      }
      setIsLoading(false);
    } catch (error) {
      setGeneralError('Сеть недоступна');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Container style={styles.content}>
        <Text style={styles.title}>Сброс пароля</Text>
        <Text style={styles.subtitle}>
          {type === 'phone' ? 'Введите код из SMS' : 'Введите код из email'}
        </Text>
        {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
        <View style={styles.inputContainer}>
          <FormField
            value={code}
            onChangeText={setCode}
            placeholder={type === 'phone' ? 'Код из SMS' : 'Код из email'}
            keyboardType="numeric"
          />
          {codeError ? <Text style={styles.fieldError}>{codeError}</Text> : null}
        </View>
        <View style={styles.inputContainer}>
          <FormField
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Новый пароль"
            secureTextEntry
          />
          {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
        </View>
        <Button fullWidth onPress={handleResetPassword}>
          {isLoading ? '...' : 'Сменить пароль'}
        </Button>
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
    marginBottom: spacing.sm,
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
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  fieldError: {
    fontSize: 14,
    fontFamily: 'regular',
    color: colors.error,
    marginTop: spacing.xs,
  },
});
