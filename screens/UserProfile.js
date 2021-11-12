import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components';
import * as firebase from 'firebase';
import 'firebase/database';
import { add } from 'react-native-reanimated';

const ScreenContainer = ({ children }) => (
    <View style={styles.container}>{children}</View>
  );

export const UserProfile = ({route, navigation}) => {
    const {currentUser, userBeingSearch} = route.params
    const [publicOrNot, setPublicOrNot] = useState(true)
    const [coursesSem1, setCoursesSem1] = useState({})
    const [coursesSem2, setCoursesSem2] = useState({})
    const [added, setAdded] = useState(false)
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
            
        })

        /*
            Will add refCheckFriend here
            for checking existing friends
        */

        const refCheckFriendRequest = db.ref('users/' + currentUser + '/requests/friends/sent')
        refCheckFriendRequest.off()
        refCheckFriendRequest.on('value', (data) => {
            if (data.val() != null) {
                data.val().forEach(element => {
                    if (element == userBeingSearch){
                        setAdded(true)
                    }
                })
            }
        })
    }, [])

    function handleAddFriend(){
        for (let i = 0; i < 2; i++){
            let source, target, value
            if (i==0){
                source = userBeingSearch + "/requests/friends/received"
                target = currentUser
                value = "Pending"
            }else{
                source = currentUser + "/requests/friends/sent"
                target = userBeingSearch
                value = "Requested"
            }
            const ref = db.ref('users/' + source )
            ref.off()
            var temp = []
            ref.on('value', (data) => {
                console.log(data.val())
                if (data.val() != null) {
                    data.val().forEach(element => {
                        temp.push(element)
                    });
                }
            })
            temp.push(target)
            if (i == 0){
                ref.parent.update({
                    'received': temp
                })
            }else{
                ref.parent.update({
                    'sent': temp
                })
            }
        }
        setAdded(true)
    }

    const courses = Object.entries(coursesSem1).map((course, index) => {
        // console.log(course)
        if(course[1] == 'empty'){
            return(
            <View key={index} style={styles.courses}>
                <Text style={styles.courseTitle}>No saved course yet!</Text>
            </View>
            )
        }
        return(
            <View key={index} style={styles.courses}>
                <Text style={styles.courseTitle}>{course[0]} {course[1]}</Text>
            </View>
        )
    })

    

    return(
        <View>
            <View style={{height:'30%', marginHorizontal: '30%', borderWidth:'1sp', marginVertical: '3%'}}>
                <Text>Icon</Text>
            </View>
            <Text>@{userBeingSearch}</Text>
            <View style={styles.addButton}>
                <Button 
                disabled={added}
                title={added ? "Requested" : "Add Friend" }
                backgroundColor={added ? 'black' : 'red'}
                onPress={() => handleAddFriend()}
                />
            </View>
            <View style={{borderBottomColor: 'black', borderBottomWidth: '1sp', marginBottom: '3%'}}/>
            
            <View style={styles.coursesConainer}>
                <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 20, marginBottom: 10}}>2021-2022 Sem1</Text>
                {publicOrNot ? courses : <Text>Course List available to friends only</Text>}
            </View>
        </View>
        
    )
  }


  const styles = StyleSheet.create({
    coursesConainer: {
        justifyContent:'center',
        alignItems: 'center'
    },
    courses: {
        height: 50, 
        borderWidth: 3, 
        borderRadius: 5, 
        margin: 3, 
        width:'80%',
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