import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, ScrollView, Image, Text, Modal, StyleSheet, TouchableOpacity, FlatList,Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, useScrollToTop } from '@react-navigation/native';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { logout } from '../actions/authActions';
import { persistor } from '../store/index';
import * as Device from 'expo-device';
import { ProductCard } from '../components/ProductCard';
import { useGetPostListQuery, useGetPostListCityQuery } from '../api';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  useEffect(() => { if (isUpdatePending) Updates.reloadAsync().catch(() => Alert.alert('Error')); }, [isUpdatePending]);
  return null;
});

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('Device.isDevice:', Device.isDevice);
    (async () => {
      const perm = await Notifications.getPermissionsAsync();
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
  const effectiveCity = selectedCity || 'Весь Казахстан';
  const isAllKazakhstan = effectiveCity === 'Весь Казахстан';

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
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false as const,
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
      { id: 1, name: t('categories_main.services'),        icon: <MaterialCommunityIcons name="briefcase-outline" size={26} color={ORANGE} /> },
      { id: 2, name: t('categories_main.products'),        icon: <Ionicons name="cart-outline" size={26} color={ORANGE} /> },
      { id: 3, name: t('categories_main.findEmployee'),    icon: <MaterialCommunityIcons name="account-search-outline" size={26} color={ORANGE} /> },
      { id: 99, name: t('categories_main.qorgauAi'),       icon: <Ionicons name="sparkles-outline" size={26} color={ORANGE} /> },
      { id: 4, name: t('categories_main.other'),           icon: <Ionicons name="apps-outline" size={26} color={ORANGE} /> },
      { id: 7, name: t('categories_main.industrialSecurityEducation'), icon: <Ionicons name="school-outline" size={26} color={ORANGE} /> },
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
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Image style={styles.logo} source={require('../assets/logo.png')} />
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerUser}
              onPress={() => {
                if (user?.username) return;
                (navigation as any).navigate('Auth', { screen: 'LoginOrRegistration' });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={20} color={ORANGE} />
              <Text style={styles.headerUserText}>
                {user?.username ? user.username : t('register.register')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setVisible(true)} style={styles.headerGeo} activeOpacity={0.7}>
              <Ionicons name="location-outline" size={22} color={ORANGE} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Поиск */}
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('SearchScreen')}
          style={styles.searchBar}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={18} color="#A7A7A7" />
          <Text style={styles.searchPlaceholder}>{t('main.search_catalog')}</Text>
        </TouchableOpacity>

        {/* «Сторис»-чипы */}
        <FlatList
          data={stories}
          horizontal
          keyExtractor={(item) => item.id}
          contentContainerStyle={{  paddingTop: 6 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleOpenStory(item)} style={styles.storyChip} activeOpacity={0.9}>
              <Image source={item.preview} style={styles.storyImg} />
            </TouchableOpacity>
          )}
        />
        <StoriesInstructions visible={modalVisible} onClose={() => setModalVisible(false)} story={selectedStory} />

        {/* Категории */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Категории</Text>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryTile}
              onPress={() => {
                if (category.id === 99) {
                  (navigation as any).navigate('QorgauAi', { selectedCity });
                } else {
                  (navigation as any).navigate('GetPostsByCategory', { categoryId: category, selectedCity });
                }
              }}
              activeOpacity={0.85}
            >
              <View style={styles.categoryIconWrap}>
                {category.icon}
              </View>
              <Text style={styles.categoryText} numberOfLines={2}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Рекомендации + выбор города */}
        <View style={[styles.sectionRow, { marginTop: 8, marginBottom: 8 }]}>
          <Text style={styles.sectionTitle}>
            {isAllKazakhstan ? t('recommendation') : selectedCity }
          </Text>
          <TouchableOpacity style={styles.cityChip} onPress={() => setVisible(true)} activeOpacity={0.8}>
            <Ionicons name="location-outline" size={16} color={ORANGE} />
            <Text style={styles.cityChipText} numberOfLines={1}>
              {selectedCity || 'Весь Казахстан'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={ORANGE} />
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

      <FlatList
        ref={listRef}
        data={posts}
        numColumns={2}
        style={{ paddingHorizontal: 10 }}
        contentContainerStyle={{ justifyContent: 'center', paddingBottom: 60 }}
        keyExtractor={(item) => item.id.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={6}
        windowSize={7}
        maxToRenderPerBatch={8}
        removeClippedSubviews
        ListEmptyComponent={
          isLoading ? null : (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text>Нет объявлений</Text>
            </View>
          )
        }
        ListHeaderComponent={headerEl}
        renderItem={({ item }) => (
          <View style={{ width: '50%', alignItems: 'center' }}>
            <MemoProductCard
              key={item.id}
              id={item.id}
              title={item.title}
              image={item.images?.[0]?.image || null}
              cost={item.cost}
              media={item.images}
              condition={item.condition}
              mortage={item.mortage}
              delivery={item.delivery}
              city={item.geolocation}
              date={item.date}
              extra_fields={item.extra_fields}
              tariff={item.tariff || 0}
              isVisible={visibleItems.includes(item.id)}
            />
          </View>
        )}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={
          <View style={{ marginBottom: 10 }}>
            {isLoading && <ActivityIndicator size="large" color={ORANGE} />}
          </View>
        }
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 6, backgroundColor: '#FFFFFF',
  },
  logo: { height: 26, width: 120, resizeMode: 'contain' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerUser: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10 },
  headerUserText: { fontSize: 18, marginLeft: 8, fontFamily: 'medium', color: '#141517' },
  headerGeo: { marginLeft: 6, padding: 6, borderRadius: 10 },

  searchBar: {
    width: '95%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#EEE', height: 48, paddingHorizontal: 14,
    borderRadius: 14, marginTop: 8,
    marginBottom: 10,
  },
  searchPlaceholder: { marginLeft: 10, fontSize: 16, color: '#A7A7A7' },

  storyChip: {
    height: 120, width: SCREEN_WIDTH * 0.29, borderRadius: 16, backgroundColor: LIGHT_ORANGE,
    marginRight: 12, justifyContent: 'flex-start',
  },  
  storyImg: { width: '100%', height: '100%', borderRadius: 14,borderWidth: 2, borderColor: ORANGE, marginBottom: 6, resizeMode: 'cover' },

  sectionRow: { width: '95%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 },
  sectionTitle: { fontFamily: 'semibold', fontSize: 20, color: '#141517' },

  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    width: '95%', alignSelf: 'center', marginTop: 8, marginBottom: 15 
  },
  categoryTile: {
    width: '31.8%', backgroundColor: LIGHT_ORANGE, borderRadius: 16, height: 95, paddingHorizontal: 20, marginBottom: 12,
    borderWidth: 1, borderColor: ORANGE + '33', justifyContent: 'center'
  },
  categoryIconWrap: {
    borderRadius: 12, marginBottom: 6,
  },
  categoryText: { fontSize: 14, fontFamily: 'medium', color: '#333', textAlign: 'left' },

  cityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 34,
    borderRadius: 10, backgroundColor: '#FFF5EA', borderWidth: 1, borderColor: '#F3D9C2',
  },
  cityChipText: { fontSize: 13.5, color: '#7A4A1F', maxWidth: 140 },
});
