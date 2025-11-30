
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
      prefixes: ['https://www.qcity.kz', 'qcity://'],
      config: {
        screens: {
          root: {
            path: '',
            screens: {
              HomeTab: {
                path: '',
                screens: {
                  Home: {
                    path: '',
                    exact: true,
                  },
                  ViewPost: 'post/:id',
                  ViewUser: 'user/:username',
                  ResultsSearchScreen: 'search/results',
                  SearchScreen: 'search',
                  GetPostsByCity: 'city/:city',
                  GetPostsByCategory: 'category/:id',
                  QorgauAi: 'ai',
                  Support: 'support',
                },
              },
              // Избранные
              FeedTab: {
                path: 'favourites',
                screens: {
                  Home: '',
                },
              },
              // Создание поста
              CreateTab: {
                path: 'create',
                screens: {
                  CreatePostCategory: '',
                  CreatePost: 'details',
                  PostTariffs: 'tariffs',
                  Pay: 'pay',
                  PostCreated: 'success',
                },
              },
              MessagesTab: {
                path: 'messages',
                screens: {
                  Messages: '',
                  MessagesDm: ':username',
                },
              },
              ProfileTab: {
                path: 'profile',
                screens: {
                  Profile: '',
                  Policy: 'policy',
                  Terms: 'terms',
                  about: 'about',
                  tariffs: 'tariffs',
                  active: 'active',
                  edit: 'edit/:postId?',
                  approve: 'approve',
                  Favourite: 'favourites',
                  notactive: 'not-active',
                  notpayed: 'not-paid',
                  deleted: 'deleted',
                  admin: 'admin',
                  adminApproved: 'admin/approved',
                  adminRejected: 'admin/rejected',
                  adminUsers: 'admin/users',
                  ProfileSettings: 'settings',
                  PostTariffs: 'tariffs/select',
                  Pay: 'pay',
                },
              },
            },
          },
          Auth: {
            path: 'auth',
            screens: {
              SelectLanguage: 'lang',
              LoginOrRegistration: '',
              Login: 'login',
              Signup: 'signup',
              PhoneOtp: 'otp',
              Profile: 'profile',
              ForgotPassword: 'forgot',
              ResetPassword: 'reset',
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
