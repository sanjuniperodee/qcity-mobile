import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Text } from 'react-native';
import { useGetCategoriesListQuery } from '../api';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

export const CreatePostCategoryScreen = () => {
  const { data, isLoading, isError } = useGetCategoriesListQuery();
  const navigation = useNavigation();
  const auth = useSelector((state) => state.auth);
  const isAuthenticated = !!auth?.isAuthenticated && !!auth?.token;

  const iconMap = {
    'Услуги': 'briefcase-outline',
    'Товары': 'cart-outline',
    'Найти сотрудника': 'people-outline',
    'Охранные агентства': 'shield-checkmark-outline',
    'Пром. безопасность': 'warning-outline',
    'Обучение ПБ': 'school-outline',
    'Прочее': 'ellipsis-horizontal-circle-outline',
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate('CreatePost', {
          categoryParam: item.name,
          categoryId: item.id,
        })
      }
    >
      <Ionicons
        name={iconMap[item.name] || 'apps-outline'}
        size={28}
        color="#F09235"
        style={{ marginRight: 16 }}
      />
      <Text style={styles.text}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={60} color="#F09235" style={{ marginBottom: 20 }} />
        <Text style={styles.title}>Чтобы создать объявление</Text>
        <Text style={styles.subtitle}>Войдите или зарегистрируйтесь</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => {
            const parent = navigation.getParent?.();
            if (parent) {
              parent.navigate('Auth', { screen: 'LoginOrRegistration' });
            } else {
              navigation.navigate('Auth', { screen: 'LoginOrRegistration' });
            }
          }}
        >
          <Text style={styles.authButtonText}>Войти / Зарегистрироваться</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F09235" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Ошибка загрузки категорий</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Выберите категорию</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'medium',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#6B7280',
    marginBottom: 20,
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
  authButton: {
    backgroundColor: '#F09235',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  authButtonText: {
    color: '#fff',
    fontFamily: 'medium',
    fontSize: 16,
  },
});
