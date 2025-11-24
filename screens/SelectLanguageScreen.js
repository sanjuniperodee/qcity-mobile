import React, { useEffect } from 'react';
import { View, StyleSheet,  TouchableOpacity, TouchableWithoutFeedback, FlatList, ScrollView, RefreshControl, Dimensions, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';


export const SelectLanguageScreen = () => {
    const navigation = useNavigation()
    const { t, i18n } = useTranslation();
    
    const handleLanguage = (language) => {
        i18n.changeLanguage(language)
        try { 
            if (typeof window !== 'undefined') window.localStorage.setItem('lng', language); 
        } catch (e) {
            console.error("Error saving language to localStorage:", e);
        }
        
        // Force reload of all translations
        setTimeout(() => {
            navigation.navigate('LoginOrRegistration')
        }, 100);
    }
    return (
        <View style={{alignItems:'center',width:'90%',marginHorizontal:'5%',marginTop:80}}>
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
            <Text style={{ fontFamily: 'bold',fontSize:25, textAlign:'center',marginTop:20}} >{t('select_language.select_language')}</Text>
            <Text style={{ fontFamily: 'regular',fontSize:15,color:"#96949D",width:253,lineHeight:21,marginTop:10, textAlign:'center' }} >{t('select_language.you_could_change_language')}</Text>

            <View style={{marginTop:220,flexDirection:'row',justifyContent:'center',alignItems:'center',width:'100%',gap:10}}>
                <TouchableOpacity onPress={() => {handleLanguage('kz')}} style={{paddingVertical:15,backgroundColor:'#F7F8F9',borderRadius:10,alignItems:'center',borderColor:'#D6D6D6',borderWidth:1,flex:1}}>
                    <Text style={{color:'#F09235',fontSize:16,}}>{t('kaz')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {handleLanguage('ru')}} style={{paddingVertical:15,backgroundColor:'#F7F8F9',borderRadius:10,alignItems:'center',borderColor:'#D6D6D6',borderWidth:1,flex:1}}>
                    <Text style={{color:'#F09235',fontSize:16,}}>{t('rus')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {handleLanguage('en')}} style={{paddingVertical:15,backgroundColor:'#F7F8F9',borderRadius:10,alignItems:'center',borderColor:'#D6D6D6',borderWidth:1,flex:1}}>
                    <Text style={{color:'#F09235',fontSize:16,}}>{t('eng')}</Text>
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