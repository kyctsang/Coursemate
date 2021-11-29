import React, {useContext, useEffect, useState} from 'react';

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    Picker,
    Pressable,
    TouchableOpacity
} from "react-native";
import { RadioButton } from 'react-native-paper';
import {Button} from "../components";
import {Colors} from "../styles";
import {BottomModal, useBottomModal} from "react-native-lightning-modal";

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

    const TIMESLOTS_HOURS_DIFF = 7;

    const [meetingDay, setMeetingDay] = useState("Monday");
    const [meetingLength, setMeetingLength] = useState("1");
    const [meetingTimeslots, setMeetingTimeslots] = useState(allTimeslots);

    const [groupMembers, setGroupMembers] = useState([]);
    const [membersCourses, setMembersCourses] = useState([]);
    const [coursesTimeslots, setCoursesTimeslots] = useState([]);

    const [message, setMessage] = useState("");
    const { dismiss, show, modalProps } = useBottomModal();
    const [leavePage, setLeavePage] = useState(false);

    const [checked, setChecked] = useState("");

    const timeList = Object.entries(meetingTimeslots).map(([idx, time]) => {
        return (
            <View style={styles.item}
                  key={time}>
                <RadioButton
                    value={time}
                    status={ checked === time ? "checked" : "unchecked" }
                    onPress={() => setChecked(time)}
                />
                <TouchableHighlight>
                    <Text style={styles.username}>{time}</Text>
                </TouchableHighlight>
            </View>
        )
    });


    useEffect(() => {
        try {
            // get this group members list
            groupMembersRef.once('value')
                .then(snapshot => {
                    setGroupMembers(snapshot.val());
                });
        } catch(error) {
            console.log(`Error: ${error.stackTrace}`)
        }
        // return () => {setGroupMembers([])};
    }, [meetingDay, meetingLength]);

    useEffect(() => {
        try {
            // get all of the members' courseList
            db.ref('users').once('value')
                .then(snapshot => {
                    return snapshot.exportVal();
                }).then(users => {
                    let allCourses = [];
                    for (let groupMember of groupMembers) {
                        if (users[groupMember]["sem1"]["empty"] !== "empty")
                            allCourses.push(users[groupMember]['sem1']);
                    }
                    setMembersCourses(allCourses);
                });
        } catch(error) {
            console.log(`Error: ${error.stackTrace}`)
        }
        // return () => {
        //     setMembersCourses([]);
        // }
    }, [groupMembers]);

    useEffect(() => {
        try {
            // get all of the courses' timeslots
            db.ref('courses/sem1').once('value')
                .then(snapshot => {
                    return snapshot.exportVal();
                }).then(allSemCourses => {
                    let membersCoursesTimeslots = []
                    for (let coursesObj of membersCourses) {
                        for (const [title, subClass] of Object.entries(coursesObj)) {
                            for (const [idx, time] of Object.entries(allSemCourses[title]['section'][subClass])) {
                                membersCoursesTimeslots.push(time);
                            }
                        }
                    }
                    setCoursesTimeslots(membersCoursesTimeslots);
                    console.log(membersCoursesTimeslots);
            });
        } catch(error) {
            console.log(`Error: ${error.stackTrace}`)
        }
        // return () => {
        //     setCoursesTimeslots([]);
        // }
    }, [membersCourses]);

    /* useEffect on [meetingDay]
    get available timeslot on that day
     */
    useEffect(() => {
        let dayIdx = allDays.indexOf(meetingDay) + 1; // 1 to 5
        let meetingDayUnavailableTimeslots = [];
        for (let dayTime of coursesTimeslots) {
            if (dayTime.charAt(0) === dayIdx.toString()) {
                meetingDayUnavailableTimeslots.push(parseInt(dayTime.split("-")[1]))
            }
        }
        // generate available start time
        let availableStartTimeslots = [];
        for (let i = 1; i < 14 - parseInt(meetingLength); i++) {
            if (meetingDayUnavailableTimeslots.indexOf(i) === -1) {
                let comingMeetingLengthFree = true
                for (let j = i + 1; j < i + parseInt(meetingLength); j++) {
                    if (meetingDayUnavailableTimeslots.indexOf(j) !== -1) {
                        comingMeetingLengthFree = false;
                        break;
                    }
                }
                if (comingMeetingLengthFree) { availableStartTimeslots.push(i); }
            }
        }
        let timeslots = [];
        for (let time of availableStartTimeslots) {
            let startTimePM = (time + TIMESLOTS_HOURS_DIFF) > 12;
            let startTime = startTimePM ? (time + TIMESLOTS_HOURS_DIFF) % 12 : time + TIMESLOTS_HOURS_DIFF;
            let endTimePM = (time + parseInt(meetingLength) + TIMESLOTS_HOURS_DIFF) > 12;
            let endTime = endTimePM ? (time + parseInt(meetingLength) + TIMESLOTS_HOURS_DIFF) % 12 : time + parseInt(meetingLength) + TIMESLOTS_HOURS_DIFF;
            timeslots.push(`${startTime}:30${startTimePM || startTime === 12 ? "PM" : "AM"} - ${endTime}:30${endTimePM || endTime === 12 ? "PM" : "AM"}`)
        }
        setMeetingTimeslots(timeslots);
        {
            /* DEBUG */
            // console.log(meetingDayUnavailableTimeslots);
            // console.log(availableStartTimeslots);
            // console.log(timeslots);
        }
        // return () => {
        //     setMeetingTimeslots([]);
        //
        // }
    }, [meetingDay, meetingLength]);

    function handleConfirmTimeslot(time) {
        console.log(time);
        if (time === "" || time === undefined ) {
            setMessage("Please select a timeslot.");
            show();
            return;
        }
        const updates = {};
        updates["meetingTime"] = meetingDay + " " + time;
        groupRef.update(updates);
        setMessage(`Next meeting is set on\n${meetingDay + " " + time}.`);
        show();
        setLeavePage(true);
    }

    function dismissNavigate() {
        navigation.navigate("Group Details", {groupId: groupId});
    }

    return (
        <View style={{padding: 20, backgroundColor: 'white', height: '100%'}}>
            {/* <Text style={[styles.heading, styles.h1]}>New Meeting Time</Text> */}
            <ScrollView style={{background: "#FFFFFF"}}>
                {/* Picker for meeting day */}
                <Text style={[styles.subHeading, styles.h4]}>Meeting Day</Text>
                <Picker style={styles.picker}
                        selectedValue ={meetingDay}
                        onValueChange={day => {setMeetingDay(day)}}>
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
                    onValueChange={length => {setMeetingLength(length)}}>
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
                {meetingTimeslots.length === 0 ? <Text style={[styles.heading, styles.h2, {color: 'orange'}]}>Group members are busy today!</Text> : <Text />}
                {timeList}
            </ScrollView>
            <Pressable style={ meetingTimeslots.length ? styles.button : styles.disabledButton}
                       disabled={!meetingTimeslots.length}
                       onPress={() => handleConfirmTimeslot(checked)}>
                <Text style={{color: 'white'}}>Confirm Meeting Time</Text>
            </Pressable>
            <BottomModal backdropColor="rgba(0,0,0,0.5)" height={350} {...modalProps} >
                <TouchableOpacity style={styles.fill} onPress={leavePage ? () => {dismissNavigate()} : dismiss}>
                    <Text style={styles.message}>{message}</Text>
                    <Text style={styles.close}>Tap to close</Text>
                </TouchableOpacity>
            </BottomModal>
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
        marginVertical: 10
    },
    h2: {
        fontSize: 20,
        marginVertical: 10
    },
    h3: {
        fontSize: 14,
        marginVertical: 10
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
        backgroundColor: Colors.blackButton,
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