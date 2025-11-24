import React, { useState, useCallback, useMemo } from 'react';
import { View, TextInput,  TouchableOpacity, ScrollView, KeyboardAvoidingView,Platform,RefreshControl, Dimensions, Image, Text, StyleSheet } from 'react-native';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Spacer from '../components/ui/Spacer';
import { spacing, colors, radius, shadows } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import {useTranslation} from 'react-i18next'
import { LinearGradient } from 'expo-linear-gradient';

export const SignUpScreen = () => {
    const navigation = useNavigation()
    const {t} = useTranslation();

    const [loginError, setLoginError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [password2Error, setPassword2Error] = useState('');

    const {width} = Dimensions.get('window');
    const isDesktop = width >= 1024;


    const [login, setLogin] = React.useState('');
    const [password, onChangePassword] = React.useState('');

    const [password2, onChangePassword2] = React.useState('');

    const [showPassword, setShowPassword] = useState(false); 

    const [showPassword2, setShowPassword2] = useState(false); 
    const [method, setMethod] = useState('email'); // 'email' | 'phone'
    const [phoneDigits, setPhoneDigits] = useState(''); // only user-entered digits after 77

    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    }; 

    const toggleShowPassword2 = () => { 
        setShowPassword2(!showPassword2); 
    }; 

    const normalizeKzPhone = (val) => {
        const digits = (val || '').replace(/\D/g, '');
        if (digits.startsWith('77') && digits.length === 11) return `+${digits}`;
        if (digits.startsWith('7') && digits.length === 11) return `+${digits}`; // already 7xxxxxxxxxx
        return val;
    };

    const isKzPhone = (val) => /^\+77\d{9}$/.test(normalizeKzPhone(val));

    const formatKzPhoneFromDigits = (rest) => {
        const r = (rest || '').slice(0,9);
        const area = `7${r.slice(0,2)}`; // total 3 digits in parentheses
        const block1 = r.slice(2,5);
        const block2 = r.slice(5,7);
        const block3 = r.slice(7,9);
        let out = `+7 (${area}`;
        if (r.length < 2) return out; // still typing first two after 7
        out += `) ${block1}`;
        if (block1.length < 3) return out;
        out += `-${block2}`;
        if (block2.length < 2) return out;
        out += `-${block3}`;
        return out;
    };

    const handlePhoneChange = (value) => {
        const incoming = value || '';
        const only = incoming.replace(/\D/g, '');
        // remove leading 77 if user pasted full number
        let rest = only.replace(/^77?/, '').slice(0,9);
        const currentMasked = formatKzPhoneFromDigits(phoneDigits) || '+7 (7';
        if (rest.length === phoneDigits.length && incoming.length < currentMasked.length) {
            rest = phoneDigits.slice(0, Math.max(0, phoneDigits.length - 1));
        }
        setPhoneDigits(rest);
        const masked = formatKzPhoneFromDigits(rest);
        setLogin(masked || '+7 (7');
    };

    const validate = () => {
        let isValid = true;
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z\.]{2,5}))$/;
        const asPhone = isKzPhone(login);
        const asEmail = emailRegex.test(login);
        if (!login.trim() || (method === 'email' && !asEmail) || (method === 'phone' && !asPhone)) {
            setLoginError(t('register.error.email_required_or_invalid'));
            isValid = false;
        } else {
            setLoginError('');
        }
    
        if (!password.trim()) {
            setPasswordError(t('register.error.password_required'));
            isValid = false;
        } else if (password.length < 6) { // Допустим, минимальная длина пароля — 6 символов
            setPasswordError(t('register.error.password_length'));
            isValid = false;
        } else {
            setPasswordError('');
        }
    
        if (password !== password2) {
            setPassword2Error(t('register.error.passwords_do_not_match'));
            isValid = false;
        } else {
            setPassword2Error('');
        }
    
        return isValid;
    };
    
    const handleRegistration = async () => {
        if (validate()) {
            if (method === 'email') {
                navigation.navigate('Profile', { login: login, password: password });
                return;
            }
            // phone path: request OTP then navigate after confirm
            const phone = normalizeKzPhone(`+77${phoneDigits}`);
            try {
                const resp = await fetch('https://market.qorgau-city.kz/api/phone/verify/request/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone }),
                });
                if (!resp.ok) {
                    const { parseApiError } = await import('../utils/apiError');
                    const parsed = await parseApiError(resp);
                    setLoginError(parsed.message);
                    return;
                }
            } catch (e) {
                setLoginError(t('register.error.email_required_or_invalid'));
                return;
            }
            // Переходим на ввод кода
            navigation.navigate('PhoneOtp', { phone, password });
        }
    };
    

    return (
        <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        >
         <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Container style={{ alignItems:'center', marginTop:80 }}>
            <View style={{ width:'100%', maxWidth: isDesktop ? 480 : undefined, alignItems:'center' }}>
            <View style={styles.logoContainer}>
                <LinearGradient
                    colors={['#F3B127', '#F26D1D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.logoGradient}
                >
                    <Text style={styles.logoText}>Qorgau</Text>
                    <Text style={styles.logoSubtext}>City</Text>
                </LinearGradient>
            </View>
            <Text style={[styles.title, { fontSize: isDesktop ? 24 : 28 }]}>{t('register.register_of_acc')}</Text>
            <Text style={[styles.subtitle, { fontSize: isDesktop ? 14 : 15 }]}>{t('register.create_acc')}</Text>

            {/* Toggle Email/Phone */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity 
                    onPress={() => { setMethod('email'); setLogin(''); setPhoneDigits(''); }} 
                    style={[styles.toggleButton, method === 'email' && styles.toggleButtonActive]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.toggleText, method === 'email' && styles.toggleTextActive]}>{t('auth.email')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => { setMethod('phone'); setLogin('+7 (7'); setPhoneDigits(''); }} 
                    style={[styles.toggleButton, method === 'phone' && styles.toggleButtonActive]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.toggleText, method === 'phone' && styles.toggleTextActive]}>{t('auth.phone')}</Text>
                </TouchableOpacity>
            </View>

            <View style={{marginTop:20, width: '100%'}}>
                <FormField
                    onChangeText={(v) => method==='phone' ? handlePhoneChange(v) : setLogin(v)}
                    value={method==='phone' ? (login || '+7 (7') : login}
                    placeholder={method==='phone' ? '+7 (7XX) XXX-XX-XX' : t('email')}
                    keyboardType={method==='phone' ? 'phone-pad' : 'default'}
                    maxLength={method==='phone' ? 18 : 100}
                    selection={method==='phone' ? { start: (login || '+7 (7').length, end: (login || '+7 (7').length } : undefined}
                    dense={isDesktop}
                />
            </View>
            <View style={{ width: '100%' }}>
                <View style={{marginTop:10}}>
                    <FormField
                        onChangeText={onChangePassword}
                        value={password}
                        placeholder={t('password')}
                        secureTextEntry={!showPassword}
                        accessoryRight={<MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#D6D6D6" onPress={toggleShowPassword} />}
                        dense={isDesktop}
                    />
                </View>
                <View style={{marginTop:10}}>
                    <FormField
                        onChangeText={onChangePassword2}
                        value={password2}
                        placeholder={t('password')}
                        secureTextEntry={!showPassword2}
                        accessoryRight={<MaterialCommunityIcons name={showPassword2 ? 'eye-off' : 'eye'} size={24} color="#D6D6D6" onPress={toggleShowPassword2} />}
                        dense={isDesktop}
                    />
                </View>
            </View>
            <View style={styles.errorsContainer}>
                {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                {password2Error ? <Text style={styles.errorText}>{password2Error}</Text> : null}
            </View>
                <Button size={isDesktop ? 'xs' : 'md'} fullWidth onPress={handleRegistration}>
                    {t('continue')}
                </Button>
                <Spacer size={spacing.sm} />
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login', { prefill: method==='phone' ? normalizeKzPhone(`+77${phoneDigits}`) : login })}
                    style={styles.linkContainer}
                    activeOpacity={0.7}
                >
                    <Text style={styles.linkText}>{t('login.already_have_account')} <Text style={styles.linkTextAccent}>{t('login.login_link')}</Text></Text>
                </TouchableOpacity>
            </View>
        </Container>
        </ScrollView>
    </KeyboardAvoidingView>
    );
  }

  const styles = StyleSheet.create({
    logoContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    logoGradient: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      flexDirection: 'row',
      alignItems: 'baseline',
      ...shadows.md,
    },
    logoText: {
      fontSize: 22,
      fontFamily: 'bold',
      color: colors.primaryText,
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    logoSubtext: {
      fontSize: 18,
      fontFamily: 'medium',
      color: colors.primaryText,
      lineHeight: 20,
      letterSpacing: 0.3,
      marginLeft: spacing.xxs,
      opacity: 0.95,
    },
    title: {
      fontFamily: 'bold',
      textAlign: 'center',
      marginTop: spacing.lg,
      color: colors.text,
    },
    subtitle: {
      fontFamily: 'regular',
      color: colors.textMuted,
      maxWidth: 320,
      lineHeight: 21,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    toggleContainer: {
      marginTop: spacing.xl,
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
    linkContainer: {
      alignItems: 'center',
      marginTop: spacing.md,
    },
    linkText: {
      fontSize: 15,
      fontFamily: 'regular',
      color: colors.textMuted,
    },
    linkTextAccent: {
      color: colors.primary,
      fontFamily: 'semibold',
    },
    errorsContainer: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
      width: '100%',
    },
    errorText: {
      fontSize: 14,
      fontFamily: 'regular',
      color: colors.error,
      marginTop: spacing.xs,
    },
  });