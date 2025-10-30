import React, { useState, useCallback, useMemo } from 'react';
import { View, TextInput,  TouchableOpacity, ScrollView, KeyboardAvoidingView,Platform,RefreshControl, Dimensions, Image, Text } from 'react-native';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Spacer from '../components/ui/Spacer';
import { spacing, colors } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import {useTranslation} from 'react-i18next'

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
        const only = (value || '').replace(/\D/g, '');
        // remove leading 77 if user pasted full number
        const rest = only.replace(/^77?/, '').slice(0,9);
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
            <Image style={{height:90,width:180,objectFit:'contain'}} source={require('../assets/logo.jpg')}/>
            <Text style={{ fontFamily: 'bold',fontSize: isDesktop ? 18 : 25, textAlign:'center',marginTop:20}} >{t('register.register_of_acc')}</Text>
            <Text style={{ fontFamily: 'regular',fontSize: isDesktop ? 14 : 15,color:colors.textMuted, maxWidth: 320,lineHeight:21,marginTop:10, textAlign:'center' }} >{t('register.create_acc')}</Text>

            {/* Toggle Email/Phone */}
            <View style={{marginTop:30, flexDirection:'row', columnGap:10}}>
                <TouchableOpacity onPress={() => { setMethod('email'); setLogin(''); setPhoneDigits(''); }} style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, borderWidth:1, borderColor: method==='email' ? colors.primary : '#D6D6D6', backgroundColor: method==='email' ? colors.mutedBg : colors.bg }}>
                    <Text style={{ color: colors.primary }}>{t('auth.email')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setMethod('phone'); setLogin(''); setPhoneDigits(''); }} style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, borderWidth:1, borderColor: method==='phone' ? colors.primary : '#D6D6D6', backgroundColor: method==='phone' ? colors.mutedBg : colors.bg }}>
                    <Text style={{ color: colors.primary }}>{t('auth.phone')}</Text>
                </TouchableOpacity>
            </View>

            <View style={{marginTop:20, width: '100%'}}>
                <FormField
                    onChangeText={(v) => method==='phone' ? handlePhoneChange(v) : setLogin(v)}
                    value={method==='phone' ? (login || '+7 (7') : login}
                    placeholder={method==='phone' ? '+7 (7XX) XXX-XX-XX' : t('email')}
                    keyboardType={method==='phone' ? 'phone-pad' : 'default'}
                    maxLength={method==='phone' ? 18 : 100}
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
            <View style={{marginTop:20,justifyContent:'center', width: '100%'}}>
                <View>
                    {loginError ? <Text style={{color: 'red'}}>{loginError}</Text> : null}
                </View>
                <View style={{marginBottom:20}}>
                    <View style={{marginTop:10}}>
                        {passwordError ? <Text style={{color: 'red'}}>{passwordError}</Text> : null}
                    </View>
                    <View style={{marginTop:10}}>
                        {password2Error ? <Text style={{color: 'red'}}>{password2Error}</Text> : null}
                    </View>
                </View>
                <Button size={isDesktop ? 'sm' : 'md'} fullWidth onPress={handleRegistration}>
                    {t('continue')}
                </Button>
                <Spacer size={spacing.sm} />
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login', { prefill: method==='phone' ? normalizeKzPhone(`+77${phoneDigits}`) : login })}
                    style={{alignItems:'center', marginTop:14}}
                    activeOpacity={0.7}
                >
                    <Text style={{ color:colors.textMuted }}>Уже есть аккаунт? <Text style={{ color:colors.primary }}>Войти</Text></Text>
                </TouchableOpacity>
            </View>
            </View>
        </Container>
        </ScrollView>
    </KeyboardAvoidingView>
    );
  }