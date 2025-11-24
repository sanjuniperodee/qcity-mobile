import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Dimensions } from 'react-native';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { colors, spacing, radius, shadows } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { parseApiError } from '../utils/apiError';
import { StyleSheet } from 'react-native';

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
    const incoming = value || '';
    const only = incoming.replace(/\D/g, '');
    let rest = only.replace(/^77?/, '').slice(0,9);
    const currentMasked = formatKzPhoneFromDigits(phoneDigits) || '+7 (7';
    if (rest.length === phoneDigits.length && incoming.length < currentMasked.length) {
      rest = phoneDigits.slice(0, Math.max(0, phoneDigits.length - 1));
    }
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
    <View style={styles.container}>
      <Container style={styles.content}>
        <Text style={styles.title}>Восстановление пароля</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            onPress={() => { setMethod('email'); setEmail(''); setPhoneDigits(''); }} 
            style={[styles.toggleButton, method === 'email' && styles.toggleButtonActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, method === 'email' && styles.toggleTextActive]}>Почта</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { setMethod('phone'); setEmail('+7 (7'); setPhoneDigits(''); }} 
            style={[styles.toggleButton, method === 'phone' && styles.toggleButtonActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, method === 'phone' && styles.toggleTextActive]}>Телефон</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <FormField
            value={email}
            onChangeText={(v) => method==='phone' ? handlePhoneChange(v) : setEmail(v)}
            placeholder={method==='phone' ? '+7 (7XX) XXX-XX-XX' : 'Email'}
            keyboardType={method==='phone' ? 'phone-pad' : 'default'}
            maxLength={method==='phone' ? 18 : 100}
            selection={method==='phone' ? { start: (email || '+7 (7').length, end: (email || '+7 (7').length } as any : undefined}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button fullWidth onPress={handleRequestCode}>
          Отправить код
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
    marginBottom: spacing.xl,
    color: colors.text,
    textAlign: 'center',
  },
  toggleContainer: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  toggleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.mutedBg,
  },
  toggleText: {
    fontSize: 15,
    fontFamily: 'medium',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primary,
    fontFamily: 'semibold',
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
