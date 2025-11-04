import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {HomeScreen} from '../screens/MainScreen'
import { PostViewScreen } from '../screens/PostViewScreen';
import { UserViewScreen } from '../screens/UserViewScreen';
import { ResultsSearchScreen } from '../screens/ResultsSearchScreen';
import { GetPostsByCategoryScreen } from '../screens/GetPostsByCategoryScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { GetPostsByCityScreen } from '../screens/GetPostsByCityScreen';
import { QorgauAiScreen } from '../screens/QorgauAiScreen';

import BackButton from '../components/ui/BackButton';

const Main = createNativeStackNavigator();

export default function MainStackNavigator({ route, navigation }) {

    return (
        <Main.Navigator
            screenOptions={({ navigation }) => ({
                headerShadowVisible: false,
                headerTitle: '',
                headerBackTitleVisible: false,
                headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
                contentStyle:{ backgroundColor:'#FFFFFF' }
            })}
        >
            <Main.Screen 
                name='Home' 
                component={HomeScreen}
                options={() => ({ headerShown: false })}/>
            <Main.Screen 
                name='ViewPost' 
                component={PostViewScreen}
                options={() => ({
                    headerTransparent: false,
                    headerStyle: {
                        backgroundColor: '#FFFFFF',
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                        height: 56,
                    },
                    headerTitleStyle: {
                        display: 'none',
                    },
                    headerLeftContainerStyle: {
                        paddingLeft: 8,
                    },
                    headerRightContainerStyle: {
                        paddingRight: 8,
                    },
                })}/>
            <Main.Screen 
                name='ViewUser' 
                component={UserViewScreen}
                options={() => ({})}/>
            <Main.Screen 
                name='GetPostsByCity' 
                component={GetPostsByCityScreen}
                options={({ route }) => ({
                    headerTitle: route.params.categoryName || 'Поиск по городу',
                })}/>
            <Main.Screen 
                name='ResultsSearchScreen' 
                component={ResultsSearchScreen}
                options={() => ({ headerTitle: 'Поиск' })}/>
            <Main.Screen 
                name='SearchScreen' 
                component={SearchScreen}
                options={({ navigation }) => ({
                    contentStyle:{
                        backgroundColor:'#FFFFFF'
                      },
                    headerShadowVisible:false,
                    title: 'Поиск',
                    headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
                    })}/>
            <Main.Screen 
                name='GetPostsByCategory' 
                component={GetPostsByCategoryScreen}
                options={({ route }) => ({ headerTitle: route.params.categoryName || 'Услуги' })}/>
            <Main.Screen 
                name='QorgauAi' 
                component={QorgauAiScreen}
                options={() => ({ headerTitle: 'Qorgau AI' })}/>
        
        </Main.Navigator>
    )
}