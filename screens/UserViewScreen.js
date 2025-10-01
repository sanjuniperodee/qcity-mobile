import React, {useEffect} from 'react';
import { ScrollView, View, Text, StyleSheet, Image, Linking,TouchableOpacity,Platform,Alert } from 'react-native';
import { useGetUserByUsernameQuery, useGetPostsByUserQuery } from '../api';
import { ProductCard } from '../components/ProductCard'; // A component to display each post

export const UserViewScreen = ({ route }) => {
  const { username } = route.params;
  const { data: userData, isFetching: fetchingUser } = useGetUserByUsernameQuery(username);
  const { data: postsData, isFetching: fetchingPosts } = useGetPostsByUserQuery(username);

  const makeCall = (number) => {
    let phoneNumber = '';

    if (Platform.OS === 'android') {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }

    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (!supported) {
          Alert.alert('Телефонный номер не доступен');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch(err => console.warn(err));
  };

  useEffect(()=>{
    console.log(userData);
  },[userData])

  return (
    <ScrollView style={styles.container}>
      {!userData ? (
        <Text></Text>
      ) : (
        <View style={styles.userInfo}>
          <Image 
              style={styles.avatar}
              source={
                userData.profile_image
                  ? {uri: `http://market.qorgau-city.kz${userData.profile_image}`}
                  : require('../assets/profilePurple.png')
              }
            />
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.details}>{userData.email}</Text>
          <TouchableOpacity onPress={() => makeCall(userData.profile.phone_number)}>
            <Text style={{fontFamily: 'medium', fontSize: 18, marginTop: 15}}>
                {userData.profile.phone_number}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!postsData ? (
          <Text></Text>
          ) : (
            <>
                <Text style={styles.postsTitle}>Объявления от {username}</Text>
                <View style={{width:'93%',alignSelf:'center', flexWrap:'wrap',flexDirection:'row', marginTop: 10}}>
                {postsData.map(item => (
                    <ProductCard 
                    key={item.pk}
                    id={item.id}
                    title={item.title}
                    image={item.images[0].image}
                    cost={item.cost}
                    media={item.images}
                    condition={item.condition}
                    mortage={item.mortage}
                    delivery={item.delivery}
                    city={item.geolocation}
                    date={item.date}
                    tariff={item.tariff || 0}/>
                ))}
                </View>
            </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop:20,
  },
  avatar: {
    width: 110,
    height: 110,
    marginBottom:10,
    borderRadius: 50,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 16,
    color: 'grey',
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft:'5%',
    marginTop: 30,
  },
});

// Assuming ProductCard is a component you have that formats the post data nicely
