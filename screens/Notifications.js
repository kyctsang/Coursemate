import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Button } from '../components';
import { Avatar } from 'react-native-elements';
import { Typography, Colors, Base } from '../styles';

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';
import 'firebase/database';
import { color } from 'react-native-reanimated';
import { render } from 'react-dom';

const db = firebase.database()

const ScreenContainer = ({ children }) => (
    <View style={styles.container}>{children}</View>
);

export const Notifications = ({ navigation }) => {
    const [friendRequests, setFriendRequests] = useState([])
    const { user } = useContext(AuthenticatedUserContext);
    const currentUsername = user.email.substring(0, user.email.length - 10)
    const [status, setStatus] = useState('Friend')
    const setStatusFilter = s => {
        setStatus(s)
    }
    const listTab = [
        {
            status: 'Friend'
        },
        {
            status: 'Group'
        }
    ]

    useEffect(() => {
        const ref = db.ref('users/' + currentUsername + "/requests/friends/received")
        ref.off()
        ref.on('value', (data) => {
            if (data.val() != null) {
                setFriendRequests(data.val())
            }
        })
    }, [])

    function handleRequests(element, status) {
        for (let i = 0; i < 2; i++) {
            let source, target, path
            if (i == 0) {
                source = currentUsername
                path = "/requests/friends/received"
                target = element
            } else {
                source = element
                path = "/requests/friends/sent"
                target = currentUsername
            }
            const ref = db.ref('users/' + source + path)
            ref.off()
            var temp = []
            ref.on('value', (data) => {
                if (data.val() != null) {
                    temp = data.val()
                    var index = temp.indexOf(target)
                    if (index > -1) {
                        temp.splice(index, 1)
                    }
                }
            })
            if (i == 0) {
                ref.parent.update({
                    'received': temp
                })
                setFriendRequests(temp)
            } else {
                ref.parent.update({
                    'sent': temp
                })
            }

            if (status) {
                console.log("Added " + element)
                const ref2 = db.ref('users/' + source + "/friends")
                ref2.off()
                var temp2 = []
                ref2.on('value', (data) => {
                    if (data.val() != null) {
                        temp2 = data.val()
                    }
                })
                if (!temp2.includes(target)) {
                    temp2.push(target)
                }
                ref2.parent.update({
                    'friends': temp2
                })

            } else {
                console.log("Rejected " + element)
            }
        }

    }

    const friendsRequestsList = friendRequests.map((element, index) => {
        console.log(element)
        console.log(index)

        const refDisplayName = db.ref('users/' + element + '/displayName')
        let displayName = ''
        refDisplayName.off()
        refDisplayName.on('value', (data) => {
            displayName = data.val()
        })
        return (
            <View key={index} style={styles.noti}>
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
                        {displayName}
                    </Text>
                    <Text style={styles.userName}>
                        {'@' + element}
                    </Text>
                </View>
                <View style={styles.button}>
                    <Button
                        title='Accept'
                        tileColor='#fff'
                        titleSize={14}
                        backgroundColor={Colors.orangeButton}
                        onPress={() => { handleRequests(element, true) }}
                    />
                </View>
                <View style={styles.button}>
                    <Button
                        title='Reject'
                        tileColor='#fff'
                        titleSize={14}
                        backgroundColor={Colors.blackButton}
                        onPress={() => { handleRequests(element, false) }}
                    />
                </View>
            </View>
        )
    })

    function renderList() {
        // console.log(status)
        return status === 'Friend' ? friendsRequestsList : friendsRequestsList // <Text style={{ fontSize: 40 }}>No Group Invitations</Text> // Change to groupInvitationList
    }

    return (
        <ScreenContainer>
            <SafeAreaView>
                <View style={styles.listTab}>
                    {
                        listTab.map(e => (
                            <TouchableOpacity
                                key={e.status}
                                style={[styles.btnTab, status === e.status && styles.btnTabActive]}
                                onPress={() => setStatusFilter(e.status)}
                            >
                                <Text
                                    style={[styles.textTab, status === e.status && styles.textTabActive]}
                                >
                                    {e.status}
                                </Text>
                            </TouchableOpacity>))
                    }
                </View>
                <View style={styles.notiContainer}>
                    {renderList()}
                </View>
            </SafeAreaView>
        </ScreenContainer>
    )
}

const styles = StyleSheet.create({
    container: {
        ...Base.page
    },
    profilePicContainer: {
        // backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        minWidth: 50,
        maxWidth: 70
    },
    profilePic: {
        transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }]
    },
    notiContainer: {
        // height: '45%'
    },
    noti: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 80,
        padding: 14,
        borderBottomWidth: 0.9,
        borderColor: Colors.border
    },
    listTab: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        alignSelf: 'center',
        borderBottomWidth: 1,
        borderColor: Colors.border
    },
    btnTab: {
        borderWidth: 0.5,
        borderColor: Colors.greyButton,
        padding: 8,
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnTabActive: {
        backgroundColor: '#ff8243'
    },
    textTab: {
        color: "#000",
        fontSize: 16
    },
    textTabActive: {
        color: '#fff'
    },
    usersInfo: {
        backgroundColor: '#F0F0F0',
        borderRadius: 6,
        flexGrow: 2,
        flexDirection: 'column',
        paddingLeft: 12,
        maxWidth: 170
    },
    displayName: {
        fontWeight: 'bold',
        fontSize: 20
    },
    userName: {
        fontSize: 16
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        paddingLeft: 10,
        maxWidth: 80
    },
})