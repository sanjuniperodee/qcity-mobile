import React, { useState, useCallback, useMemo } from 'react';
import { View, TextInput,  TouchableOpacity, ScrollView, Image, Text, Platform,Alert,Modal, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Spacer from '../components/ui/Spacer';
import { colors } from '../theme/tokens';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { loginSuccess } from '../actions/authActions';
import { useDispatch } from 'react-redux';
import {useTranslation} from 'react-i18next'
import { useNavigation, useRoute } from '@react-navigation/native';
import { parseApiError } from '../utils/apiError';

export const LoginScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {t} = useTranslation();
    const [login, setLogin] = React.useState('');
    const [password, onChangePassword] = React.useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {width} = Dimensions.get('window');
    const isDesktop = width >= 1024;

    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState(''); // detected type
    const [method, setMethod] = useState('email'); // explicit toggle
    const [phoneDigits, setPhoneDigits] = useState('');

    // Prefill from navigation params (e.g., from SignUpScreen)
    React.useEffect(() => {
        const params = route.params || {};
        if (params?.prefill && !login) {
            setLogin(params.prefill);
            if (/^\+77\d{9}$/.test(params.prefill)) {
                // if phone, switch method
                setMethod('phone');
            }
        }
    }, [route.params]);

    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    }; 

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (value) => {
        const digits = (value || '').replace(/\D/g, '');
        return digits.length === 11 && digits.startsWith('77');
    };

    const normalizeKzPhone = (value) => {
        const digits = (value || '').replace(/\D/g, '');
        if (digits.length === 11 && digits.startsWith('77')) return `+${digits}`;
        return value;
    };

    const formatKzPhoneFromDigits = (rest) => {
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

    const handlePhoneChange = (value) => {
        const only = (value || '').replace(/\D/g, '');
        const rest = only.replace(/^77?/, '').slice(0,9);
        setPhoneDigits(rest);
        const masked = formatKzPhoneFromDigits(rest);
        setLogin(masked || '+7 (7');
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

    const validateForm = () => {
        if (!login.trim() || !password.trim()) {
            setError('Пожалуйста заполните пустые поля');
            return false;
        }
        
        const detectedType = method === 'email' ? 'email' : (validatePhone(login) ? 'phone' : null);
        setInputType(detectedType || '');
        if (!detectedType) {
            setError('Введите корректный email или номер телефона (+7 XXX XXX XX XX)');
            return false;
        }
        
        setError('');
        return true;
    };

    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }
        setIsLoading(true); 
      try {
          // Определяем тип локально, не полагаясь на setState
          const kind = method === 'email' ? 'email' : 'phone';
          const key = kind === 'email' ? 'email' : 'phone';
          const val = kind === 'phone' ? normalizeKzPhone(login) : login;

          const response = await fetch('https://market.qorgau-city.kz/api/login/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  [key]: val,
                  password: password,
              }),
          });
  
          if (response.ok) {
              const data = await response.json();
              const { id, username, email, profile, profile_image } = data.user;
              dispatch(loginSuccess({ id, username, email, profile, profile_image }, data.token));
              const parent = navigation.getParent();
                if (parent) {
                parent.reset({
                    index: 0,
                    routes: [{ name: 'root' }],
                });
                } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'root' }],
                });
                }
          } else {
              const parsed = await parseApiError(response);
              setIsLoading(false);
              setError(parsed.message);
          }
      } catch (error) {
          Alert.alert('Ошибка', error)
      }
  };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} 
            enableOnAndroid={true}
            extraScrollHeight={150}
            keyboardShouldPersistTaps="handled"
        >
            <Modal
                animationType="slide"
                transparent={true}
                visible={isLoading}
                onRequestClose={() => {
                setIsLoading(false);
                }}
            >
                <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.modalText}>Вход в аккаунт</Text>
                </View>
                </View>
            </Modal>
            <ScrollView contentContainerStyle={{ flex: 1 }}>
                <Container style={{ alignItems: 'center', marginTop: 80 }}>
                    <View style={{ width: '100%', maxWidth: isDesktop ? 480 : undefined, alignItems: 'center' }}>
                    <Image style={{height:90,width:180,objectFit:'contain'}} source={require('../assets/logo.jpg')}/>
                    <Text style={{ fontFamily: 'bold',fontSize:isDesktop ? 18 : 25, textAlign:'center',marginTop:20}} >{t('login.login_to_acc')}</Text>
                    <Text style={{ fontFamily: 'regular',fontSize:isDesktop ? 14 : 15,color:colors.textMuted, maxWidth: 320,lineHeight:21,marginTop:20, textAlign:'center' }} ></Text>
                    {/* Toggle Email/Phone */}
                    <View style={{marginTop:20, flexDirection:'row', gap:10}}>
                        <TouchableOpacity onPress={() => { setMethod('email'); setLogin(''); setPhoneDigits(''); setInputType(''); }} style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, borderWidth:1, borderColor: method==='email' ? colors.primary : '#D6D6D6', backgroundColor: method==='email' ? colors.mutedBg : '#FFF' }}>
                            <Text style={{ color: colors.primary }}>{t('auth.email')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setMethod('phone'); setLogin(''); setPhoneDigits(''); setInputType(''); }} style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, borderWidth:1, borderColor: method==='phone' ? colors.primary : '#D6D6D6', backgroundColor: method==='phone' ? colors.mutedBg : '#FFF' }}>
                            <Text style={{ color: colors.primary }}>{t('auth.phone')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{marginTop:20, width: '100%'}}>
                        <FormField
                            label={t('register.write_name')}
                            onChangeText={(v) => method==='phone' ? handlePhoneChange(v) : setLogin(v)}
                            value={method==='phone' ? (login || '+7 (7') : login}
                            placeholder={method==='phone' ? '+7 (7XX) XXX-XX-XX' : t('number_or_email')}
                            keyboardType={method==='phone' ? 'phone-pad' : 'default'}
                            maxLength={method==='phone' ? 18 : 100}
                            autoCapitalize="none"
                            autoCorrect={false}
                            dense={isDesktop}
                        />
                    </View>
                    <View style={{marginTop:15, width: '100%'}}>
                        <Text style={{fontFamily:'medium' ,marginBottom:10,fontSize:14}}>{t('password')}</Text>
                        <View style={{width: '100%'}}>
                            <FormField
                                onChangeText={onChangePassword}
                                value={password}
                                placeholder={t('password')}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                accessoryRight={<MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#D6D6D6" onPress={toggleShowPassword} />}
                                dense={isDesktop}
                            />
                        </View>
                    </View>

                    <View style={{marginTop:20,justifyContent:'center'}}>

                        {error ? <Text style={{color: 'red', textAlign: 'center', marginBottom: 15}}>{error}</Text> : null}
                        <Button size={isDesktop ? 'sm' : 'md'} fullWidth onPress={handleLogin}>{t('login.login')}</Button>

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={{marginTop:30, color:colors.textMuted,fontSize:15, textAlign:'center'}}>
                                Забыли пароль?
                            </Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                </Container>
            </ScrollView>
        </KeyboardAwareScrollView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      paddingTop:50,
      alignItems: 'center',
      shadowColor: '#666',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      marginTop: 25,
      fontFamily:'medium',
      fontSize:16,
      textAlign: 'center',
    },
  });
  
  