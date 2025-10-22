import React, { useState, useCallback, useMemo } from 'react';
import { View, TextInput,  TouchableOpacity, ScrollView, Image, Text, Platform,Alert,Modal, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { loginSuccess } from '../actions/authActions';
import { useDispatch } from 'react-redux';
import {useTranslation} from 'react-i18next'
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
    const navigation = useNavigation();
    const {t} = useTranslation();
    const [login, onChangeLogin] = React.useState('');
    const [password, onChangePassword] = React.useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {width} = Dimensions.get('window');

    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState(''); // 'email' or 'phone' 

    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    }; 

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

    const validateForm = () => {
        if (!login.trim() || !password.trim()) {
            setError('Пожалуйста заполните пустые поля');
            return false;
        }
        
        const detectedType = detectInputType(login);
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
          const response = await fetch('https://market.qorgau-city.kz/api/login/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  [inputType === 'email' ? 'email' : 'phone']: login,
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
              setIsLoading(false); 
              Alert.alert('Имя пользователя или пароль не правильный', '')
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
                <View style={{ alignItems: 'center', width: '90%', marginHorizontal: '5%', marginTop: 80 }}>
                    <Image style={{height:90,width:180,objectFit:'contain'}} source={require('../assets/logo.jpg')}/>
                    <Text style={{ fontFamily: 'bold',fontSize:25, textAlign:'center',marginTop:20}} >{t('login.login_to_acc')}</Text>
                    <Text style={{ fontFamily: 'regular',fontSize:15,color:"#96949D",width:253,lineHeight:21,marginTop:20, textAlign:'center' }} ></Text>
                    <View style={{marginTop:40}}>
                        <Text style={{fontFamily:'medium' ,marginBottom:10,fontSize:14}}>{t('register.write_name')}</Text>
                        <TextInput
                            style={{width:width - 40,paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6',fontSize:16}}
                            onChangeText={onChangeLogin}
                            value={login}
                            placeholder="Email или номер телефона"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                    <View style={{marginTop:15,width: width - 40}}>
                        <Text style={{fontFamily:'medium' ,marginBottom:10,fontSize:14}}>{t('password')}</Text>
                        <View style={{flexDirection:'row',alignItems:'center',width:width - 40,paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6'}}>
                            <TextInput
                                style={{width:'90%',fontSize:16}}
                                onChangeText={onChangePassword}
                                value={password}
                                placeholder={t('password')}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <MaterialCommunityIcons 
                                name={showPassword ? 'eye-off' : 'eye'} 
                                size={24} 
                                color="#D6D6D6"
                                style={{marginLeft: 10, }} 
                                onPress={toggleShowPassword} 
                            /> 
                        </View>
                    </View>

                    <View style={{marginTop:20,justifyContent:'center'}}>

                        {error ? <Text style={{color: 'red', textAlign: 'center', marginBottom: 15}}>{error}</Text> : null}
                        <TouchableOpacity onPress={handleLogin} style={{paddingVertical:15,width:width - 40,backgroundColor:'#F09235',borderRadius:10,alignItems:'center'}}>
                            <Text style={{color:'#FFF',fontSize:16,}}>{t('login.login')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={{marginTop:30, color:'#96949D',fontSize:15, textAlign:'center'}}>
                                Забыли пароль?
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
  
  