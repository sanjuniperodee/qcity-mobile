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

  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (screenWidth < 480) {
      return 2; // Small mobile screens - 2 columns
    } else if (screenWidth < 768) {
      return 2; // Regular mobile screens - 2 columns
    } else if (screenWidth < 1024) {
      return 3; // Tablets - 3 columns
    } else {
      return 4; // Desktop/large screens - 4 columns
    }
  };

  const numColumns = getNumColumns();

  // Calculate item width based on number of columns with appropriate spacing
  const getItemWidth = () => {
    const padding = 10; // Padding on each side of the screen
    const spacing = 10; // Spacing between items
    const availableWidth = screenWidth - (padding * 2) - (spacing * (numColumns - 1));
    // For mobile, ensure we always have at least 2 columns
    return availableWidth / numColumns;
  };

  const itemWidth = getItemWidth();
  
  // Force the item width to be a percentage on mobile screens
  const itemWidthStyle = screenWidth < 768 ? { width: '46%' } : { width: itemWidth, maxWidth: 300 };
  
  return (
    <FlatList
      data={data}
      numColumns={numColumns}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={({ item }) => (
        <View style={[
          styles.itemContainer,
          itemWidthStyle
        ]}>
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
    paddingHorizontal: 2,
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  itemContainer: {
    padding: 4,
    margin: 4,
    alignItems: 'center',
  },
  columnWrapperStyle: {
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  }
});
