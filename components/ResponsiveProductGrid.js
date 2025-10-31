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
  
  // Calculate item dimensions based on number of columns
  const getItemStyle = () => {
    const totalMargin = 16; // Total horizontal margin/padding per item
    const containerPadding = 16; // Padding of container
    const spacing = 8; // Spacing between items
    
    // Calculate width based on number of columns
    const availableWidth = screenWidth - containerPadding;
    const itemWidth = (availableWidth / numColumns) - spacing;
    
    return {
      width: itemWidth,
      marginHorizontal: spacing / 2,
      marginVertical: spacing / 2,
    };
  };
  
  const itemStyle = getItemStyle();

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
        <View style={[styles.itemContainer, { width: itemStyle.width }]}>
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
      columnWrapperStyle={styles.columnWrapperStyle}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
  contentContainer: {
    paddingBottom: 60,
    alignItems: 'flex-start',
    paddingHorizontal: 0,
  },
  itemContainer: {
    alignItems: 'center',
  },
  columnWrapperStyle: {
    flex: 1,
    justifyContent: 'flex-start',
  }
});
