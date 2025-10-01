import React, { useState, useCallback, useMemo } from 'react';
import { View, TextInput,  TouchableOpacity, ScrollView, KeyboardAvoidingView,Platform,RefreshControl, Dimensions, Image, Text } from 'react-native';
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


    const [login, onChangeLogin] = React.useState('');
    const [password, onChangePassword] = React.useState('');

    const [password2, onChangePassword2] = React.useState('');

    const [showPassword, setShowPassword] = useState(false); 

    const [showPassword2, setShowPassword2] = useState(false); 

    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    }; 

    const toggleShowPassword2 = () => { 
        setShowPassword2(!showPassword2); 
    }; 

    const validate = () => {
        let isValid = true;
    
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z\.]{2,5}))$/;
        if (!login.trim() || !emailRegex.test(login)) {
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
    
    const handleRegistration = () => {
        if (validate()) {
            navigation.navigate('Profile', { login: login, password: password });
        }
    };
    

    return (
        <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        >
         <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{alignItems:'center',width:'90%',marginHorizontal:'5%',marginTop:80}}>
            <Image style={{height:90,width:180,objectFit:'contain'}} source={require('../assets/logo.jpg')}/>
            <Text style={{ fontFamily: 'bold',fontSize:25, textAlign:'center',marginTop:20}} >{t('register.register_of_acc')}</Text>
            <Text style={{ fontFamily: 'regular',fontSize:15,color:"#96949D",width:255,lineHeight:21,marginTop:10, textAlign:'center' }} >{t('register.create_acc')}</Text>

            <View style={{marginTop:40}}>
                <TextInput
                    style={{width:width - 40,paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6'}}
                    onChangeText={onChangeLogin}
                    value={login}
                    placeholder={t('number_or_email')}
                />
            </View>
            <View>
                <View style={{marginTop:10,flexDirection:'row',alignItems:'center',width:width - 40,paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6'}}>
                    <TextInput
                        style={{width:'90%'}}
                        onChangeText={onChangePassword}
                        value={password}
                        placeholder={t('password')}
                        secureTextEntry={!showPassword}
                    />
                    <MaterialCommunityIcons 
                        name={showPassword ? 'eye-off' : 'eye'} 
                        size={24} 
                        color="#D6D6D6"
                        style={{marginLeft: 10, }} 
                        onPress={toggleShowPassword} 
                    /> 
                </View>
                <View style={{marginTop:10,flexDirection:'row',alignItems:'center',width:width - 40,paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6'}}>
                    <TextInput
                        style={{width:'90%'}}
                        onChangeText={onChangePassword2}
                        value={password2}
                        placeholder={t('password')}
                        secureTextEntry={!showPassword2}
                    />
                    <MaterialCommunityIcons 
                        name={showPassword2 ? 'eye-off' : 'eye'} 
                        size={24} 
                        color="#D6D6D6"
                        style={{marginLeft: 10, }} 
                        onPress={toggleShowPassword2} 
                    /> 
                </View>
            </View>
            <View style={{marginTop:20,justifyContent:'center'}}>
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
                <TouchableOpacity onPress={handleRegistration} style={{paddingVertical:15,width:width - 40,backgroundColor:'#F09235',borderRadius:10,alignItems:'center'}}>
                    <Text style={{color:'#FFF',fontSize:16,}}>{t('continue')}</Text>
                </TouchableOpacity>
            </View>
        </View>
        </ScrollView>
    </KeyboardAvoidingView>
    );
  }