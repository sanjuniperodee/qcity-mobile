import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, ScrollView, Image, Text, Modal, StyleSheet, TouchableOpacity, FlatList,Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, useScrollToTop } from '@react-navigation/native';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { logout } from '../actions/authActions';
import { persistor } from '../store/index';
import * as Device from 'expo-device';
import { ProductCard } from '../components/ProductCard';
import { ResponsiveProductGrid } from '../components/ResponsiveProductGrid';
import { useGetPostListQuery, useGetPostListCityQuery } from '../api';
import { useTranslation } from 'react-i18next';
import * as NotificationsModule from 'expo-notifications';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Grid } from '../components/ui/Grid';
import CategoryTile from '../components/ui/CategoryTile';
import { StoriesInstructions } from '../components/StoriesInstructions.js';
import { useNotification } from '../context/NotificationContext';
import { setCity } from '../actions/locationActions';
import * as Updates from 'expo-updates';
import { cities } from '../constants/cities';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ========= helpers =========
const arraysEqual = (a: Array<any>, b: Array<any>) => {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const throttle = <F extends (...args: any[]) => void>(fn: F, ms: number) => {
  let last = 0;
  let timer: any = null;
  return (...args: Parameters<F>) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, ms - (now - last));
    }
  };
};

// Мемо-обёртка над ProductCard
const MemoProductCard = React.memo(
  ProductCard,
  (prev, next) =>
    prev.id === next.id &&
    prev.title === next.title &&
    prev.image === next.image &&
    prev.cost === next.cost &&
    prev.condition === next.condition &&
    prev.mortage === next.mortage &&
    prev.delivery === next.delivery &&
    prev.city === next.city &&
    prev.date === next.date &&
    prev.tariff === next.tariff &&
    prev.isVisible === next.isVisible &&
    ((prev.media?.length ?? 0) === (next.media?.length ?? 0)) &&
    ((prev.extra_fields?.length ?? 0) === (next.extra_fields?.length ?? 0))
);

