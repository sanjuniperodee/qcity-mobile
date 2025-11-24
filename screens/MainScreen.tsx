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
import i18n from '../i18n';
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
  const currentLanguage = i18n.language;

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
  // Варианты "Весь Казахстан" на всех языках
  const allKazakhstanVariants = useMemo(
    () => ['Весь Казахстан', 'Бүкіл Қазақстан', 'All Kazakhstan'],
    []
  );
  const effectiveCity = selectedCity || allKazakhstanText;
  // Проверяем, является ли выбранный город одним из вариантов "Весь Казахстан" на любом языке
  const isAllKazakhstan =
    !selectedCity ||
    allKazakhstanVariants.includes(effectiveCity) ||
    effectiveCity === allKazakhstanText;
  const [langKey, setLangKey] = useState(0);
  
  // Сброс данных при смене города
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setFirstLoaded(false);
    setHasReachedEnd(false); // Сбрасываем флаг при смене города
  }, [effectiveCity, isAllKazakhstan]);

  const [visibleItems, setVisibleItems] = useState<Array<string | number>>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false); // Флаг для блокировки после 404

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
    error: errorAll,
  } = useGetPostListQuery(
    { page, limit, langKey },
    { ...baseQueryOpts, skip: !isAllKazakhstan }
  );

  const {
    data: cityData,
    isLoading: isLoadingCity,
    isFetching: isFetchingCity,
    refetch: refetchCity,
    error: errorCity,
  } = useGetPostListCityQuery(
    { city: effectiveCity, page, limit, langKey },
    { ...baseQueryOpts, skip: isAllKazakhstan }
  );

  const data = isAllKazakhstan ? allData : cityData;
  const error = isAllKazakhstan ? errorAll : errorCity;
  const isLoading = isAllKazakhstan ? (isLoadingAll || isFetchingAll) : (isLoadingCity || isFetchingCity);
  const refetchActive = isAllKazakhstan ? refetchAll : refetchCity;
  
  // Проверка на 404 ошибку (конец списка)
  const is404Error = error && (
    ('status' in error && (error.status === 404 || error.status === 'FETCH_ERROR')) ||
    ('data' in error && error.data && typeof error.data === 'object' && 'detail' in error.data && 
     typeof error.data.detail === 'string' && error.data.detail.includes('Неправильная страница'))
  );

  // Обновление данных при смене языка
  const prevLanguageRef = useRef(currentLanguage);
  useEffect(() => {
    if (prevLanguageRef.current !== currentLanguage) {
      prevLanguageRef.current = currentLanguage;
      setLangKey((key) => key + 1);
      setPage(1);
      setPosts([]);
      setFirstLoaded(false);
      setHasReachedEnd(false);
    }
  }, [currentLanguage]); // eslint-disable-line

  const handleSelectCity = (city: string) => {
    if (city === selectedCity) { setVisible(false); return; }
    dispatch(setCity(city));
    setPage(1);
    setPosts([]);
    setFirstLoaded(false);
    setHasReachedEnd(false); // Сбрасываем флаг при смене города
    setVisible(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setFirstLoaded(false);
    setHasReachedEnd(false); // Сбрасываем флаг при обновлении
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
    // Если была 404 ошибка, не обрабатываем данные
    if (is404Error && page > 1) {
      // Откатываем страницу назад, если получили 404
      setPage((p) => Math.max(1, p - 1));
      setHasReachedEnd(true); // Устанавливаем флаг, что достигли конца
      return;
    }
    
    if (!data?.results) return;
    
    // Если последняя страница вернула меньше элементов чем limit, значит это последняя страница
    if (data.results.length < limit && page > 1) {
      setHasReachedEnd(true);
    }
    
    if (page === 1) {
      const next = data.results;
      const same =
        posts.length === next.length &&
        arraysEqual(posts.map((p) => p.id), next.map((p: any) => p.id));
      if (!same) setPosts(next);
      setFirstLoaded(true);
      // Если первая страница вернула меньше элементов чем limit, значит это последняя страница
      if (next.length < limit) {
        setHasReachedEnd(true);
      }
    } else {
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const add = data.results.filter((p: any) => !ids.has(p.id));
        return add.length ? [...prev, ...add] : prev;
      });
    }
  }, [data, page, is404Error, limit]); // eslint-disable-line

  // ========= пагинация =========
  const hasMore = useMemo(() => {
    // Если достигли конца (404 или последняя страница), значит больше постов нет
    if (hasReachedEnd || is404Error) return false;
    
    const total = data?.total;
    if (typeof total === 'number') return posts.length < total;
    const lastLen = data?.results?.length ?? 0;
    // Если последняя страница вернула меньше элементов чем limit, значит это последняя страница
    return lastLen === limit && lastLen > 0;
  }, [data?.total, data?.results?.length, posts.length, is404Error, hasReachedEnd, limit]);

  const loadMoreItemsRaw = useCallback(() => {
    // Блокируем загрузку если:
    // - еще не загрузили первую страницу
    // - идет загрузка
    // - нет больше данных
    // - была 404 ошибка
    // - уже достигли конца
    if (!firstLoaded || isLoading || !hasMore || is404Error || hasReachedEnd) {
      return;
    }
    setPage((p) => p + 1);
  }, [firstLoaded, isLoading, hasMore, is404Error, hasReachedEnd]);

  // Throttle для предотвращения частых вызовов при скролле
  const loadMoreItems = useMemo(() => throttle(loadMoreItemsRaw, 1000), [loadMoreItemsRaw]);

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
        onEndReachedThreshold={0.3}
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
        allowAutoPreview={true}
        visibleItems={visibleItems}
      />
    </>
  );
};

