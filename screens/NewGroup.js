import React, {useContext, useState} from 'react';
import {Text, View, StyleSheet, Pressable} from 'react-native';

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';

import {IconButton, InputField} from "../components";
import {Colors} from "../styles";

export const NewGroup = ({navigation}) => {
    const db = firebase.database();
    const { user } = useContext(AuthenticatedUserContext);
    const username = user.email.substring(0,user.email.length-10);
    const groupRef = db.ref('groups/')
    const userRef = db.ref(`users/${username}/groups`);

    const [newGroupName, setNewGroupName] = useState('');

    async function addUser() {
        let newGroup = groupRef.push();
        newGroup.set({'name': newGroupName, 'members': [username]});
        let newGroupId = newGroup.key;

        userRef.once('value').then((snapshot) => {
            return snapshot.val();
        }).then((arr) => {
            if (arr != null) {
                userRef.set(arr.concat([{"id": newGroupId, "name": newGroupName}]));
                console.log('new groups added to current group list.');
            }
            else {
                userRef.set([{"id": newGroupId, "name": newGroupName}]);
                console.log("new groups added.")
            }
        }).catch(error => {
            console.log(`Error: ${error}`)
        });
        navigation.navigate("GroupDetails", {groupId: newGroupId, groupName: newGroupName})
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>New Group</Text>
            <InputField
                inputStyle={{
                    fontSize: 14
                }}
                containerStyle={{
                    backgroundColor: '#E8E8E8'
                }}
                leftIcon='account-group'
                placeholder = 'Group Name'
                autoCapitalize='none'
                autoCorrect={false}
                onChangeText={text => {
                    setNewGroupName(text);
                }}
            />
            <Pressable onPress={addUser} style={styles.button}>
                <Text style={{color: 'white'}}>Create Group</Text>
            </Pressable>
        </View>
    )
}
const styles = StyleSheet.create({
    h1: {
        color: '#111',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 20
    },
    input: {
        margin: 15,
        height: 40,
        borderColor: "#7a42f4",
        borderWidth: 1
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: Colors.orangeButton,
        marginTop: 20
    },
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: 20,
        backgroundColor: 'white'
    }
});