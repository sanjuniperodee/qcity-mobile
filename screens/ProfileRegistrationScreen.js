import React, { useState, useEffect } from 'react';
import { View, TextInput,  TouchableOpacity, KeyboardAvoidingView,Platform, ScrollView, Image, Text, Modal, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { loginSuccess } from '../actions/authActions';
import { useDispatch } from 'react-redux';
import {useTranslation} from 'react-i18next'
import { parseApiError } from '../utils/apiError';

export const ProfileRegistrationScreen = ({route}) => {
    const { login, password, type } = route.params;
    const {t} = useTranslation();
    const [name, onChangeName] = useState('');
    const dispatch = useDispatch()
    const [image, setImage] = useState(null);
    const navigation = useNavigation();

    const { width } = Dimensions.get('window');
    
    const [nameError, setNameError] = useState('');
    const [imageError, setImageError] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
      let isValid = true;
  
      // Проверка имени
      if (!name.trim()) {
        setNameError(t('register.error.name_required'));
        isValid = false;
    } else if (/[\s_]/.test(name)) {
        // Проверяем наличие пробелов или символов подчеркивания
        setNameError('Введите Имя пользователя без пробелов и специальных знаков');
        isValid = false;
    } else {
        setNameError('');
    }
  
      return isValid;
  };  


    useEffect(() => {
      (async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Нам нужно разрешение на использование галереи, для того чтобы прикрепить фото');
        }
      })();
    }, []);
  

    const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
  
      console.log(result);
  
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    };

    const handleRegistration = async () => {
        if (!validate()) {
          return;
        }
        setIsLoading(true);
        
        const formData = new FormData();
        formData.append('username', name);
        formData.append('password', password);
        if (type === 'phone') {
          formData.append('phone', login);
        } else {
          formData.append('email', login);
        }
        if (image) {
          formData.append('profile_image', { uri: image, type: 'image/jpeg', name: 'profile.jpg' });
        }
        formData.append('profile.phone_number', type === 'phone' ? login : '');
    
        try {
          const response = await fetch('https://market.qorgau-city.kz/api/register/', {
            method: 'POST',
            body: formData,
            headers: {
              Accept: 'application/json',
              // НЕ устанавливаем Content-Type для FormData - браузер сделает это автоматически с boundary
            },
          });
    
          if (response.ok) {
            const data = await response.json();
            // Handle successful registration, e.g., navigate to the next screen
            dispatch(loginSuccess(data.user, data.token));
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
            // map field errors
            if (parsed.fieldErrors.username?.length) setNameError(parsed.fieldErrors.username[0]);
            if (parsed.fieldErrors.phone?.length || parsed.fieldErrors.phone_number?.length) {
              alert((parsed.fieldErrors.phone?.[0] || parsed.fieldErrors.phone_number?.[0]));
            }
            if (!Object.keys(parsed.fieldErrors).length) {
              alert(parsed.message);
            }
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Error during registration:', error);
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
              <Text style={styles.modalText}>Создание аккаунта</Text>
          </View>
          </View>
      </Modal>
       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{alignItems:'center',width:'90%',marginHorizontal:'5%',marginTop:80}}>
            <Image style={{height:90,width:180,objectFit:'contain'}} source={require('../assets/logo.jpg')}/>
            <Text style={{ fontFamily: 'bold',fontSize:25, textAlign:'center',marginTop:20}} >{t('register.register_of_acc')}</Text>
            <Text style={{ fontFamily: 'regular',fontSize:15,color:"#96949D",width:255,lineHeight:21,marginTop:10, textAlign:'center' }} >{t('register.create_acc')}</Text>


            <TouchableOpacity style={{marginTop:40}} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={{ width: 110, height: 110, borderRadius:15,borderWidth:1,borderColor:'#D6D6D6' }} />
                ) : (
                    <View style={{ width: 110, height: 110, backgroundColor: '#F7F8F9', borderRadius: 15,borderWidth:1,borderColor:'#D6D6D6', justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{height:25,width:25,marginTop:20}} source={require('../assets/plus.jpg')} />
                        <Text style={{ fontFamily:'regular',fontSize:14,color:'#96949D',marginTop:10, }}>{t('register.profile_pic')}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={{marginTop:40}}>
                <TextInput
                    style={{width:width - 40,paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6'}}
                    onChangeText={onChangeName}
                    value={name}
                    placeholder={t('register.write_name')}
                />
            </View>

            { nameError ? <Text style={{ color: 'red', marginTop: 15,alignSelf:'flex-start' }}>{nameError}</Text> : null }
            { imageError ? <Text style={{ color: 'red', marginTop: 15,alignSelf:'flex-start' }}>{imageError}</Text> : null }
            <View style={{marginTop:20,justifyContent:'center'}}>
                <TouchableOpacity onPress={handleRegistration} style={{paddingVertical:15,width:width - 40,backgroundColor:'#F09235',borderRadius:10,alignItems:'center'}}>
                    <Text style={{color:'#FFF',fontSize:16,}}>{t('continue')}</Text>
                </TouchableOpacity>
            </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  
  