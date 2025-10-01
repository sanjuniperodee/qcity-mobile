import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { useNavigation } from '@react-navigation/native';
import {
  useGetPostsByCategoryQuery,
  useGetPostsByCategoryAndCityQuery,
  useGetSubCategoriesListQuery,
  useGetPostsByGlobalCategoryQuery,  
  useGetPostsBySubCategoryQuery,   
} from '../api';
import { cities } from '../constants/cities';
import { useDispatch, useSelector } from 'react-redux';
import { setCity } from '../actions/locationActions';

const ALL_KZ = 'Весь Казахстан';

export const GetPostsByCategoryScreen = ({ route }) => {
  const { categoryId } = route.params;

  const [page, setPage] = useState(1);
  const limit = 6;
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const [visible, setVisible] = useState(false);

  const dispatch = useDispatch();
  const selectedCity = useSelector((s) => s.city.selectedCity);

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: categoryId.name });
  }, [navigation, categoryId]);

  const [globalFilter, setGlobalFilter] = useState(null);    // 'Пожарная безопасность' | 'Охранная безопасность' | 'Промышленная безопасность' | null
  const [selectedSubId, setSelectedSubId] = useState(null);  // id подкатегории или null
  console.log('aada',selectedSubId);
  
  // не отправляем "Весь Казахстан" на бэк
  const cityArg = useMemo(
    () => (selectedCity && selectedCity !== ALL_KZ ? selectedCity : undefined),
    [selectedCity]
  );

  const { data: subcategories } = useGetSubCategoriesListQuery(categoryId.id);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setVisibleItems(viewableItems.map(item => item.item.id));
  }).current;

  const handleSelectCity = (city) => {
    if (city === selectedCity) {
      setVisible(false);
      return;
    }
    setVisible(false);
    // ⚠️ Сбросим страницу и данные после смены города (ниже в useEffect тоже есть сброс)
    dispatch(setCity(city));
  };

  // ❗️ ЗАПРОСЫ: оба хука вызываются ВСЕГДА, управляем через skip
  const qCategory = useGetPostsByCategoryQuery(
    { category_id: categoryId.id, page, limit },
    { skip: !!cityArg || !!globalFilter || !!selectedSubId, refetchOnMountOrArgChange: true }
  );

  // по категории + городу (если указан город и нет других фильтров)
  const qCategoryCity = useGetPostsByCategoryAndCityQuery(
    { category_id: categoryId.id, city: cityArg, page, limit },
    { skip: !cityArg || !!globalFilter || !!selectedSubId, refetchOnMountOrArgChange: true }
  );

  // по глобальной категории (когда нажаты 3 кнопки)
  const qGlobal = useGetPostsByGlobalCategoryQuery(
    { global_category: globalFilter, city: cityArg, page, limit },
    { skip: !globalFilter, refetchOnMountOrArgChange: true }
  );

  // по подкатегории (чипы ниже)
  const qSub = useGetPostsBySubCategoryQuery(
    { sub_category_id: selectedSubId, city: cityArg, page, limit },
    { skip: !selectedSubId, refetchOnMountOrArgChange: true }
  );

  // активный источник данных
  const active =
    selectedSubId ? qSub :
    globalFilter ? qGlobal :
    cityArg ? qCategoryCity :
    qCategory;
  const { data, isLoading, isFetching, refetch, isError, error } = active;

  // ❗️При смене города/категории — сбросить список и страницу
  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [globalFilter, selectedSubId, cityArg, categoryId.id]);

  // набор постов постранично
  useEffect(() => {
    if (!data?.results) return;
    if (page === 1) setPosts(data.results);
    else {
      const ids = new Set(posts.map(p => p.id));
      const add = data.results.filter(p => !ids.has(p.id));
      setPosts(prev => [...prev, ...add]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setPosts([]);
    refetch?.();
    setTimeout(() => setRefreshing(false), 600);
  }, [refetch]);

  // пагинация
  const loadMoreItems = useCallback(() => {
    if (!isLoading && !isFetching && data?.results?.length > 0) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, isFetching, data]);

  const isSpecialCategory = categoryId.id === 1 || categoryId.id === 2;

  const handlePickGlobal = (label) => {
    setGlobalFilter(prev => (prev === label ? null : label)); // повторный тап снимает
    setSelectedSubId(null); // сброс другого фильтра
  };

  const handlePickSubcategory = (id) => {
    setSelectedSubId(prev => (prev === id ? null : id));
    setGlobalFilter(null);
    setPage(1);
    setPosts([]);
  };

  const clearFilters = () => {
    setGlobalFilter(null);
    setSelectedSubId(null);
  };

  return (
    <FlatList
      data={posts}
      numColumns={2}
      style={{ paddingHorizontal: 10, marginBottom: 100 }}
      contentContainerStyle={{ justifyContent: 'center' }}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={() => (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {/* выбор города */}
          <View style={styles.filtersRow}>
            <TouchableOpacity style={styles.cityChip} onPress={() => setVisible(true)}>
              <Text style={styles.cityChipText} numberOfLines={1}>{selectedCity || ALL_KZ}</Text>
              <Image style={{ width: 12, height: 12, marginLeft: 6 }} source={require('../assets/chevron-down.png')} />
            </TouchableOpacity>
          </View>

          {/* Глобальные фильтры для категорий 1/2 */}
          {isSpecialCategory ? (
            <>
              <TouchableOpacity
                onPress={() => handlePickGlobal('Пожарная безопасность')}
                style={[styles.button, globalFilter === 'Пожарная безопасность' && styles.buttonActive]}
              >
                <Text style={[styles.buttonText, globalFilter === 'Пожарная безопасность' && styles.buttonTextActive]}>
                  Пожарная безопасность
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePickGlobal('Охранная безопасность')}
                style={[styles.button, globalFilter === 'Охранная безопасность' && styles.buttonActive]}
              >
                <Text style={[styles.buttonText, globalFilter === 'Охранная безопасность' && styles.buttonTextActive]}>
                  Охранная безопасность
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePickGlobal('Промышленная безопасность')}
                style={[styles.button, globalFilter === 'Промышленная безопасность' && styles.buttonActive]}
              >
                <Text style={[styles.buttonText, globalFilter === 'Промышленная безопасность' && styles.buttonTextActive]}>
                  Промышленная безопасность
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={clearFilters} style={[styles.button, globalFilter === null && styles.buttonActive]}>
                <Text style={[styles.buttonText, globalFilter === null && styles.buttonTextActive]}>Все</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {subcategories?.map(sc => (
                <TouchableOpacity
                  key={sc.id}
                  onPress={() => handlePickSubcategory(sc.id)}
                  style={[
                    styles.button,
                    selectedSubId === sc.id && styles.buttonActive
                  ]}
                >
                  <Text style={selectedSubId === sc.id ? styles.buttonTextActive : styles.buttonText}>
                    {sc.name}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Кнопка «Все» для сброса */}
              <TouchableOpacity
                onPress={() => setSelectedSubId(null)}
                style={[styles.button, selectedSubId === null && styles.buttonActive]}
              >
                <Text style={[styles.buttonText, selectedSubId === null && styles.buttonTextActive]}>
                  Все
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* модал выбора города */}
          <Modal visible={visible} transparent>
            <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={() => setVisible(false)}>
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
      )}
      renderItem={({ item }) => (
        <View style={{ width: '50%', alignItems: 'center' }}>
          <ProductCard
            key={item.id}
            id={item.id}
            title={item.title}
            image={item.images?.[0]?.image || null}
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
        !isLoading && !isFetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 18, color: '#777' }}>
              {isError ? (error?.data?.detail || 'Нет постов') : 'Нет постов'}
            </Text>
          </View>
        ) : null
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    borderColor: '#999',
    borderWidth: 1,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  buttonActive: {
    backgroundColor: '#F7F4E9',
    borderColor: '#E67E0E',
  },
  buttonTextActive: {
    color: '#E67E0E',
    fontWeight: '600',
  },  
  buttonText: { fontSize: 13, color: '#777' },

  filtersRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 10,
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