import { colors, spacing, radius, shadows } from '../theme/tokens';

const ORANGE = colors.primary;
const LIGHT_ORANGE = colors.mutedBg; // фон плиток

const styles = StyleSheet.create({
  centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.overlay // Apple HIG: system overlay color
  },
  modalView: {
    margin: spacing.xl, 
    backgroundColor: colors.surface, 
    borderRadius: radius.xl, // Apple HIG: larger radius for modals
    width: '90%', 
    maxHeight: '60%',
    paddingVertical: spacing.lg, 
    alignItems: 'center', 
    ...shadows.xl, // Apple HIG: stronger shadow for modals
  },
  cityButton: { 
    paddingVertical: spacing.md, 
    marginVertical: spacing.xs, 
    paddingHorizontal: spacing.sm, 
    borderRadius: radius.lg, // Apple HIG: consistent rounding
    width: '100%', 
    backgroundColor: colors.bgSecondary // Apple HIG: system secondary background
  },
  activeCityButton: { 
    backgroundColor: colors.mutedBg // Apple HIG: use semantic color
  },
  cityText: { 
    textAlign: 'center', 
    fontSize: 15, 
    fontFamily: 'medium', 
    color: colors.text // Apple HIG: primary text color
  },
  cityTextActive: { 
    textAlign: 'center', 
    fontFamily: 'medium', 
    fontSize: 15, 
    color: colors.primary // Apple HIG: primary color for active state
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, // Apple HIG: consistent spacing
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg, // Apple HIG: system background
    borderBottomWidth: 0.5, // Apple HIG: subtle separator
    borderBottomColor: colors.separator, // Apple HIG: system separator
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logoGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg, // Apple HIG: consistent rounding
    flexDirection: 'row',
    alignItems: 'baseline',
    ...shadows.sm, // Apple HIG: subtle depth
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // Apple HIG: consistent spacing
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg, // Apple HIG: consistent rounding
    backgroundColor: colors.bgSecondary, // Apple HIG: system secondary background
    borderWidth: 0, // Apple HIG: use shadow instead
    borderColor: 'transparent',
    maxWidth: 150,
    minHeight: 44, // Apple HIG: minimum touch target
    ...shadows.sm, // Apple HIG: subtle depth
  },
  headerUserText: {
    fontSize: 14,
    marginLeft: spacing.xs,
    fontFamily: 'medium',
    color: colors.text, // Apple HIG: primary text color
    flex: 1,
  },
  headerGeo: {
    padding: spacing.sm,
    borderRadius: radius.lg, // Apple HIG: consistent rounding
    backgroundColor: colors.bgSecondary, // Apple HIG: system secondary background
    borderWidth: 0, // Apple HIG: use shadow instead
    borderColor: 'transparent',
    minWidth: 44, // Apple HIG: minimum touch target
    minHeight: 44,
    ...shadows.sm, // Apple HIG: subtle depth
  },

  searchBar: {
    width: '95%',
    alignSelf: 'center',
    backgroundColor: colors.surface, // Apple HIG: system surface
    borderWidth: 0, // Apple HIG: use shadow instead
    borderColor: 'transparent',
    height: 50, // Apple HIG: comfortable height
    borderRadius: radius.lg, // Apple HIG: consistent rounding
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.md, // Apple HIG: subtle shadow for depth
  },
  searchBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md, // Apple HIG: consistent spacing
    height: '100%',
  },
  searchPlaceholder: {
    marginLeft: spacing.sm,
    fontSize: 16,
    fontFamily: 'regular',
    color: colors.textPlaceholder, // Apple HIG: system placeholder color
    flex: 1,
  },

  storyChip: {
    height: 120, 
    width: SCREEN_WIDTH * 0.29, 
    borderRadius: radius.lg, // Apple HIG: consistent rounding
    backgroundColor: LIGHT_ORANGE,
    marginRight: spacing.sm, 
    justifyContent: 'flex-start',
    ...shadows.md, // Apple HIG: subtle depth
  },  
  storyImg: { 
    width: '100%', 
    height: '100%', 
    borderRadius: radius.md,
    borderWidth: 2, 
    borderColor: ORANGE, 
    marginBottom: spacing.xs, 
    resizeMode: 'cover' 
  },

  sectionRow: {
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg, // Apple HIG: consistent spacing
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'bold',
    fontSize: 22,
    color: colors.text, // Apple HIG: primary text color
  },
  recommendationsHeader: {
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg, // Apple HIG: consistent spacing
    marginBottom: spacing.md,
  },
  recommendationsTitle: {
    fontFamily: 'bold',
    fontSize: 22,
    color: colors.text, // Apple HIG: primary text color
    flex: 1,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // Apple HIG: consistent spacing
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg, // Apple HIG: consistent rounding
    backgroundColor: colors.mutedBg, // Apple HIG: semantic color
    borderWidth: 0, // Apple HIG: use shadow instead
    borderColor: 'transparent',
    minHeight: 44, // Apple HIG: minimum touch target
    ...shadows.sm, // Apple HIG: subtle depth
  },
  cityChipText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: colors.primary, // Apple HIG: primary color
    maxWidth: 140,
  },
});
