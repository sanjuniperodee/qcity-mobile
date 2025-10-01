
import React, { Component } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigation from './BottomTabNavigation'
import { useSelector } from 'react-redux';
import AuthStackNavigator from './AuthStackNavigation';



export default function Navigation() {

    const theme = {...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#FFFFFF',
        },
      };
    

    return (
        <NavigationContainer theme={theme}>
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

  const Stack = createNativeStackNavigator()
