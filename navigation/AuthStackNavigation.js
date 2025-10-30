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
import PhoneOtpScreen from '../screens/PhoneOtpScreen';
import BackButton from '../components/ui/BackButton';

const Stack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShadowVisible: false,
        headerTitle: '',
        headerBackTitleVisible: false,
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      })}
    >
      <Stack.Screen name="SelectLanguage" component={SelectLanguageScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignUpScreen} />
      <Stack.Screen name="LoginOrRegistration" component={LoginOrRegistrationScreen} />
      <Stack.Screen name="Profile" component={ProfileRegistrationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="PhoneOtp" component={PhoneOtpScreen} />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
