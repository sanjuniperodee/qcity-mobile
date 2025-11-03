import React, { Component,useEffect,useState } from 'react';
import { View, Image, StyleSheet, Text, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainStackNavigator from './MainStackNavigator'
import FavoriteStackNavigator from './FavouriteStackNavigator'
import MessagesStackNavigator from './MessagesStackNavigator'
import ProfileStackNavigator from './ProfileStackNavigator'
import CreatePostStackNavigation from './CreatePostStackNavigation'
import {useTranslation} from 'react-i18next'

const Tab = createBottomTabNavigator();

export default function BottomTabNavigation () {
    const {t} = useTranslation();
    const screenWidth = Dimensions.get('window').width;
    const isTablet = screenWidth >= 768;
    return (
        <View style={styles.container}>
            <Tab.Navigator
                initialRouteName={'HomeTab'}
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarLabelStyle: {
                        fontSize: 11,
                        marginTop: 4,
                        marginBottom: 2,
                    },
                    tabBarItemStyle: {
                        paddingVertical: 4,
                        flex: 1,
                    },
                    tabBarStyle: {
                        backgroundColor: '#FFF',
                        borderTopWidth: 0,
                        position: 'absolute',
                        borderTopWidth: 0, 
                        width: '100%',
                        alignSelf: 'center',
                        paddingHorizontal: 0,
                        borderTopLeftRadius:15,
                        borderTopRightRadius:15,
                        elevation: 0,
                        marginBottom:0,
                        zIndex:2,
                    },
                })}
                >
                <Tab.Screen name="HomeTab" component={MainStackNavigator}
                    listeners={{
                        tabPress: (e) => {
                          // Reset to top when tab is pressed
                          // This is handled by useScrollToTop in MainScreen
                        },
                      }}
                    options={{
                        tabBarLabel: t('tabs_short.home'),
                        tabBarIcon: ({focused}) => focused ? 
                        <TabIcon image={require('../assets/mainIconActive.png')}/> : 
                        <TabIcon image={require('../assets/mainIcon.png')}/>,
                    }}
                />
                <Tab.Screen
                    name={t("tabs.feed")}
                    component={FavoriteStackNavigator}
                    options={{
                        tabBarLabel: t('tabs_short.favorites'),
                        tabBarIcon: ({focused}) => focused ? 
                        <TabIcon image={require('../assets/Heart.png')}/> : 
                        <TabIcon image={require('../assets/Favorite.png')}/>,
                    }}
                />
                <Tab.Screen
                    name={t("tabs.create_new")}
                    component={CreatePostStackNavigation}
                    options={{
                        tabBarLabel: t('tabs_short.add'),
                        tabBarIcon: () =>  
                        <CreateTabIcon image={require('../assets/createPostIcon.png')}/> 
                    }}
                />
                <Tab.Screen
                    name={t("tabs.messages")}
                    component={MessagesStackNavigator}
                    options={{
                        tabBarLabel: t('tabs_short.messages'),
                        tabBarIcon: ({focused}) => focused ? 
                        <TabIcon image={require('../assets/messagesIconActive.png')}/> : 
                        <TabIcon image={require('../assets/messagesIcon.png')}/>,
                    }}
                />
                <Tab.Screen
                    name={t("tabs.profile")}
                    component={ProfileStackNavigator}
                    options={{
                        tabBarLabel: t('tabs_short.profile'),
                        tabBarIcon: ({focused}) => focused ? 
                        <TabIcon image={require('../assets/profileIconActive.png')}/> : 
                        <TabIcon image={require('../assets/profileIcon.png')}/>,
                    }}
                />
            </Tab.Navigator>
        </View>
    )
}
function TabIcon({image}) {
    return (
        <View>
            <Image source={image} style={styles.Icon}/>
        </View>
    );
}

function CreateTabIcon({image}) {
    return (
        <View>
            <Image source={image} style={styles.CreatePostIcon}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:10,
        backgroundColor:'transparent'
      },
      backgroundImage: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 20,
        zIndex: 1,
      },

    Icon: {
        width: 18,
        height: 16,
        resizeMode: 'contain'
    },
    CreatePostIcon: {
        width:22,
        height:20,
    },
    tabBarLabel: {
        fontSize: 10, 
        fontFamily:'regular',
        color: '#9C9C9C',
    },
    tabBarLabelActive: {
        fontSize: 10, 
        fontFamily:'regular',
        color: '#F09235',
    },
    
});