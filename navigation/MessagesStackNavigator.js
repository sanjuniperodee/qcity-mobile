import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {View,StyleSheet,Text, TouchableOpacity, Image} from 'react-native';
import { MessagesMainScreen } from '../screens/MessagesMainScreen';
import { MessagesDmScreen } from '../screens/MessagesDmScreen';
import BackButton from '../components/ui/BackButton';

const Stack = createNativeStackNavigator();

const MessagesStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShadowVisible:false,
        headerTitle: 'Сообщения',
        headerBackTitleVisible:false,
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      })}
    >
      <Stack.Screen name="Messages" component={MessagesMainScreen} />
      <Stack.Screen name="MessagesDm" component={MessagesDmScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});

export default MessagesStackNavigator;
