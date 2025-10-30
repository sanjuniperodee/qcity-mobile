import React, { useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ProductCard } from '../components/ProductCard';
import { useListFavouritesQuery } from '../api';

export const FavouriteScreen = () => {
  const navigation = useNavigation();
  const auth = useSelector((state) => state.auth);
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
      navigation.navigate('Auth' as never, { screen: 'LoginOrRegistration' } as never);
    }
  };

  // --- Если пользователь НЕ авторизован: показываем CTA-блок ---
  if (!isAuthenticated) {
    return (
      <View style={styles.authWrapper}>
        <Text style={styles.authTitle}>{t('favorites.login_required')}</Text>
        <Text style={styles.authText}>
          {t('favorites.login_required_text')}
        </Text>
        <TouchableOpacity style={styles.authButton} onPress={goToAuth}>
          <Text style={styles.authButtonText}>{t('favorites.login_register')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Лоадер при загрузке избранного ---
  if (isLoading && !favouritesData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Приводим данные к массиву (на случай, если API вернёт объект)
  const items = Array.isArray(favouritesData)
    ? favouritesData
    : Array.isArray(favouritesData?.results)
    ? favouritesData.results
    : [];

  return (
    <FlatList
      data={items}
      numColumns={2}
      style={{ paddingHorizontal: 10, marginBottom: 100 }}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      contentContainerStyle={{ justifyContent: 'center' }}
      keyExtractor={(item: any) => String(item.id)}
      renderItem={({ item }) => (
        <View style={{ width: '50%', alignItems: 'center' }}>
          <ProductCard
            key={item.id}
            id={item.id}
            title={item.title}
            image={item.images?.[0]?.image}
            cost={item.cost}
            media={item.images}
            condition={item.condition}
            mortage={item.mortage}
            delivery={item.delivery}
            city={item.geolocation}
            date={item.date}
            tariff={item.tariff || 0}
            isVisible={visibleItems.includes(item.id)}
          />
        </View>
      )}
      onEndReached={loadMoreItems}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#777' }}>{t('favorites.no_favorites')}</Text>
        </View>
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  authWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 0,
  },
  authTitle: {
    fontSize: 20,
    fontFamily: 'medium',
    marginBottom: 8,
    textAlign: 'center',
  },
  authText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  authButton: {
    backgroundColor: '#F09235',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  authButtonText: {
    color: '#fff',
    fontFamily: 'medium',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
