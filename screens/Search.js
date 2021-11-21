import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Touchable, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Avatar } from 'react-native-elements';
import { UserProfile, handleAddFriends } from './UserProfile';

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

export const SearchScreen = ({ navigation, route }) => {
    let addMember = false;
    let groupId;
    if (route.params === undefined) {
        addMember = false;
        groupId = ""
    }
    else {
        addMember = route.params.addMember;
        groupId = route.params.groupId;
    }

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
            // console.log(data.val()['twchim01']['displayName'])
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

    function checkFriends(username){
        var i = 0
        var returnButton = [["Add", Colors.orangeButton, false, false], ["Undo", Colors.blackButton, true, false], ["Friend", Colors.greyButton, true, true]]
        const refRequest = db.ref('users/' + currentUsername + '/requests/friends/sent/')
        refRequest.off()
        refRequest.on('value', (data) => {
            // console.log(data.val())
            if(data.val() != null){
                if(data.val().includes(username)){
                    // console.log(username + "matched!!!")
                    i = 1
                }
            }
        })
        const refFriend = db.ref('users/' + currentUsername + '/friends/')
        refFriend.off()
        refFriend.on('value', (data) => {
            if(data.val() != null){
                if (data.val().includes(username)){
                    i = 2
                }
            }
        })
        return returnButton[i]
    }

    function checkGroups(username) {
        let i = 0;
        let returnButton = [["Add", Colors.orangeButton, false, false], ["Undo", Colors.blackButton, true, false], ["Member", Colors.greyButton, true, true]];
        const refRequest = db.ref(`groups/${groupId}/requests/sent/`)
        refRequest.off()
        refRequest.on('value', (data) => {
            // console.log(data.val())
            if(data.val() != null){
                if(data.val().includes(username)){
                    // console.log(username + "matched!!!")
                    i = 1
                }
            }
        })
        const refFriend = db.ref(`groups/${groupId}/members`)
        refFriend.off()
        refFriend.on('value', (data) => {
            if(data.val() != null){
                if (data.val().includes(username)){
                    i = 2
                }
            }
        })
        return returnButton[i]
    }

    function handleAddMembers(groupId, currentUser, userBeingAdded, added) {
        const db = firebase.database();
        for (let i = 0; i < 2; i++) {
            let source, target, ref;
            if (i === 0) {
                source = userBeingAdded + "/requests/groups/received"
                // target = currentUser
                ref = db.ref('users/' + source)
            } else {
                source = `${groupId}/requests/sent`
                // target = userBeingAdded
                ref = db.ref('groups/' + source)
            }
            ref.off()
            var temp = []
            if(!added){
                ref.on('value', (data) => {
                    console.log(data.val())
                    if (data.val() != null) {
                        temp = data.val()
                    }
                })
                if (i === 0) {
                    temp.push(groupId)
                    ref.parent.update({
                        'received': temp
                    })
                } else {
                    temp.push(userBeingAdded)
                    ref.parent.update({
                        'sent': temp
                    })
                }
            }
        }
    }

    const usersList = Object.entries(usersDetail).map((username, index) => {
        // will have three states, 1. add, 2. sent, 3. already friends
        var [buttonText, buttonColor, added, disable] = addMember ? checkGroups(username[0]) : checkFriends(username[0])
        if (username[0] != currentUsername) {
            return (
                <View key={index}>
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
                            <Text style={styles.displayName}>
                                {usersDetail[username[0]]['displayName']}
                            </Text>
                            <Text style={styles.userName}>
                                {'@' + username[0]}
                            </Text>
                        </View>
                        <View style={styles.addButton}>
                            <Button
                                disabled={disable}
                                onPress={() => { addMember ? handleAddMembers(groupId, currentUsername, username[0], added) : handleAddFriends(currentUsername, username[0], added) }}
                                backgroundColor={buttonColor}
                                title={buttonText}
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
        paddingBottom: 70
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
        flexGrow: 1,
        minWidth: 50,
        maxWidth: 70
        // maxWidth: 80
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
    displayName: {
        fontWeight: 'bold',
        fontSize: 20
    },
    userName: {
        fontSize: 16,
        fontStyle: 'italic'
    },
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        paddingLeft: 10,
        maxWidth: 80
    },
})