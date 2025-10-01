import React, { useState, useEffect } from 'react';
import { View, StyleSheet,Pressable, TouchableOpacity, Image, Text } from 'react-native';

export const createDropdown = (state, setState, options) => {
    const [open, setOpen] = useState(false);
  
    const toggleOpen = () => {
      setOpen(!open);
    };
  
    return (
      <>
        <Text style={{ fontFamily:'bold', fontSize:16, marginTop:20, marginBottom:10 }}>{options.title}</Text>
        <Pressable onPress={toggleOpen} style={styles.profileButton}>
          <Text style={{ fontFamily:'regular', fontSize:14, color:'#96949D' }}>{state ? state : options.placeholder}</Text>
          <Image style={{ height:16, width:8, transform:[{ rotate: open ? '270deg' : '90deg' }], marginRight:5 }} source={require('../assets/arrow-right.png')} />
        </Pressable>
        {open && (
          <View style={{ backgroundColor:'#F7F8F9', borderEndEndRadius:5, marginTop:-3, borderBottomLeftRadius:5, borderColor:'#D6D6D6', borderWidth:1, paddingVertical:10 }}>
            {options.items.map((item, index) => (
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
  
