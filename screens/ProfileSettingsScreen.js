import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Image, Text, KeyboardAvoidingView, Alert, ActivityIndicator, Modal, Platform, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Container from '../components/ui/Container';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import * as ImagePicker from 'expo-image-picker';
import { loginSuccess } from '../actions/authActions';
import { logout } from '../actions/authActions';
import { persistor } from '../store/index';
import { useDispatch, useSelector } from 'react-redux';
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
          // Прикрепляем файл только если пользователь выбрал НОВОЕ локальное изображение
          if (image && typeof image === 'string' && !image.startsWith('http')) {
            if (Platform.OS === 'web') {
              try {
                const resp = await fetch(image);
                const blob = await resp.blob();
                formData.append('profile_image', blob, 'profile_image.jpg');
              } catch (e) {
                console.warn('Failed to read image blob', e);
              }
            } else {
              formData.append('profile_image', {
                uri: image,
                type: 'image/jpeg',
                name: 'profile_image.jpg',
              });
            }
          }
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
              if (data.phone_number?.length) setPhoneError(t('register.error.phone_already_in_use'));
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

    const currentLanguage = i18n.language;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
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
              <ActivityIndicator size="large" color="#F09235" />
              <Text style={styles.modalText}>{t('profile_settings.editing_profile')}</Text>
            </View>
          </View>
        </Modal>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Заголовок с градиентом */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#F3B127', '#F26D1D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <Ionicons name="settings" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Настройки профиля</Text>
                  <Text style={styles.headerSubtitle}>Редактируйте свои данные</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.content}>
            {/* Аватар */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8}>
                {image ? (
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: image }} style={styles.avatar} />
                    <View style={styles.editAvatarBadge}>
                      <Ionicons name="camera" size={16} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={48} color="#CCCCCC" />
                    <Text style={styles.avatarPlaceholderText}>{t('register.profile_pic')}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Форма */}
            <View style={styles.formSection}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{t('profile_settings.your_name')}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    onChangeText={onChangeName}
                    value={name}
                    placeholder={t('profile_settings.enter_your_name')}
                    placeholderTextColor="#999"
                  />
                </View>
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{t('profile_settings.phone_number')}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    onChangeText={onChangePhone}
                    value={phone}
                    placeholder={t('profile_settings.enter_phone_number')}
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{t('profile_settings.email_for_login')}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    onChangeText={onChangeEmail}
                    value={email}
                    placeholder={t('profile_settings.enter_email')}
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {generalError ? <Text style={styles.generalErrorText}>{generalError}</Text> : null}

              {/* Выбор языка */}
              <View style={styles.languageSection}>
                <Text style={styles.sectionTitle}>Язык приложения</Text>
                <View style={styles.languageButtons}>
                  <TouchableOpacity
                    onPress={() => handleLanguage('kz')}
                    style={[
                      styles.languageButton,
                      currentLanguage === 'kz' && styles.languageButtonActive
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.languageButtonText,
                      currentLanguage === 'kz' && styles.languageButtonTextActive
                    ]}>
                      {t('kaz')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleLanguage('ru')}
                    style={[
                      styles.languageButton,
                      currentLanguage === 'ru' && styles.languageButtonActive
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.languageButtonText,
                      currentLanguage === 'ru' && styles.languageButtonTextActive
                    ]}>
                      {t('rus')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleLanguage('en')}
                    style={[
                      styles.languageButton,
                      currentLanguage === 'en' && styles.languageButtonActive
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.languageButtonText,
                      currentLanguage === 'en' && styles.languageButtonTextActive
                    ]}>
                      {t('eng')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Кнопка сохранения */}
              <TouchableOpacity
                onPress={handleProfileEdit}
                style={styles.saveButton}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#F3B127', '#F26D1D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>{t('profile_settings.edit_profile')}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Выход */}
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={20} color="#999" />
                <Text style={styles.logoutButtonText}>{t('profile_settings.logout')}</Text>
              </TouchableOpacity>

              {/* Удаление аккаунта */}
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={deleting}
                style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
                activeOpacity={0.7}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={styles.deleteButtonText}>{t('profile_settings.delete_account.button')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }


  const styles = StyleSheet.create({
    keyboardView: {
      flex: 1,
      backgroundColor: '#F7F8F9',
    },
    container: {
      flex: 1,
      backgroundColor: '#F7F8F9',
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      marginBottom: 20,
      borderRadius: 0,
      overflow: 'hidden',
    },
    headerGradient: {
      padding: 20,
      paddingTop: 30,
      paddingBottom: 25,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIcon: {
      marginRight: 15,
    },
    headerText: {
      flex: 1,
    },
    headerTitle: {
      fontFamily: 'bold',
      fontSize: 24,
      color: '#FFFFFF',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontFamily: 'regular',
      fontSize: 14,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    content: {
      paddingHorizontal: 20,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: '#FFFFFF',
      backgroundColor: '#F0F0F0',
    },
    editAvatarBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F09235',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#FFFFFF',
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#F0F0F0',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#E0E0E0',
      borderStyle: 'dashed',
    },
    avatarPlaceholderText: {
      fontFamily: 'regular',
      fontSize: 12,
      color: '#999',
      marginTop: 8,
    },
    formSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    fieldContainer: {
      marginBottom: 20,
    },
    fieldLabel: {
      fontFamily: 'bold',
      fontSize: 14,
      color: '#1A1A1A',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F7F8F9',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      paddingHorizontal: 16,
      height: 52,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontFamily: 'regular',
      fontSize: 16,
      color: '#1A1A1A',
      paddingVertical: 0,
    },
    errorText: {
      color: '#FF3B30',
      fontFamily: 'regular',
      fontSize: 12,
      marginTop: 6,
    },
    generalErrorText: {
      color: '#FF3B30',
      fontFamily: 'regular',
      fontSize: 14,
      marginTop: 10,
      marginBottom: 10,
    },
    languageSection: {
      marginTop: 10,
      marginBottom: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    sectionTitle: {
      fontFamily: 'bold',
      fontSize: 14,
      color: '#1A1A1A',
      marginBottom: 12,
    },
    languageButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    languageButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: '#F7F8F9',
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    languageButtonActive: {
      backgroundColor: '#FFF5E6',
      borderColor: '#F09235',
      borderWidth: 2,
    },
    languageButtonText: {
      fontFamily: 'medium',
      fontSize: 14,
      color: '#999',
    },
    languageButtonTextActive: {
      color: '#F09235',
      fontFamily: 'bold',
    },
    saveButton: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 10,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    saveButtonGradient: {
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontFamily: 'bold',
      fontSize: 16,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      marginBottom: 12,
    },
    logoutButtonText: {
      fontFamily: 'medium',
      fontSize: 15,
      color: '#999',
      marginLeft: 8,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      backgroundColor: '#FFF5F5',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FFE0E0',
    },
    deleteButtonDisabled: {
      opacity: 0.6,
    },
    deleteButtonText: {
      fontFamily: 'medium',
      fontSize: 15,
      color: '#FF3B30',
      marginLeft: 8,
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      marginTop: 20,
      fontFamily: 'medium',
      fontSize: 16,
      color: '#1A1A1A',
      textAlign: 'center',
    },
  });