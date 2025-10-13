import React, { useState, useEffect } from 'react';
import { View, TextInput,  TouchableOpacity, Image, Text,KeyboardAvoidingView,Alert,ActivityIndicator,Modal,Platform,StyleSheet,ScrollView,Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { loginSuccess } from '../actions/authActions';
import { logout } from '../actions/authActions';
import { persistor } from '../store/index';
import { useDispatch,useSelector } from 'react-redux';
import { useUpdateUserProfileMutation } from '../api';
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
      'Удалить аккаунт?',
      'Это действие необратимо: профиль и персональные данные будут удалены согласно политике хранения.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: actuallyDeleteAccount }
      ]
    );
  };

  const actuallyDeleteAccount = async () => {
    if (!user?.username) {
      Alert.alert('Ошибка', 'Не удалось определить пользователя.');
      return;
    }
  
    try {
      setDeleting(true);
  
      const url = `${API_BASE}/user/${encodeURIComponent(user.username)}/delete/`;
      const headers = {
        Accept: 'application/json',
        ...getAuthHeader(token),
      };
  
      // 1) Пытаемся удалить через DELETE
      let res = await fetch(url, { method: 'DELETE', headers });
  
      // 2) Если бекенд не разрешает DELETE (405) — пробуем POST
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
        Alert.alert('Удаление запущено', 'Аккаунт будет удалён в ближайшее время.');
        return;
      }
  
      if (res.status === 401) { handleLogout(); return; }
      if (res.status === 403) { Alert.alert('Доступ запрещён', 'Можно удалить только свой аккаунт.'); return; }
      if (res.status === 404) { Alert.alert('Ошибка удаления', 'Пользователь не найден.'); return; }
  
      const text = await (async () => { try { return await res.text(); } catch { return ''; } })();
      Alert.alert('Ошибка удаления', text || `Код ${res.status}`);
    } catch (e) {
      Alert.alert('Сеть', e?.message ?? 'Не удалось выполнить удаление. Попробуйте позже.');
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
    }

    const handleProfileEdit = async () => {
        try {
          setLoading(true);
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
            console.error('Profile update failed:', result.error);
          } else {
            console.log(result.data.user);
            setLoading(false);
            dispatch(loginSuccess(result.data.user, token));
          }
        } catch (error) {
          console.error('Error during profile update:', error);
        }
      };

    return (
      <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                <Text style={styles.modalText}>Редактирование профиля</Text>
            </View>
            </View>
        </Modal>
        <ScrollView contentContainerStyle={{alignItems:'center',width:'90%',marginHorizontal:'5%',marginTop:0}}>
            <TouchableOpacity style={{marginTop:40}} onPress={pickImage}>
                {image ? (
                    <View >
                        <Image style={{position:'absolute',alignSelf:'center',top:30,zIndex:1,height:50,width:50}} source={require('../assets/edit.png')}/>
                        <Image source={{ uri: image }} style={{ width: 110, height: 110, borderRadius:100,borderWidth:1,borderColor:'#D6D6D6' }} />
                    </View>
                ) : (
                    <View style={{ width: 110, height: 110, backgroundColor: '#F7F8F9', borderRadius: 100,borderWidth:1,borderColor:'#D6D6D6', justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{height:25,width:25,marginTop:20}} source={require('../assets/plus.jpg')} />
                        <Text style={{ fontFamily:'regular',fontSize:14,color:'#96949D',marginTop:10, }}>Фото профиля</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={{marginTop:25}}>
                <Text style={{fontFamily:'medium',fontSize:16,marginBottom:10}}>Ваше имя</Text>
                <TextInput
                    style={{width:width - 40,paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6'}}
                    onChangeText={onChangeName}
                    value={name}
                    placeholder="Введите ваше имя"
                />
            </View>
            <View style={{marginTop:20}}>
                <Text style={{fontFamily:'medium',fontSize:16,marginBottom:10}}>Номер телефона</Text>
                <TextInput
                    style={{width:width - 40,paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6'}}
                    onChangeText={onChangePhone}
                    value={phone}
                    placeholder="Введите номер телефона"
                />
            </View>
            <View style={{marginTop:20}}>
                <Text style={{fontFamily:'medium',fontSize:16,marginBottom:10}}>Почта для входа</Text>
                <TextInput
                    style={{width:width - 40,paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6'}}
                    onChangeText={onChangeEmail}
                    value={email}
                    placeholder="Введите почту"
                />
            </View>

            <View style={{marginTop:20,flexDirection:'row',justifyContent:'center'}}>
                <TouchableOpacity onPress={() => {handleLanguage('kz')}} style={{paddingVertical:15,width:165,backgroundColor:'#F7F8F9',borderRadius:10,alignItems:'center',borderColor:'#D6D6D6',borderWidth:1}}>
                    <Text style={{color:'#F09235',fontSize:16,}}>{t('kaz')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {handleLanguage('ru')}} style={{marginLeft:10,paddingVertical:15,width:165,backgroundColor:'#F7F8F9',borderRadius:10,alignItems:'center',borderColor:'#D6D6D6',borderWidth:1}}>
                    <Text style={{color:'#F09235',fontSize:16,}}>{t('rus')}</Text>
                </TouchableOpacity>
            </View>

            <View style={{marginTop:20,justifyContent:'center'}}>
                <TouchableOpacity onPress={handleProfileEdit} style={{paddingVertical:15,width:width - 40,backgroundColor:'#F09235',borderRadius:10,alignItems:'center'}}>
                    <Text style={{color:'#FFF',fontSize:16,}}>Изменить профиль</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleLogout} style={{marginTop:20}}><Text style={{fontFamily:'medium',opacity:.4}}>Выйти из аккаунта</Text></TouchableOpacity>
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
               : <Text style={{color:'#ff3b30',fontSize:16,fontFamily:'medium'}}>Удалить аккаунт</Text>}
           </TouchableOpacity>
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