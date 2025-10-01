import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet,FlatList} from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { useGetPostListCityQuery } from '../api';


export const GetPostsByCityScreen = ({route}) => {
    const city = route.params.city
    const [page, setPage] = useState(1);
    const limit = 6;
    const [refreshing, setRefreshing] = useState(false);
    const { data, isLoading, refetch } = useGetPostListCityQuery({ city, page, limit  });
    const [posts, setPosts] = useState([]);

    const [visibleItems, setVisibleItems] = useState([]);

    const viewabilityConfig = {
      itemVisiblePercentThreshold: 50, // Элемент считается видимым, если хотя бы 50% его площади отображается
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
      setVisibleItems(viewableItems.map(item => item.item.id));
    }).current;
  
    const onRefresh = useCallback(() => {
      setRefreshing(true);
      console.log('refreshed');
      setPage(1); // Reset to page 1 for refresh
      refetch({ page: 1, limit }).finally(() => setRefreshing(false));
    }, [refetch, limit]);
  
    const loadMoreItems = useCallback(() => {
        setPage(currentPage => currentPage + 1);
    }, [data?.results?.length, data?.total, isLoading]);
  
    useEffect(() => {
      refetch()
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
        if (page === 1) {
          setPosts(data.results);
        } else {
          appendNewPosts(data.results);
        }
      }
    }, [data, page]);
  
  
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