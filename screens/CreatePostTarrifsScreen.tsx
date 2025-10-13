import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Image, Text, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";

export const CreatePostTarrifsScreen = ({route}) => {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const navigation = useNavigation();
  const id = route.params.id;
  console.log('id',id);

  const user = useSelector(state => state.auth.token);
  

  useEffect(() => {
    getOfferings();
    getCustomerInfo();
  }, []);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log("📢 customerInfo", JSON.stringify(customerInfo, null, 2));
  }

  const sendPostRequest = async () => { 
    const apiUrl = `https://market.qorgau-city.kz/api/posts/${id}/pay/`; 
    try {
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Authorization':`Token ${user}`,
          'Content-Type': 'application/json'
      },
      });
      const data = await response.json();
      if (response.status === 200) {
        console.log('✅ Post edited successfully');
      } else {
        console.log('❌ Error editing post:', data.detail);
      }
    } catch (err) {
      console.log('⚠️ Network error:', err);
    }
  }

  const handleSubscribe = async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);

      if (customerInfo.entitlements.active["Pro"]) {
        console.log("✅ Subscribed to Pro successfully");

        await sendPostRequest();
        navigation.navigate("PostCreated");
      } else {
        Alert.alert("Ошибка", "Покупка завершена, но подписка не активна.");
      }
    } catch (e: any) {
      if (e.userCancelled || e.code === PURCHASES_ERROR_CODE.PurchaseCancelledError) {
        console.log("❌ User cancelled purchase");
        Alert.alert("Отмена", "Вы отменили покупку.");
      } else {
        console.log("⚠️ Purchase failed: ", e);
        Alert.alert("Ошибка", "Что-то пошло не так. Попробуйте ещё раз.");
      }
    }
  };

  async function getOfferings() {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      setOfferings(offerings);
    }
  }

  return (
    <ScrollView style={{alignSelf:'center',marginTop:0,width:'90%'}}>
      <Image style={{width:200,height:80,alignSelf:'center',marginTop:30,resizeMode:'contain'}} source={require('../assets/logo.jpg')} />
      <Text style={{fontSize:24,fontFamily:'medium',textAlign:'center',marginTop:20}}>Выберите тариф</Text>
      {offerings?.current?.availablePackages.map((pkg) => (
        <TouchableOpacity 
          onPress={() => handleSubscribe(pkg)} 
          style={{borderRadius:10,width:'100%',borderWidth:1,borderColor:'#F09235',marginTop:20}} 
          key={pkg.identifier}
        >
          <Text style={{textAlign:'center',fontSize:24,fontWeight:'bold',color:'#F09235',marginTop:15}}>
            {pkg.product.title}
          </Text>
          <Text style={{color:'#96949D',fontSize:14,textAlign:'center',fontFamily:'regular'}}>
            {pkg.product.description}
          </Text>
          <Text style={{backgroundColor:'#F09235',width:'100%',textAlign:'center',paddingVertical:5,marginTop:25,marginBottom:15,fontSize:24,fontWeight:'bold',color:'#F7F8F9'}}>
            {pkg.product.priceString}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity 
        onPress={()=>{navigation.navigate('PostCreated')}} 
        style={{borderRadius:10,width:'100%',borderWidth:1,borderColor:'#D6D6D6',marginTop:20}}
      >
        <Text style={{textAlign:'center',fontSize:24,fontWeight:'bold',color:'#444',marginTop:15}}>Бесплатное</Text>
        <Text style={{color:'#96949D',fontSize:14,textAlign:'center',fontFamily:'regular'}}>Размещение объявления</Text>
        <Text style={{backgroundColor:'#D6D6D6',width:'100%',textAlign:'center',paddingVertical:5,marginTop:25,marginBottom:15,fontSize:24,fontWeight:'bold',color:'#F7F8F9'}}>0₸</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
