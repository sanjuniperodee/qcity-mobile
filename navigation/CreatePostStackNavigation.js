import React, { Component } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {CreatePostScreen} from '../screens/CreatePostScreen'
import {CreatePostCategoryScreen} from '../screens/CreatePostCategoryScreen'
import {CreatePostSuccessScreen} from '../screens/CreatePostSuccessScreen'
import {CreatePostTarrifsScreen} from '../screens/CreatePostTarrifsScreen'
import {CreatePostPayScreen} from '../screens/CreatePostPayScreen'
import BackButton from '../components/ui/BackButton';

const Main = createNativeStackNavigator();

export default function CreatePostStackNavigation() {
    return (
        <Main.Navigator
            screenOptions={({ navigation }) => ({
                headerShadowVisible:false,
                headerTitle: '',
                headerBackTitleVisible:false,
                headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
            })}
        >
            <Main.Screen 
                name='CreatePostCategory' 
                component={CreatePostCategoryScreen}
                options={() => ({ headerTitle: 'Новое объявления' })}/>
            <Main.Screen 
                name='CreatePost' 
                component={CreatePostScreen}
                options={() => ({ headerTitle: 'Новое объявления' })}/>
            <Main.Screen 
                name='PostTariffs' 
                component={CreatePostTarrifsScreen}
                options={() => ({ headerTitle: 'Тарифы' })}/>
            <Main.Screen 
                name='Pay' 
                component={CreatePostPayScreen}
                options={() => ({ headerTitle: 'Тарифы' })}/>
            <Main.Screen 
                name='PostCreated' 
                component={CreatePostSuccessScreen}
                options={() => ({})}/>
        
        </Main.Navigator>
    )
}