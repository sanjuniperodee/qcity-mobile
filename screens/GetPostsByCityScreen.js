import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet,FlatList} from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { useGetPostListCityQuery } from '../api';


export const GetPostsByCityScreen = ({route}) => {
    const city = route.params.city
    const [page, setPage] = useState(1);
    const limit = 6;
    const [refreshing, setRefreshing] = useState(false);
    const { data, isLoading, refetch, error } = useGetPostListCityQuery({ city, page, limit  });
    const [posts, setPosts] = useState([]);
    const [hasReachedEnd, setHasReachedEnd] = useState(false); // Флаг для блокировки после 404

    const [visibleItems, setVisibleItems] = useState([]);

    const viewabilityConfig = {
      itemVisiblePercentThreshold: 50, // Элемент считается видимым, если хотя бы 50% его площади отображается
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
      setVisibleItems(viewableItems.map(item => item.item.id));
    }).current;
  
    // Проверка на 404 ошибку (конец списка)
    const is404Error = error && (error.status === 404 || error.status === 'FETCH_ERROR' || (error.data && error.data.detail && error.data.detail.includes('Неправильная страница')));
  
    const onRefresh = useCallback(() => {
      setRefreshing(true);
      console.log('refreshed');
      setPage(1); // Reset to page 1 for refresh
      setHasReachedEnd(false); // Сбрасываем флаг при обновлении
      refetch({ page: 1, limit }).finally(() => setRefreshing(false));
    }, [refetch, limit]);
  
    const hasMore = useMemo(() => {
      if (hasReachedEnd || is404Error) return false;
      const total = data?.total;
      if (typeof total === 'number') return posts.length < total;
      const lastLen = data?.results?.length ?? 0;
      return lastLen === limit && lastLen > 0;
    }, [data?.total, data?.results?.length, posts.length, is404Error, hasReachedEnd, limit]);
  
    const loadMoreItemsRaw = useCallback(() => {
      if (isLoading || !hasMore || is404Error || hasReachedEnd) return;
      setPage(currentPage => currentPage + 1);
    }, [isLoading, hasMore, is404Error, hasReachedEnd]);
  
    // Throttle для предотвращения частых вызовов при скролле
    const throttle = (fn, ms) => {
      let last = 0;
      let timer = null;
      return (...args) => {
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
    
    const loadMoreItems = useMemo(() => throttle(loadMoreItemsRaw, 1000), [loadMoreItemsRaw]);
  
    useEffect(() => {
      // Если была 404 ошибка, не обрабатываем данные
      if (is404Error && page > 1) {
        setPage((p) => Math.max(1, p - 1));
        setHasReachedEnd(true); // Устанавливаем флаг, что достигли конца
        return;
      }
      
      refetch();
      const appendNewPosts = (newPosts) => {
        // Only append if newPosts are not empty and have different content
        if (newPosts.length === 0) return;
        const existingPostIds = new Set(posts.map(post => post.id));
        const filteredNewPosts = newPosts.filter(post => !existingPostIds.has(post.id));
        
        if (filteredNewPosts.length > 0) {
          setPosts(currentPosts => [...currentPosts, ...filteredNewPosts]);
        }
      };
    
      if (data?.results) {
        // Если последняя страница вернула меньше элементов чем limit, значит это последняя страница
        if (data.results.length < limit && page > 1) {
          setHasReachedEnd(true);
        }
        
        if (page === 1) {
          setPosts(data.results);
          // Если первая страница вернула меньше элементов чем limit, значит это последняя страница
          if (data.results.length < limit) {
            setHasReachedEnd(true);
          }
        } else {
          appendNewPosts(data.results);
        }
      }
    }, [data, page, is404Error, limit]);
  
  
    return (
      <FlatList
        data={posts}
        numColumns={2}
        style={{paddingHorizontal:10,marginBottom:100}}
        contentContainerStyle={{justifyContent:'center'}}
        keyExtractor={item => item.id.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
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
        onEndReachedThreshold={0.3}
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
  
  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      width:'90%',
      maxHeight:'60%',
      paddingVertical: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    cityButton: {
      paddingVertical: 20,
      marginVertical:5,
      paddingHorizontal: 10,
      borderRadius:15,
      width: '100%', 
      backgroundColor: '#eee',
    },
    activeCityButton: {
      backgroundColor: '#F09235',
    },
    cityText: {
      textAlign: 'center',
      fontSize:15,
      fontFamily:'medium',
      opacity:.7
    },
    cityTextActive: {
      textAlign: 'center',
      fontFamily:'medium',
      fontSize:15,
      color:'#FFF'
    },
    selectorButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      margin: 10,
      backgroundColor: '#ddd',
    },
  });