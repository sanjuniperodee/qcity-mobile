import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

export const ProfileTariffsScreen = () => {
  const navigation = useNavigation();
  const { tarifs } = useSelector((state: any) => state.auth);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тарифы</Text>
      <Text style={styles.description}>
        Выберите тариф и оплатите, чтобы ваш пост был опубликован на главной странице.
      </Text>
      <View style={styles.tariffsContainer}>
        {tarifs.map((tariff: any) => (
          <TouchableOpacity
            key={tariff.id}
            style={styles.tariff}
            onPress={() => navigation.navigate('CreatePostPay', { tariff: tariff.id })}
          >
            <Text style={styles.tariffTitle}>{tariff.title}</Text>
            <Text style={styles.tariffPrice}>{tariff.price} р</Text>
            <Text style={styles.tariffDescription}>{tariff.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  tariffsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tariff: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    marginRight: 8,
  },
  tariffTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tariffPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  tariffDescription: {
    fontSize: 14,
    color: '#999',
  },
});

