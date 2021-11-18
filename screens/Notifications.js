import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components';
import { Avatar } from 'react-native-elements';

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';
import 'firebase/database';
import { Colors } from '../styles';

const db = firebase.database()

const ScreenContainer = ({ children }) => (
    <View >{children}</View>
  );

export const Notifications = ({navigation}) => {
    const [friendRequests, setFriendRequests] = useState([])
    const { user } = useContext(AuthenticatedUserContext);
    const currentUsername = user.email.substring(0, user.email.length - 10)

    useEffect(() => {
        const ref = db.ref('users/' + currentUsername + "/requests/friends/received")
        ref.off()
        ref.on('value', (data) => {
            if (data.val() != null){
                setFriendRequests(data.val())
            }
        })
    }, [])

    function handleRequests(element, status){
        for (let i = 0; i < 2; i++) {
            let source, target, path
            if (i == 0){
                source = currentUsername 
                path = "/requests/friends/received"
                target = element
            } else{
                source = element 
                path = "/requests/friends/sent"
                target = currentUsername
            }
            const ref = db.ref('users/' + source + path)
            ref.off()
            var temp = []
            ref.on('value', (data) => {
                if(data.val() != null) {
                    temp = data.val()
                    var index = temp.indexOf(target)
                    if (index > -1){
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

            if (status){
                console.log("Added " + element)
                const ref2 = db.ref('users/' + source + "/friends")
                ref2.off()
                var temp2 = []
                ref2.on('value', (data) => {
                    if (data.val() != null){
                        temp2 = data.val()
                    }
                })
                if(!temp2.includes(target)){
                    temp2.push(target)
                }
                ref2.parent.update({
                    'friends': temp2
                })
    
            }else{
                console.log("Rejected " + element)
            }
        }
        
    }

    const friendsRequestsList = friendRequests.map((element, index) => {
        console.log(element)
        console.log(index)
        return(
            <View key={index} style={styles.noti}>
                <View style={styles.profilePicContainer}>
                    <View style={styles.profilePic}>
                        <Avatar
                            rounded
                            source={require('../assets/emptyProPic.png')}
                        />
                    </View>
                </View>
                <Text>{element} </Text>
                <Button 
                    title='Accept'
                    width='20%'
                    backgroundColor={Colors.orangeButton}
                    onPress={() => {handleRequests(element, true)}}
                />
                <Button 
                    title='Reject'
                    width='20%'
                    backgroundColor={Colors.blackButton}
                    onPress={() => {handleRequests(element, false)}}
                />
            </View>
        )
    })
    return(
        <ScreenContainer>
            <View style={styles.notiContainer}>
                <Text style={{fontSize: 26}}>Groups</Text>
                <View>
                    {/* similar to friends, but do after group is done */}
                </View>
            </View>
            <View style={styles.notiContainer}>
                <Text style={{fontSize: 26}}>Friends</Text>
                {friendsRequestsList}
            </View>
        </ScreenContainer>
    )
} 

const styles = StyleSheet.create({
    profilePicContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1
    },
    profilePic: {
        transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }]
    },
    notiContainer:{
        height: '45%'
    },
    noti:{
        flexDirection: 'row',
        borderWidth: 1,
        padding: 2,
        height: 60
    }
})