import React, { useState, useRef, useCallback } from 'react';
import { View, Text,FlatList, ActivityIndicator } from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { useFocusEffect } from '@react-navigation/native';
import { useListFavouritesQuery } from '../api';

export const ProfileFavouriteScreen = () => {
  const { data: favouritesData, isLoading, isFetching, refetch } = useListFavouritesQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [page, setPage] = useState(1);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

    const loadMoreItems = useCallback(() => {
        setPage(currentPage => currentPage + 1);
    }, [favouritesData?.results?.length, favouritesData?.total, isLoading]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setVisibleItems(viewableItems.map(item => item.item.id));
  }).current;

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        setRefreshing(true);
        try {
          await refetch();
        } finally {
          setRefreshing(false);
        }
      };

      refresh();
    }, [refetch])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
      <FlatList
        data={favouritesData}
        numColumns={2}
        style={{paddingHorizontal:10,marginBottom:100}}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={{justifyContent:'center'}}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ width: '50%', alignItems: 'center' }}>
            <ProductCard
              key={item.id}
              id={item.id}
              title={item.title}
              image={item.images[0].image}
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
            <Text style={{ fontSize: 18, color: '#777' }}>Нет постов</Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
  );
};