import React, { useState, useEffect } from 'react';
import { View, Dimensions, FlatList, StyleSheet } from 'react-native';
// Using dynamic import to handle both ProductCard and MemoProductCard
// The component will use whatever is passed via props

export const ResponsiveProductGrid = ({ 
  data,
  onViewableItemsChanged,
  viewabilityConfig,
  ListHeaderComponent,
  ListEmptyComponent,
  onEndReached,
  onEndReachedThreshold,
  refreshing,
  onRefresh,
  ListFooterComponent,
  ProductCardComponent
}) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  // Listen for dimension changes to handle orientation changes or window resizing
  useEffect(() => {
    const handleDimensionsChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
    return () => subscription.remove();
  }, []);

  // Determine number of columns based on screen width
  const getNumColumns = () => {
    if (screenWidth >= 1024) {
      return 4; // Desktop - 4 columns
    } else if (screenWidth >= 768) {
      return 3; // Tablet - 3 columns
    } else {
      return 2; // Mobile - 2 columns
    }
  };
  
  const numColumns = getNumColumns();
  
  // Calculate item width based on number of columns with fixed outer padding and spacing
  const listHorizontalPadding = 0; // no extra padding so header/search keep their width
  const interItemSpacing = 12; // px between items

  const getItemWidth = () => {
    const available = screenWidth - interItemSpacing * (numColumns - 1);
    return Math.floor(available / numColumns);
  };
  const itemWidth = getItemWidth();

  return (
    <FlatList
      data={data}
      numColumns={numColumns}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      key={`grid-${numColumns}`} // Force re-render when columns change
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={({ item }) => (
        <View style={[styles.itemContainer, { width: itemWidth, marginBottom: interItemSpacing }]}>
          {React.createElement(ProductCardComponent || require('./ProductCard').ProductCard, {
            key: item.id,
            id: item.id,
            title: item.title,
            image: item.images?.[0]?.image || null,
            cost: item.cost,
            media: item.images,
            condition: item.condition,
            mortage: item.mortage,
            delivery: item.delivery,
            city: item.geolocation,
            date: item.date,
            extra_fields: item.extra_fields,
            tariff: item.tariff || 0,
            isVisible: true
          })}
        </View>
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold || 0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListFooterComponent={ListFooterComponent}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  itemContainer: {
    alignItems: 'center',
  },
  gap: 12,
});
