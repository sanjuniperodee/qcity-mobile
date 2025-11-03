import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, TextInput, Pressable, TouchableOpacity, FlatList, ScrollView, Image, Text, Alert, KeyboardAvoidingView, Platform, ActionSheetIOS } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { Video, ResizeMode } from 'expo-av';
import { useGetSubCategoriesListQuery } from '../api';
import { buildExtraFields } from '../constants/helpers';
import { categoryFields } from '../constants/categoryFields';
import { TextInputMask } from 'react-native-masked-text';
import { useTranslation } from 'react-i18next';
import { ToggleGroup } from '../components/ToggleGroup';
import * as ImageManipulator from 'expo-image-manipulator';

export const CreatePostScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const [categoryError, setCategoryError] = useState(false);

  const { categoryParam: categoryParam, categoryId: categoryIdParam } = route.params || {};
  const fields = categoryFields[categoryParam] || [];

  const [categoryLayoutY, setCategoryLayoutY] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const toggleDropdown = (dropdownId) => {
    setOpenDropdown((prevOpen) => (prevOpen === dropdownId ? null : dropdownId));
  };

  const [images, setImages] = useState([]);
  const [cardImage, setCardImage] = useState(null);
  const [category, setCategory] = useState(null);
  const [globalCategory, setGlobalCategory] = useState(null);

  const user = useSelector(state => state.auth.token);
  const userId = useSelector(state => state.auth.user.id);
  const id = Math.floor(Date.now() / 1000);
  const [formState, setFormState] = React.useState({});

  const [title, onChangeTitle] = useState('');
  const [cost, onChangeCost] = useState('');
  const [content, onChangeContent] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [globalCategoriesOpen, setGlobalCategoriesOpen] = useState(false);
  const { data: subcategories, error, isLoading } = useGetSubCategoriesListQuery(categoryIdParam);

  const [phone, onChangePhone] = useState('');
  const [whatsapp, onChangeWhatsapp] = useState('');
  const [site, onChangeSite] = useState('');
  const [telegram, onChangeTelegram] = useState('');
  const [insta, onChangeInsta] = useState('');
  const [facebook, onChangeFacebook] = useState('');
  const [tiktok, onChangeTiktok] = useState('');
  const [twogis, onChangeTwogis] = useState('');

  const [city, setCity] = useState('');
  useEffect(() => {
    if (images.length > 0) {
      setMediaError(false);
    }
  }, [images]);

  const video = useRef(null);
  const [status, setStatus] = useState({});

  const togglecategories = () => setCategoriesOpen(!categoriesOpen);
  const toggleglobalcategories = () => setGlobalCategoriesOpen(!globalCategoriesOpen);

  const scrollViewRef = useRef(null);
  const mediaRef = useRef(null);

  const [mediaError, setMediaError] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Refs for each input field
  const titleRef = React.createRef();
  const categoryRef = React.createRef();
  const costRef = React.createRef();
  const contentRef = React.createRef();
  const phoneRef = React.createRef();
  const cityRef = React.createRef();

  const validateFields = () => {
    const fieldsToCheck = [
      { value: title, ref: titleRef, name: 'Название', placeholder: 'Введите название' },
      { value: cost, ref: costRef, name: 'Цена', placeholder: 'Введите цену' },
      { value: content, ref: contentRef, name: 'Описание', placeholder: 'Введите описание' },
      { value: phone, ref: phoneRef, name: 'Телефон', placeholder: '+7 777 777 777' },
      { value: city, ref: cityRef, name: 'Город', placeholder: 'Выберите город' }
    ];

    let hasError = false;
    let firstErrorField = null;

    // Проверка обязательных полей
    for (const field of fieldsToCheck) {
      const hasValue = !!field.value?.trim();
      if (!hasValue) {
        if (!firstErrorField) firstErrorField = field;
        
        if (field.name === 'Телефон') {
          setPhoneError(true);
        }
        hasError = true;
        field.ref.current?.setNativeProps?.({ style: { borderColor: 'red', borderWidth: 2 } });
      } else {
        field.ref.current?.setNativeProps?.({ style: { borderColor: '#D6D6D6', borderWidth: 1 } });
        if (field.name === 'Телефон') {
          setPhoneError(false);
        }
      }
    }

    // Проверка медиафайлов
    if (categoryIdParam !== 3 && images.length === 0) {
      setMediaError(true);
      Alert.alert('Ошибка', 'Добавьте хотя бы одно фото или видео');
      mediaRef.current?.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        }
      );
      return false;
    } else {
      setMediaError(false);
    }

    // Проверка города
    if (!city) {
      setCityError('Выберите город');
      Alert.alert('Ошибка', 'Выберите город');
      hasError = true;
    } else {
      setCityError(false);
    }

    // Проверка категории
    if (!category) {
      hasError = true;
      setCategoryError(true);
      Alert.alert('Ошибка', 'Выберите подкатегорию');
      scrollViewRef.current?.scrollTo({
        y: categoryLayoutY - 40,
        animated: true,
      });
    } else {
      setCategoryError(false);
    }

    // Скролл к первому полю с ошибкой
    if (hasError && firstErrorField) {
      firstErrorField.ref.current?.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
        }
      );
      firstErrorField.ref.current?.focus?.();
    }

    if (hasError) {
      Alert.alert('Ошибка валидации', 'Пожалуйста, заполните все обязательные поля');
      return false;
    }
    return true;
  };

  // Permissions
  useEffect(() => {
    (async () => {
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      if (lib.status !== 'granted') {
        Alert.alert('Разрешение', 'Нужен доступ к медиа, чтобы выбирать файлы');
      }
      if (cam.status !== 'granted') {
        // не блокируем, просто предупредим — камера нужна для съёмки
        // Alert.alert('Разрешение', 'Нужен доступ к камере, чтобы снимать фото/видео');
      }
    })();
  }, []);

  // Simple resize to max 600x600 (без сохранения пропорций — как у тебя было)
  async function resizeImage(uri, width, height) {
    const actions = [{ resize: { width, height } }];
    const saveOptions = { compress: 1, format: ImageManipulator.SaveFormat.JPEG };
    const result = await ImageManipulator.manipulateAsync(uri, actions, saveOptions);
    return result; // { uri, width, height }
  }

  function getFileName(uri) {
    const match = uri.match(/\/([^\/?#]+)[^\/]*$/);
    if (match) return decodeURIComponent(match[1]);
    return `file_${Date.now()}`;
  }

  function getFileTypeByUri(uri) {
    const ext = (uri.split('.').pop() || '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'heic', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv', 'wmv'].includes(ext)) return 'video';
    return 'unknown';
  }

  function guessMime(type, uri) {
    if (type === 'video') {
      if (uri.endsWith('.mov')) return 'video/quicktime';
      if (uri.endsWith('.mkv')) return 'video/x-matroska';
      if (uri.endsWith('.avi')) return 'video/x-msvideo';
      if (uri.endsWith('.wmv')) return 'video/x-ms-wmv';
      return 'video/mp4';
    }
    // image
    if (uri.endsWith('.png')) return 'image/png';
    if (uri.endsWith('.webp')) return 'image/webp';
    if (uri.endsWith('.heic')) return 'image/heic';
    return 'image/jpeg';
  }

  // ---- NEW: Choice of source (camera photo/video or library) ----
  const chooseMedia = () => {
    // Web: открываем сразу файловый диалог (Alert/ActionSheet на web не поддерживает кнопки)
    if (Platform.OS === 'web') {
      pickFromLibrary();
      return;
    }

    const open = (option) => {
      if (option === 'photo') pickFromCamera('image');
      if (option === 'video') pickFromCamera('video');
      if (option === 'library') pickFromLibrary();
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Отмена', 'Снять фото', 'Снять видео', 'Выбрать из галереи'],
          cancelButtonIndex: 0,
        },
        (i) => {
          if (i === 1) open('photo');
          if (i === 2) open('video');
          if (i === 3) open('library');
        }
      );
    } else {
      Alert.alert('Загрузить медиа', 'Выберите источник', [
        { text: 'Снять фото', onPress: () => open('photo') },
        { text: 'Снять видео', onPress: () => open('video') },
        { text: 'Выбрать из галереи', onPress: () => open('library') },
        { text: 'Отмена', style: 'cancel' },
      ]);
    }
  };

  const handleResult = async (result) => {
    if (result.canceled) return;

    const asset = result.assets?.[0];
    // expo-image-picker возвращает asset.type ('image'|'video') на iOS/Android,
    // но подстрахуемся по uri
    const coarseType = asset?.type || getFileTypeByUri(asset?.uri || '');
    const fileName = getFileName(asset.uri);

    try {
      if (coarseType === 'image') {
        const resized = await resizeImage(asset.uri, 600, 600);
        const imageToAdd = { ...resized, type: 'image', fileName };
        setImages((prev) => [...prev, imageToAdd]);
        if (!cardImage) setCardImage(imageToAdd);
      } else if (coarseType === 'video') {
        const videoToAdd = { uri: asset.uri, type: 'video', fileName };
        setImages((prev) => [...prev, videoToAdd]);
        video.current?.playAsync();
        video.current?.setStatusAsync({ isMuted: true });
      } else {
        console.error('Unknown file type');
        return;
      }
      setMediaError(false);
    } catch (e) {
      console.error('Ошибка обработки медиа:', e);
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Разрешение', 'Разрешите доступ к медиа, чтобы выбрать файл');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });
    await handleResult(result);
  };

  const pickFromCamera = async (mode = 'image') => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Разрешение', 'Разрешите доступ к камере, чтобы снять фото/видео');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: mode === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      videoMaxDuration: 60,
    });
    await handleResult(result);
  };

  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const [sent, setSent] = useState(false);
  const sendPostRequest = async () => {
    const isValid = validateFields();
    if (!isValid) return;

    const extraFields = buildExtraFields(formState, fields);
    if (sent) return;
    setSent(true);

    const apiUrl = 'https://market.qorgau-city.kz/api/posts/';
    const formData = new FormData();

    formData.append('title', title);
    formData.append('post_pk', id);
    formData.append('content', content);
    formData.append('category_id', categoryIdParam);
    formData.append('global_category', globalCategory);
    formData.append('subcategory_id', category.id);
    formData.append('extra_fields', JSON.stringify(extraFields));
    formData.append('geolocation', city);
    formData.append('cost', cost);
    formData.append('author', userId);
    formData.append('isActive', true);

    formData.append('phone', phone);
    formData.append('phone_whatsapp', whatsapp);
    formData.append('site', site);
    formData.append('telegram', telegram);
    formData.append('insta', insta);
    formData.append('facebook', facebook);
    formData.append('tiktok', tiktok);
    formData.append('twogis', twogis);

    // Приложение (iOS/Android) — передаём { uri, name, type }
    // Web — нужен Blob/File: читаем через fetch(item.uri) и добавляем blob
    await Promise.all(
      images.map(async (item, index) => {
        const mime = guessMime(item.type, item.uri);
        const name = (item.fileName || `media_${index}`).toLowerCase();
        if (Platform.OS === 'web') {
          try {
            const resp = await fetch(item.uri);
            const blob = await resp.blob();
            formData.append(`images[${index}][image]`, blob, name);
          } catch (e) {
            console.warn('Failed to read media blob', e);
          }
        } else {
          formData.append(`images[${index}][image]`, {
            uri: item.uri,
            name,
            type: mime,
          });
        }
        formData.append(`images[${index}][type]`, item.type); // 'image' | 'video'
      })
    );

    try {
      setLoading(true);
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Token ${user}`
        },
      });

      if (response.ok) {
        setLoading(false);
        setSent(false);
        setGeneralError('');
        const data = await response.json();
        const createdPostId = data.id;
        navigation.navigate('PostTariffs', { id: createdPostId });
      } else {
        setLoading(false);
        setSent(false);
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          errorText = `Ошибка ${response.status}`;
        }
        setGeneralError(errorText);
        console.error('Error creating post:', errorText);
      }
    } catch (error) {
      setLoading(false);
      setSent(false);
      const msg = error?.message ? String(error.message) : 'Сеть недоступна';
      setGeneralError(msg);
      console.error('Fetch error:', msg);
    }
  };

  const CreateDropdown = ({ isOpen, refProp, error, toggleOpen, state, setState, title, placeholder, items = [] }) => {
    return (
      <View ref={refProp}>
        <Text style={{ fontFamily: 'medium', fontSize: 18, marginTop: 20, marginBottom: 10 }}>{title}</Text>
        <Pressable
          onPress={toggleOpen}
          style={[
            styles.profileButton,
            { borderColor: error ? '#F04438' : '#E0E0E0', borderWidth: 1 }
          ]}
        >
          <Text style={{ fontFamily: 'regular', fontSize: 14, color: state ? '#000' : '#96949D' }}>
            {state ? state : placeholder}
          </Text>
          <Image
            style={{
              height: 16,
              width: 8,
              transform: [{ rotate: isOpen ? '270deg' : '90deg' }],
              marginRight: 5,
            }}
            source={require('../assets/arrow-right.png')}
          />
        </Pressable>

        {isOpen && (
          <View style={{ backgroundColor: '#F7F8F9', borderEndEndRadius: 5, marginTop: -2, borderBottomLeftRadius: 5, borderColor: '#e0e0e0', borderWidth: 1, paddingVertical: 10 }}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setState(item);
                  toggleOpen();
                }}
                style={{ width: '100%', paddingVertical: 10, paddingHorizontal: 15 }}>
                <Text style={{ color: '#96949D', fontSize: 13 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView ref={scrollViewRef} horizontal={false}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={loading}
          onRequestClose={() => {
            setLoading(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.modalText}>Пост создается...</Text>
            </View>
          </View>
        </Modal>

        <View style={{ marginTop: 20, marginBottom: 150, width: '90%', alignSelf: 'center' }}>
          <Text style={{ fontFamily: 'medium', fontSize: 22, marginTop: 10 }}>{`Подать объявление ${categoryParam}`}</Text>
          {generalError ? (
            <Text style={{ color: 'red', marginTop: 12 }}>{generalError}</Text>
          ) : null}

          <Text style={{ fontFamily: 'medium', fontSize: 18, marginTop: 20 }}>{t('title.header')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginTop: 5 }}>
            <Text style={{ fontFamily: 'regular', fontSize: 14, opacity: .5 }}>{t('title.min_length_instruction')}</Text>
            <Text style={{ color: '#96949D' }}>{title.length}/70</Text>
          </View>
          <TextInput
            style={{
              width: '100%',
              paddingHorizontal: 10,
              height: 50,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#c4c4c4',
              backgroundColor: '#F7F8F9'
            }}
            ref={titleRef}
            placeholder={t('title.header')}
            maxLength={50}
            onChangeText={onChangeTitle}
          />

          <Text style={{ fontFamily: 'medium', fontSize: 18, marginBottom: 10, marginTop: 20, }}>{t('price.header')}</Text>
          <TextInput
            style={{
              width: '100%',
              paddingHorizontal: 10,
              height: 50,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#c4c4c4',
              backgroundColor: '#F7F8F9'
            }}
            ref={costRef}
            value={cost}
            onChangeText={text => onChangeCost(text.replace(/[^0-9]/g, '').slice(0, 103123))}
            placeholder={t('price.placeholder')}
            maxLength={10}
            keyboardType="numeric"
          />

          <Text style={{ fontFamily: 'medium', fontSize: 18, marginTop: 20, marginBottom: 10 }}>{t('category.header')}</Text>
          <Pressable
            ref={categoryRef}
            onLayout={event => setCategoryLayoutY(event.nativeEvent.layout.y)}
            onPress={togglecategories}
            style={[
              styles.profileButton,
              categoryError && { borderColor: 'red', borderWidth: 1 }
            ]}
          >
            <Text style={{ fontFamily: 'regular', fontSize: 14, color: '#96949D' }}>
              {category ? category.name : t('category.placeholder')}
            </Text>
            <Image
              style={{
                height: 16,
                width: 8,
                transform: [{ rotate: categoriesOpen ? '270deg' : '90deg' }],
                marginRight: 5
              }}
              source={require('../assets/arrow-right.png')}
            />
          </Pressable>

          {categoriesOpen && subcategories ?
            <View style={{ backgroundColor: '#F7F8F9', borderEndEndRadius: 5, marginTop: -3, borderBottomLeftRadius: 5, borderColor: '#c4c4c4', borderWidth: 1, paddingVertical: 10 }}>
              {subcategories.map((item) => {
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      if (item) setCategory(item);
                      togglecategories();
                    }}
                    style={{ width: '100%', paddingVertical: 10, paddingHorizontal: 15 }}
                  >
                    <Text style={{ color: '#96949D', fontSize: 13 }}>{item.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            : null}

          {(categoryIdParam === 1 || categoryIdParam === 2) && (
            <CreateDropdown
              title={'Вид товара или услуги'}
              placeholder={t('category.placeholder')}
              isOpen={openDropdown === 'global'}
              toggleOpen={() => toggleDropdown('global')}
              state={globalCategory}
              setState={setGlobalCategory}
              items={["Промышленная безопасность", "Пожарная безопасность", "Охранная безопасность"]}
              refProp={null}
              error={false}
            />
          )}

          <View ref={mediaRef} style={{ marginTop: 30, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontFamily: 'medium' }}>Добавьте фотографии и видео</Text>
            {mediaError && <Text style={{ color: 'red', marginVertical: 5 }}>Добавьте хоть одно фото или видео</Text>}
            <Text style={{ marginTop: 5, fontSize: 14, opacity: .6, fontFamily: 'regular' }}>Видео помогает покупателю лучше оценить товар. Добавьте короткий ролик и вы продадите быстрее!</Text>

            <ScrollView horizontal contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingBottom: 15 }} keyboardShouldPersistTaps="handled">
              <TouchableOpacity
                style={{ marginRight: 10, zIndex: 2 }}
                onPress={chooseMedia}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="add-media"
              >
                <View style={{ width: 110, height: 110, backgroundColor: '#F7F8F9', borderRadius: 10, borderWidth: 1, borderColor: '#c4c4c4', justifyContent: 'center', alignItems: 'center' }}>
                  <Image style={{ height: 25, width: 25 }} source={require('../assets/plusBlue.png')} />
                </View>
              </TouchableOpacity>

              <FlatList
                data={images}
                horizontal
                keyExtractor={(_item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  item.type === 'image' ?
                    <View>
                      <Image source={{ uri: item.uri }} style={{ width: 110, height: 110, borderRadius: 10, borderWidth: 1, borderColor: '#c4c4c4', marginRight: 10 }} />
                      <TouchableOpacity onPress={() => removeImage(index)} style={{ position: 'absolute', top: 5, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15, padding: 5 }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    :
                    <View>
                      <Video
                        isMuted={true}
                        ref={video}
                        style={{ width: 110, height: 110, borderRadius: 10, borderWidth: 1, borderColor: '#c4c4c4', marginRight: 10 }}
                        source={{ uri: item.uri }}
                        useNativeControls
                        resizeMode={ResizeMode.COVER}
                        isLooping
                        volume={0}
                        onPlaybackStatusUpdate={(s) => setStatus(() => s)}
                      />
                      <TouchableOpacity onPress={() => removeImage(index)} style={{ position: 'absolute', top: 5, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15, padding: 5 }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                )}
              />
            </ScrollView>
          </View>

          <Text style={{ fontFamily: 'medium', fontSize: 18, marginTop: 20 }}>{t('description.header')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
            <Text style={{ fontFamily: 'regular', fontSize: 14 }}>{t('description.min_length_instruction')}</Text>
            <Text style={{ color: '#96949D' }}>{content.length}/9000</Text>
          </View>
          <TextInput
            style={{
              width: '100%',
              paddingHorizontal: 10,
              height: 100,
              paddingTop: 20,
              borderWidth: 1,
              borderRadius: 10,
              borderColor: '#c4c4c4',
              backgroundColor: '#F7F8F9'
            }}
            value={content}
            ref={contentRef}
            onChangeText={onChangeContent}
            placeholder={t('description.placeholder')}
            maxLength={9000}
            multiline
            numberOfLines={3}
          />

          <CreateDropdown
            error={cityError}
            refProp={cityRef}
            isOpen={openDropdown === 'city'}
            toggleOpen={() => toggleDropdown('city')}
            state={city}
            setState={setCity}
            title={t('location.header')}
            placeholder={t('location.placeholder')}
            items={[
              "Астана",
              "Алматы",
              "Шымкент",
              "Кызылорда",
              "Весь Казахстан",
              "Караганда",
              "Актобе",
              "Тараз",
              "Павлодар",
              "Усть-Каменогорск",
              "Семей",
              "Атырау",
              "Костанай",
              "Уральск",
              "Петропавловск",
              "Актау",
              "Темиртау",
              "Туркестан"
            ]}
          />

          <Text style={{ fontFamily: 'medium', fontSize: 18, marginTop: 20, }}>Контактные данные</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <View style={{ width: '48%', marginTop: 10 }}>
              <Text style={{ fontFamily: 'medium', opacity: .7, fontSize: 12, marginBottom: 10, }}>Номер телефона</Text>
              <TextInputMask
                type={'custom'}
                placeholder="+7 777 777 777"
                ref={phoneRef}
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: phoneError ? 'red' : '#c4c4c4',
                  backgroundColor: '#F7F8F9'
                }}
                options={{ mask: '+79999999999' }}
                value={phone}
                onChangeText={(text) => {
                  onChangePhone(text);
                  if (text.trim() !== '') setPhoneError(false);
                }}
              />
            </View>
            <View style={{ width: '48%', marginTop: 10 }}>
              <Text style={{ fontFamily: 'medium', opacity: .7, fontSize: 12, marginBottom: 10, }}>Номер телефона Whatsapp</Text>
              <TextInputMask
                type={'custom'}
                placeholder="777 777 7777"
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: '#c4c4c4',
                  backgroundColor: '#F7F8F9'
                }}
                options={{ mask: '+79999999999' }}
                value={whatsapp}
                onChangeText={onChangeWhatsapp}
              />
            </View>
            <View style={{ width: '48%', marginTop: 10 }}>
              <Text style={{ fontFamily: 'medium', opacity: .7, fontSize: 12, marginBottom: 10, }}>Ссылка на сайт</Text>
              <TextInput
                placeholder="https://"
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: '#c4c4c4',
                  backgroundColor: '#F7F8F9'
                }}
                value={site}
                onChangeText={onChangeSite}
              />
            </View>
            <View style={{ width: '48%', marginTop: 10 }}>
              <Text style={{ fontFamily: 'medium', opacity: .7, fontSize: 12, marginBottom: 10, }}>Ссылка на телеграм</Text>
              <TextInput
                placeholder="https://t.me/"
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: '#c4c4c4',
                  backgroundColor: '#F7F8F9'
                }}
                value={telegram}
                onChangeText={onChangeTelegram}
              />
            </View>
            <View style={{ width: '48%', marginTop: 10 }}>
              <Text style={{ fontFamily: 'medium', opacity: .7, fontSize: 12, marginBottom: 10, }}>Ссылка на TikTok</Text>
              <TextInput
                placeholder="https://tiktok.com/@"
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: '#c4c4c4',
                  backgroundColor: '#F7F8F9'
                }}
                value={tiktok}
                onChangeText={onChangeTiktok}
              />
            </View>
            <View style={{ width: '48%', marginTop: 10 }}>
              <Text style={{ fontFamily: 'medium', opacity: .7, fontSize: 12, marginBottom: 10, }}>Ссылка на FaceBook</Text>
              <TextInput
                placeholder="https://facebook.com/"
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: '#c4c4c4',
                  backgroundColor: '#F7F8F9'
                }}
                value={facebook}
                onChangeText={onChangeFacebook}
              />
            </View>
            <View style={{ width: '48%', marginTop: 10 }}>
              <Text style={{ fontFamily: 'medium', opacity: .7, fontSize: 12, marginBottom: 10, }}>Ссылка на Instagram</Text>
              <TextInput
                placeholder="https://instagram.com/"
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: '#c4c4c4',
                  backgroundColor: '#F7F8F9'
                }}
                value={insta}
                onChangeText={onChangeInsta}
              />
            </View>
            <View style={{ width: '48%', marginTop: 10 }}>
              <Text style={{ fontFamily: 'medium', opacity: .7, fontSize: 12, marginBottom: 10, }}>Ссылка на 2gis</Text>
              <TextInput
                placeholder="https://2gis.kz/"
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: '#c4c4c4',
                  backgroundColor: '#F7F8F9'
                }}
                value={twogis}
                onChangeText={onChangeTwogis}
              />
            </View>
          </View>

          <TouchableOpacity onPress={sendPostRequest} disabled={loading} style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 20, marginTop: 40, backgroundColor: loading ? '#d7a06f' : '#F09235', paddingVertical: 15, alignItems: 'center' }}>
            <Text style={{ color: '#F7F8F9', fontSize: 16 }}>Опубликовать</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
    profileButton: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#F7F8F9',
      borderRadius: 10,
      borderColor: '#c4c4c4',
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 17,
    },
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
      fontSize:18,
      textAlign: 'center',
    },
  });
  
  
