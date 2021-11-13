import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useBottomModal, BottomModal } from 'react-native-lightning-modal';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';

import { Typography, Colors, Base } from '../styles';
import { InputField, ErrorMessage, Button } from '../components';
import InsetShadow from 'react-native-inset-shadow'
import ToggleSwitch from 'rn-toggle-switch'

import * as firebase from 'firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import 'firebase/database';

const db = firebase.database();

const ScreenContainer = ({ children }) => (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
        <View style={styles.container}>{children}</View>
    </TouchableWithoutFeedback>
);

export const Course = ({ navigation }) => {
    const [courses, setCourses] = useState({})
    const [coursesSem2, setCoursesSem2] = useState({})
    const [coursesSem1, setCoursesSem1] = useState({})
    const [courseCode, setCourseCode] = useState()
    const [selectedSem1, setSelectedSem1] = useState([])
    const [selectedSem2, setSelectedSem2] = useState([])
    const [message, setMessage] = useState("")
    const [clashedCourse, setClashedCourse] = useState("")
    const [savable, setSavable] = useState(false)
    const [disable, setDisable] = useState(false)
    const { dismiss, show, modalProps } = useBottomModal();
    const [toggleValue, setToggleValue] = useState(false);


    const { user } = useContext(AuthenticatedUserContext);
    const day = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const slot = ['', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30']


    useEffect(() => {
        var ref = db.ref('courses/sem1/');
        ref.on('value', (data) => { gotCourses(data, 1) });
        ref = db.ref('courses/sem2/');
        ref.on('value', (data) => { gotCourses(data, 2) });
    }, []);

    function clearState() {
        toggleValue ? setSelectedSem2([]) : setSelectedSem1([])
    }

    function gotCourses(data, sem) {
        // console.log(data.val())
        // data.val().forEach(element => {
        //     console.log("CODE: " + element.code)
        //     console.log("TITLE: " + element.title)
        // });
        console.log("Fetched")
        if (sem == 1) {
            setCourses(data.val())
            setCoursesSem1(data.val())
        } else {
            setCoursesSem2(data.val())
        }
        // console.log(courses) 
    }

    function handleSearch(text) {
        const coursesSem = toggleValue ? coursesSem2 : coursesSem1
        var temp = {}
        // console.log("START")
        Object.entries(coursesSem).map((course, index) => {
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

    function handleSelect(code, section) {
        // console.log("CODE: " + code + ", SECTION: " + section)
        const selected = toggleValue ? selectedSem2 : selectedSem1
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
                setSavable(false)
                show()
            } else {
                const temp = selected
                temp.push({ code, section })
                // console.log(section)
                // console.log(...temp)
                toggleValue ? setSelectedSem2([...temp]) : setSelectedSem1([...temp])
                // setSelected([...temp])
            }

        } else {
            setMessage("You can select up to 6 courses only! 🤥")
            setClashedCourse("")
            setSavable(false)
            show()
        }
    }

    function handleDeselect(index) {
        const temp = toggleValue ? selectedSem2 : selectedSem1
        temp.splice(index, 1)
        // console.log(...temp)
        toggleValue ? setSelectedSem2([...temp]) : setSelectedSem1([...temp])
        // setSelected([...temp])
        // console.log(selected)
        // alert(index)
    }

    function handleCheck() {
        var slot_tuple = {};
        const selected = toggleValue ? selectedSem2 : selectedSem1
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
            setSavable(true)
        } else {
            // alert("Time clash!\n" + found)
            setMessage("Time clash! 😮‍💨\n\n")
            setClashedCourse(found)
            setSavable(false)
        }
        setDisable(false)
    }

    function handleSave() {
        // alert("SAVED")
        const username = user.email.substring(0, user.email.length - 10)
        const ref = db.ref('users/' + username)
        ref.off()
        // console.log(selected)
        var temp = {}
        const selected = toggleValue ? selectedSem2 : selectedSem1
        selected.forEach((course, index) => {
            temp[course.code] = course.section[0]
        })
        // console.log(temp)
        if (Object.keys(temp).length == 0) {
            temp = { empty: 'empty' }
        }
        if (toggleValue) {
            ref.update({
                sem2: temp
            })
        } else {
            ref.update({
                sem1: temp
            })
        }

        setDisable(true)
    }

    function changeSem() {
        if (toggleValue) {
            setCourses(coursesSem1)
        } else {
            setCourses(coursesSem2)
        }
    }

    const courseList = Object.entries(courses).map((course, index) => {
        // console.log(course[0])
        // console.log(course[1].section)
        return (
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
                temp.forEach((element, index3) => {
                    if (element != 0) {
                        timeslot += pad + '(' + day[index3] + ') ' + slot[temp2[index3]] + '⁠–' + slot[temp2[index3] + element]
                    }
                    if (timeslot != "") {
                        pad = "   "
                    }
                })
                return (
                    <View key={index2} style={{ height: 70 }}>
                        <InsetShadow>
                            <TouchableOpacity style={styles.courseList} onPress={() => handleSelect(course[0], timeslots)}>
                                <Text style={styles.courseTitle}>{course[0]} {timeslots[0]}</Text>
                                <Text>{timeslot}</Text>
                            </TouchableOpacity>
                        </InsetShadow>
                    </View>
                )
            })
        )
    })

    const selectedCourses = (toggleValue ? selectedSem2 : selectedSem1).map((course, index) => {
        return (
            <TouchableOpacity style={styles.selectedItem} key={index} onPress={() => handleDeselect(index)}>
                <Text>{course.code} {course.section[0]}</Text>
                <MaterialCommunityIcons
                    name={'window-close'}
                    size={16}
                />
            </TouchableOpacity>
        )
    })

    return (
        <ScreenContainer>
            <View style={styles.topContainer}>
                <View style={styles.searchBar}>
                    <InputField
                        inputStyle={{
                            fontSize: 14
                        }}
                        containerStyle={{
                            backgroundColor: '#E8E8E8'
                        }}
                        leftIcon='card-search-outline'
                        placeholder='Enter Course Code'
                        autoCapitalize='characters'
                        autoCorrect={false}
                        textContentType='password'
                        value={courseCode}
                        onChangeText={text => {
                            setCourseCode(text.toUpperCase());
                            handleSearch(text.toUpperCase());
                        }}
                    />
                </View>
                <View style={styles.toggleSwitchContainer}>
                    <View style={styles.toggleSwitch}>
                        <ToggleSwitch
                            text={{ on: 'Sem 1', off: 'Sem 2', activeTextColor: 'white', inactiveTextColor: 'white' }}
                            textStyle={{ fontWeight: 'bold' }}
                            color={{ indicator: Colors.orangeButton, active: 'black', inactive: 'black', activeBorder: 'black', inactiveBorder: 'black' }}
                            active={true}
                            disabled={false}
                            width={80}
                            radius={25}
                            onValueChange={(val) => {
                                setToggleValue(!toggleValue);
                                changeSem()
                            }}
                        />
                    </View>
                </View>
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
            <View style={styles.bottomContainer}>
                <View style={styles.clearButton}>
                    <Button
                        onPress={() => {
                            clearState();
                        }}
                        backgroundColor={Colors.greyButton}
                        title='Clear'
                        tileColor='#fff'
                        titleSize={20}
                    />
                </View>
                <View style={styles.checkButton}>
                    <Button
                        onPress={() => {
                            handleCheck();
                            show();
                        }}
                        backgroundColor={Colors.orangeButton}
                        title='Check'
                        tileColor='#fff'
                        titleSize={20}
                    />
                </View>
            </View>
            <BottomModal backdropColor="rgba(0,0,0,0.5)" height={600} {...modalProps} >
                <TouchableOpacity style={styles.fill} onPress={dismiss}>
                    <Text style={styles.message}>{message}</Text>
                    <Text style={styles.clashed}>{clashedCourse}</Text>
                    {savable
                        ? <TouchableOpacity disabled={disable} style={[styles.saveButton, { backgroundColor: disable ? '#bd7b7b' : '#ff0000' }]} onPress={() => handleSave()}>
                            <Text style={[styles.title, { color: '#fff', fontWeight: '600', fontSize: 16, }]}>{disable ? 'Saved' : 'Save'}</Text>
                        </TouchableOpacity>

                        : null}
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
    topContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 12,
        height: '12%'
    },
    searchBar: {
        flexBasis: '65%'
    },
    toggleSwitchContainer: {
        flexBasis: '35%'
    },
    toggleSwitch: {
        transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }]
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        alignSelf: 'center'
    },
    selectedContainer: {
        padding: 12,
        // backgroundColor: '#000',
        height: '40%'
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
        backgroundColor: '#F5F5F5',
        height: '38%'
    },
    bottomContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        height: '10%'
    },
    clearButton: {
        // flexGrow: 1,
        width: '50%',
        paddingHorizontal: 12
    },
    checkButton: {
        // flexGrow: 1,
        width: '50%',
        paddingHorizontal: 12
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