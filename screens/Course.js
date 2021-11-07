import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useBottomModal, BottomModal } from 'react-native-lightning-modal';

import { Typography, Colors, Base } from '../styles';
import { InputField, ErrorMessage } from '../components';

import * as firebase from 'firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import 'firebase/database';

const database = firebase.database();

const ScreenContainer = ({ children }) => (
    <View style={styles.container}>{children}</View>
);

export const Course = ({ navigation }) => {
    const [courseCode, setCourseCode] = useState()
    const [courses, setCourses] = useState([])
    const [courses2, setCourses2] = useState([])
    const [selected, setSelected] = useState([])
    const [checkResult, setCheckResult] = useState("")
    const [clashedCourse, setClashedCourse] = useState("")
    const { dismiss, show, modalProps } = useBottomModal();
    const day = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const slot = ['', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30']

    function gotData(data) {
        console.log(data.val())
        // data.val().forEach(element => {
        //     console.log("CODE: " + element.code)
        //     console.log("TITLE: " + element.title)
        // });
        console.log("Fetched")
        setCourses(data.val())
        setCourses2(data.val())
        // console.log(courses) 

    }
    useEffect(() => {
        const ref = database.ref('course/');
        ref.on('value', gotData);
    }, []);

    function searchCourse(text) {
        var temp = []
        Object.entries(courses2).map((course, index) => {
            // console.log(course[1].code)
            // console.log("BREAK")
            if (course[1].code.includes(text.toUpperCase())) {
                console.log(course[1].code)
                temp.push(course[1])
            }
        })
        console.log(temp)
        setCourses(temp)
    }

    function selectCourse(code, section) {
        if (selected.length < 6) {
            var duplicate = false
            selected.forEach((course, index) => {
                console.log(course.code)
                console.log(code)
                if (course.code == code) {
                    duplicate = true
                }
            })
            if (duplicate) {
                alert(code + " is selected previously!")
            } else {
                const temp = selected
                temp.push({ code, section })
                // console.log(...temp)
                setSelected([...temp])
            }

        } else {
            alert("You can select up to 6 courses only!")
        }
    }

    function deselectCourse(index) {
        const temp = selected
        temp.splice(index, 1)
        // console.log(...temp)
        setSelected([...temp])
        // console.log(selected)
        // alert(index)
    }

    function check() {
        var slot_tuple = {};
        selected.forEach((course, index) => {
            course.section[1].forEach((slot, index2) => {
                if (typeof (slot_tuple[slot]) == 'undefined') {
                    slot_tuple[slot] = [course.code + " " + course.section[0]]
                } else {
                    slot_tuple[slot].push(course.code + " " + course.section[0])
                }
                // console.log(slot)
            })
        })
        // console.log(slot_tuple)
        var valid = true
        var found = ""
        Object.entries(slot_tuple).map((slot, index) => {
            if (slot[1].length > 1 && valid) {
                console.log("Time clash")
                slot[1].forEach((course, index) => {
                    console.log(course)
                    found += course + '\n'
                })
                valid = false
            }
        })
        if (valid) {
            // alert("No time clash!")
            setCheckResult("No time clash! 🤩")
            setClashedCourse("")
        } else {
            // alert("Time clash!\n" + found)
            setCheckResult("Time clash! 😮‍💨\n\n")
            setClashedCourse(found)
        }
    }

    const courseList = courses.map((course, index) => {
        // console.log(course.section)
        return (
            Object.entries(course.section).map((section, index) => {
                var timeslot = ""
                var check_day = 0
                var temp = [0, 0, 0, 0, 0, 0]
                var temp2 = [0, 0, 0, 0, 0, 0]
                var pad = ""
                section[1].map((x) => {
                    temp[x[0]] += 1
                    if (check_day != x[0]) {
                        temp2[x[0]] = parseInt(x[2])
                    }
                    check_day = x[0]
                })
                temp.forEach((element, index) => {
                    if (element != 0) {
                        timeslot += pad + '(' + day[index] + ') ' + slot[temp2[index]] + '⁠–' + slot[temp2[index] + element]
                    }
                    if (timeslot != "") {
                        pad = "   "
                    }
                })
                return (
                    <TouchableOpacity style={styles.courseList} key={index} onPress={() => selectCourse(course.code, section)}>
                        <Text style={styles.courseTitle}>{course.code} {section[0]}</Text>
                        <Text>{timeslot}</Text>
                    </TouchableOpacity>
                )
            })
        )
    })

    const selectedCourses = selected.map((course, index) => {
        return (
            <TouchableOpacity style={styles.selectedContainer} key={index} onPress={() => deselectCourse(index)}>
                <Text key={index}>{course.code} {course.section[0]}</Text>
                <MaterialCommunityIcons 
                    name={'window-close'}
                    size={16}
                />
            </TouchableOpacity>
        )
    })

    return (
        <ScreenContainer>
            {/* <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                    name={'magnify'}
                    size={20}
                    iconColor = '#000'
                />
                <TextInput
                    style={styles.input}
                    placeholder="Search Course"
                    onChangeText={text => searchCourse(text)}
                />
            </View> */}
            <InputField
                inputStyle={{
                    fontSize: 14
                }}
                containerStyle={{
                    backgroundColor: '#fff',
                    marginBottom: 20
                }}
                leftIcon='card-search-outline'
                placeholder='Enter Course Code'
                autoCapitalize='none'
                autoCorrect={false}
                textContentType='password'
                value={courseCode}
                onChangeText={text => {
                    setCourseCode(text);
                    searchCourse(text);
                }}
            />
            <ScrollView style={styles.scrollView}>
                {courseList}
            </ScrollView>
            <View style={styles.selectContainer}>
                <Text>Selected</Text>
                {selectedCourses}
            </View>
            <Button
                title='Check'
                onPress={() => {check(); show()}}
            />
            <BottomModal backdropColor="rgba(0,0,0,0.5)" height={600} {...modalProps} >
                <TouchableOpacity style={styles.fill} onPress={dismiss}>
                    <Text style={styles.result}>{checkResult}</Text>
                    <Text style={styles.clashed}>{clashedCourse}</Text>
                    <Text style={styles.close}>Tap to close</Text>
                </TouchableOpacity>
            </BottomModal>
        </ScreenContainer>
    )

}

const styles = StyleSheet.create({
    container: {
        ...Base.page
    },
    // inputContainer: {
    //     borderRadius: 4,
    //     flexDirection: 'row',
    //     padding: 15
    // },
    // input: {
    //     flex: 1,
    //     width: '100%',
    //     fontSize: 18
    // },
    selectContainer: {
        padding: 12,
        height: 200
    },
    selectedContainer: {
        borderRadius: 4,
        flexDirection: 'row',
        padding: 12
    },
    courseList: {
        alignItems: "center",
        backgroundColor: Colors.courseList,
        borderWidth: 1.5,
        borderBottomWidth: 0,
        padding: 10,
        borderRadius: 10
    },
    courseTitle: {
        fontWeight: 'bold'
    },
    scrollView: {
        height: 300,
        borderRadius: 10,
        backgroundColor: Colors.background
    },
    fill: { 
        flex: 5/6,
        alignItems: 'center'
    },
    result:{
        fontSize: 35
    },
    clashed:{
        fontSize: 25
    },
    close:{
        fontSize: 15,
        color: '#c2b38a',
        // fontWeight: '400',
        position: 'absolute',
        bottom: 150
    }

});