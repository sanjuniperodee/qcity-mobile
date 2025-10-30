
import React, { Component } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, StackActions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigation from './BottomTabNavigation'
import { useSelector } from 'react-redux';
import AuthStackNavigator from './AuthStackNavigation';

const Stack = createNativeStackNavigator();

export default function Navigation() {

    const theme = {...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#FFFFFF',
        },
      };
    

    const prefix = Linking.createURL('/');
    const linking = {
      prefixes: ['https://www.qcity.kz', prefix],
      config: {
        screens: {
          root: {
            screens: {
              BottomTabNavigation: {
                screens: {
                  // Главная вкладка (MainStackNavigator)
                  HomeTab: {
                    screens: {
                      Home: '',
                      ViewPost: 'post/:id',
                      ViewUser: 'user/:username',
                      ResultsSearchScreen: 'search/results',
                      SearchScreen: 'search',
                      GetPostsByCity: 'city/:city',
                      GetPostsByCategory: 'category/:id',
                      QorgauAi: 'ai',
                    },
                  },
                  // Избранные
                  [require('../locales/ru.json').tabs.feed]: {
                    screens: {
                      Home: 'favourites',
                    },
                  },
                  // Создание поста
                  [require('../locales/ru.json').tabs.create_new]: {
                    screens: {
                      CreatePostCategory: 'create',
                      CreatePost: 'create/details',
                      PostTariffs: 'create/tariffs',
                      Pay: 'create/pay',
                      PostCreated: 'create/success',
                    },
                  },
                  // Сообщения
                  [require('../locales/ru.json').tabs.messages]: {
                    screens: {
                      Messages: 'messages',
                      MessagesDm: 'messages/:username',
                    },
                  },
                  // Профиль
                  [require('../locales/ru.json').tabs.profile]: {
                    screens: {
                      Profile: 'profile',
                      Policy: 'profile/policy',
                      Terms: 'profile/terms',
                      about: 'profile/about',
                      tariffs: 'profile/tariffs',
                      active: 'profile/active',
                      edit: 'profile/edit/:postId?',
                      approve: 'profile/approve',
                      Favourite: 'profile/favourites',
                      notactive: 'profile/not-active',
                      notpayed: 'profile/not-paid',
                      deleted: 'profile/deleted',
                      admin: 'profile/admin',
                      ProfileSettings: 'profile/settings',
                      PostTariffs: 'profile/tariffs/select',
                      Pay: 'profile/pay',
                    },
                  },
                },
              },
            },
          },
          Auth: {
            screens: {
              SelectLanguage: 'auth/lang',
              LoginOrRegistration: 'auth',
              Login: 'auth/login',
              Signup: 'auth/signup',
              PhoneOtp: 'auth/otp',
              Profile: 'auth/profile',
              ForgotPassword: 'auth/forgot',
              ResetPassword: 'auth/reset',
            },
          },
        },
      },
      documentTitle: {
        formatter: (_options, route) => `${route?.name ?? 'Qcity'} · Qcity`,
      },
    };

    return (
        <NavigationContainer linking={linking} theme={theme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen component={BottomTabNavigation} name="root"/>
              <Stack.Screen
                name="Auth"
                component={AuthStackNavigator}
                options={{
                  gestureEnabled: false,
                  animation: 'slide_from_right',
                }}
              />
            </Stack.Navigator>
        </NavigationContainer>
    );
  }
