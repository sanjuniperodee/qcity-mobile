import React, { Component,useState,useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {HomeScreen} from '../screens/MainScreen'
import { PostViewScreen } from '../screens/PostViewScreen';
import { UserViewScreen } from '../screens/UserViewScreen';
import { ResultsSearchScreen } from '../screens/ResultsSearchScreen';
import { GetPostsByCategoryScreen } from '../screens/GetPostsByCategoryScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { GetPostsByCityScreen } from '../screens/GetPostsByCityScreen';
import { QorgauAiScreen } from '../screens/QorgauAiScreen';

const Main = createNativeStackNavigator();

export default function MainStackNavigator({ route, navigation }) {

    return (
        <Main.Navigator>
            <Main.Screen 
                name='Home' 
                component={HomeScreen}
                options={() => ({
                    headerShown:false,
                    title: null,
                    contentStyle:{
                        backgroundColor:'#FFFFFF'
                      }
                    })}/>
            <Main.Screen 
                name='ViewPost' 
                component={PostViewScreen}
                screenOptions={{
                    headerShown: false,
                  }}
                options={({ navigation }) => ({
                    contentStyle:{
                        backgroundColor:'#FFFFFF'
                      },
                    headerShadowVisible:false,
                    title: null,
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='ViewUser' 
                component={UserViewScreen}
                screenOptions={{
                    headerShown: false,
                  }}
                options={({ navigation }) => ({
                    contentStyle:{
                        backgroundColor:'#FFFFFF'
                      },
                    headerShadowVisible:false,
                    title: null,
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='GetPostsByCity' 
                component={GetPostsByCityScreen}
                options={({ route, navigation }) => ({
                    contentStyle:{
                        backgroundColor:'#FFFFFF'
                      },
                    headerShadowVisible:false,
                    title: route.params.categoryName || 'Поиск по городу',
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='ResultsSearchScreen' 
                component={ResultsSearchScreen}
                options={({ navigation }) => ({
                    contentStyle:{
                        backgroundColor:'#FFFFFF'
                      },
                    headerShadowVisible:false,
                    title: 'Поиск',
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='SearchScreen' 
                component={SearchScreen}
                options={({ navigation }) => ({
                    contentStyle:{
                        backgroundColor:'#FFFFFF'
                      },
                    headerShadowVisible:false,
                    title: 'Поиск',
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='GetPostsByCategory' 
                component={GetPostsByCategoryScreen}
                options={({ route, navigation }) => ({
                    contentStyle:{
                        backgroundColor:'#FFFFFF'
                      },
                    headerShadowVisible:false,
                    title: route.params.categoryName || 'Услуги',
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='QorgauAi' 
                component={QorgauAiScreen}
                options={({ route, navigation }) => ({
                    contentStyle:{
                        backgroundColor:'#FFFFFF'
                      },
                    headerShadowVisible:false,
                    title: 'Qorgau AI',
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                        </View>
                    ),
                    })}/>
        
        </Main.Navigator>
    )
}
function HeaderIcon(props) {
    return (
    <TouchableOpacity onPress={props.onPress}>
        <Image source={props.source}
        style={props.side !== "right" ? styles.Icon : styles.rightIcon}/>
    </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    Icon: {
        marginLeft: 13,
        width: 28,
        height: 28,
        resizeMode: 'contain'
    },
    rightIcon: {
        marginLeft: 30,
        width: 24,
        height: 24,
        resizeMode: 'contain'
    },
    HeaderRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    HeaderTitle: {
        fontFamily: 'bold',
        fontSize: 18
    },
});