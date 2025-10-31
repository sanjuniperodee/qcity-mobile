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

  // Always use 2 columns for mobile, regardless of screenWidth
  const numColumns = 2;
  
  // Mobile devices always need 2 columns
  const isMobile = true; // Force mobile layout

  // Calculate item width based on number of columns with appropriate spacing
  const getItemWidth = () => {
    const padding = 10; // Padding on each side of the screen
    const spacing = 10; // Spacing between items
    const availableWidth = screenWidth - (padding * 2) - (spacing * (numColumns - 1));
    // For mobile, ensure we always have at least 2 columns
    return availableWidth / numColumns;
  };

  const itemWidth = getItemWidth();
  
  // Force the item width to exactly 48%
  const itemWidthStyle = { width: '48%', maxWidth: screenWidth / 2 - 16 };
  
  return (
    <FlatList
      data={data}
      numColumns={numColumns}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      key={numColumns} // Force re-render when columns change
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={({ item, index }) => (
        <View style={{
          width: '49%',
          padding: 2,
          margin: 1,
        }}>
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
      columnWrapperStyle={{ 
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 2,
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingBottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  itemContainer: {
    padding: 3,
    margin: 1,
    alignItems: 'center',
  },
  columnWrapperStyle: {
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  }
});
