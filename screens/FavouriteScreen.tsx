import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from '../components/ProductCard';
import { ResponsiveProductGrid } from '../components/ResponsiveProductGrid';
import { useListFavouritesQuery } from '../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FavouriteScreen = () => {
  const navigation = useNavigation();
  const auth = useSelector((state: any) => state.auth);
  const { t } = useTranslation();
  const isAuthenticated = !!auth?.isAuthenticated && !!auth?.token;

  // Загружаем избранное только если авторизован
  const {
    data: favouritesData,
    isLoading,
    isFetching,
    refetch,
  } = useListFavouritesQuery(undefined, { skip: !isAuthenticated });

  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const loadMoreItems = useCallback(() => {
    // если будет пагинация — здесь увеличивай страницу и дергай следующий запрос
    setPage((currentPage) => currentPage + 1);
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setVisibleItems(viewableItems.map((vi: any) => vi.item.id));
  }).current;

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      const refresh = async () => {
        setRefreshing(true);
        try {
          await refetch();
        } finally {
          setRefreshing(false);
        }
      };
      refresh();
    }, [isAuthenticated, refetch])
  );

  const onRefresh = useCallback(() => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [isAuthenticated, refetch]);

  const goToAuth = () => {
    const parent = (navigation as any).getParent?.();
    if (parent) {
      parent.navigate('Auth', { screen: 'LoginOrRegistration' });
    } else {
      (navigation as any).navigate('Auth', { screen: 'LoginOrRegistration' });
    }
  };

  // --- Если пользователь НЕ авторизован: показываем CTA-блок ---
  if (!isAuthenticated) {
    return (
      <View style={styles.authWrapper}>
        <View style={styles.authIconContainer}>
          <Ionicons name="heart-outline" size={64} color="#F09235" />
        </View>
        <Text style={styles.authTitle}>{t('favorites.login_required')}</Text>
        <Text style={styles.authText}>
          {t('favorites.login_required_text')}
        </Text>
        <TouchableOpacity style={styles.authButton} onPress={goToAuth} activeOpacity={0.8}>
          <LinearGradient
            colors={['#F3B127', '#F26D1D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.authButtonGradient}
          >
            <Text style={styles.authButtonText}>{t('favorites.login_register')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Лоадер при загрузке избранного ---
  if (isLoading && !favouritesData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F09235" />
        <Text style={styles.loadingText}>Загрузка избранного...</Text>
      </View>
    );
  }

  // Приводим данные к массиву (на случай, если API вернёт объект)
  const items = Array.isArray(favouritesData)
    ? favouritesData
    : Array.isArray(favouritesData?.results)
    ? favouritesData.results
    : [];

  const favouritesCount = items.length;

  // Header component для ResponsiveProductGrid
  const headerComponent = useMemo(
    () => (
      <View>
        {/* Заголовок с статистикой */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#F3B127', '#F26D1D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons name="heart" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Избранное</Text>
                <Text style={styles.headerSubtitle}>
                  {favouritesCount} {favouritesCount === 1 ? 'объявление' : favouritesCount < 5 ? 'объявления' : 'объявлений'} в избранном
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Информационная карточка */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardItem}>
            <Ionicons name="information-circle-outline" size={20} color="#F09235" />
            <Text style={styles.infoCardText}>
              Сохраняйте понравившиеся объявления для быстрого доступа
            </Text>
          </View>
        </View>
      </View>
    ),
    [favouritesCount]
  );

  // Empty component
  const emptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="heart-outline" size={64} color="#E0E0E0" />
        </View>
        <Text style={styles.emptyTitle}>{t('favorites.no_favorites')}</Text>
        <Text style={styles.emptySubtitle}>
          Добавьте объявления в избранное, чтобы быстро найти их позже
        </Text>
      </View>
    ),
    [t]
  );

  return (
    <View style={styles.container}>
      <ResponsiveProductGrid
        data={items}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={emptyComponent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={null}
        ProductCardComponent={ProductCard}
        containerWidth={SCREEN_WIDTH}
        scrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'medium',
    fontSize: 16,
    color: '#666666',
  },
  authWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  authIconContainer: {
    marginBottom: 24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 24,
    fontFamily: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  authText: {
    fontSize: 15,
    fontFamily: 'regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  authButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  authButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  authButtonText: {
    color: '#fff',
    fontFamily: 'bold',
    fontSize: 16,
    textAlign: 'center',
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
  infoCard: {
    backgroundColor: '#FFF5E6',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#F09235',
  },
  infoCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCardText: {
    marginLeft: 10,
    fontFamily: 'regular',
    fontSize: 13,
    color: '#B85C1A',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'regular',
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
