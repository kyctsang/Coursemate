import React, {useContext, useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from "react-native";

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';

import {Colors} from "../styles";
import {Button} from "../components";
import {BottomModal, useBottomModal} from "react-native-lightning-modal";

export const GroupDetails = ({ navigation, route }) => {
    const {groupId, groupName} = route.params;

    const db = firebase.database();
    const { user } = useContext(AuthenticatedUserContext);
    const username = user.email.substring(0,user.email.length-10);
    const groupRef = db.ref(`groups/${groupId}`)
    const groupMembersRef = db.ref(`groups/${groupId}/members`)
    const userRef = db.ref(`users/${username}`);

    const [members, setMembers] = useState({});
    const [meetingTime, setMeetingTime] = useState(undefined);

    const [message, setMessage] = useState("");
    const { dismiss, show, modalProps } = useBottomModal();

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
        // return () => {
        //     setMembers({});
        //     setMeetingTime(null);
        // }
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
        }).catch(error => {console.log(`Error: ${error.stackTrace}`)});
        setMessage(`${target} has been removed.`);
        show();
    }

    async function deleteGroup(id) {
        // for each group members remove their groups
        // const
        // for each group requests sent, remove them
        // remove group from groups

    }

    const memberList = Object.entries(members).map(([id, membersName], index) => {
        try {
            return (
                <View style={styles.item}
                      key={id}>
                    <TouchableHighlight>
                        <Text style={styles.username}>@{membersName}</Text>
                    </TouchableHighlight>
                    {
                        membersName === username ?
                            <View/> :
                            <Button
                                onPress={() => deleteMember(membersName)}
                                backgroundColor={Colors.redButton}
                                title="Remove"
                                titleColor="#fff"
                                titleSize={16}
                                containerStyle={{padding: 10, width: 90, maxHeight: 30}}
                            />
                    }
                </View>
            )
        } catch (error) {
            console.log(`Error: ${error.stackTrace}`);
        }
    });

    return(
        <View style={styles.container}>
            <Text style={[styles.heading, styles.h1]}>{groupName}</Text>
            {meetingTime !== undefined ? <Text style={styles.h3}>{meetingTime}</Text> : <Text />}
            <Text style={[styles.heading, styles.h2]}>Group members</Text>
            <ScrollView containerStyle={styles.memberList} style={styles.memberContainer}>
                {memberList}
            </ScrollView>
            <Pressable style={[styles.button, styles.orangeButton]}
                onPress={() => navigation.navigate("Search", {addMember: true, groupId: groupId})}>
                <Text style={{color: 'white'}}>Add Members</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.orangeButton]}
                onPress={() => navigation.navigate("Meeting Time", {groupId: groupId})}>
                <Text style={{color: 'white'}}>New Meeting Time</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.redButton]}>
                <Text style={{color: 'white'}}>Delete Group</Text>
            </Pressable>
            <BottomModal backdropColor="rgba(0,0,0,0.5)" height={350} {...modalProps} >
                <TouchableOpacity style={styles.fill} onPress={dismiss}>
                    <Text style={styles.message}>{message}</Text>
                    <Text style={styles.close}>Tap to close</Text>
                </TouchableOpacity>
            </BottomModal>
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
        borderColor: '#56d9c0',
        borderWidth: 1,
        height: 45,
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
    },
    fill: {
        flex: 1,
        width: '100%',
        paddingTop: 50,
        alignItems: 'center'
    },
    message: {
        fontSize: 20,
        textAlign: 'center'
    },
    clashed: {
        fontSize: 25
    },
    saveButton: {
        position: 'absolute',
        backgroundColor: '#f57c00',
        bottom: 300,
        minHeight: 40,
        width: '50%',
        borderRadius: 10,
        justifyContent: 'center'
    },
    close: {
        fontSize: 15,
        color: '#c2b38a',
        position: 'absolute',
        bottom: 200
    }
});