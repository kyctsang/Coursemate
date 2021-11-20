import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components';
import * as firebase from 'firebase';
import 'firebase/database';
import { Colors } from '../styles';

const ScreenContainer = ({ children }) => (
    <View style={styles.container}>{children}</View>
);

export const UserProfile = ({ route, navigation }) => {
    const { currentUser, userBeingSearch } = route.params
    const [publicOrNot, setPublicOrNot] = useState(true)
    const [coursesSem1, setCoursesSem1] = useState({})
    const [coursesSem2, setCoursesSem2] = useState({})
    const [isFriend, setIsFriend] = useState(false)
    const db = firebase.database();

    useEffect(() => {
        const ref = db.ref('users/' + userBeingSearch)
        ref.off()
        ref.on('value', (data) => {
            // console.log(data.val())
            setPublicOrNot(data.val()['public'])
            setCoursesSem1(data.val()['sem1'])
            setCoursesSem2(data.val()['sem2'])
            // console.log(coursesSem1)
            // console.log(data.val()['sem1'])
            if (data.val()['friends'] != null) {
                if (data.val()['friends'].includes(currentUser)){
                    setIsFriend(true)
                    console.log("friend:")
                    console.log(isFriend)
                }
            }
        })
    }, [])

    const friendButton = (() => {
        var disable = false
        var buttonText = "Add friend"
        var buttonColor = Colors.orangeButton
        var added = false
        const refCheckFriendRequest = db.ref('users/' + currentUser + '/requests/friends/sent')
        refCheckFriendRequest.off()
        refCheckFriendRequest.on('value', (data) => {
            if (data.val() != null) {
                if (data.val().includes(userBeingSearch)){
                    buttonText = "Undo"
                    buttonColor = Colors.blackButton
                    added = true
                }
            }
        })

        const refCheckFriend = db.ref('users/' + currentUser + "/friends")
        refCheckFriend.off()
        refCheckFriend.on('value', (data) => {
            if (data.val() != null){
                if(data.val().includes(userBeingSearch)){
                    disable = true
                    buttonText = "Friend"
                    buttonColor = Colors.greyButton
                }
            }
        })
        return(
            <Button
                disabled={disable} 
                title={buttonText}
                backgroundColor={buttonColor}
                onPress={() => {handleAddFriends(currentUser, userBeingSearch, added); }}
            />
        )
    })

    const courses = Object.entries(coursesSem1).map((course, index) => {
        // console.log(course)
        if (course[1] == 'empty') {
            return (
                <View key={index} style={styles.courses}>
                    <Text style={styles.courseTitle}>No saved course yet!</Text>
                </View>
            )
        }
        return (
            <View key={index} style={styles.courses}>
                <Text style={styles.courseTitle}>{course[0]} {course[1]}</Text>
            </View>
        )
    })



    return (
        <View>
            <View >
                <Text>Icon</Text>
            </View>
            <Text>@{userBeingSearch}</Text>
            <View style={styles.addButton}>
                {friendButton()}
            </View>

            <View style={styles.coursesConainer}>
                <Text >2021-2022 Sem1</Text>
                {isFriend || publicOrNot ? courses : <Text>Course List available to friends only</Text>}
            </View>
        </View>

    )
}

export function handleAddFriends(currentUser, userBeingAdded, added) {
    const db = firebase.database();
    for (let i = 0; i < 2; i++) {
        let source, target
        if (i == 0) {
            source = userBeingAdded + "/requests/friends/received"
            target = currentUser
        } else {
            source = currentUser + "/requests/friends/sent"
            target = userBeingAdded
        }
        const ref = db.ref('users/' + source)
        ref.off()
        var temp = []
        if(added){
            ref.on('value', (data) => {
                if(data.val() != null){
                    temp = data.val()
                    var index = temp.indexOf(target)
                    if (index > -1){
                        temp.splice(index, 1)
                    }
                }
            })
        }else{
            ref.on('value', (data) => {
                console.log(data.val())
                if (data.val() != null) {
                    temp = data.val()
                }
            })
            temp.push(target)
        }
        if (i == 0) {
            ref.parent.update({
                'received': temp
            })
        } else {
            ref.parent.update({
                'sent': temp
            })
        }
    }
}

const styles = StyleSheet.create({
    coursesConainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    courses: {
        height: 50,
        borderWidth: 3,
        borderRadius: 5,
        margin: 3,
        width: '80%',
        justifyContent: 'center',
        backgroundColor: '#fcba03'
    },
    courseTitle: {
        fontWeight: 'bold',
        textAlign: 'center'
    },
    addButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '25%',
        height: '10%',
        marginVertical: '5%'
    }
})