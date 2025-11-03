import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal,ActivityIndicator,TextInput,Pressable, TouchableOpacity, Platform, FlatList, ScrollView, Image, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { Video,ResizeMode } from 'expo-av';
import { useGetCategoriesListQuery } from '../api';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetPostByIdQuery } from '../api';
import { parseApiError } from '../utils/apiError';
import { TextInputMask } from 'react-native-masked-text';
import {useTranslation} from 'react-i18next'
import { InputMap } from '../components/InputMap';

export const EditPostScreen = ({route}) => {
  const post_id = route?.params?.post;
  const { data:postData,isLoading: isPostLoading,refetch } = useGetPostByIdQuery(post_id ?? 0);

  const navigation = useNavigation();
  const {t} = useTranslation();
  const [loading,setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const [openDropdown, setOpenDropdown] = useState(null);
  const { data, error, isLoading } = useGetCategoriesListQuery();

  const toggleDropdown = (dropdownId) => {
    setOpenDropdown((prevOpen) => (prevOpen === dropdownId ? null : dropdownId));
};
  

  const user = useSelector(state => state.auth.token);
  const userId = useSelector(state => state.auth.user.id);
  
  const [city, setCity] = useState('');
  const [title, onChangeTitle] = useState('');
  const [cost, onChangeCost] = useState('');

  const [adress, onChangeAdress] = useState('');
  const [AdressLat,setAdressLat] = useState('')
  const [AdressLng,setAdressLng] = useState('')

  const [content, onChangeContent] = useState('');
  const [images, setImages] = useState([]);
  const [phone, onChangePhone] = useState('');
  const [whatsapp, onChangeWhatsapp] = useState('');
  const [site, onChangeSite] = useState('');
  const [telegram, onChangeTelegram] = useState('');
  const [insta, onChangeInsta] = useState('');
  const [facebook, onChangeFacebook] = useState('');
  const [tiktok, onChangeTiktok] = useState('');
  const [twogis, onChangeTwogis] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedMortage, setSelectedMortage] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(false);
  const [category, setCategory] = useState(null);

  const [brand, onChangeBrand] = useState('');
  const [color, onChangeColor] = useState('');
  const [fuel, setFuel] = useState('');
  const [bathroom, setBathroom] = useState('');
  const [statement, setStatement] = useState('');
  const [engineVolume, onChangeEngineVolume] = useState('');
  const [numberOfOwners, onChangeNumberOfOwners] = useState('');
  const [transmission, setTransmission] = useState('');
  const [body, setBody] = useState('');

  const [numberOfRooms, onChangeNumberOfRooms] = useState('');
  const [totalArea, onChangeTotalArea] = useState('');
  const [property, onChangeProperty] = useState('');
  const [furniture, setFurniture] = useState('');
  const [renovation, setRenovation] = useState('');
  const [building, setBuilding] = useState('');
  const [heating, setHeating] = useState('');
  const [house3, onChangeHouse3] = useState('');

    useEffect(()=>{
        console.log(images);
    },[images])

  useEffect(() => {
    if (!isPostLoading && postData) {
      onChangeTitle(postData.title);
      onChangeCost(postData.cost);
      onChangeContent(postData.content);
      setImages(postData.images); // Assuming images is an array of { image: url }

      onChangePhone(postData.phone);
      onChangeWhatsapp(postData.phone_whatsapp);
      onChangeSite(postData.site);
      onChangeTelegram(postData.telegram);
      onChangeInsta(postData.insta);
      onChangeFacebook(postData.facebook);
      onChangeTiktok(postData.tiktok);
      onChangeTwogis(postData.twogis);
      setSelectedCondition(postData.condition);
      setSelectedMortage(postData.mortage === 'true'); // Assuming mortage is a string 'true' or 'false'
      setSelectedDelivery(postData.delivery === 'true');
      setCategory(postData.categories); // Assuming you want to save the category id
      setCity(postData.geolocation); // Assuming you want to save the category id

      const fieldValues = postData.fields.reduce((acc, curr) => {
        acc[curr.field_name] = curr.field_value;
        return acc;
      }, {});
    
      onChangeNumberOfRooms(fieldValues["Количество комнат"] || '');
      onChangeTotalArea(fieldValues["Общая площадь"] || '');
      onChangeProperty(fieldValues["Тип собственности"] || ''); // Assuming there's a field for this
      setFurniture(fieldValues["Мебелирование"] || ''); // Assuming there's a field for this
      setRenovation(fieldValues["Ремонт"] || '');
      setBuilding(fieldValues["Тип строения"] || ''); // Assuming there's a field for this
      setHeating(fieldValues["Отопление"] || '');
      onChangeHouse3(fieldValues["Год постройки"] || '');
      setBathroom(fieldValues["Санузел"] || '');
    }
  }, [postData, isPostLoading]);


  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);
  

  
  const handleConditionPress = (condition) => {
    setSelectedCondition(condition);
  };

  
  const handleMortagePress = (mortage) => {
    setSelectedMortage(mortage);
  };

  
  const handleDeliveryPress = (delivery) => {
    setSelectedDelivery(delivery);
  };
  // 
  
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  
  const togglecategories = () => {
    setCategoriesOpen(!categoriesOpen);
  };
  
  // 

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedFile = result.assets[0];
      const fileSize = selectedFile.fileSize;
      const maxSize = 10 * 1024 * 1024; // Максимальный размер файла (6 МБ в байтах)
  
      if (fileSize > maxSize) {
        alert("Файл слишком большой","Размер файла не должен превышать 10 МБ.");
      } else {
        setImages((prevImages) => [...prevImages, result.assets[0]]);
      }

      if(result.assets[0].type == 'video') {
        video.current.playAsync()
      }
    }
  };


  const sendPostRequest = async () => {
    const apiUrl = `https://market.qorgau-city.kz/api/posts/edit/${postData.id}/`; 
    const formData = new FormData();

    formData.append('title', title);
    formData.append('content', content);
    formData.append('category_id', category.id);
    formData.append('condition', selectedCondition);
    formData.append('delivery', selectedDelivery);
    formData.append('mortage', selectedMortage);
    formData.append('geolocation', city);
    formData.append('cost', cost);
    formData.append('author', userId);

    formData.append('phone', phone);
    formData.append('phone_whatsapp', whatsapp);
    formData.append('site', site);
    formData.append('telegram', telegram);
    formData.append('insta', insta);
    formData.append('facebook', facebook);
    formData.append('tiktok', tiktok);
    formData.append('twogis', twogis);

    const fieldsData = category.id === 6 ? [
      { field_name: 'Марка', field_value: brand },
      { field_name: 'Цвет', field_value: color },
      { field_name: 'Вид топлива', field_value: fuel },
      { field_name: 'Состояние', field_value: statement },
      { field_name: 'Объём двигателя', field_value: engineVolume },
      { field_name: 'Количество хозяев', field_value: numberOfOwners }
    ] : category.id === 4 ? [
      { field_name: 'Количество комнат', field_value: numberOfRooms },
      { field_name: 'Общая площадь', field_value: totalArea },
      { field_name: 'Ремонт', field_value: renovation },
      { field_name: 'Отопление', field_value: heating },
      { field_name: 'Год постройки', field_value: house3 },
      { field_name: 'Санузел', field_value: bathroom }
    ] : [];

    if (category.id === 4) {
      formData.append('adress', adress);
      formData.append('lat', AdressLat);
      formData.append('lng', AdressLng);
    }
  
    fieldsData.forEach((field, index) => {
      formData.append(`fields[${index}][field_name]`, field.field_name);
      formData.append(`fields[${index}][field_value]`, field.field_value);
    });

    images.forEach((image, index) => {
        if (image.uri && image.uri.startsWith('file://')) {
            console.log('Uploading newly picked image');
            const file = {
                uri: image.uri,
                name: image.fileName || `image_${index}.jpg`,
                type: image.type || 'image',
            };

            formData.append(`images[${index}][image]`, file);
            formData.append(`images[${index}][type]`, image.type);
        }
    });

    

    try {
      setLoading(true)
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        body: formData,
        headers: {
            'Authorization':`Token ${user}`
        },
      });

      if (response.ok) {
        setLoading(false)
        setGeneralError('')
      } else {
        setLoading(false);
        try {
          const parsed = await parseApiError(response);
          setGeneralError(parsed.message);
        } catch (e) {
          setGeneralError('Произошла ошибка');
        }
      }
    } catch (error) {
      setLoading(false);
      setGeneralError('Сеть недоступна');
    }
  };


  const CreateDropdown = ({ isOpen, toggleOpen, state, setState, title, placeholder, items = [] }) => { 
    return (
      <>
        <Text style={{ fontFamily:'bold', fontSize:16, marginTop:20, marginBottom:10 }}>{title}</Text>
        <Pressable onPress={toggleOpen} style={styles.profileButton}>
          <Text style={{ fontFamily:'regular', fontSize:14, color:'#96949D' }}>{state ? state : placeholder}</Text>
          <Image style={{ height:16, width:8, transform:[{ rotate: isOpen ? '270deg' : '90deg' }], marginRight:5 }} source={require('../assets/arrow-right.png')} />
        </Pressable>
        {isOpen && (
          <View style={{ backgroundColor:'#F7F8F9', borderEndEndRadius:5, marginTop:-3, borderBottomLeftRadius:5, borderColor:'#D6D6D6', borderWidth:1, paddingVertical:10 }}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setState(item);
                  toggleOpen();
                }}
                style={{ width:'100%', paddingVertical:10, paddingHorizontal:15 }}>
                <Text style={{ color:'#96949D', fontSize:13 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </>
    );
  };
  
  

  return (
    <ScrollView horizontal={false}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={loading}
        onRequestClose={() => {
          setLoading(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.modalText}>Пост создается...</Text>
          </View>
        </View>
      </Modal>
      
  <View style={{ marginTop: 20,marginBottom:150, width: '90%', alignSelf: 'center' }}>
    {generalError ? <Text style={{ color: 'red', marginBottom: 10 }}>{generalError}</Text> : null}
    <Text style={{ fontSize: 16, fontFamily: 'bold' }}>Добавьте фотографии</Text>
    <ScrollView horizontal={true} contentContainerStyle={{flexDirection:'row',alignItems:'center',marginTop:10,paddingBottom:15}}>
        <TouchableOpacity style={{ marginRight: 10 }} onPress={pickImage}>
            <View style={{ width: 110, height: 110, backgroundColor: '#F7F8F9', borderRadius: 5, borderWidth: 1, borderColor: '#D6D6D6', justifyContent: 'center', alignItems: 'center' }}>
                <Image style={{ height: 25, width: 25 }} source={require('../assets/plusBlue.png')} />
            </View>
        </TouchableOpacity>
        <FlatList
        data={images}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
            item.type === 'image' ? <Image source={{ uri: item.image ? item.image : item.uri }} style={{ width: 110, height: 110, borderRadius: 5, borderWidth: 1, borderColor: '#D6D6D6', marginRight: 10 }} /> :
        
            <View>
                <Video
                isMuted={true}
                ref={video}
                style={{ width: 110, height: 110, borderRadius: 5, borderWidth: 1, borderColor: '#D6D6D6', marginRight: 10 }}
                source={{
                    uri: item.uri,
                }}
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping
                onPlaybackStatusUpdate={(status) => setStatus(() => status)}
                />
            </View>
        )}
        />
    </ScrollView>
    <Text style={{fontFamily:'bold',fontSize:16,marginTop:10}}>{t('title.header')}</Text>
    <View style={{flexDirection:'row',justifyContent:'space-between',marginVertical:10}}>
        <Text style={{fontFamily:'regular',fontSize:14}}>{t('title.min_length_instruction')}</Text>
        <Text style={{color:'#96949D'}}>{title.length}/70</Text>
    </View>
    <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
        placeholder={t('title.header')}
        maxLength={50}
        value={title}
        onChangeText={onChangeTitle}
    />
    <Text style={{fontFamily:'bold',fontSize:16,marginBottom:10,marginTop:20,}}>{t('price.header')}</Text>
    <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
        value={cost}
        onChangeText={onChangeCost}
        placeholder={t('price.placeholder')}
        maxLength={70}
    />

    <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('category.header')}</Text>
    <Pressable onPress={togglecategories} style={styles.profileButton}>
      <Text style={{ fontFamily: 'regular', fontSize: 14,color:'#96949D' }}>{category ? category.name : t('category.placeholder')}</Text>
      <Image style={{ height: 16, width: 8,transform: [{ rotate: categoriesOpen ? '270deg' : '90deg' }],marginRight: 5 }} source={require('../assets/arrow-right.png')} />
    </Pressable>

    {categoriesOpen && data ? 
        <View style={{backgroundColor: '#F7F8F9',borderEndEndRadius: 5,marginTop:-3,borderBottomLeftRadius: 5,borderColor: '#D6D6D6',borderWidth: 1,paddingVertical:10}}>
            {data.map((item) => {
            return (
                <TouchableOpacity
                key={item.id}
                onPress={() => {
                  if (item) {
                      setCategory(item);
                    }
                    togglecategories();
                }}
                style={{ width: '100%', paddingVertical: 10, paddingHorizontal: 15 }}
                >
                <Text style={{ color: '#96949D', fontSize: 13 }}>{item.name}</Text>
                </TouchableOpacity>
            );
            })}
        </View>
    : null}

    <Text style={{fontFamily:'bold',fontSize:16,marginTop:20}}>{t('description.header')}</Text>
    <View style={{flexDirection:'row',justifyContent:'space-between',marginVertical:10}}>
        <Text style={{fontFamily:'regular',fontSize:14}}>{t('description.min_length_instruction')}</Text>
        <Text style={{color:'#96949D'}}>{content.length}/9000</Text>
    </View>
    <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 100,
          paddingTop:20,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
        value={content}
        onChangeText={onChangeContent}
        placeholder={t('description.placeholder')}
        maxLength={9000}
        multiline
        numberOfLines={3}
    />

    <CreateDropdown isOpen={openDropdown === 'city'} toggleOpen={() => toggleDropdown('city')} state={city} setState={setCity} title={t('location.header')} placeholder={t('location.placeholder')} items={["Астана", "Алматы", "Шымкент", "Кызылорда"]} />

    {category && category.id === 3 && (
      <>
        <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('additional_fields.brand.header')}</Text>
        <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
          value={brand}
          onChangeText={onChangeBrand}
          placeholder={t('additional_fields.brand.placeholder')}
          maxLength={70}
        />

        <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('additional_fields.color.header')}</Text>
        <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
          value={color}
          onChangeText={onChangeColor}
          placeholder={t('additional_fields.color.placeholder')}
          maxLength={70}
        />

        <CreateDropdown isOpen={openDropdown === 'fuel'} toggleOpen={() => toggleDropdown('fuel')} state={fuel} setState={setFuel} title="Вид топлива" placeholder="Выберите вид топлива" items={['Бензин', 'Дизель', 'Электрический', 'Гибридный']} />
        <CreateDropdown isOpen={openDropdown === 'statement'} toggleOpen={() => toggleDropdown('statement')} state={statement} setState={setStatement} title="Состояние" placeholder="Выберите состояние" items={['Новое', 'Б/у']} />
        <CreateDropdown isOpen={openDropdown === 'body'} toggleOpen={() => toggleDropdown('body')} state={body} setState={setBody} title="Тип кузова" placeholder="Выберите тип кузова" items={['Мопед','Кроссовер', 'Купе','Седан','Хэтчбэк','Лифтбек','Купе','Родстер','Тарга']} />
        <CreateDropdown isOpen={openDropdown === 'transmission'} toggleOpen={() => toggleDropdown('transmission')} state={transmission} setState={setTransmission} title="Коробка передач" placeholder="Выберите коробку передач" items={['Автомат', 'Механика']} />


        <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('additional_fields.engine_volume.header')}</Text>
        <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
          value={engineVolume}
          onChangeText={onChangeEngineVolume}
          placeholder={t('additional_fields.engine_volume.placeholder')}
          maxLength={70}
        />
        <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('additional_fields.number_of_owners.header')}</Text>
        <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
          value={numberOfOwners}
          onChangeText={onChangeNumberOfOwners}
          placeholder={t('additional_fields.number_of_owners.placeholder')}
          maxLength={70}
        />
      </>
    )}


    {category && category.id === 4 && (
  <>
    <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('additional_fields.number_of_rooms.header')}</Text>
    <TextInput
    style={{
      width: '100%',
      paddingHorizontal: 10,
      height: 50,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: '#D6D6D6',
      backgroundColor: '#F7F8F9'
    }}
      value={numberOfRooms}
      onChangeText={onChangeNumberOfRooms}
      placeholder={t('additional_fields.number_of_rooms.placeholder')}
      maxLength={70}
    />

    <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('additional_fields.total_area.header')}</Text>
    <TextInput
    style={{
      width: '100%',
      paddingHorizontal: 10,
      height: 50,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: '#D6D6D6',
      backgroundColor: '#F7F8F9'
    }}
      value={totalArea}
      onChangeText={onChangeTotalArea}
      placeholder={t('additional_fields.total_area.placeholder')}
      maxLength={70}
    />

    <InputMap
      value={adress}
      label="Адрес"
      onChangeText={onChangeAdress}
    />

    <CreateDropdown isOpen={openDropdown === 'property'} toggleOpen={() => toggleDropdown('property')} state={property} setState={onChangeProperty} title="Тип собственности" placeholder="Выберите тип собственности" items={['От хозяина','Долевая']} />
    <CreateDropdown isOpen={openDropdown === 'furniture'} toggleOpen={() => toggleDropdown('furniture')} state={furniture} setState={setFurniture} title="Мебелирование" placeholder="Выберите мебелирование" items={['Полное', 'Частичное', 'Нет']} />
    <CreateDropdown isOpen={openDropdown === 'building'} toggleOpen={() => toggleDropdown('building')} state={building} setState={setBuilding} title="Тип строения" placeholder="Выберите тип строения" items={['Кирпичный', 'Панельный']} />

    <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('additional_fields.year_of_construction.header')}</Text>
    <TextInput
    style={{
      width: '100%',
      paddingHorizontal: 10,
      height: 50,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: '#D6D6D6',
      backgroundColor: '#F7F8F9'
    }}
      value={house3}
      onChangeText={onChangeHouse3}
      placeholder={t('additional_fields.year_of_construction.placeholder')}
      maxLength={70}
    />
  </>
)}

