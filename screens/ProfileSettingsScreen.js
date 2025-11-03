import React, { useState, useEffect } from 'react';
import { View, TextInput,  TouchableOpacity, Image, Text,KeyboardAvoidingView,Alert,ActivityIndicator,Modal,Platform,StyleSheet,ScrollView,Dimensions } from 'react-native';
import Container from '../components/ui/Container';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import * as ImagePicker from 'expo-image-picker';
import { loginSuccess } from '../actions/authActions';
import { logout } from '../actions/authActions';
import { persistor } from '../store/index';
import { useDispatch,useSelector } from 'react-redux';
import { useUpdateUserProfileMutation } from '../api';
import { parseApiError } from '../utils/apiError';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export const ProfileSettingsScreen = ({route}) => {
    const user = useSelector(state => state.auth.user);
    const token = useSelector(state => state.auth.token);
    const [name, onChangeName] = useState(user?.username);
    const [email, onChangeEmail] = useState(user?.email);
    const [phone, onChangePhone] = useState(user?.profile?.phone_number);
    const { width } = Dimensions.get('window');
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const [deleting, setDeleting] = useState(false);

    const dispatch = useDispatch()
    const [image, setImage] = useState(null);

    const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation();
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        if (user.profile_image) {
            setImage(`https://market.qorgau-city.kz${user.profile_image}`)
        }
      (async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      })();
    }, []);


    // Базовый URL; поправь при необходимости
