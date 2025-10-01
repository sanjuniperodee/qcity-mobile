import React, { useState,useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Dimensions } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

    const {height, width} = Dimensions.get('window')
    const InputWidth = width * 0.88

export const InputMap = (props) => {   
    const [InputFocus, setInputFocus] = useState(false)

    const onFocus = () => {
        setInputFocus(true)
    }

    return (
        <>
            <Text style={[styles.InputText, 
                InputFocus || props.value ? {opacity: 1} : null]}>
                {props.label}
            </Text>
            <View style={styles.Container}>
                <View style={styles.Right}>
                    <GooglePlacesAutocomplete
                        placeholder='Введите адрес'
                        autoFocus={false}
                        returnKeyType={'search'}
                        listViewDisplayed={"auto"}
                        numberOfLines={2}
                        bounces={false}
                        fetchDetails={true}
                        enablePoweredByContainer={false}
                        keyboardShouldPersistTaps="handled"
                        getDefaultValue={() => ''}
                        listEmptyComponent={() => (
                            <View style={{flex: 1}}>
                            <Text>Не найдено</Text>
                            </View>
                        )}
                        textInputProps={{
                            value: props.value,
                            onChangeText: (value) => props.onChangeText(value),
                        }}
                        renderRow={(rowData) => {
                            const title = rowData.structured_formatting.main_text;
                            const address = rowData.structured_formatting.secondary_text;

                            return (
                                <View>
                                    <Text style={InputStyles.predefinedPlacesDescription}>{title}</Text>
                                    <Text style={{ fontSize: 14 }}>{address}</Text>
                                </View>
                            );
                        }}
                        
                        onPress={(data, details = null) => {
                            const newAddress = details?.formatted_address || "";
                            if (props.onChangeText) {
                                props.onChangeText(newAddress); // Update the address state in the parent component
                            }
                            setInputFocus(false); // Optionally reset input focus state
                        }}
                        query={{
                            key: 'AIzaSyCKKn8KVrLBr5jiIIgAC0mNpeWnZCObYq4',
                            language: 'ru',
                            types: 'address',
                    }}
                    styles={InputStyles}/>
                </View>
                <TouchableOpacity
                    style={styles.Icon}
                    onPress={props.onPress}>
                    <Image 
                        style={{width: 14, height: 14}} 
                        source={require('../assets/NavigationArrow.png')}/>
                </TouchableOpacity>
            </View>
        </>
    );
  }
const styles = StyleSheet.create({
    Input: {
        height: 40,
        width: '100%',
        fontSize: 15,
    },
    Container: {
        width: '100%',
        marginTop:10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F7F8F9',
        borderRadius: 5,
        borderColor: '#D6D6D6',
        borderWidth: 1,
    },
    Right: {
        width: '85%'
    },
    InputText: {
        color: '#000000',
        opacity: 0.9,
        fontFamily: 'bold',
        width: 200,
        marginTop:20,
        fontSize:15
    },
    Icon: {
        height: 40,
        width: 30,
        display:'none',
        borderRadius: 4,
        backgroundColor: '#F6F6F6',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
});


const InputStyles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: 100,
        justifyContent: 'space-between',
    },
    textInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center'
    },
    textInput: {
        height: 40,
        fontSize: 15,
        fontFamily: 'regular',
        width: '60%',
        backgroundColor:'#F7F8F9',
        justifyContent:'center',
        paddingHorizontal:10,
        margin: 0,
        numberOfLines: 2
    },
    listView: {
        top: 0,
        width: InputWidth - 20,
        borderRadius: 5,
        backgroundColor: '#F7F8F9',
        zIndex: 999,
    },
    predefinedPlacesDescription: {
        
    },
    PredefinedPlacesTitle: {
        fontFamily: 'medium',
        fontSize: 12,
        lineHeight: 14
    },
    row: {
        padding: 0,
        backgroundColor: '#F7F8F9',
        borderWidth:0,
        paddingLeft:10,
        paddingVertical:10,
        width:'100%'
    }
})