{category && category.id === 5 && (
  <>
        <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('additional_fields.number_of_rooms.header')}</Text>
        <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
          value={numberOfRooms}
          onChangeText={onChangeNumberOfRooms}
          placeholder={t('additional_fields.number_of_rooms.placeholder')}
          maxLength={70}
        />

        <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>{t('additional_fields.lease_term.header')}</Text>
        <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
          value={leaseTerm}
          onChangeText={onChangeLeaseTerm}
          placeholder={t('additional_fields.lease_term.placeholder')}
          maxLength={70}
        />

        <InputMap
            value={adress}
            label="Адрес"
            onTapRow={onChangeAdress('')}
            onChangeText={(text) => {
                onChangeAdress(text);
            }}
        />

        <CreateDropdown isOpen={openDropdown === 'property'} toggleOpen={() => toggleDropdown('property')} state={property} setState={onChangeProperty} title="Тип собственности" placeholder="Выберите тип собственности" items={['От хозяина','Долевая']} />
        <CreateDropdown isOpen={openDropdown === 'furniture'} toggleOpen={() => toggleDropdown('furniture')} state={furniture} setState={setFurniture} title="Мебелирование" placeholder="Выберите мебелирование" items={['Полное', 'Частичное', 'Нет']} />
        <CreateDropdown isOpen={openDropdown === 'building'} toggleOpen={() => toggleDropdown('building')} state={building} setState={setBuilding} title="Тип строения" placeholder="Выберите тип строения" items={['Кирпичный', 'Панельный']} />

       
        <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>Общая площадь</Text>
        <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
          value={totalArea}
          onChangeText={onChangeTotalArea}
          placeholder="Общая площадь"
          maxLength={70}
        />

        <CreateDropdown isOpen={openDropdown === 'renovation'} toggleOpen={() => toggleDropdown('renovation')} state={renovation} setState={setRenovation} title="Ремонт" placeholder="Выберите ремонт" items={['Евроремонт', 'Частичный', 'Белый каркас', 'Черный каркас']} />
        <CreateDropdown isOpen={openDropdown === 'heating'} toggleOpen={() => toggleDropdown('heating')} state={heating} setState={setHeating} title="Отопление" placeholder="Выберите отопление" items={['Воздушное', 'Электрическое ', 'Водяное', 'Центральный']} />
        <CreateDropdown isOpen={openDropdown === 'bathroom'} toggleOpen={() => toggleDropdown('bathroom')} state={bathroom} setState={setBathroom} title="Санузел" placeholder="Выберите санузел" items={['Раздельный', 'Совместный']} />

        <Text style={{fontFamily:'bold',fontSize:16,marginTop:20,marginBottom:10}}>Год постройки</Text>
        <TextInput
        style={{
          width: '100%',
          paddingHorizontal: 10,
          height: 50,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#D6D6D6',
          backgroundColor: '#F7F8F9'
        }}
          value={house3}
          onChangeText={onChangeHouse3}
          placeholder="Год постройки"
          maxLength={70}
        />
      </>
    )}

