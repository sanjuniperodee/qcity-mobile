import React, { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchPostsQuery } from '../api';
import { ProductCard } from '../components/ProductCard';

export const ResultsSearchScreen = ({route}) => {
  const {searchQuery} = route.params
  const { data: searchResults, isLoading, refetch } = useSearchPostsQuery(searchQuery);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    console.log(searchResults);
    refetch();
  }, [searchResults]);

  const renderItem = ({ item }) => (
    <ProductCard
      id={item.id}
      title={item.title}
      key={item.id}
      image={item.images[0].image}
      cost={item.cost}
      media={item.images}
      condition={item.condition}
      mortage={item.mortage}
      delivery={item.delivery}
      content={item.content}
      city={item.geolocation}
      date={item.date}
    />
  );

  return (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          horizontal={false} // Set to false for a vertical layout
          showsVerticalScrollIndicator={false} // Optional: hide vertical scrollbar
          renderItem={renderItem}
          snapToInterval={640}
          pagingEnabled
          style={{marginBottom:90}}
          decelerationRate="fast"
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />} // Adjust the height as needed
          contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: '5.5%' }}
        /> 
  );
};
