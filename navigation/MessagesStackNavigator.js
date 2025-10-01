import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {View,StyleSheet,Text, TouchableOpacity, Image} from 'react-native';
import { MessagesMainScreen } from '../screens/MessagesMainScreen';
import { MessagesDmScreen } from '../screens/MessagesDmScreen';

const Stack = createNativeStackNavigator();

const MessagesStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Messages"
        component={MessagesMainScreen}
        options={({ navigation }) => ({
          headerShadowVisible:false,
          title: null,
          headerLeft: () => (
              <View style={styles.HeaderRight}>
                  <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                  <Text style={{fontFamily:'bold',fontSize:24,marginLeft:15}}>Сообщения</Text>
              </View>
          ),
          })}/>
      <Stack.Screen name="MessagesDm"
        component={MessagesDmScreen}
        options={({ navigation }) => ({
          headerShadowVisible:false,
          tabBarVisible: false,
          title: null,
          headerLeft: () => (
              <View style={styles.HeaderRight}>
                  <HeaderIcon source={require('../assets/goback.png')} onPress={() => navigation.goBack()}/>
                  <Text style={{fontFamily:'bold',fontSize:24,marginLeft:15}}>Сообщения</Text>
              </View>
          ),
          })}/>
    </Stack.Navigator>
  );
};

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

export default MessagesStackNavigator;