// тех. компоненты
const NotificationDebug = React.memo(() => {
  const { notification, expoPushToken } = useNotification();
  useEffect(() => { if (expoPushToken) console.log('expoPushToken -> ', expoPushToken); }, [expoPushToken]);
  useEffect(() => { console.log('Latest notification: -> ', notification?.request?.content?.title); }, [notification]);
  return null;
});
const UpdateWatcher = React.memo(() => {
  const { isUpdatePending } = Updates.useUpdates();
  const { t } = useTranslation();
  useEffect(() => { if (isUpdatePending) Updates.reloadAsync().catch(() => Alert.alert(t('common.error'))); }, [isUpdatePending, t]);
  return null;
});

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('Device.isDevice:', Device.isDevice);
    (async () => {
      const perm = await NotificationsModule.getPermissionsAsync();
      console.log('Permissions:', perm);
    })();
  }, []);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  useEffect(() => {
    if ((route.params as any)?.scrollToTop) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [(route.params as any)?.scrollToTop]);


  const user = useSelector((state: any) => state.auth.user, shallowEqual);
  useEffect(() => {
    if (!user) {
      dispatch(logout());
      persistor.purge();
    }
  }, [user, dispatch]);

  const [page, setPage] = useState(1);
  const limit = 6;

  const selectedCity = useSelector((state: any) => state.city.selectedCity, shallowEqual);
  const allKazakhstanText = t('location.all_kazakhstan');
  const effectiveCity = selectedCity || allKazakhstanText;
  const isAllKazakhstan = effectiveCity === allKazakhstanText;
  
  // Автоматический refetch при смене языка
  useEffect(() => {
    if (isAllKazakhstan) {
      refetchAll();
    } else {
      refetchCity();
    }
  }, [t]); // eslint-disable-line

  // Сброс данных при смене города и автоматический refetch
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setFirstLoaded(false);
    // Автоматический refetch при смене города
    if (isAllKazakhstan) {
      refetchAll();
    } else {
      refetchCity();
    }
  }, [effectiveCity, isAllKazakhstan]); // eslint-disable-line

  const [visibleItems, setVisibleItems] = useState<Array<string | number>>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [firstLoaded, setFirstLoaded] = useState(false);

  const handleOpenStory = (story: any) => {
    if (!story?.slides?.length) return;
    setSelectedStory(story);
    setModalVisible(true);
  };

  // === RTK Query
  const baseQueryOpts = {
    skip: false,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    pollingInterval: 0,
  };

  const {
    data: allData,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
    refetch: refetchAll,
  } = useGetPostListQuery({ page, limit }, { ...baseQueryOpts, skip: !isAllKazakhstan });

  const {
    data: cityData,
    isLoading: isLoadingCity,
    isFetching: isFetchingCity,
    refetch: refetchCity,
  } = useGetPostListCityQuery({ city: effectiveCity, page, limit }, { ...baseQueryOpts, skip: isAllKazakhstan });

  const data = isAllKazakhstan ? allData : cityData;
  const isLoading = isAllKazakhstan ? (isLoadingAll || isFetchingAll) : (isLoadingCity || isFetchingCity);
  const refetchActive = isAllKazakhstan ? refetchAll : refetchCity;

  const handleSelectCity = (city: string) => {
    if (city === selectedCity) { setVisible(false); return; }
    dispatch(setCity(city));
    setPage(1);
    setPosts([]);
    setFirstLoaded(false);
    setVisible(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setFirstLoaded(false);
    refetchActive().finally(() => setRefreshing(false));
  }, [refetchActive]);

  // ========= Viewability =========
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChangedRaw = useRef(({ viewableItems }: any) => {
    const next = viewableItems.map((vi: any) => vi.item.id).sort();
    setVisibleItems((prev) => (arraysEqual(prev, next) ? prev : next));
  }).current;
  const onViewableItemsChanged = useMemo(() => throttle(onViewableItemsChangedRaw, 250), [onViewableItemsChangedRaw]);

  // ========= приём данных =========
  useEffect(() => {
    if (!data?.results) return;
    if (page === 1) {
      const next = data.results;
      const same =
        posts.length === next.length &&
        arraysEqual(posts.map((p) => p.id), next.map((p: any) => p.id));
      if (!same) setPosts(next);
      setFirstLoaded(true);
    } else {
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const add = data.results.filter((p: any) => !ids.has(p.id));
        return add.length ? [...prev, ...add] : prev;
      });
    }
  }, [data, page]); // eslint-disable-line

  // ========= пагинация =========
  const hasMore = useMemo(() => {
    const total = data?.total;
    if (typeof total === 'number') return posts.length < total;
    const lastLen = data?.results?.length ?? 0;
    return lastLen === limit;
  }, [data?.total, data?.results?.length, posts.length]);

  const loadMoreItems = useCallback(() => {
    if (!firstLoaded || isLoading || !hasMore) return;
    setPage((p) => p + 1);
  }, [firstLoaded, isLoading, hasMore]);

  // ========= источники для UI =========
  // заменили картинки на иконки из @expo/vector-icons
  const categories = useMemo(
    () => [
      // компактные иконки на десктопе, крупнее на телефоне
      { id: 1, name: t('categories_main.services'),        icon: <MaterialCommunityIcons name="briefcase-outline" size={SCREEN_WIDTH >= 1024 ? 20 : 26} color={ORANGE} /> },
      { id: 2, name: t('categories_main.products'),        icon: <Ionicons name="cart-outline" size={SCREEN_WIDTH >= 1024 ? 20 : 26} color={ORANGE} /> },
      { id: 3, name: t('categories_main.findEmployee'),    icon: <MaterialCommunityIcons name="account-search-outline" size={SCREEN_WIDTH >= 1024 ? 20 : 26} color={ORANGE} /> },
      { id: 99, name: t('categories_main.qorgauAi'),       icon: <Ionicons name="sparkles-outline" size={SCREEN_WIDTH >= 1024 ? 20 : 26} color={ORANGE} /> },
      { id: 4, name: t('categories_main.other'),           icon: <Ionicons name="apps-outline" size={SCREEN_WIDTH >= 1024 ? 20 : 26} color={ORANGE} /> },
      { id: 7, name: t('categories_main.industrialSecurityEducation'), icon: <Ionicons name="school-outline" size={SCREEN_WIDTH >= 1024 ? 20 : 26} color={ORANGE} /> },
    ],
    [t]
  );

  const stories = useMemo(
    () => [
      { id: '1', title: t('stories.create'),    preview: require('../assets/create.jpg'), slides: [{ id: '2-1', image: require('../assets/create1.jpg') }, { id: '2-2', image: require('../assets/create2.jpg') }, { id: '2-3', image: require('../assets/create3.jpg') }, { id: '2-4', image: require('../assets/create4.jpg') }, { id: '2-5', image: require('../assets/create5.jpg') }, { id: '2-6', image: require('../assets/create6.jpg') }] },
      { id: '2', title: t('stories.edit'),      preview: require('../assets/edit.jpg'),   slides: [{ id: '3-1', image: require('../assets/edit2.jpg') }, { id: '3-2', image: require('../assets/edit2.jpg') }, { id: '3-3', image: require('../assets/edit3.jpg') }, { id: '3-4', image: require('../assets/edit4.jpg') }] },
      { id: '3', title: t('stories.security'),  preview: require('../assets/safe.jpg'),   slides: [{ id: '4-1', image: require('../assets/secure1.jpg') }, { id: '4-2', image: require('../assets/secure2.jpg') }, { id: '4-3', image: require('../assets/secure3.jpg') }] },
    ],
    [t]
  );

  // === HEADER
  const headerEl = useMemo(
    () => (
      <>
        {/* Выбор города */}
        <Modal visible={visible} transparent>
          <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={() => setVisible(false)}>
            <View style={styles.modalView}>
              <ScrollView style={{ width: '100%', paddingHorizontal: 35 }}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city.value}
                    style={[styles.cityButton, selectedCity === city.value && styles.activeCityButton]}
                    onPress={() => handleSelectCity(city.value)}
                  >
                    <Text style={selectedCity === city.value ? styles.cityTextActive : styles.cityText}>
                      {city.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Шапка с безопасным отступом сверху */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#F3B127', '#F26D1D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoGradient}
            >
              <Text style={styles.logoText}>Qorgau</Text>
              <Text style={styles.logoSubtext}>City</Text>
            </LinearGradient>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerUser}
              onPress={() => {
                if (user?.username) {
                  (navigation as any).navigate('ProfileTab', { screen: 'Profile' });
                  return;
                }
                (navigation as any).navigate('Auth', { screen: 'LoginOrRegistration' });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={20} color="#F09235" />
              <Text style={styles.headerUserText} numberOfLines={1}>
                {user?.username ? user.username : t('register.register')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setVisible(true)} style={styles.headerGeo} activeOpacity={0.7}>
              <Ionicons name="location-outline" size={22} color="#F09235" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Поиск */}
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('SearchScreen')}
          style={styles.searchBar}
          activeOpacity={0.85}
        >
          <View style={styles.searchBarContent}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <Text style={styles.searchPlaceholder}>{t('main.search_catalog')}</Text>
          </View>
        </TouchableOpacity>

        {/* «Сторис»-чипы */}
        <FlatList
          data={stories}
          horizontal
          keyExtractor={(item) => item.id}
          contentContainerStyle={{  paddingTop: 6, paddingHorizontal: 10 }}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={Math.round(SCREEN_WIDTH * 0.29) + 12}
          getItemLayout={(_, index) => ({ length: Math.round(SCREEN_WIDTH * 0.29) + 12, offset: (Math.round(SCREEN_WIDTH * 0.29) + 12) * index, index })}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleOpenStory(item)} style={styles.storyChip} activeOpacity={0.9}>
              <Image source={item.preview} style={styles.storyImg} />
            </TouchableOpacity>
          )}
        />
        <StoriesInstructions visible={modalVisible} onClose={() => setModalVisible(false)} story={selectedStory} />

        {/* Categories */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t('main.categories')}</Text>
        </View>

        <Grid gap={SCREEN_WIDTH >= 1024 ? 10 : 12} style={{ width: '95%', alignSelf: 'center', marginTop: 8, marginBottom: 15 }}>
          {categories.map((category) => (
            <CategoryTile
              key={category.id}
              icon={category.icon}
              label={category.name}
              onPress={() => {
                if (category.id === 99) {
                  (navigation as any).navigate('QorgauAi', { selectedCity });
                } else {
                  (navigation as any).navigate('GetPostsByCategory', { 
                    categoryId: {
                      id: category.id,
                      name: category.name
                    }, 
                    selectedCity 
                  });
                }
              }}
            />
          ))}
        </Grid>

        {/* Recommendations + city selection */}
        <View style={styles.recommendationsHeader}>
          <Text style={styles.recommendationsTitle}>
            {isAllKazakhstan ? t('recommendation') : selectedCity}
          </Text>
          <TouchableOpacity
            style={styles.cityChip}
            onPress={() => setVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="location-outline" size={16} color="#F09235" />
            <Text style={styles.cityChipText} numberOfLines={1}>
              {selectedCity || t('location.all_kazakhstan')}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#F09235" />
          </TouchableOpacity>
        </View>
      </>
    ),
    [visible, selectedCity, user?.username, navigation, t, stories, categories, modalVisible, selectedStory, isAllKazakhstan, insets.top]
  );

  return (
    <>
      <NotificationDebug />
      <UpdateWatcher />

      <ResponsiveProductGrid
        data={posts}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text>{t('main.no_listings')}</Text>
            </View>
          )
        }
        ListHeaderComponent={headerEl}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ProductCardComponent={MemoProductCard}
        ListFooterComponent={
          <View style={{ marginBottom: 10, paddingHorizontal: 12 }}>
            {isLoading && <ActivityIndicator size="large" color={ORANGE} />}
          </View>
        }
        containerWidth={SCREEN_WIDTH}
        scrollEnabled={true}
      />
    </>
  );
};

