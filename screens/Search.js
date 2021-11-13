import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Touchable, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Avatar } from 'react-native-elements';
import { UserProfile } from './UserProfile';

import { Typography, Colors, Base } from '../styles';
import { InputField, Button } from '../components';
import Firebase from '../config/firebase';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';
import 'firebase/database';

const ScreenContainer = ({ children }) => (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <ScrollView>{children}</ScrollView>
    </KeyboardAvoidingView>
);

const SearchScreen = ({ navigation }) => {
    const db = firebase.database()
    const auth = Firebase.auth()
    const { user } = useContext(AuthenticatedUserContext)
    const currentUsername = user.email.substring(0, user.email.length - 10)
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

    function handleSearch(text) {
        // console.log(text)
        var temp = {}
        Object.entries(usersDetail2).map((candidate, index) => {
            if (candidate[0].includes(text)) {
                temp[candidate[0]] = candidate[1]
            }
        })
        setUsersDetail(temp)
    }

    const usersList = Object.entries(usersDetail).map((username, index) => {
        // console.log(username)
        if (username[0] != currentUsername) {
            return (
                <View key={index}>
                    {/* add icon at the leftmost of the bar? */}
                    <TouchableOpacity
                        style={styles.usersList}
                        onPress={() => {
                            navigation.navigate('Friend', { currentUser: currentUsername, userBeingSearch: username[0] })
                        }}
                    >
                        <View style={styles.profilePicContainer}>
                            <View style={styles.profilePic}>
                                <Avatar
                                    rounded
                                    source={require('../assets/emptyProPic.png')}
                                />
                            </View>
                        </View>
                        <View style={styles.usersInfo}>
                            <Text style={styles.firstLastName}>{'First Last'}</Text>
                            <Text style={styles.userName}>{'@' + username[0]}</Text>
                        </View>
                        <View style={styles.addButton}>
                            <Button
                                onPress={() => { }}
                                backgroundColor={Colors.orangeButton}
                                title='Add'
                                tileColor='#fff'
                                titleSize={14}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
    })

    return (
        <View style={styles.container}>
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
                    onChangeText={text => {
                        handleSearch(text.toLowerCase());
                    }}
                />
            </View>
            <View style={styles.scrollContainer}>
                <ScrollView nestedScrollEnabled={true}>
                    {usersList}
                </ScrollView>
            </View>
        </View >
    )
}



export const Search = ({ navigation }) => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator initialRouteName="Search">
            <Stack.Screen name="User Search" component={SearchScreen} />
            <Stack.Screen name="Friend" component={UserProfile} />
        </Stack.Navigator>
    )
}

const styles = StyleSheet.create({
    container: {
        ...Base.page
    },
    searchBar: {
        height: 67,
        padding: 12,
        borderBottomWidth: 0.9,
        borderColor: Colors.border
    },
    scrollContainer: {
        // height: '88%'
    },
    usersList: {
        display: 'flex',
        flexDirection: 'row',
        height: 80,
        padding: 14,
        borderBottomWidth: 0.9,
        borderColor: Colors.border
    },
    profilePicContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1
    },
    profilePic: {
        transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }]
    },
    usersInfo: {
        backgroundColor: '#F0F0F0',
        borderRadius: 6,
        flexGrow: 2,
        flexDirection: 'column',
        paddingLeft: 12
    },
    firstLastName: {
        fontWeight: 'bold',
        fontSize: 20
    },
    userName: {
        fontSize: 16
    },
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        paddingLeft: 10
    },
})