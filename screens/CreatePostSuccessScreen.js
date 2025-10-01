import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, Button,TextInput,Pressable, TouchableOpacity, FlatList, ScrollView, Image, Text } from 'react-native';

export const CreatePostSuccessScreen = () => {
    const navigation = useNavigation()
    return (
        <View style={{alignSelf:'center',marginTop:200,width:'80%'}}>
            <Text style={{fontSize:30,fontFamily:'bold',color:'#F26D1D',textAlign:'center'}}>Пост успешно создан</Text>
            <Text style={{fontSize:15,marginTop:20,fontFamily:'regular',color:'#444',textAlign:'center'}}>Пост направлен на модерацию. Обычно модерацию поста занимает не больше дня</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Главная',{screen:'Home'})}><Text style={{fontSize:15,marginTop:30,fontFamily:'medium',color:'#111',textAlign:'center'}}>Вернутся на главную</Text></TouchableOpacity>
        </View>
    )
}