import React, {useContext} from 'react';
import {Pressable, StyleSheet, Text, View} from "react-native";

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';

import {Colors} from "../styles";

export const GroupDetails = ({ navigation, route }) => {
    const db = firebase.database();
    const { user } = useContext(AuthenticatedUserContext);
    const username = user.email.substring(0,user.email.length-10);
    const groupRef = db.ref('groups/')
    const userRef = db.ref(`users/${username}/groups`);

    const {groupId, groupName} = route.params;

    async function deleteGroup(id) {

    }

    return(
        <View style={styles.container}>
            <Text style={styles.h1}>{groupName}</Text>
            <Pressable style={styles.button}>
                <Text style={{color: 'white'}}>Delete Group</Text>
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
        margin: 10
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: Colors.redButton ,
        marginTop: 10
    },
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: 20
    }
});