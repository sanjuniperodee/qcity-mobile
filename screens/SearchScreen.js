import React, { useState, useRef, useEffect, use } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { useSearchPostsByCityQuery, useSearchPostsQuery } from '../api';
import { ProductCard } from '../components/ProductCard';
import { setCity } from '../actions/locationActions';
import { cities } from '../constants/cities';

export const SearchScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const selectedCity = useSelector((s) => s.city.selectedCity);
  const isAllKazakhstan = !selectedCity || selectedCity === t('location.all_kazakhstan');
  const [visible, setVisible] = useState(false);

  const effectiveCity = selectedCity;

  const [search, onChangeSearch] = useState('');

  const [viewableItems, setViewableItems] = useState([]);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    setViewableItems(viewableItems.map((item) => item.key));
  });

  const {
    data: searchResultsAll,
    isFetching: isFetchingAll,
    refetch: refetchAll,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: allError,
  } = useSearchPostsQuery(
    search,
    { skip: !search || search.length <= 2 || !isAllKazakhstan, refetchOnMountOrArgChange: true }
  );
  
  const {
    data: searchResultsByCity,
    isFetching: isFetchingCity,
    refetch: refetchByCity,
    isLoading: isLoadingCity,
    isError: isErrorCity,
    error: cityError,
  } = useSearchPostsByCityQuery(
    { q: search, city: effectiveCity },
    { skip: !search || search.length <= 2 || isAllKazakhstan, refetchOnMountOrArgChange: true }
  );
  

  console.log('searchResultsByCity', searchResultsByCity);
  

  const data = isAllKazakhstan
  ? (isErrorAll ? [] : (searchResultsAll || []))
  : (isErrorCity ? [] : (searchResultsByCity || []));

  const isBusy = isAllKazakhstan
  ? (isLoadingAll || isFetchingAll)
  : (isLoadingCity || isFetchingCity);

  const apiError = isAllKazakhstan ? allError : cityError;

  const refetchActive = isAllKazakhstan ? refetchAll : refetchByCity;

  useEffect(() => {
    if (search && search.length > 2) {
      refetchActive?.();
    }
  }, [search, selectedCity]);

  // ----- CITY PICKER -----
  const handleSelectCity = (city) => {
    if (city === selectedCity) {
      setVisible(false);
      return;
    }
    dispatch(setCity(city));
    setVisible(false);
  };

  return (
    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
      <View style={{ width: '85%', alignItems: 'center', justifyContent: 'space-between',flexDirection: 'row'}}>
        <View
          style={styles.searchBox}
        >
          <Image style={{ width: 17, height: 17,marginRight: 10 }} source={require('../assets/search.png')} />
          <TextInput
            style={{ width: '90%', fontSize: 16 }}
            onChangeText={onChangeSearch}
            placeholder={t('search.search_placeholder')}
            value={search}
            returnKeyType="search"
          />
        </View>
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.cityChip} onPress={() => setVisible(true)}>
            <Text style={styles.cityChipText} numberOfLines={1}>
              {selectedCity || t('location.all_kazakhstan')}
            </Text>
            <Image style={{ width: 12, height: 12, marginLeft: 6 }} source={require('../assets/chevron-down.png')} />
          </TouchableOpacity>
        </View>
      </View>

      {isBusy && (
        <View style={{ marginTop: 12 }}>
          <ActivityIndicator />
        </View>
      )}

      <FlatList
        data={data}
        contentContainerStyle={{ paddingBottom: 20, marginBottom: 90, marginTop: 10, justifyContent: 'space-between', width: '100%' }}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            id={item.id}
            title={item.title}
            key={item.id}
            image={item.images?.[0]?.image}
            cost={item.cost}
            media={item.images}
            condition={item.condition}
            mortage={item.mortage}
            delivery={item.delivery}
            city={item.geolocation}
            date={item.date}
            isInView={viewableItems.includes(item.id.toString())}
          />
        )}
        onViewableItemsChanged={handleViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        ListEmptyComponent={
          (!!search && search.length > 2 && !isBusy)
            ? (
              <View style={{ paddingTop: 24, alignItems: 'center' }}>
                <Text>
                  {
                    (isAllKazakhstan ? isErrorAll : isErrorCity)
                      ? (apiError?.data?.detail || t('search.nothing_found'))
                      : t('search.nothing_found')
                  }
                </Text>
              </View>
            )
            : null
        }
      />

      <Modal visible={visible} transparent>
        <TouchableOpacity
          style={styles.centeredView}
          activeOpacity={1}
          onPressOut={() => setVisible(false)}
        >
          <View style={styles.modalView}>
            <ScrollView style={{ width: '100%', paddingHorizontal: 35 }}>
              {cities.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.cityButton, selectedCity === c.value && styles.activeCityButton]}
                  onPress={() => handleSelectCity(c.value)}
                >
                  <Text style={selectedCity === c.value ? styles.cityTextActive : styles.cityText}>
                    {c.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    width: '63%',
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#F7F8F9',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    height: 50,
    borderRadius: 15,
  },
  filtersRow: {
    width: '35%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    height: 50,
    borderRadius: 18,
    backgroundColor: '#F0F1F3',
  },
  cityChipText: { fontSize: 14 },
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  cityButton: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  activeCityButton: {
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
  },
  cityText: { fontSize: 16 },
  cityTextActive: { fontSize: 16, fontWeight: '600' },
});
