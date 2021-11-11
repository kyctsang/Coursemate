import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Touchable, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProfile } from './UserProfile';

import { InputField } from '../components';
import Firebase from '../config/firebase';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';
import 'firebase/database';

const ScreenContainer = ({ children }) => (
    <View >{children}</View>
  );

const SearchScreen = ({navigation}) => {
    const db = firebase.database()
    const auth = Firebase.auth()
    const { user } = useContext(AuthenticatedUserContext)
    const currentUsername = user.email.substring(0, user.email.length-10)
    const [usersDetail, setUsersDetail] = useState({})
    const [usersDetail2, setUsersDetail2] = useState({})

    useEffect(() => {
        const ref = db.ref('users/')
        ref.off()
        ref.on('value', (data) => {
            // console.log(data)
            setUsersDetail(data.val())
            setUsersDetail2(data.val())
        })
    }, [])

    function handleSearch(text){
        // console.log(text)
        var temp = {}
        Object.entries(usersDetail2).map((candidate, index) => {
            if(candidate[0].includes(text)){
                temp[candidate[0]] = candidate[1]
            }
        })
        setUsersDetail(temp)
    }

    const usersList = Object.entries(usersDetail).map((username, index) => {
        // console.log(username)
        if(username[0] != currentUsername){
            return(
                <View key={index} style={{height:50, backgroundColor: 'yellow', borderWidth: 1}}>
                    {/* add icon at the leftmost of the bar? */}
                    <TouchableOpacity style={styles.usersList} onPress={() => navigation.navigate('Friend', {currentUser: currentUsername, userBeingSearch: username[0]})}>
                        <Text key={index} style={styles.usersTitle}>{username[0]}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    })

    return(
        <View>
            <View style={styles.searchBar}>
                <InputField
                    inputStyle={{
                        fontSize: 14
                    }}
                    containerStyle={{
                        backgroundColor: '#E8E8E8'
                    }}
                    leftIcon='card-search-outline'
                    placeholder='Enter username'
                    autoCapitalize='none'
                    autoCorrect={false}
                    // textContentType='password'
                    // value={target}
                    onChangeText={text => {
                        handleSearch(text.toLowerCase());
                    }}
                />
                <ScrollView>
                    
                    {usersList}
                </ScrollView>
            </View>             
        </View>
    )
}



export const Search = ({navigation}) => {
    const Stack = createStackNavigator();
    return(
        <Stack.Navigator initialRouteName="Search">
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Friend" component={UserProfile} />
        </Stack.Navigator>
    )
    
}

const styles = StyleSheet.create({
    searchBar: {
        flexBasis: '70%',
        height: '10%'
    },
    usersList: {
        display: 'flex',
        paddingLeft: 50,
        padding: 15
    },
    usersTitle: {
        fontWeight: 'bold',
        fontSize: 16
    },
})