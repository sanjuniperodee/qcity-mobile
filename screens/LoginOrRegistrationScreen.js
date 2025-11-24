import React from 'react';
import { View, TouchableOpacity, Image, Text, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';


export const LoginOrRegistrationScreen = () => {
    const navigation = useNavigation()
    const {t} = useTranslation();
    const { width } = Dimensions.get('window');

    return (
        <View style={{flex:1,alignItems:'center', justifyContent:'center',width:'90%',marginHorizontal:'5%'}}>
            <View style={styles.logoContainer}>
                <LinearGradient
                    colors={['#F3B127', '#F26D1D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.logoGradient}
                >
                    <Text style={styles.logoText}>Qorgau</Text>
                    <Text style={styles.logoSubtext}>City</Text>
                </LinearGradient>
            </View>
            <Text style={{ fontFamily: 'bold',fontSize:25, textAlign:'center',marginTop:20}} >{t('welcome')}</Text>
            <Text style={{ fontFamily: 'regular',fontSize:15,color:"#96949D",width:253,lineHeight:21,marginTop:10, textAlign:'center' }} >{t('welcome_desc')}</Text>

            <View style={{marginTop:165,justifyContent:'center'}}>
                <TouchableOpacity onPress={() => {navigation.navigate('Signup')}} style={{paddingVertical:15,width:width - 40,borderRadius:10,alignItems:'center',borderColor:'#F09235',marginBottom:10,borderWidth:1}}>
                    <Text style={{color:'#F09235',fontSize:16,}}>{t('register.register')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {navigation.navigate('Login')}} style={{paddingVertical:15,width:width - 40,backgroundColor:'#F09235',borderRadius:10,alignItems:'center'}}>
                    <Text style={{color:'#FFF',fontSize:16,}}>{t('login.login')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  }

  const styles = StyleSheet.create({
    logoContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoGradient: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    logoText: {
      fontSize: 22,
      fontFamily: 'bold',
      color: '#FFFFFF',
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    logoSubtext: {
      fontSize: 18,
      fontFamily: 'medium',
      color: '#FFFFFF',
      lineHeight: 20,
      letterSpacing: 0.3,
      marginLeft: 4,
      opacity: 0.95,
    },
  });
