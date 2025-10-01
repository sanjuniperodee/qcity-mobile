import React, { useState } from 'react';
import { View, TextInput,Pressable, TouchableOpacity, Image, Text,StyleSheet } from 'react-native';


export const CreateHouseInfo = () => {
    const [house1, onChangeHouse1] = useState('');
    const [house2, onChangeHouse2] = useState('');
    const [house3, onChangeHouse3] = useState('');

      // House
  
  // 
  
  const [renovation, setRenovation] = useState(null);
  const [heating, setHeating] = useState(null);

  const [renovationOpen, setRenovationOpen] = useState(false);
  
  const togglerenovation = () => {
    setRenovationOpen(!renovationOpen);
  };

  // 

  const [heatingOpen, setHeatingOpen] = useState(false);

  const toggleheating = () => {
    setHeatingOpen(!heatingOpen);
  };

  // 

  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);

  const togglepropertyType = () => {
    setPropertyTypeOpen(!propertyTypeOpen);
  };

  // 

  const [furnishingOpen, setFurnishingOpen] = useState(false);

  const togglefurnishing = () => {
    setFurnishingOpen(!furnishingOpen);
  };

  // 

  const [buildingOpen, setBuildingOpen] = useState(false);

  const togglebuilding = () => {
    setBuildingOpen(!buildingOpen);
  };

  // 

    return(
        <>
            <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>Количество комнат</Text>
            <TextInput
              style={{width:'100%',paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6',backgroundColor:'#F7F8F9'}}
              onChangeText={onChangeHouse1}
              value={house1}
              placeholder="Количество комнат"
              maxLength={70}
            />

            <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>Общая площадь</Text>
            <TextInput
              style={{width:'100%',paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6',backgroundColor:'#F7F8F9'}}
              onChangeText={onChangeHouse2}
              value={house2}
              placeholder="Общая площадь"
              maxLength={70}
            />

            <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>Ремонт</Text>
            <Pressable onPress={togglerenovation} style={styles.profileButton}>
              <Text style={{ fontFamily: 'regular', fontSize: 14,color:'#96949D' }}>{renovation ? renovation : 'Ремонт'}</Text>
              <Image style={{ height: 16, width: 8,transform: [{ rotate: renovationOpen ? '270deg' : '90deg' }],marginRight: 5 }} source={require('../assets/arrow-right.png')} />
            </Pressable>
            {renovationOpen ? 
                <View style={{backgroundColor: '#F7F8F9',borderEndEndRadius: 5,marginTop:-3,borderBottomLeftRadius: 5,borderColor: '#D6D6D6',borderWidth: 1,paddingVertical:10}}>
                    <TouchableOpacity 
                        onPress={() => {
                            setRenovation('Евро ремонт');
                            togglerenovation();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Евро ремонт</Text></TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setRenovation('Белый каркас');
                            togglerenovation();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Белый каркас</Text></TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setRenovation('Частичная отделка');
                            togglerenovation();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Частичная отделка</Text></TouchableOpacity>
                </View>
            : null}

            <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>Отопление</Text>
            <Pressable onPress={togglestatement} style={styles.profileButton}>
              <Text style={{ fontFamily: 'regular', fontSize: 14,color:'#96949D' }}>{heating ? heating : 'Центральное'}</Text>
              <Image style={{ height: 16, width: 8,transform: [{ rotate: statementOpen ? '270deg' : '90deg' }],marginRight: 5 }} source={require('../assets/arrow-right.png')} />
            </Pressable>
            {heatingOpen ? 
                <View style={{backgroundColor: '#F7F8F9',borderEndEndRadius: 5,marginTop:-3,borderBottomLeftRadius: 5,borderColor: '#D6D6D6',borderWidth: 1,paddingVertical:10}}>
                    <TouchableOpacity 
                        onPress={() => {
                            setHeating('Новый');
                            toggleheating();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Новый</Text></TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setHeating('Б/У');
                            toggleheating();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Б/У</Text></TouchableOpacity>
                </View>
            : null}
            <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>От хозяина</Text>
            <Pressable onPress={togglestatement} style={styles.profileButton}>
              <Text style={{ fontFamily: 'regular', fontSize: 14,color:'#96949D' }}>{propertyType ? statement : 'Тип собственности'}</Text>
              <Image style={{ height: 16, width: 8,transform: [{ rotate: statementOpen ? '270deg' : '90deg' }],marginRight: 5 }} source={require('../assets/arrow-right.png')} />
            </Pressable>
            {propertyTypeOpen ? 
                <View style={{backgroundColor: '#F7F8F9',borderEndEndRadius: 5,marginTop:-3,borderBottomLeftRadius: 5,borderColor: '#D6D6D6',borderWidth: 1,paddingVertical:10}}>
                    <TouchableOpacity 
                        onPress={() => {
                            setStatement('Новый');
                            togglestatement();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Новый</Text></TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setStatement('Б/У');
                            togglestatement();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Б/У</Text></TouchableOpacity>
                </View>
            : null}
            <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>Меблирование</Text>
            <Pressable onPress={togglestatement} style={styles.profileButton}>
              <Text style={{ fontFamily: 'regular', fontSize: 14,color:'#96949D' }}>{statement ? statement : 'Полное'}</Text>
              <Image style={{ height: 16, width: 8,transform: [{ rotate: statementOpen ? '270deg' : '90deg' }],marginRight: 5 }} source={require('../assets/arrow-right.png')} />
            </Pressable>
            {statementOpen ? 
                <View style={{backgroundColor: '#F7F8F9',borderEndEndRadius: 5,marginTop:-3,borderBottomLeftRadius: 5,borderColor: '#D6D6D6',borderWidth: 1,paddingVertical:10}}>
                    <TouchableOpacity 
                        onPress={() => {
                            setStatement('Новый');
                            togglestatement();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Новый</Text></TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setStatement('Б/У');
                            togglestatement();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Б/У</Text></TouchableOpacity>
                </View>
            : null}
            <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>Тип строения</Text>
            <Pressable onPress={togglestatement} style={styles.profileButton}>
              <Text style={{ fontFamily: 'regular', fontSize: 14,color:'#96949D' }}>{statement ? statement : 'Панельный'}</Text>
              <Image style={{ height: 16, width: 8,transform: [{ rotate: statementOpen ? '270deg' : '90deg' }],marginRight: 5 }} source={require('../assets/arrow-right.png')} />
            </Pressable>
            {statementOpen ? 
                <View style={{backgroundColor: '#F7F8F9',borderEndEndRadius: 5,marginTop:-3,borderBottomLeftRadius: 5,borderColor: '#D6D6D6',borderWidth: 1,paddingVertical:10}}>
                    <TouchableOpacity 
                        onPress={() => {
                            setStatement('Новый');
                            togglestatement();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Новый</Text></TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setStatement('Б/У');
                            togglestatement();
                        }} 
                        style={{width:'100%',paddingVertical:10,paddingHorizontal:15,}}><Text style={{color:'#96949D',fontSize:13}}>Б/У</Text></TouchableOpacity>
                </View>
            : null}

            <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>Год постройки</Text>
            <TextInput
              style={{width:'100%',paddingHorizontal:10,height:50,borderWidth:1,borderRadius:10,borderColor:'#D6D6D6',backgroundColor:'#F7F8F9'}}
              onChangeText={onChangeHouse3}
              value={house3}
              placeholder="Год постройки"
              maxLength={70}
            />
          </>
    )
}

const styles = StyleSheet.create({
    profileButton: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#F7F8F9',
      borderRadius: 5,
      borderColor: '#D6D6D6',
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 17,
    },
  });
  
