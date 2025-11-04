import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {View,StyleSheet,Text,TouchableOpacity,Image} from 'react-native';
import BackButton from '../components/ui/BackButton';
import { ProfileMainScreen } from '../screens/ProfileMainScreen';
import { ProfilePolicyScreen } from '../screens/ProfilePolicyScreen';
import { ProfileTermsScreen } from '../screens/ProfileTermsScreen';
import { ProfileAboutScreen } from '../screens/ProfileAboutScreen';
import { ProfileTariffsScreen } from '../screens/ProfileTariffsScreen';
import { ProfileActiveScreen } from '../screens/ProfileActiveScreen';
import { ProfileApproveScreen } from '../screens/ProfileApproveScreen';
import { ProfileNotActiveScreen } from '../screens/ProfileNotActiveScreen';
import { ProfileNotPayedScreen } from '../screens/ProfileNotPayedScreen';
import { ProfileDeletedScreen } from '../screens/ProfileDeletedScreen';
import { ProfileRejectedScreen } from '../screens/ProfileRejectedScreen';
import { ProfileadminScreen } from '../screens/ProfileadminScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { ProfileFavouriteScreen } from '../screens/ProfileFavouriteScreen';
import { EditPostScreen } from '../screens/EditPostScreen';
import {CreatePostTarrifsScreen} from '../screens/CreatePostTarrifsScreen'
import {CreatePostPayScreen} from '../screens/CreatePostPayScreen'

const Stack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShadowVisible:false,
        headerTitle: '',
        headerBackTitleVisible:false,
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      })}
    >
      <Stack.Screen name="Profile" component={ProfileMainScreen} options={() => ({ headerTitle: 'Ваш профиль' })}/>
      <Stack.Screen name="Policy" component={ProfilePolicyScreen} options={() => ({ headerTitle: 'Политика конфиденциальности' })}/>
      <Stack.Screen name="Terms" component={ProfileTermsScreen} options={() => ({ headerTitle: 'Условия пользования' })}/>
      <Stack.Screen name="about" component={ProfileAboutScreen} options={() => ({ headerTitle: 'О приложении' })}/>
      <Stack.Screen name="tariffs" component={ProfileTariffsScreen} options={() => ({ headerTitle: 'Тарифы' })}/>
      <Stack.Screen name="active" component={ProfileActiveScreen} options={() => ({ headerTitle: 'Активные' })}/>
      <Stack.Screen name="edit" component={EditPostScreen} options={() => ({ headerTitle: 'Редактирование поста' })}/>
      <Stack.Screen name="approve" component={ProfileApproveScreen} options={() => ({ headerTitle: 'Модерация' })}/>
      <Stack.Screen name="Favourite" component={ProfileFavouriteScreen} options={() => ({ headerTitle: 'Избранные' })}/>
      <Stack.Screen name="notactive" component={ProfileNotActiveScreen} options={() => ({ headerTitle: 'Не активные' })}/>
      <Stack.Screen name="notpayed" component={ProfileNotPayedScreen} options={() => ({ headerTitle: 'Не оплаченные' })}/>
      <Stack.Screen name="deleted" component={ProfileDeletedScreen} options={() => ({ headerTitle: 'Удаленные' })}/>
      <Stack.Screen name="rejected" component={ProfileRejectedScreen} options={() => ({ headerTitle: 'Отклоненные' })}/>
      <Stack.Screen name="admin" component={ProfileadminScreen} options={() => ({ headerTitle: 'Админ панель' })}/>
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} options={() => ({ headerTitle: 'Настройки профиля' })}/>

        <Stack.Screen name='PostTariffs' component={CreatePostTarrifsScreen} options={() => ({ headerTitle: 'Тарифы' })}/>
        <Stack.Screen name='Pay' component={CreatePostPayScreen} options={() => ({ headerTitle: 'Тарифы' })}/>
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

export default ProfileStackNavigator;