const ORANGE = '#F09235';
const LIGHT_ORANGE = '#FFF9F5'; // фон плиток

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: {
    margin: 20, backgroundColor: '#fff', borderRadius: 16, width: '90%', maxHeight: '60%',
    paddingVertical: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  cityButton: { paddingVertical: 16, marginVertical: 6, paddingHorizontal: 10, borderRadius: 12, width: '100%', backgroundColor: '#F1F2F4' },
  activeCityButton: { backgroundColor: ORANGE + '22' },
  cityText: { textAlign: 'center', fontSize: 15, fontFamily: 'medium', color: '#333' },
  cityTextActive: { textAlign: 'center', fontFamily: 'medium', fontSize: 15, color: ORANGE },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logoGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 22,
    fontFamily: 'bold',
    color: '#FFFFFF',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 18,
    fontFamily: 'medium',
    color: '#FFFFFF',
    lineHeight: 20,
    letterSpacing: 0.3,
    marginLeft: 4,
    opacity: 0.95,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxWidth: 150,
  },
  headerUserText: {
    fontSize: 14,
    marginLeft: 6,
    fontFamily: 'medium',
    color: '#1A1A1A',
    flex: 1,
  },
  headerGeo: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  searchBar: {
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    height: 52,
    borderRadius: 16,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'regular',
    color: '#999',
    flex: 1,
  },

  storyChip: {
    height: 120, width: SCREEN_WIDTH * 0.29, borderRadius: 16, backgroundColor: LIGHT_ORANGE,
    marginRight: 12, justifyContent: 'flex-start',
  },  
  storyImg: { width: '100%', height: '100%', borderRadius: 14,borderWidth: 2, borderColor: ORANGE, marginBottom: 6, resizeMode: 'cover' },

  sectionRow: {
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'bold',
    fontSize: 22,
    color: '#1A1A1A',
  },
  recommendationsHeader: {
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontFamily: 'bold',
    fontSize: 22,
    color: '#1A1A1A',
    flex: 1,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: '#FFE5CC',
    height: 40,
  },
  cityChipText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#E65100',
    maxWidth: 140,
  },
});
