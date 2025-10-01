import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {LoginScreen} from '../screens/LoginScreen';
import {SignUpScreen} from '../screens/SignUpScreen';
import {LoginOrRegistrationScreen} from '../screens/LoginOrRegistrationScreen';
import {ProfileRegistrationScreen} from '../screens/ProfileRegistrationScreen';
import {SelectLanguageScreen} from '../screens/SelectLanguageScreen';
import {View} from 'react-native';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SelectLanguage"
        component={SelectLanguageScreen}
        options={() => ({
          headerShadowVisible: false,
          title: null,
          headerLeft: () => (
            <View></View>
          ),
          })}/>
      <Stack.Screen name="Login"
        component={LoginScreen}
        options={() => ({
          headerShadowVisible: false,
          title: null,
          headerLeft: () => (
            <View></View>
          ),
          })}/>
      <Stack.Screen name="Signup" component={SignUpScreen} 
        options={() => ({

          headerShadowVisible: false,
          title: null,
          headerLeft: () => (
            <View></View>
          ),
          })}/>
      <Stack.Screen name="LoginOrRegistration" component={LoginOrRegistrationScreen} 
        options={() => ({
          headerShadowVisible: false,
          title: null,
          headerLeft: () => (
            <View></View>
          ),
          })}/>
      <Stack.Screen name="Profile" component={ProfileRegistrationScreen} 
        options={() => ({
          headerShadowVisible: false,
          title: null,
          headerLeft: () => (
            <View></View>
          ),
          })}/>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} 
        options={() => ({
          headerShadowVisible: false,
          title: null,
          headerLeft: () => (
            <View></View>
          ),
          })}/>
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} 
        options={() => ({
          headerShadowVisible: false,
          title: null,
          headerLeft: () => (
            <View></View>
          ),
          })}/>
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
