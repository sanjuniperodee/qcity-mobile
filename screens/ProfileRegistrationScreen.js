import React, { useState, useEffect } from 'react';
import { View, TextInput,  TouchableOpacity, KeyboardAvoidingView,Platform, ScrollView, Image, Text, Modal, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { loginSuccess } from '../actions/authActions';
import { useDispatch } from 'react-redux';
import {useTranslation} from 'react-i18next'
import { parseApiError } from '../utils/apiError';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme/tokens';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';

export const ProfileRegistrationScreen = ({route}) => {
    const { login, password, type } = route.params;
    const {t} = useTranslation();
    const [name, onChangeName] = useState('');
    const dispatch = useDispatch()
    const [image, setImage] = useState(null);
    const [generalError, setGeneralError] = useState('');
    const navigation = useNavigation();

    const [nameError, setNameError] = useState('');
    const [imageError, setImageError] = useState('');
    const [emailError, setEmailError] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
      let isValid = true;
  
      // Проверка имени
      if (!name.trim()) {
        setNameError(t('register.error.name_required'));
        isValid = false;
    } else if (/[\s_]/.test(name)) {
        // Проверяем наличие пробелов или символов подчеркивания
        setNameError(t('register.no_spaces_special_chars'));
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
          alert(t('alerts.permission.media_access'));
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
        setGeneralError('');
        setEmailError('');
        
        const formData = new FormData();
        formData.append('username', name);
        formData.append('password', password);
        if (type === 'phone') {
          formData.append('phone', login);
        } else {
          formData.append('email', login);
        }
        if (image && !image.startsWith('http')) {
          if (Platform.OS === 'web') {
            try {
              const resp = await fetch(image);
              const blob = await resp.blob();
              formData.append('profile_image', blob, 'profile.jpg');
            } catch (e) {
              console.warn('Failed to read image blob', e);
            }
          } else {
            formData.append('profile_image', { uri: image, type: 'image/jpeg', name: 'profile.jpg' });
          }
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
              setGeneralError(t('register.error.phone_already_in_use'));
            }
            if (parsed.fieldErrors.email?.length) {
              setEmailError(t('register.error.email_already_in_use'));
            }
            if (!Object.keys(parsed.fieldErrors).length) {
              setGeneralError(parsed.message);
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
              <Text style={styles.modalText}>{t('register.account_creation')}</Text>
          </View>
          </View>
      </Modal>
       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <LinearGradient
                    colors={[colors.primaryLight, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.logoGradient}
                >
                    <Text style={styles.logoText}>Qorgau</Text>
                    <Text style={styles.logoSubtext}>City</Text>
                </LinearGradient>
            </View>
            <Text style={styles.title}>{t('register.register_of_acc')}</Text>
            <Text style={styles.subtitle}>{t('register.create_acc')}</Text>

            <TouchableOpacity style={styles.imageContainer} onPress={pickImage} activeOpacity={0.7}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Image style={styles.plusIcon} source={require('../assets/plus.jpg')} />
                        <Text style={styles.imagePlaceholderText}>{t('register.profile_pic')}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.inputContainer}>
                <FormField
                    onChangeText={onChangeName}
                    value={name}
                    placeholder={t('register.write_name')}
                />
            </View>

            <View style={styles.errorsContainer}>
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                {imageError ? <Text style={styles.errorText}>{imageError}</Text> : null}
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
            </View>
            <View style={styles.buttonContainer}>
                <Button fullWidth onPress={handleRegistration}>
                    {t('continue')}
                </Button>
            </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }


  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      width: '90%',
      marginHorizontal: '5%',
      marginTop: 80,
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlay,
    },
    modalView: {
      margin: 20,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.xxl,
      paddingTop: spacing.xxxl,
      alignItems: 'center',
      ...shadows.xl,
    },
    modalText: {
      marginTop: spacing.lg,
      fontFamily: 'medium',
      fontSize: 16,
      textAlign: 'center',
      color: colors.text,
    },
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
      fontSize: 28,
      textAlign: 'center',
      marginTop: spacing.lg,
      color: colors.text,
    },
    subtitle: {
      fontFamily: 'regular',
      fontSize: 15,
      color: colors.textMuted,
      width: 280,
      lineHeight: 21,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    imageContainer: {
      marginTop: spacing.xl,
    },
    profileImage: {
      width: 110,
      height: 110,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    imagePlaceholder: {
      width: 110,
      height: 110,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    plusIcon: {
      height: 25,
      width: 25,
      marginTop: spacing.sm,
    },
    imagePlaceholderText: {
      fontFamily: 'regular',
      fontSize: 14,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    inputContainer: {
      marginTop: spacing.xl,
      width: '100%',
    },
    errorsContainer: {
      marginTop: spacing.md,
      width: '100%',
      alignSelf: 'flex-start',
    },
    errorText: {
      fontSize: 14,
      fontFamily: 'regular',
      color: colors.error,
      marginTop: spacing.xs,
    },
    buttonContainer: {
      marginTop: spacing.lg,
      justifyContent: 'center',
      width: '100%',
    },
  });
  
  