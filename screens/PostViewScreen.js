import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
  Dimensions,
  Text,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { useGetPostByIdQuery, useGetPostListQuery, useAddToFavouritesMutation, useRemoveFromFavouritesMutation, useListFavouritesQuery } from '../api';
import { ProductCard } from '../components/ProductCard';
import { ResponsiveProductGrid } from '../components/ResponsiveProductGrid';
import { SliderComponent } from '../components/SliderComponent';
import { Social } from '../components/Social';

export const PostViewScreen = ({ route }) => {
  const navigation = useNavigation();
  const auth = useSelector((state) => state.auth);
  const isAuthenticated = !!auth?.isAuthenticated && !!auth?.token;
  const user = auth?.user;
  const isAdmin = user?.email === 'admin@mail.ru';

  const [message, onChangeMessage] = useState('');
  const { id, viewMode, fromScreen } = route.params || {};
  
  // Определяем режим просмотра: admin/moderator - режим просмотра для админа/модерации
  const isAdminView = viewMode === 'admin' || (fromScreen && ['Admin', 'Moderation', 'Rejected'].includes(fromScreen));

  const { data, error, isLoading, refetch } = useGetPostByIdQuery(id);

  const page = 1;
  const limit = 5;
  const { data: dataPost } = useGetPostListQuery({ page, limit });

  const windowWidth = Dimensions.get('window').width;
  const scrollViewRef = useRef(null);
  const [similarWidth, setSimilarWidth] = useState(0);

  const [isFavourite, setIsFavourite] = useState(false);
  const [addToFavourites, { isLoading: isAdding }] = useAddToFavouritesMutation();
  const [removeFromFavourites, { isLoading: isRemoving }] = useRemoveFromFavouritesMutation();

  // Загружаем избранное только если авторизован
  const { data: userFavourites, isLoading: isLoadingFavourites } = useListFavouritesQuery(undefined, { skip: !isAuthenticated });

  // Нормализуем формат favorites (массив или {results})
  const normalisedFavs = Array.isArray(userFavourites)
    ? userFavourites
    : Array.isArray(userFavourites?.results)
    ? userFavourites.results
    : [];

  useEffect(() => {
    if (!isAuthenticated) {
      setIsFavourite(false);
      return;
    }
    if (normalisedFavs && !isLoadingFavourites) {
      const isFav = normalisedFavs.some((fav) => fav.id === id);
      setIsFavourite(isFav);
    }
  }, [normalisedFavs, isLoadingFavourites, id, isAuthenticated]);

  const ensureAuthOrGo = () => {
    const parent = navigation.getParent?.();
    if (parent) parent.navigate('Auth', { screen: 'LoginOrRegistration' });
    else navigation.navigate('Auth', { screen: 'LoginOrRegistration' });
  };

  const toggleFavourite = async () => {
    if (!isAuthenticated) {
      ensureAuthOrGo();
      return;
    }
    try {
      if (isFavourite) {
        await removeFromFavourites(id);
        setIsFavourite(false);
      } else {
        await addToFavourites(id);
        setIsFavourite(true);
      }
    } catch (e) {
      console.log('fav error', e);
    }
  };

  const makeCall = (number) => {
    let phoneNumber = Platform.OS === 'android' ? `tel:${number}` : `telprompt:${number}`;
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Телефонный номер не доступен');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch((err) => console.warn(err));
  };

  const maskPhone = (phone) => {
    if (!phone) return '';
    const visible = phone.slice(0, 7).trim();
    return `${visible}`;
  };

  const maskedLinkLabel = (url) => {
    if (!url) return '';
    // показываем домен/первые символы
    try {
      const u = new URL(url);
      return `${u.host}/•••`;
    } catch {
      return `${url.slice(0, 10)}•••`;
    }
  };

  const fetchData = async () => {
    if (!isAuthenticated) {
      ensureAuthOrGo();
      return;
    }
    try {
      onChangeMessage('');
      const response = await fetch('https://market.qorgau-city.kz/api/create_connection/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${auth.token}`,
        },
        body: JSON.stringify({
          message: message,
          user_receiver: data?.author?.username,
          post_id: data?.id,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
    } catch (error) {
      console.error('create_connection error:', error);
    }
  };

  const onShare = useCallback(async () => {
    if (!data) {
      Alert.alert('Ошибка', 'Данные ещё загружаются.');
      return;
    }

    const msg = `Смотри что я нашел в приложении QORGAU!
Название: ${data.title}
Описание: ${data.content}
Цена: ${data.cost}
Город: ${data.geolocation}
https://apps.apple.com/kg/app/qorgau-marketplace/id1665878596`;

    try {
      await Share.share({ message: msg, title: data.title });
    } catch (error) {
      console.error('Failed to share:', error?.message);
    }
  }, [data]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => null,
    });
  }, [navigation]);

  // Контакты: если не авторизован — маскируем
  const phoneToShow = isAuthenticated ? data?.phone : maskPhone(data?.phone);
  const showRealContacts = isAuthenticated;

  return (
    <ScrollView
      style={styles.container}
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
          {!data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F09235" />
        </View>
          ) : (
        <View style={styles.content}>
          {/* Галерея изображений */}
          <View style={styles.sliderContainer}>
              <SliderComponent data={data?.images} />
          </View>

          {/* Основная информация */}
          <View style={styles.mainContent}>
            {/* Заголовок и категория */}
            <View style={styles.headerSection}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>{data?.title}</Text>
                {data?.categories?.name && (
                  <View style={styles.categoryBadge}>
                    <Ionicons name="folder-outline" size={14} color="#F09235" />
                    <Text style={styles.categoryText}>{data.categories.name}</Text>
                    {data?.subcategory && (
                      <>
                        <Ionicons name="chevron-forward" size={12} color="#999" style={{ marginHorizontal: 4 }} />
                      <TouchableOpacity onPress={() => navigation.navigate('postsByCategory', { id: data?.categories?.id })}>
                          <Text style={styles.subcategoryText}>{data.subcategory}</Text>
                      </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </View>
              <View style={styles.actionsRow}>
                <View style={styles.viewsSection}>
                  <MaterialCommunityIcons name="eye-outline" size={18} color="#999" />
                  <Text style={styles.viewsText}>{data?.views || 0}</Text>
                </View>
                    <TouchableOpacity
                  onPress={toggleFavourite}
                  style={[
                    styles.favoriteButton,
                    {
                      backgroundColor: isFavourite ? '#FFEBEE' : '#F7F8F9',
                      borderColor: isFavourite ? '#F44336' : '#E0E0E0',
                    }
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isFavourite ? 'heart' : 'heart-outline'}
                    size={22}
                    color={isFavourite ? '#F44336' : '#999'}
                  />
                    </TouchableOpacity>
                  </View>
                </View>

            {/* Цена */}
            <View style={styles.priceSection}>
              <Text style={styles.price}>{data?.cost} ₸</Text>
            </View>

            {/* Контакты и продавец */}
            <View style={styles.contactSection}>
              {data?.phone && (
                <TouchableOpacity
                  style={styles.phoneButton}
                  onPress={() => {
                    if (showRealContacts) makeCall(data.phone);
                    else ensureAuthOrGo();
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#F3B127', '#F26D1D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.phoneButtonGradient}
                  >
                    <Ionicons name="call-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.phoneButtonText}>{phoneToShow}</Text>
                    {!isAuthenticated && (
                      <Text style={styles.phoneButtonHint}>Показать</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => navigation.navigate('ViewUser', { username: data?.author?.username })}
                style={styles.sellerCard}
                activeOpacity={0.7}
                >
                  <Image
                  style={styles.sellerAvatar}
                    source={
                      data?.author?.profile_image
                        ? { uri: `https://market.qorgau-city.kz${data.author.profile_image}` }
                        : require('../assets/profilePurple.png')
                    }
                  />
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerLabel}>Продавец</Text>
                  <Text style={styles.sellerName}>{data?.author?.username || 'Пользователь'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

              {data?.geolocation && (
                <View style={styles.locationCard}>
                  <Ionicons name="location-outline" size={20} color="#F09235" />
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationText}>{data.geolocation}</Text>
                    {data?.adress && (
                      <Text style={styles.addressText}>{data.adress.split(',')[0]}</Text>
                    )}
                  </View>
                </View>
              )}
                </View>

            {/* Социальные сети */}
                {(data?.telegram ||
                  data?.site ||
                  data?.insta ||
                  data?.facebook ||
                  data?.phone_whatsapp ||
                  data?.twogis) && (
              <View style={styles.socialSection}>
                <Text style={styles.sectionTitle}>Контакты</Text>
                {!isAuthenticated && (
                      <TouchableOpacity
                        onPress={() => ensureAuthOrGo()}
                    style={styles.authPrompt}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color="#F09235" />
                    <Text style={styles.authPromptText}>
                      Войдите, чтобы увидеть полные контакты
                        </Text>
                      </TouchableOpacity>
                )}
                <View style={styles.socialGrid}>
                      {data?.telegram && (
                        <Social
                          url={isAuthenticated ? data.telegram : undefined}
                          label={isAuthenticated ? undefined : maskedLinkLabel(data.telegram)}
                          image={require('../assets/telegram.png')}
                          onPress={() => (!isAuthenticated ? ensureAuthOrGo() : undefined)}
                        />
                      )}
                      {data?.site && (
                        <Social
                          url={isAuthenticated ? data.site : undefined}
                          label={isAuthenticated ? undefined : maskedLinkLabel(data.site)}
                          image={require('../assets/site.png')}
                          onPress={() => (!isAuthenticated ? ensureAuthOrGo() : undefined)}
                        />
                      )}
                      {data?.insta && (
                        <Social
                          url={isAuthenticated ? data.insta : undefined}
                          label={isAuthenticated ? undefined : maskedLinkLabel(data.insta)}
                          image={require('../assets/insta.png')}
                          onPress={() => (!isAuthenticated ? ensureAuthOrGo() : undefined)}
                        />
                      )}
                      {data?.facebook && (
                        <Social
                          url={isAuthenticated ? data.facebook : undefined}
                          label={isAuthenticated ? undefined : maskedLinkLabel(data.facebook)}
                          image={require('../assets/facebook.png')}
                          onPress={() => (!isAuthenticated ? ensureAuthOrGo() : undefined)}
                        />
                      )}
                      {data?.phone_whatsapp && (
                        <Social
                          url={isAuthenticated ? data.phone_whatsapp : undefined}
                          label={isAuthenticated ? undefined : maskPhone(data.phone_whatsapp)}
                          whatsapp
                          image={require('../assets/whatsapp.png')}
                          onPress={() => (!isAuthenticated ? ensureAuthOrGo() : undefined)}
                        />
                      )}
                      {data?.twogis && (
                        <Social
                          url={isAuthenticated ? data.twogis : undefined}
                          label={isAuthenticated ? undefined : maskedLinkLabel(data.twogis)}
                          image={require('../assets/2gis.png')}
                          onPress={() => (!isAuthenticated ? ensureAuthOrGo() : undefined)}
                        />
                      )}
                    </View>
                  </View>
                )}

            {/* Описание */}
            {data?.content && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Описание</Text>
                <Text style={styles.descriptionText}>{data.content}</Text>
              </View>
            )}

            {/* Характеристики */}
            {Array.isArray(data?.fields) && data.fields.length > 1 && (
              <View style={styles.specsSection}>
                <Text style={styles.sectionTitle}>Характеристики</Text>
                <View style={styles.specsList}>
                  {data.fields.map((field, index) =>
                    field.field_value ? (
                      <View key={index} style={styles.specItem}>
                        <Text style={styles.specLabel}>{field.field_name}</Text>
                        <Text style={styles.specValue}>{field.field_value}</Text>
                      </View>
                    ) : null
                  )}
                </View>
              </View>
            )}

            {/* Информация о статусе для админа/модерации */}
            {isAdminView && (
              <View style={styles.adminInfoSection}>
                <Text style={styles.adminInfoTitle}>Информация о статусе</Text>
                <View style={styles.adminInfoList}>
                  <View style={styles.adminInfoItem}>
                    <Text style={styles.adminInfoLabel}>Одобрено:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: data?.approved ? '#E8F5E9' : '#FFEBEE' }]}>
                      <Text style={[styles.statusText, { color: data?.approved ? '#50C878' : '#F44336' }]}>
                        {data?.approved ? 'Да' : 'Нет'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.adminInfoItem}>
                    <Text style={styles.adminInfoLabel}>Активно:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: data?.isActive ? '#E8F5E9' : '#F5F5F5' }]}>
                      <Text style={[styles.statusText, { color: data?.isActive ? '#50C878' : '#9E9E9E' }]}>
                        {data?.isActive ? 'Да' : 'Нет'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.adminInfoItem}>
                    <Text style={styles.adminInfoLabel}>Оплачено:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: data?.isPayed ? '#E8F5E9' : '#FFF3E0' }]}>
                      <Text style={[styles.statusText, { color: data?.isPayed ? '#50C878' : '#FF9800' }]}>
                        {data?.isPayed ? 'Да' : 'Нет'}
                      </Text>
                    </View>
                  </View>
                  {data?.tariff && (
                    <View style={styles.adminInfoItem}>
                      <Text style={styles.adminInfoLabel}>Тариф:</Text>
                      <Text style={styles.adminInfoValue}>{data.tariff.name || 'Не указан'}</Text>
                    </View>
                  )}
                  {data?.rejection_reason && (
                    <View style={styles.rejectionReasonBox}>
                      <Text style={styles.rejectionReasonLabel}>Причина отклонения:</Text>
                      <Text style={styles.rejectionReasonText}>{data.rejection_reason}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Написать продавцу - показываем только в обычном режиме просмотра */}
            {!isAdminView && data?.author?.username && auth?.user?.username && data.author.username !== auth.user.username && (
              <View style={styles.messageSection}>
                <Text style={styles.sectionTitle}>Написать продавцу</Text>
                    {!isAuthenticated ? (
                  <View style={styles.authCard}>
                    <Ionicons name="chatbubble-outline" size={24} color="#F09235" />
                    <Text style={styles.authCardText}>
                      Чтобы отправить сообщение продавцу, войдите в аккаунт
                        </Text>
                        <TouchableOpacity
                          onPress={ensureAuthOrGo}
                      style={styles.authButton}
                      activeOpacity={0.8}
                        >
                      <Text style={styles.authButtonText}>Войти</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                  <View style={styles.messageInputContainer}>
                        <TextInput
                      style={styles.messageInput}
                          onChangeText={onChangeMessage}
                          numberOfLines={4}
                          multiline={true}
                          value={message}
                          placeholder="Здравствуйте! Я интересуюсь вашим товаром/услугой. Могу я узнать больше о нем? Есть ли возможность договориться о встрече и проверить качество на месте?"
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      onPress={fetchData}
                      style={styles.sendButton}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#F3B127', '#F26D1D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sendButtonGradient}
                      >
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                      </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
            )}

            {/* Похожие объявления - показываем только в обычном режиме просмотра */}
            {!isAdminView && (
              <View style={styles.similarSection}>
                <Text style={styles.sectionTitle}>Похожие объявления</Text>
                {Array.isArray(dataPost?.results) && (
                  <View style={styles.similarGrid} onLayout={(e) => setSimilarWidth(e.nativeEvent.layout.width)}>
                    <ResponsiveProductGrid
                      data={dataPost.results}
                      containerWidth={similarWidth || undefined}
                      scrollEnabled={false}
                    />
                  </View>
                )}
                  </View>
                )}
              </View>
            </View>
          )}
    </ScrollView>
  );
};

function HeaderIcon(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <Image source={props.source} style={props.side !== 'right' ? styles.Icon : styles.rightIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  content: {
    paddingBottom: 100,
  },
  sliderContainer: {
    marginBottom: 0,
    marginTop: 0,
    paddingTop: 0,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerSection: {
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'bold',
    color: '#1A1A1A',
    lineHeight: 32,
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#F09235',
    marginLeft: 4,
  },
  subcategoryText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#666',
  },
  viewsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  viewsText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#666',
    marginLeft: 6,
  },
  priceSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  price: {
    fontSize: 32,
    fontFamily: 'bold',
    color: '#1A1A1A',
  },
  contactSection: {
    marginBottom: 24,
  },
  phoneButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  phoneButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  phoneButtonText: {
    fontSize: 18,
    fontFamily: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
  },
  phoneButtonHint: {
    fontSize: 12,
    fontFamily: 'regular',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerLabel: {
    fontSize: 12,
    fontFamily: 'regular',
    color: '#999',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontFamily: 'bold',
    color: '#1A1A1A',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE5CC',
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    fontFamily: 'regular',
    color: '#666',
  },
  socialSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  authPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE5CC',
  },
  authPromptText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#E65100',
    marginLeft: 10,
    flex: 1,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  descriptionSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'regular',
    color: '#333',
    lineHeight: 24,
  },
  specsSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  specsList: {
    gap: 16,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  specLabel: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#666',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'right',
  },
  adminInfoSection: {
    backgroundColor: '#F7F8F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  adminInfoTitle: {
    fontSize: 18,
    fontFamily: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  adminInfoList: {
    gap: 12,
  },
  adminInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminInfoLabel: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#666',
  },
  adminInfoValue: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'medium',
  },
  rejectionReasonBox: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  rejectionReasonLabel: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#666',
    marginBottom: 8,
  },
  rejectionReasonText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#F44336',
    lineHeight: 20,
  },
  messageSection: {
    marginBottom: 24,
  },
  authCard: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE5CC',
  },
  authCardText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#E65100',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  authButton: {
    backgroundColor: '#F09235',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: '#FFFFFF',
  },
  messageInputContainer: {
    position: 'relative',
  },
  messageInput: {
    width: '100%',
    minHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#E0E0E0',
    fontSize: 15,
    fontFamily: 'regular',
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  sendButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarSection: {
    marginBottom: 24,
  },
  similarGrid: {
    marginTop: 12,
  },
  Icon: {
    marginLeft: 13,
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  rightIcon: {
    marginLeft: 30,
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  HeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  HeaderTitle: {
    fontFamily: 'medium',
    fontSize: 18,
  },
});