<Text style={{fontFamily:'bold',fontSize:16,marginTop:20,}}>Контактные данные</Text>
    <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'}}>
      <View style={{width:'48%',marginTop:10}}>
        <Text style={{fontFamily:'medium',opacity:.7,fontSize:12,marginBottom:10,}}>Номер телефона</Text>
        <TextInputMask
          type={'custom'}
          placeholder="+7 777 777 777"
          style={{
            width: '100%',
            paddingHorizontal: 10,
            height: 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#D6D6D6',
            backgroundColor: '#F7F8F9'
          }}
          options={{
            mask: '+79999999999'
          }}
          value={phone}
          onChangeText={onChangePhone}
        />
      </View>
      <View style={{width:'48%',marginTop:10}}>
        <Text style={{fontFamily:'medium',opacity:.7,fontSize:12,marginBottom:10,}}>Номер телефона Whatsapp</Text>
        <TextInputMask
          type={'custom'}
          placeholder="777 777 7777"
          style={{
            width: '100%',
            paddingHorizontal: 10,
            height: 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#D6D6D6',
            backgroundColor: '#F7F8F9'
          }}
          options={{
            mask: '+79999999999'
          }}
          value={whatsapp}
          onChangeText={onChangeWhatsapp}
        />
      </View>
      <View style={{width:'48%',marginTop:10}}>
        <Text style={{fontFamily:'medium',opacity:.7,fontSize:12,marginBottom:10,}}>Ссылка на сайт</Text>
        <TextInput
          placeholder="https://"
          style={{
            width: '100%',
            paddingHorizontal: 10,
            height: 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#D6D6D6',
            backgroundColor: '#F7F8F9'
          }}
          value={site}
          onChangeText={onChangeSite}
        />
      </View>
      <View style={{width:'48%',marginTop:10}}>
        <Text style={{fontFamily:'medium',opacity:.7,fontSize:12,marginBottom:10,}}>Ссылка на телеграм</Text>
        <TextInput
          placeholder="https://t.me/"
          style={{
            width: '100%',
            paddingHorizontal: 10,
            height: 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#D6D6D6',
            backgroundColor: '#F7F8F9'
          }}
          value={telegram}
          onChangeText={onChangeTelegram}
        />
      </View>
      <View style={{width:'48%',marginTop:10}}>
        <Text style={{fontFamily:'medium',opacity:.7,fontSize:12,marginBottom:10,}}>Ссылка на TikTok</Text>
        <TextInput
          placeholder="https://tiktok.com/@"
          style={{
            width: '100%',
            paddingHorizontal: 10,
            height: 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#D6D6D6',
            backgroundColor: '#F7F8F9'
          }}
          value={tiktok}
          onChangeText={onChangeTiktok}
        />
      </View>
      <View style={{width:'48%',marginTop:10}}>
        <Text style={{fontFamily:'medium',opacity:.7,fontSize:12,marginBottom:10,}}>Ссылка на FaceBook</Text>
        <TextInput
          placeholder="https://facebook.com/"
          style={{
            width: '100%',
            paddingHorizontal: 10,
            height: 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#D6D6D6',
            backgroundColor: '#F7F8F9'
          }}
          value={facebook}
          onChangeText={onChangeFacebook}
        />
      </View>
      <View style={{width:'48%',marginTop:10}}>
        <Text style={{fontFamily:'medium',opacity:.7,fontSize:12,marginBottom:10,}}>Ссылка на Instagram</Text>
        <TextInput
          placeholder="https://instagram.com/"
          style={{
            width: '100%',
            paddingHorizontal: 10,
            height: 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#D6D6D6',
            backgroundColor: '#F7F8F9'
          }}
          value={insta}
          onChangeText={onChangeInsta}
        />
      </View>
      <View style={{width:'48%',marginTop:10}}>
        <Text style={{fontFamily:'medium',opacity:.7,fontSize:12,marginBottom:10,}}>Ссылка на 2gis</Text>
        <TextInput
          placeholder="https://2gis.kz/"
          style={{
            width: '100%',
            paddingHorizontal: 10,
            height: 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#D6D6D6',
            backgroundColor: '#F7F8F9'
          }}
          value={twogis}
          onChangeText={onChangeTwogis}
        />
      </View>
    </View>
        <Text style={{fontFamily:'bold',fontSize:16,marginTop:20}}>{t('extra_info')}</Text>
        <Text style={{marginVertical:10}}>{t('product_statement')}</Text>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
                onPress={() => handleConditionPress('Новый')}
                style={{
                paddingVertical: 15,
                width: 170,
                backgroundColor: selectedCondition === 'Новый' ? '#D6D6D6' : '#F7F8F9',
                borderRadius: 5,
                alignItems: 'center',
                borderColor: '#D6D6D6',
                borderWidth: 1,
                }}
            >
                <Text style={{ color: selectedCondition === 'Новый' ? '#F7F8F9' : '#D6D6D6', fontSize: 16 }}>Новый</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleConditionPress('Б/У')}
                style={{
                marginLeft: 10,
                paddingVertical: 15,
                width: 170,
                backgroundColor: selectedCondition === 'Б/У' ? '#D6D6D6' : '#F7F8F9',
                borderRadius: 5,
                alignItems: 'center',
                borderColor: '#D6D6D6',
                borderWidth: 1,
                }}
            >
                <Text style={{ color: selectedCondition === 'Б/У' ? '#F7F8F9' : '#D6D6D6', fontSize: 16 }}>Б/У</Text>
            </TouchableOpacity>
        </View>

        <Text style={{marginVertical:10}}>Имеется ли рассрочка?</Text>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
                onPress={() => handleMortagePress(false)}
                style={{
                paddingVertical: 15,
                width: 170,
                backgroundColor: selectedMortage === false ? '#D6D6D6' : '#F7F8F9',
                borderRadius: 5,
                alignItems: 'center',
                borderColor: '#D6D6D6',
                borderWidth: 1,
                }}
            >
                <Text style={{ color: selectedMortage === false ? '#F7F8F9' : '#D6D6D6', fontSize: 16 }}>Нет</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleMortagePress(true)}
                style={{
                marginLeft: 10,
                paddingVertical: 15,
                width: 170,
                backgroundColor: selectedMortage === true ? '#D6D6D6' : '#F7F8F9',
                borderRadius: 5,
                alignItems: 'center',
                borderColor: '#D6D6D6',
                borderWidth: 1,
                }}
            >
                <Text style={{ color: selectedMortage === true ? '#F7F8F9' : '#D6D6D6', fontSize: 16 }}>Да</Text>
            </TouchableOpacity>
        </View>
        

        <Text style={{marginVertical:10}}>Возможна доставка?</Text>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
                onPress={() => handleDeliveryPress(false)}
                style={{
                paddingVertical: 15,
                width: 170,
                backgroundColor: selectedDelivery === false ? '#D6D6D6' : '#F7F8F9',
                borderRadius: 5,
                alignItems: 'center',
                borderColor: '#D6D6D6',
                borderWidth: 1,
                }}
            >
                <Text style={{ color: selectedDelivery === false ? '#F7F8F9' : '#D6D6D6', fontSize: 16 }}>Нет</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleDeliveryPress(true)}
                style={{
                marginLeft: 10,
                paddingVertical: 15,
                width: 170,
                backgroundColor: selectedDelivery === true ? '#D6D6D6' : '#F7F8F9',
                borderRadius: 5,
                alignItems: 'center',
                borderColor: '#D6D6D6',
                borderWidth: 1,
                }}
            >
                <Text style={{ color: selectedDelivery === true ? '#F7F8F9' : '#D6D6D6', fontSize: 16 }}>Да</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={sendPostRequest} style={{ borderRadius: 5, overflow: 'hidden', marginBottom: 20,marginTop:40 }}>
                <LinearGradient
                  colors={['#F3B127', '#F26D1D']}
                  style={{ paddingVertical: 15, width: '100%', alignItems: 'center' }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <Text style={{ color: '#F7F8F9', fontSize: 16 }}>Опубликовать</Text>
                </LinearGradient>
              </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


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
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      paddingTop:50,
      alignItems: 'center',
      shadowColor: '#666',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      marginTop: 25,
      fontFamily:'medium',
      fontSize:16,
      textAlign: 'center',
    },
  });
  
  