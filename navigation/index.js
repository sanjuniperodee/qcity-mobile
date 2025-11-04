
import React, { Component } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, StackActions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
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
    

    const linking = {
      prefixes: ['https://www.qcity.kz'],
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
                  FeedTab: {
                    screens: {
                      Home: 'favourites',
                    },
                  },
                  // Создание поста
                  CreateTab: {
                    screens: {
                      CreatePostCategory: 'create',
                      CreatePost: 'create/details',
                      PostTariffs: 'create/tariffs',
                      Pay: 'create/pay',
                      PostCreated: 'create/success',
                    },
                  },
                  // Сообщения
                  MessagesTab: {
                    screens: {
                      Messages: 'messages',
                      MessagesDm: 'messages/:username',
                    },
                  },
                  // Профиль
                  ProfileTab: {
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
                      adminApproved: 'profile/admin/approved',
                      adminRejected: 'profile/admin/rejected',
                      adminUsers: 'profile/admin/users',
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
        <SafeAreaProvider>
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
        </SafeAreaProvider>
    );
  }
