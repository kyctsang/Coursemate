import React, {useContext, useEffect, useState} from 'react';

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';
import {ScrollView, StyleSheet, Text, TouchableHighlight, View, Picker, Pressable} from "react-native";
import { RadioButton } from 'react-native-paper';
import {Button} from "../components";
import {Colors} from "../styles";

export const MeetingTime = ({ navigation, route }) => {
    const {groupId} = route.params;

    const db = firebase.database();
    const { user } = useContext(AuthenticatedUserContext);
    const username = user.email.substring(0,user.email.length-10);
    const groupRef = db.ref(`groups/${groupId}`)
    const groupMembersRef = db.ref(`groups/${groupId}/members`)
    const userRef = db.ref(`users/${username}`);

    const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

    const allTimeslots = [
        "8:30am - 9:30am",
        "9:30am - 10:30am",
        "10:30am - 11:30am",
        "11:30am - 12:30pm",
        "12:30pm - 1:30pm",
        "1:30pm - 2:30pm",
        "2:30pm - 3:30pm",
        "3:30pm - 4:30pm",
        "4:30pm - 5:30pm",
        "5:30pm - 6:30pm",
        "6:30pm - 7:30pm",
        "7:30pm - 8:30pm"]

    const [meetingDay, setMeetingDay] = useState("Monday");
    const [meetingLength, setMeetingLength] = useState(1);
    const [timeslots, setTimeslots] = useState(allTimeslots);

    const [members, setMembers] = useState([]);
    const [tempCourseStudied, setTempCourseStudied] = useState({});
    const [unavailableTimeslots, setUnavailableTimeslots] = useState([]);

    const [checked, setChecked] = useState('');
    const [confirmEnabled, setConfirmEnabled] = useState(true);

    const timeList = Object.entries(timeslots).map(([index, time]) => {
        return (
            <View style={styles.item}
                  key={time}>
                <RadioButton
                    value={time}
                    status={ checked === time ? 'checked' : 'unchecked' }
                    onPress={() => setChecked(time)}
                />
                <TouchableHighlight>
                    <Text style={styles.username}>{time}</Text>
                </TouchableHighlight>
            </View>
        )
    });

    async function addCourseTime(courseName, subClass) {
        let courseRef = db.ref(`courses/sem1/${courseName}/section/${subClass}`)
        await courseRef.once('value')
            .then(snapshot => {
                if (snapshot) {
                    let tempList = snapshot.val();
                    let matchingList = []
                    for (let dayTime of tempList) {
                        if (dayTime.charAt(0) === (allDays.indexOf(meetingDay) + 1).toString() ) {
                            let timeList = dayTime.split("-")

                            matchingList.push(parseInt(timeList[1]));
                        }
                    }
                    setUnavailableTimeslots(unavailableTimeslots.concat(matchingList));
                    console.log(`tempList added: ${matchingList} to ${unavailableTimeslots}`)
                }
            }).catch(error => {console.log(`Error: ${error}`)});
    }

    useEffect(() => {
        fetchMembers().then();
    }, [meetingDay, meetingLength])

    useEffect(() => {
        setUnavailableTimeslots([]);
        for (let member of members) {
            let userCoursesRef = db.ref(`users/${member}/sem1`);
            userCoursesRef.once('value')
                .then(userCourses => {1
                    if (userCourses) {
                        console.log(userCourses.exportVal());
                        setTempCourseStudied(userCourses.exportVal());
                    }
                }).catch(error => {console.log(`Error: ${error}`)});
        }
    }, [members])

    useEffect(() => {
        if (tempCourseStudied) {
            for (let key in tempCourseStudied) {
                console.log(`course name is ${key}`);
                addCourseTime(key, tempCourseStudied[key])
                    .catch(error => {console.log(`Error: ${error}`)});
            }
        }
    }, [tempCourseStudied])

    useEffect(() => {
        let allTimeslotsIdx = [0,1,2,3,4,5,6,7,8,9,10,11]
        let differences = allTimeslotsIdx.filter(x => !unavailableTimeslots.includes(x))
        let finalTimeslots = []
        for (let difference of differences) {
            finalTimeslots.push(allTimeslots[difference])
        }
        console.log(`final timeslots are ${finalTimeslots}`)
        setTimeslots(finalTimeslots);
    }, [unavailableTimeslots])

    async function fetchMembers() {
        console.log(`Meeting Day is ${meetingDay}`)
        groupMembersRef.once('value')
            .then(groupMembers => {
                setMembers(groupMembers.val())
            });
        // await groupMembersRef.once('value')
        //     .then(async groupMembers => {
        //         for (let member of groupMembers.val()) {
        //             console.log(`Username is ${member}`);
        //             let userCoursesRef = db.ref(`users/${member}/sem1`)
        //             await userCoursesRef.once('value')
        //                 .then(userCourses => {
        //                     if (userCourses) {
        //                         console.log(userCourses.exportVal())
        //                         setTempCourseStudied(userCourses.exportVal());
        //                     }
        //                 }).catch(error => {console.log(`Error: ${error}`)});
        //             if (tempCourseStudied) {
        //                 for (let key in tempCourseStudied) {
        //                     console.log(`course name is ${key}`);
        //                     await addCourseTime(key, tempCourseStudied[key])
        //                         .catch(error => {console.log(`Error: ${error}`)});
        //                 }
        //             }
        //         }
        //     });
        //
        // await filterUnavailableTime(day)
    }

    function filterUnavailableTime(day) {
        let dayUnavailableTime = [];
        let dayAvailableTimeslots = [];
        console.log(`Unavailable timeslots are ${unavailableTimeslots}`);
        for (let unavailableTimeslot of unavailableTimeslots) {
            console.log(`Unavailable timeslot is ${unavailableTimeslot}`)
            if (parseInt(unavailableTimeslot[0]) === allDays.indexOf(day) + 1) {
                console.log(`temp day idx now is ${day}`)
                dayUnavailableTime.push(parseInt(unavailableTimeslot.split("-").pop()));
            }
        }
        console.log(`dayUnavailable time is : ${dayUnavailableTime}`);
        for (let i = allTimeslots.length; i >= 0; i--) {
            if (dayUnavailableTime.indexOf(i) === -1) {
                dayAvailableTimeslots.push(allTimeslots[i]);
            }
        }
        dayUnavailableTime.splice(dayAvailableTimeslots.indexOf(null));
        dayUnavailableTime.reverse();
        setTimeslots(dayAvailableTimeslots);
        console.log(dayAvailableTimeslots);
    }

    return (
        <View style={{padding: 20, backgroundColor: 'white', height: '100%'}}>
            <Text style={[styles.heading, styles.h1]}>New Meeting Time</Text>
            <ScrollView style={{background: "#FFFFFF"}}>
                {/* Picker for meeting day */}
                <Text style={[styles.subHeading, styles.h4]}>Meeting Day</Text>
                <Picker style={styles.picker}
                        selectedValue ={meetingDay}
                        onValueChange={async (itemValue) => {setMeetingDay(itemValue)}}>
                    <Picker.Item label="Monday" value="Monday" />
                    <Picker.Item label="Tuesday" value="Tuesday" />
                    <Picker.Item label="Wednesday" value="Wednesday" />
                    <Picker.Item label="Thursday" value="Thursday" />
                    <Picker.Item label="Friday" value="Friday" />
                </Picker>
                {/* Picker for meeting length */}
                <Text style={[styles.subHeading, styles.h4]}>Meeting Length</Text>
                <Picker style={styles.picker}
                    selectedValue ={meetingLength}
                    onValueChange={(itemValue) => setMeetingLength(itemValue)}>
                    <Picker.Item label="1 hour" value="1" />
                    <Picker.Item label="2 hours" value="2" />
                    <Picker.Item label="3 hours" value="3" />
                    <Picker.Item label="4 hours" value="4" />
                    <Picker.Item label="5 hours" value="5" />
                    <Picker.Item label="6 hours" value="6" />
                    <Picker.Item label="7 hours" value="7" />
                    <Picker.Item label="8 hours" value="8" />
                </Picker>
                <Text style={[styles.subHeading, styles.h4]}>Suggested Meeting Time</Text>
                {timeslots.length === 0 ? <Text style={[styles.heading, styles.h2]}>Group members are busy today!</Text> : <Text />}
                {timeList}
            </ScrollView>
            <Pressable style={ timeslots.length ? styles.button : styles.disabledButton}
                       disabled={timeslots.length}
                       onPress={() => console.log('pressed1')}>
                <Text style={{color: 'white'}}>Confirm Meeting Time</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    heading: {
        color: '#111',
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
    },
    subHeading: {
        color: '#555',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    h1: {
        fontSize: 28,
        marginBottom: 10
    },
    h2: {
        fontSize: 20,
        marginBottom: 10
    },
    h3: {
        fontSize: 14,
        marginBottom: 10
    },
    h4: {
        fontSize: 14
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: Colors.orangeButton,
        marginTop: 20,
        width: '100%'
    },
    disabledButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: Colors.greyButton,
        marginTop: 20,
        width: '100%'

    },
    redButton: {backgroundColor: Colors.redButton},
    orangeButton: {backgroundColor: Colors.orangeButton},
    greyButton: {backgroundColor: Colors.greyButton},
    greenButton: {backgroundColor: Colors.greenButton},
    blueButton: {backgroundColor: Colors.blueButton},
    picker: {
        height: 36
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
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
        alignItems: 'center',
        height: '100%',
        backgroundColor: 'white',
        padding: 20
    }
});