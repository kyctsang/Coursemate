import React, {useContext, useEffect, useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from "react-native";

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';

import {Colors} from "../styles";
import {Button} from "../components";

export const GroupDetails = ({ navigation, route }) => {
    const {groupId, groupName} = route.params;

    const db = firebase.database();
    const { user } = useContext(AuthenticatedUserContext);
    const username = user.email.substring(0,user.email.length-10);
    const groupRef = db.ref(`groups/${groupId}`)
    const groupMembersRef = db.ref(`groups/${groupId}/members`)
    const userRef = db.ref(`users/${username}`);

    const [members, setMembers] = useState({});
    const [meetingTime, setMeetingTime] = useState(null);

    useEffect(() => {
        try {
            groupMembersRef.on('value', data => {
                setMembers(data.val());
                console.log(data.val())
            });
            groupRef.on('value', snapshot => {
                if ("meetingTime" in snapshot.exportVal()) {
                    setMeetingTime("Regular Meeting: " + snapshot.exportVal()["meetingTime"]);
                }
            });
        } catch (error) {
            console.log(`Error: ${error.stackTrace}`);
        }
    }, []);

    function deleteMember(target) {
        const updates = {};
        let tempMembers = members;
        for (const [key, user] of Object.entries(tempMembers)) {
            if (user === target) {
                delete tempMembers[key];
                break;
            }
        }
        updates["members"] = tempMembers;
        groupRef.update(updates);

        db.ref(`users/${target}/groups`).once('value')
            .then(snapshot => {
                return snapshot.val();
            }).then(userGroups => {
                for (let group of userGroups) {
                    if (group["id"] === groupId) {
                        let idx = userGroups.indexOf(group)
                        userGroups.splice(idx, 1);
                    }
                }
                const updates = {};
                updates["groups"] = userGroups
            userRef.update(updates);
        })

        Alert.alert(`${target} has been removed.`);
    }

    async function deleteGroup(id) {

    }

    const memberList = Object.entries(members).map(([id, username], index) => {
        return (
            <View style={styles.item}
                  key={id}>
                <TouchableHighlight>
                    <Text style={styles.username}>{username}</Text>
                </TouchableHighlight>
                <Button
                    onPress={() => deleteMember(username)}
                    backgroundColor={Colors.redButton}
                    title="Remove"
                    titleColor="#fff"
                    titleSize={16}
                    containerStyle={{padding: 10, width: 90, maxHeight: 30}}
                />
            </View>

        )
    });

    return(
        <View style={styles.container}>
            <Text style={[styles.heading, styles.h1]}>{groupName}</Text>
            {meetingTime != null ? <Text style={styles.h3}>{meetingTime}</Text> : <Text />}
            <Text style={[styles.heading, styles.h2]}>Group members</Text>
            <ScrollView containerStyle={styles.memberList} style={styles.memberContainer}>
                {memberList}
            </ScrollView>
            <Pressable style={[styles.button, styles.greenButton]}
                onPress={() => navigation.navigate("Search", {addMember: true, groupId: groupId})}>
                <Text style={{color: 'white'}}>Add Members</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.blueButton]}
                onPress={() => navigation.navigate("MeetingTime", {groupId: groupId})}>
                <Text style={{color: 'white'}}>New Meeting Time</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.redButton]}>
                <Text style={{color: 'white'}}>Delete Group</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    heading: {
        color: "#2B2D2F",
        fontWeight: 'bold',
        textAlign: 'center',
    },
    h1: {
        fontSize: 28,
        marginTop: 10,
        marginLeft: 10
    },
    h2: {
        fontSize: 20,
        margin: 10
    },
    h3: {
        fontSize: 14,
        marginLeft: 10
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        marginTop: 10,
        width: '100%'
    },
    redButton: {backgroundColor: Colors.redButton},
    orangeButton: {backgroundColor: Colors.orangeButton},
    greyButton: {backgroundColor: Colors.greyButton},
    greenButton: {backgroundColor: Colors.greenButton},
    blueButton: {backgroundColor: Colors.blueButton},
    memberContainer: {
        width: '100%',
        maxHeight: 500
    },
    memberList: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderColor: '#2a4944',
        borderWidth: 1,
    },
    username: {
        fontSize: 14
    },
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '100%',
        backgroundColor: 'white',
        padding: 20
    }
});