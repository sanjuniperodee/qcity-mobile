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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

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
      headerRight: () => (
        <View style={styles.HeaderRight}>
          <HeaderIcon
            side={'right'}
            source={isFavourite ? require('../assets/Heart.png') : require('../assets/Favorite.png')}
            onPress={() => toggleFavourite()}
          />
        </View>
      ),
    });
  }, [navigation, onShare, isFavourite, isAuthenticated]);

  // Контакты: если не авторизован — маскируем
  const phoneToShow = isAuthenticated ? data?.phone : maskPhone(data?.phone);
  const showRealContacts = isAuthenticated;

  return (
    <ScrollView horizontal={false} style={{ marginTop: 0 }} ref={scrollViewRef}>
      <View style={{ alignSelf: 'center' }}>
        <ScrollView horizontal={false} style={{ width: windowWidth, paddingBottom: 150, marginTop: 0 }}>
          {!data ? (
            <ActivityIndicator style={{ marginTop: 100 }} size={'large'} />
          ) : (
            <View>
              <SliderComponent data={data?.images} />
              <View style={{ width: '90%', alignSelf: 'center', marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 25,
                    paddingBottom: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd',
                  }}
                >
                  <View style={{ maxWidth: '70%' }}>
                    <Text style={{ fontSize: 24, fontFamily: 'medium' }}>{data?.title}</Text>
                    {data?.categories?.name ? (
                      <Text style={{ fontSize: 15, fontFamily: 'regular', opacity: 0.6, marginTop: 10 }}>
                        {data.categories.name}
                      </Text>
                    ) : null}
                    {data?.subcategory ? (
                      <TouchableOpacity onPress={() => navigation.navigate('postsByCategory', { id: data?.categories?.id })}>
                        <Text style={{ fontFamily: 'medium', marginTop: 5, fontSize: 15, opacity: 0.6 }}>{data.subcategory}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                <Text style={{ fontFamily: 'medium', fontSize: 28, color: '#000', marginTop: 20}}>{data?.cost} ₸</Text>

                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
                  {data?.phone ? (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => {
                        if (showRealContacts) makeCall(data.phone);
                        else ensureAuthOrGo();
                      }}
                    >
                      <Text style={{ fontFamily: 'medium', fontSize: 18, marginTop: 15 }}>{phoneToShow}</Text>
                      {isAuthenticated ? null : <Text style={{ fontFamily: 'regular', fontSize: 13, marginTop: 15, marginLeft: 10, opacity: 0.6 }}>Показать телефон</Text>}
                    </TouchableOpacity>
                  ) : null}

                  <View style={{ flexDirection: 'row', marginTop: 17, alignItems: 'center' }}>
                    <Text style={{ color: '#333', fontFamily: 'medium', fontSize: 15 }}>{data?.views}</Text>
                    <MaterialCommunityIcons name={'eye'} size={22} color="#CFCFCF" style={{ marginLeft: 10 }} />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('ViewUser', { username: data?.author?.username });
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}
                >
                  <Image
                    style={{ width: 50, height: 50, borderRadius: 100, marginRight: 10 }}
                    source={
                      data?.author?.profile_image
                        ? { uri: `https://market.qorgau-city.kz${data.author.profile_image}` }
                        : require('../assets/profilePurple.png')
                    }
                  />
                  <Text style={{ fontSize: 18, fontFamily: 'medium' }}>{data?.author?.username || 'Пользователь'}</Text>
                </TouchableOpacity>

                <View>
                  <Text style={{ fontSize: 14, fontFamily: 'regular', marginTop: 20, opacity: 0.7 }}>{data?.geolocation}</Text>
                  {data?.adress ? (
                    <Text style={{ fontSize: 16, fontFamily: 'medium', marginTop: 5 }}>{data.adress.split(',')[0]}</Text>
                  ) : null}
                </View>

                {(data?.telegram ||
                  data?.site ||
                  data?.insta ||
                  data?.facebook ||
                  data?.phone_whatsapp ||
                  data?.twogis) && (
                  <View style={{ marginTop: 20 }}>
                    {!isAuthenticated ? (
                      <TouchableOpacity
                        onPress={() => ensureAuthOrGo()}
                        style={{
                          borderWidth: 1,
                          borderColor: '#F2D8BD',
                          backgroundColor: '#FFF7EE',
                          padding: 12,
                          borderRadius: 10,
                          marginBottom: 10,
                        }}
                      >
                        <Text style={{ fontFamily: 'medium', fontSize: 14, color: '#7A4A1F' }}>
                          Контакты скрыты. {"\n"} Войдите, чтобы увидеть полные ссылки и номера.
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap' }}>
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

                <Text style={{ fontSize: 16, fontFamily: 'medium', marginTop: 30 }}>Описание</Text>
                <Text style={{ fontSize: 16, fontFamily: 'regular', marginTop: 10 }}>{data?.content}</Text>

                {/* Информация о статусе для админа/модерации */}
                {isAdminView && (
                  <View style={{ marginTop: 30, backgroundColor: '#F7F8F9', borderRadius: 12, padding: 15 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'bold', marginBottom: 15 }}>Информация о статусе</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={{ fontSize: 14, fontFamily: 'regular', color: '#666' }}>Одобрено:</Text>
                      <Text style={{ fontSize: 14, fontFamily: 'medium', color: data?.approved ? '#50C878' : '#F44336' }}>
                        {data?.approved ? 'Да' : 'Нет'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={{ fontSize: 14, fontFamily: 'regular', color: '#666' }}>Активно:</Text>
                      <Text style={{ fontSize: 14, fontFamily: 'medium', color: data?.isActive ? '#50C878' : '#9E9E9E' }}>
                        {data?.isActive ? 'Да' : 'Нет'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={{ fontSize: 14, fontFamily: 'regular', color: '#666' }}>Оплачено:</Text>
                      <Text style={{ fontSize: 14, fontFamily: 'medium', color: data?.isPayed ? '#50C878' : '#FF9800' }}>
                        {data?.isPayed ? 'Да' : 'Нет'}
                      </Text>
                    </View>
                    {data?.tariff && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'regular', color: '#666' }}>Тариф:</Text>
                        <Text style={{ fontSize: 14, fontFamily: 'medium' }}>{data.tariff.name || 'Не указан'}</Text>
                      </View>
                    )}
                    {data?.rejection_reason && (
                      <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
                        <Text style={{ fontSize: 14, fontFamily: 'regular', color: '#666', marginBottom: 5 }}>Причина отклонения:</Text>
                        <Text style={{ fontSize: 14, fontFamily: 'regular', color: '#F44336' }}>{data.rejection_reason}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Написать продавцу - показываем только в обычном режиме просмотра */}
                {!isAdminView && data?.author?.username && auth?.user?.username && data.author.username !== auth.user.username ? (
                  <View>
                    <Text style={{ fontSize: 16, fontFamily: 'medium', marginTop: 30 }}>Написать продавцу</Text>

                    {!isAuthenticated ? (
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#F2D8BD',
                          backgroundColor: '#FFF7EE',
                          padding: 12,
                          borderRadius: 10,
                          marginTop: 10,
                        }}
                      >
                        <Text style={{ fontFamily: 'regular', fontSize: 14, color: '#7A4A1F' }}>
                          Чтобы отправить сообщение продавцу, войдите в аккаунт.
                        </Text>
                        <TouchableOpacity
                          onPress={ensureAuthOrGo}
                          style={{ marginTop: 10, alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#F09235', borderRadius: 8 }}
                        >
                          <Text style={{ color: '#fff', fontFamily: 'medium' }}>Войти</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        <TextInput
                          style={{
                            width: '100%',
                            paddingHorizontal: 10,
                            paddingTop: 15,
                            marginTop: 10,
                            height: 100,
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#D6D6D6',
                            fontFamily: 'regular',
                            fontSize: 15,
                          }}
                          onChangeText={onChangeMessage}
                          numberOfLines={4}
                          multiline={true}
                          value={message}
                          placeholder="Здравствуйте! Я интересуюсь вашим товаром/услугой. Могу я узнать больше о нем? Есть ли возможность договориться о встрече и проверить качество на месте?"
                        />
                        <TouchableOpacity onPress={fetchData}>
                          <Image source={require('../assets/send.png')} style={{ height: 24, width: 24, position: 'absolute', bottom: 10, right: 10 }} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : null}

                {Array.isArray(data?.fields) && data.fields.length > 1 ? (
                  <View style={{ marginBottom: 30 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'medium', marginTop: 30 }}>Характеристики</Text>
                    {data.fields.map((field, index) =>
                      field.field_value ? (
                        <View key={index} style={{ flexDirection: 'row', marginTop: 20 }}>
                          <Text style={{ width: '50%', color: '#9C9C9C' }}>{field.field_name}</Text>
                          <Text style={{ width: '50%', color: '#17181D', fontFamily: 'medium' }}>{field.field_value}</Text>
                        </View>
                      ) : null
                    )}
                  </View>
                ) : null}

                {/* Похожие объявления - показываем только в обычном режиме просмотра */}
                {!isAdminView && (
                  <>
                    <Text style={{ fontSize: 16, fontFamily: 'medium', marginTop: 20 }}>Похожие объявления</Text>
                    {Array.isArray(dataPost?.results) && (
                      <View style={{ marginTop: 10 }} onLayout={(e) => setSimilarWidth(e.nativeEvent.layout.width)}>
                        <ResponsiveProductGrid
                          data={dataPost.results}
                          containerWidth={similarWidth || undefined}
                          scrollEnabled={false}
                        />
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
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
