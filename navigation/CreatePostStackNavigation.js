import React, { Component } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {CreatePostScreen} from '../screens/CreatePostScreen'
import {CreatePostCategoryScreen} from '../screens/CreatePostCategoryScreen'
import {CreatePostSuccessScreen} from '../screens/CreatePostSuccessScreen'
import {CreatePostTarrifsScreen} from '../screens/CreatePostTarrifsScreen'
import {CreatePostPayScreen} from '../screens/CreatePostPayScreen'

const Main = createNativeStackNavigator();

export default function CreatePostStackNavigation() {
    return (
        <Main.Navigator>
            <Main.Screen 
                name='CreatePostCategory' 
                component={CreatePostCategoryScreen}
                options={({ navigation }) => ({
                    headerShadowVisible:false,
                    title: null,
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                            <Text style={{fontFamily:'bold',fontSize:24,marginLeft:15}}>Новое объявления</Text>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='CreatePost' 
                component={CreatePostScreen}
                options={({ navigation }) => ({
                    headerShadowVisible:false,
                    title: null,
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                            <Text style={{fontFamily:'bold',fontSize:24,marginLeft:15}}>Новое объявления</Text>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='PostTariffs' 
                component={CreatePostTarrifsScreen}
                options={({ navigation }) => ({
                    headerShadowVisible:false,
                    title: null,
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                            <Text style={{fontFamily:'bold',fontSize:24,marginLeft:15}}>Тарифы</Text>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='Pay' 
                component={CreatePostPayScreen}
                options={({ navigation }) => ({
                    headerShadowVisible:false,
                    title: null,
                    headerLeft: () => (
                        <View style={styles.HeaderRight}>
                            <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                            <Text style={{fontFamily:'bold',fontSize:24,marginLeft:15}}>Тарифы</Text>
                        </View>
                    ),
                    })}/>
            <Main.Screen 
                name='PostCreated' 
                component={CreatePostSuccessScreen}
                options={({ navigation }) => ({
                    headerShadowVisible:false,
                    title: null,
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
        style={styles.Icon}/>
    </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    Icon: {
        width: 16,
        height: 32,
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