const API_BASE = 'https://market.qorgau-city.kz/api';

  const getAuthHeader = (token) => {
    if (!token) return {};
    // если токен уже с префиксом — используем как есть
    if (token.startsWith('Bearer ') || token.startsWith('Token ')) {
      return { Authorization: token };
    }
    // чаще в Django — Token <key>; если у тебя JWT — замени на Bearer
    return { Authorization: `Token ${token}` };
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile_settings.delete_account.title'),
      t('profile_settings.delete_account.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile_settings.delete_account.confirm'), style: 'destructive', onPress: actuallyDeleteAccount }
      ]
    );
  };

  const actuallyDeleteAccount = async () => {
    if (!user?.username) {
      Alert.alert(t('common.error'), t('profile_settings.delete_account.user_not_found'));
      return;
    }
  
    try {
      setDeleting(true);
  
      const url = `${API_BASE}/user/${encodeURIComponent(user.username)}/delete/`;
      const headers = {
        Accept: 'application/json',
        ...getAuthHeader(token),
      };
  
      // 1) Trying to delete via DELETE
      let res = await fetch(url, { method: 'DELETE', headers });
  
      // 2) If backend doesn't allow DELETE (405) - try POST
      if (res.status === 405) {
        res = await fetch(url, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirm: true }),
        });
      }
  
      if (res.status === 204 || res.status === 200) {
        handleLogout();
        return;
      }
  
      if (res.status === 202) {
        handleLogout();
        Alert.alert(t('profile_settings.delete_account.deletion_started'), t('profile_settings.delete_account.will_be_deleted_soon'));
        return;
      }
  
      if (res.status === 401) { handleLogout(); return; }
      if (res.status === 403) { Alert.alert(t('common.access_denied'), t('profile_settings.delete_account.only_own_account')); return; }
      if (res.status === 404) { Alert.alert(t('profile_settings.delete_account.deletion_error'), t('profile_settings.delete_account.user_not_found')); return; }
  
      const text = await (async () => { try { return await res.text(); } catch { return ''; } })();
      Alert.alert(t('profile_settings.delete_account.deletion_error'), text || t('common.error_code', {code: res.status}));
    } catch (e) {
      Alert.alert(t('common.network'), e?.message ?? t('profile_settings.delete_account.deletion_failed'));
    } finally {
      setDeleting(false);
    }
  };  
  

  const handleLogout = () => {
      dispatch(logout());
      persistor.purge();
      navigation.navigate('HomeTab');
    };

    const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Photos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
  
      console.log(result);
  
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    };

  const handleLanguage = (language) => {
      i18n.changeLanguage(language)
      try { 
        if (typeof window !== 'undefined') window.localStorage.setItem('lng', language); 
      } catch (e) {
        console.error("Error setting language:", e);
      }
      
      // Force re-render after language change
      onChangeName(name);
  }

  const handleProfileEdit = async () => {
        try {
          setLoading(true);
          setNameError(''); setEmailError(''); setPhoneError(''); setGeneralError('');
          const formData = new FormData();
          formData.append('profile_image', {
            uri: image,
            type: 'image/jpeg',
            name: 'profile_image.jpg',
          });
          formData.append('username', name);
          formData.append('phone_number', phone);
          formData.append('email', email);
    
          const result = await updateUserProfile(formData);
    
          if (result.error) {
            setLoading(false);
            try {
              const status = result.error?.originalStatus;
              const data = result.error?.data || {};
              if (data.username?.length) setNameError(String(data.username[0]));
              if (data.email?.length) setEmailError(String(data.email[0]));
              if (data.phone_number?.length) setPhoneError(String(data.phone_number[0]));
              if (!data.username && !data.email && !data.phone_number) {
                const fallback =
                  status === 400 ? 'Ошибка валидации' :
                  status === 401 ? 'Неверный логин или пароль' :
                  status === 403 ? 'Доступ запрещён' :
                  status === 404 ? 'Не найдено' :
                  status === 429 ? 'Слишком много запросов. Повторите позже' :
                  status >= 500 ? 'Сервис временно недоступен' :
                  'Произошла ошибка';
                setGeneralError(data.detail || fallback);
              }
            } catch (e) {
              setGeneralError('Произошла ошибка');
            }
          } else {
            console.log(result.data.user);
            setLoading(false);
            dispatch(loginSuccess(result.data.user, token));
          }
        } catch (error) {
          console.error('Error during profile update:', error);
          setGeneralError('Сеть недоступна');
        }
      };

    return (
      <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
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
                <Text style={styles.modalText}>{t('profile_settings.editing_profile')}</Text>
            </View>
            </View>
        </Modal>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Container style={{ alignItems:'center' }}>
            <View style={{ width:'100%', maxWidth: (Dimensions.get('window').width >= 1024 ? 480 : undefined), alignItems:'center' }}>
            <TouchableOpacity style={{marginTop:40}} onPress={pickImage}>
                {image ? (
                    <View >
                        <Image style={{position:'absolute',alignSelf:'center',top:30,zIndex:1,height:50,width:50}} source={require('../assets/edit.png')}/>
                        <Image source={{ uri: image }} style={{ width: 110, height: 110, borderRadius:100,borderWidth:1,borderColor:'#D6D6D6' }} />
                    </View>
                ) : (
                    <View style={{ width: 110, height: 110, backgroundColor: '#F7F8F9', borderRadius: 100,borderWidth:1,borderColor:'#D6D6D6', justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{height:25,width:25,marginTop:20}} source={require('../assets/plus.jpg')} />
                        <Text style={{ fontFamily:'regular',fontSize:14,color:'#96949D',marginTop:10, }}>{t('register.profile_pic')}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={{marginTop:25, width:'100%'}}>
                <Text style={{fontFamily:'medium',fontSize:14,marginBottom:10}}>{t('profile_settings.your_name')}</Text>
                <FormField dense={Dimensions.get('window').width >= 1024} onChangeText={onChangeName} value={name} placeholder={t('profile_settings.enter_your_name')} />
                {nameError ? <Text style={{ color: 'red', marginTop: 8 }}>{nameError}</Text> : null}
            </View>
            <View style={{marginTop:20, width:'100%'}}>
                <Text style={{fontFamily:'medium',fontSize:14,marginBottom:10}}>{t('profile_settings.phone_number')}</Text>
                <FormField dense={Dimensions.get('window').width >= 1024} onChangeText={onChangePhone} value={phone} placeholder={t('profile_settings.enter_phone_number')} />
                {phoneError ? <Text style={{ color: 'red', marginTop: 8 }}>{phoneError}</Text> : null}
            </View>
            <View style={{marginTop:20, width:'100%'}}>
                <Text style={{fontFamily:'medium',fontSize:14,marginBottom:10}}>{t('profile_settings.email_for_login')}</Text>
                <FormField dense={Dimensions.get('window').width >= 1024} onChangeText={onChangeEmail} value={email} placeholder={t('profile_settings.enter_email')} />
                {emailError ? <Text style={{ color: 'red', marginTop: 8 }}>{emailError}</Text> : null}
            </View>
            {generalError ? <Text style={{ color: 'red', marginTop: 10, alignSelf:'flex-start' }}>{generalError}</Text> : null}

            <View style={{marginTop:20,flexDirection:'row',justifyContent:'center',alignItems:'center',width:'100%',gap:10}}>
                <TouchableOpacity onPress={() => {handleLanguage('kz')}} style={{paddingVertical:15,backgroundColor:'#F7F8F9',borderRadius:10,alignItems:'center',borderColor:'#D6D6D6',borderWidth:1,flex:1}}>
                    <Text style={{color:'#F09235',fontSize:16,}}>{t('kaz')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {handleLanguage('ru')}} style={{paddingVertical:15,backgroundColor:'#F7F8F9',borderRadius:10,alignItems:'center',borderColor:'#D6D6D6',borderWidth:1,flex:1}}>
                    <Text style={{color:'#F09235',fontSize:16,}}>{t('rus')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {handleLanguage('en')}} style={{paddingVertical:15,backgroundColor:'#F7F8F9',borderRadius:10,alignItems:'center',borderColor:'#D6D6D6',borderWidth:1,flex:1}}>
                    <Text style={{color:'#F09235',fontSize:16,}}>{t('eng')}</Text>
                </TouchableOpacity>
            </View>

            <View style={{marginTop:20,justifyContent:'center', width:'100%'}}>
                <Button size={Dimensions.get('window').width >= 1024 ? 'xs' : 'md'} fullWidth onPress={handleProfileEdit}>{t('profile_settings.edit_profile')}</Button>
            </View>
            <TouchableOpacity onPress={handleLogout} style={{marginTop:20}}><Text style={{fontFamily:'medium',opacity:.4}}>{t('profile_settings.logout')}</Text></TouchableOpacity>
            <TouchableOpacity
             onPress={handleDeleteAccount}
             disabled={deleting}
             style={{
               marginTop:12,
               paddingVertical:15,
               width: width - 40,
               backgroundColor:'#fff',
               borderRadius:10,
               alignItems:'center',
               opacity: deleting ? 0.7 : 1
             }}>
             {deleting
               ? <ActivityIndicator color="#fff" />
               : <Text style={{color:'#ff3b30',fontSize:16,fontFamily:'medium'}}>{t('profile_settings.delete_account.button')}</Text>}
           </TouchableOpacity>
            </View>
          </Container>
        </ScrollView>
        </KeyboardAvoidingView>
    );
  }


  const styles = StyleSheet.create({
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