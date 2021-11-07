import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useBottomModal, BottomModal } from 'react-native-lightning-modal';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';

import { Typography, Colors, Base } from '../styles';
import { InputField, ErrorMessage, Button } from '../components';
import InsetShadow from 'react-native-inset-shadow'

import * as firebase from 'firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import 'firebase/database';

const db = firebase.database();

const ScreenContainer = ({ children }) => (
    <View style={styles.container}>{children}</View>
);

export const Course = ({ navigation }) => {
    const [courses, setCourses] = useState({})
    const [courses2, setCourses2] = useState({})
    const [courseCode, setCourseCode] = useState()
    const [selected, setSelected] = useState([])
    const [message, setMessage] = useState("")
    const [clashedCourse, setClashedCourse] = useState("")
    const { dismiss, show, modalProps } = useBottomModal();


    const { user } = useContext(AuthenticatedUserContext);
    const day = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const slot = ['', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30']

    function gotCourses(data) {
        // console.log(data.val())
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
        var ref = db.ref('course/');
        ref.on('value', gotCourses);

        // ref = db.ref('users/'+user.uid);
        // ref.on('value', (data) => {
        //     console.log(data.val())
        //     console.log('users/'+user.uid)
        //     // console.log(user.uid)
        // })
    }, []);

    function searchCourse(text){
        var temp = {}
        // console.log("START")
        Object.entries(courses2).map((course, index) => {
            // console.log(course[1].code)
            // console.log("BREAK")
            if (course[0].includes(text)) {
                // console.log(course[1].code)
                temp[course[0]] = course[1]
            }
        })
        // console.log(temp)
        setCourses(temp)
    }

    function selectCourse(code, section){
        // console.log("CODE: " + code + ", SECTION: " + section)
        if (selected.length < 6) {
            var duplicate = false
            selected.forEach((course, index) => {
                // console.log(course.code)
                // console.log(code)
                if (course.code == code) {
                    duplicate = true
                }
            })
            if (duplicate) {
                setMessage(code + " is selected already! 🤨")
                setClashedCourse("")
                show()
            } else {
                const temp = selected
                temp.push({ code, section })
                // console.log(section)
                // console.log(...temp)
                setSelected([...temp])
            }

        } else {
            setMessage("You can select up to 6 courses only! 🤥")
            setClashedCourse("")
            show()
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
                // console.log("Time clash")
                slot[1].forEach((course, index) => {
                    // console.log(course)
                    found += course + '\n'
                })
                valid = false
            }
        })
        if (valid) {
            // alert("No time clash!")
            setMessage("No time clash! 🤩")
            setClashedCourse("")
        } else {
            // alert("Time clash!\n" + found)
            setMessage("Time clash! 😮‍💨\n\n")
            setClashedCourse(found)
        }
    }

    const courseList = Object.entries(courses).map((course, index) => {
        // console.log(course[0])
        // console.log(course[1].section)
        return(
            Object.entries(course[1].section).map((timeslots, index2) => {
                // console.log(course[0] + " " + timeslots[0])
                var timeslot = ""
                var check_day = 0
                var temp = [0, 0, 0, 0, 0, 0]
                var temp2 = [0, 0, 0, 0, 0, 0]
                var pad = ""
                timeslots[1].forEach((slot, index3) => {
                    // console.log(slot)
                    temp[slot[0]] += 1
                    if (check_day != slot[0]) {
                        temp2[slot[0]] = parseInt(slot[2])
                    }
                    check_day = slot[0]
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
                    <View style={{ height: 70 }}>
                        <InsetShadow>
                            <TouchableOpacity style={styles.courseList} key={index} onPress={() => selectCourse(course[0], timeslots)}>
                                <Text style={styles.courseTitle}>{course[0]} {timeslots[0]}</Text>
                                <Text>{timeslot}</Text>
                            </TouchableOpacity>
                        </InsetShadow>
                    </View>
                )
            })
        )
    })

    const selectedCourses = selected.map((course, index) => {
        return (
            <TouchableOpacity style={styles.selectedItem} key={index} onPress={() => deselectCourse(index)}>
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
            <View style={styles.searchBar}>
                <InputField
                    inputStyle={{
                        fontSize: 14
                    }}
                    containerStyle={{
                        backgroundColor: '#E8E8E8',
                        marginBottom: 16
                    }}
                    leftIcon='card-search-outline'
                    placeholder='Enter Course Code'
                    autoCapitalize='characters'
                    autoCorrect={false}
                    textContentType='password'
                    value={courseCode}
                    onChangeText={text => {
                        setCourseCode(text.toUpperCase());
                        searchCourse(text.toUpperCase());
                    }}
                />
            </View>
            <ScrollView style={styles.scrollView}>
                {courseList}
            </ScrollView>
            <View style={styles.selectedContainer}>
                <Text style={styles.title}>Selected Courses</Text>
                <View style={styles.selectedList}>
                    {selectedCourses}
                </View>
            </View>
            <View style={{ paddingHorizontal: 12 }}>
                <Button
                onPress={() => { 
                    check(); 
                    show();
                }}
                backgroundColor={Colors.button1}
                title='Check'
                tileColor='#fff'
                titleSize={20}
                containerStyle={{
                    marginBottom: 12
                }}
                />
            </View>
            <BottomModal backdropColor="rgba(0,0,0,0.5)" height={600} {...modalProps} >
                <TouchableOpacity style={styles.fill} onPress={dismiss}>
                    <Text style={styles.message}>{message}</Text>
                    <Text style={styles.clashed}>{clashedCourse}</Text>
                    <Text style={styles.close}>Tap to close</Text>
                </TouchableOpacity>
            </BottomModal>
        </ScreenContainer >
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
    searchBar: {
        paddingHorizontal: 12
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        alignSelf: 'center'
    },
    selectedContainer: {
        padding: 12,
        // backgroundColor: '#000',
        height: 200
    },
    selectedList: {
        padding: 12,
        height: 70,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center'

    },
    selectedItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40%',
        borderWidth: 1.5,
        borderRadius: 4,
        marginHorizontal: 17,
        marginVertical: 5,
        height: 40,
        flexDirection: 'row'
    },
    courseList: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15
    },
    courseTitle: {
        fontWeight: 'bold',
        fontSize: 16
    },
    scrollView: {
        display: 'flex',
        height: 100, // ?
        // borderWidth: 2,
        backgroundColor: '#fff'
    },
    fill: { 
        flex: 1,
        width: '100%',
        paddingTop: 50,
        alignItems: 'center'
    },
    message: {
        fontSize: 35,
        textAlign: 'center'
    },
    clashed: {
        fontSize: 25
    },
    close: {
        fontSize: 15,
        color: '#c2b38a',
        // fontWeight: '400',
        position: 'absolute',
        bottom: 200
    }

});