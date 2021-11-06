import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

import * as firebase from 'firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import 'firebase/database';

const database = firebase.database();

const ScreenContainer = ({ children }) => (
    <View >{children}</View>
  );

export const Course = ({navigation}) => {
    const [ courses, setCourses ] = useState([])
    const [ search, setSearch ] = useState('')
    const [ selected, setSelected ] = useState([])
    const day = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const slot = ['', '08:30','09:30','10:30','11:30','12:30','13:30','14:30','15:30','16:30','17:30','18:30','19:30']

    function gotData(data){
        // console.log(data.val())
        // data.val().forEach(element => {
        //     console.log("CODE: " + element.code)
        //     console.log("TITLE: " + element.title)
        // });
        console.log("Fetched")
        setCourses(data.val())
        // console.log(courses) 

    }
    useEffect(() => {
        const ref = database.ref('course/' );
        ref.on('value', gotData);
    }, []);
    
    function searchCourse(text){
        setSearch(text)
    }

    function selectCourse(code, section){
        if (selected.length < 6){
            const temp = selected
            temp.push({code, section})
            console.log(...temp)
            setSelected([...temp])
        }else{
            alert("You can select up to 6 courses only!")
        }
    }

    function deselectCourse(index){
        const temp = selected
        temp.splice(index,1)
        // console.log(...temp)
        setSelected([...temp])
        console.log(selected)
        // alert(index)
    }

    const courseList = courses.map((course, index) => {
        // console.log(course.section)
        return(
            Object.entries(course.section).map((section, index) => {
                var timeslot = ""
                var check_day = 0
                var temp = [0,0,0,0,0,0]
                var temp2 = [0,0,0,0,0,0]
                var pad = ""
                section[1].map((x) => {
                    temp[x[0]] += 1
                    if (check_day != x[0]){
                        temp2[x[0]] = parseInt(x[2])
                    }
                    check_day=x[0]
                })
                temp.forEach((element, index) => {
                    if (element != 0){
                        timeslot += pad + day[index] + slot[temp2[index]] + '-' + slot[temp2[index]+element]
                    }
                    if (timeslot != ""){
                        pad = "   "
                    }
                })
                return(
                    <TouchableOpacity style={styles.button} key={index} onPress={() => selectCourse(course.code, section)}>
                        <Text>{course.code} {section[0]}</Text>
                        <Text>{timeslot}</Text>
                    </TouchableOpacity>
                )
            })
        )
    })

    const selectedCourses = selected.map((course, index) => {
        return(
            <TouchableOpacity style={styles.selectedContainer} key={index} onPress={() => deselectCourse(index)}>
                <Text key={index}>{course.code} {course.section[0]}</Text>
                <MaterialCommunityIcons 
                    name={'lock'}
                    size={16}
                />
            </TouchableOpacity>
        )
    })

    return(
        <ScreenContainer style={styles.container}>
            <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                    name={'lock'}
                    size={20}
                    iconColor = '#000'
                    style={'lock'}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Search Course"
                    onChangeText={text => searchCourse(text)}
                />
            </View>
            <View style={styles.selectContainer}>
                <Text>Selected</Text>
                {selectedCourses}
            </View>
            <ScrollView style={styles.scrollView}>
                {courseList}
            </ScrollView>
        </ScreenContainer>
    )
    
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 10
    },
    inputContainer: {
        borderRadius: 4,
        flexDirection: 'row',
        padding: 12
    },
    input: {
        flex: 1,
        width: '100%',
        fontSize: 18
    },
    selectContainer: {
        padding: 12,
        height: 300
    },
    selectedContainer: {
        borderRadius: 4,
        flexDirection: 'row',
        padding: 12
    },
    button: {
      alignItems: "center",
      backgroundColor: "#DDDDDD",
      borderWidth: 2,
      borderBottomWidth: 0,
      padding: 10
    },
    scrollView: {
        borderWidth: 2,
        height: 300
      },
  });