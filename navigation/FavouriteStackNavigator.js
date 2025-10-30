import React, { Component } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {FavouriteScreen} from '../screens/FavouriteScreen'
import BackButton from '../components/ui/BackButton';

const Main = createNativeStackNavigator();

export default function FavouriteStackNavigator() {
    return (
        <Main.Navigator
            screenOptions={({ navigation }) => ({
                headerShadowVisible:false,
                headerTitle: 'Избранные',
                headerBackTitleVisible:false,
                headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
            })}
        >
            <Main.Screen name='Home' component={FavouriteScreen} options={{ headerShown: false }} />
        </Main.Navigator>
    )
}