import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Button } from '../components';
import * as firebase from 'firebase';
import 'firebase/database';
import { Base, Colors } from '../styles';
import Swiper from 'react-native-swiper'

const ScreenContainer = ({ children }) => (
    <View style={styles.container}>{children}</View>
);

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
        if (added) {
            ref.on('value', (data) => {
                if (data.val() != null) {
                    temp = data.val()
                    var index = temp.indexOf(target)
                    if (index > -1) {
                        temp.splice(index, 1)
                    }
                }
            })
        } else {
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

export const UserProfile = ({ route, navigation }) => {
    const { currentUser, userBeingSearch } = route.params
    const [publicOrNot, setPublicOrNot] = useState(true)
    const [coursesSem1, setCoursesSem1] = useState({})
    const [coursesSem2, setCoursesSem2] = useState({})
    const [isFriend, setIsFriend] = useState(false)
    const [displayName, setDisplayName] = useState('');
    const [friendsNumber, setFriendsNumber] = useState(0);
    const noSavedCoursesText = '[No Saved Courses]'
    const db = firebase.database();

    useEffect(() => {
        const ref = db.ref('users/' + userBeingSearch)
        ref.off()
        ref.on('value', (data) => {
            // console.log(data.val())
            setPublicOrNot(data.val()['public'])
            setCoursesSem1(data.val()['sem1'])
            setCoursesSem2(data.val()['sem2'])
            setDisplayName(data.val()['displayName'])
            // console.log(coursesSem1)
            // console.log(data.val()['sem1'])
            if (data.val()['friends'] != null) {
                // setFriendsNumber(data.val()['friends'].numChildren()) // need fix
                if (data.val()['friends'].includes(currentUser)) {
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
                if (data.val().includes(userBeingSearch)) {
                    buttonText = "Undo"
                    buttonColor = Colors.blackButton
                    added = true
                }
            }
        })

        const refCheckFriend = db.ref('users/' + currentUser + "/friends")
        refCheckFriend.off()
        refCheckFriend.on('value', (data) => {
            if (data.val() != null) {
                if (data.val().includes(userBeingSearch)) {
                    disable = true
                    buttonText = "Friend"
                    buttonColor = Colors.greyButton
                }
            }
        })
        return (
            <Button
                disabled={disable}
                title={buttonText}
                backgroundColor={buttonColor}
                onPress={() => { handleAddFriends(currentUser, userBeingSearch, added); }}
            />
        )
    })

    const selectedCoursesOne = Object.entries(coursesSem1).map((course, index) => {
        // alert(course[1])
        if (course[1] == 'empty') {
            return (
                <View key={index} style={styles.unavailableTextContainer}>
                    <Text style={styles.unavailableText}>{noSavedCoursesText}</Text>
                </View>
            )
        }
        console.log(course[0] + " " + course[1])
        return (
            <View key={index} style={styles.havecourses}>
                <Text style={styles.courseTitle}>{course[0]} {course[1]}</Text>
            </View>
        )
    })

    const selectedCoursesTwo = Object.entries(coursesSem2).map((course, index) => {
        // alert(course[1])
        if (course[1] == 'empty') {
            return (
                <View key={index} style={styles.unavailableTextContainer}>
                    <Text style={styles.unavailableText}>{noSavedCoursesText}</Text>
                </View>
            )
        }
        console.log(course[0] + " " + course[1])
        return (
            <View key={index} style={styles.havecourses}>
                <Text style={styles.courseTitle}>{course[0]} {course[1]}</Text>
            </View>
        )
    })

    return (
        <ScreenContainer>
            <View style={styles.proPicContainer}>
                <Image
                    style={styles.tinyLogo}
                    source={require('../assets/emptyProPic.png')}
                />
            </View>
            <View style={styles.userInfoContainer}>
                <View style={styles.namesContainer}>
                    <Text style={styles.displayName}>{displayName}</Text>
                    <Text style={styles.userName}>@{userBeingSearch}</Text>
                </View>
                <View style={styles.friendsContainer}>
                    <Text style={styles.friendsNumber}>{friendsNumber}</Text>
                    <Text style={styles.friendsText}>Friends</Text>
                </View>
            </View>
            <View style={styles.addButton}>
                {friendButton()}
            </View>

            <View style={{ flex: 1 }}>
                <Swiper style={styles.wrapper} showsButtons={false}>
                    <View style={styles.slide1}>
                        <Text style={styles.semTitle}>2021-2022 Sem 1</Text>
                        {isFriend || publicOrNot
                            ? <View style={styles.coursesConainer}>
                                {selectedCoursesOne}
                            </View>
                            : <View style={styles.unavailableTextContainer}>
                                <Text style={styles.unavailableText}>[Course list available to friends only]</Text>
                            </View>}
                    </View>
                    <View style={styles.slide2}>
                        <Text style={styles.semTitle}>2021-2022 Sem 2</Text>
                        {isFriend || publicOrNot
                            ? <View style={styles.coursesConainer}>
                                {selectedCoursesTwo}
                            </View>
                            : <View style={styles.unavailableTextContainer}>
                                <Text style={styles.unavailableText}>[Course list available to friends only]</Text>
                            </View>}
                    </View>
                </Swiper>
            </View>
        </ScreenContainer>


    )
}

const styles = StyleSheet.create({
    container: {
        ...Base.page
    },
    proPicContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        height: '25%',
        // backgroundColor: '#000'
    },
    tinyLogo: {
        height: 120,
        width: 120,
        borderRadius: 20
    },
    userInfoContainer: {
        // backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
        height: '15%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '8%'
    },
    namesContainer: {
        // backgroundColor: '#C0C0C0',
        // paddingHorizontal: 12,
        // borderRadius: 10,
        width: 'auto',
        height: '100%',
        justifyContent: 'center',
    },
    displayName: {
        fontSize: 28,
        fontWeight: 'bold'
    },
    userName: {
        fontSize: 20,
        fontStyle: 'italic'
    },
    friendsContainer: {
        // backgroundColor: 'grey',
        width: '25%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendsNumber: {
        // alignItems: 'center',
        fontSize: 28,
        fontWeight: 'bold'
    },
    friendsText: {
        fontSize: 20
    },
    addButton: {
        borderBottomWidth: 2,
        borderColor: Colors.border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5%',
        height: '10%'
    },
    coursesConainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    semTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        paddingVertical: 10
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
    slide1: {
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: '#9DD6EB'
    },
    slide2: {
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: '#97CAE5'
    },
    courses: {
        backgroundColor: '#F0F0F0',
        borderColor: '#707070',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // flexBasis: '40%',
        borderWidth: 1.5,
        borderRadius: 4,
        marginHorizontal: 10,
        marginVertical: 5,
        padding: 8,
        height: 100,
        width: '70%'
    },
    havecourses: {
        backgroundColor: '#F0F0F0',
        borderColor: '#707070',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexBasis: '40%',
        borderWidth: 1.5,
        borderRadius: 4,
        marginHorizontal: 10,
        marginVertical: 5,
        height: 40
    },
    unavailableTextContainer: {
        paddingVertical: '20%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    unavailableText: {
        fontSize: 20,
        color: '#808080',
        fontStyle: 'italic',
        // fontWeight: 'bold'
    },
})