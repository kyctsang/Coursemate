import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

import * as firebase from 'firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const database = firebase.database();

const ScreenContainer = ({ children }) => (
    <View >{children}</View>
  );

export const Course = ({navigation}) => {
    const [ courses, setCourses ] = useState([])
    const [ search, setSearch ] = useState('')
    const [ selected, setSelected ] = useState([])

    function gotData(data){
        // console.log(data.val())
        // data.val().forEach(element => {
        //     console.log("CODE: " + element.code)
        //     console.log("TITLE: " + element.title)
        // });
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

    function selectCourse(code){
        const temp = selected
        temp.push(code)
        console.log(...temp)
        console.log(typeof({...temp}))
        setSelected([...temp])
    }

    const courseList = courses.map((course, index) => {
        return(
            <TouchableOpacity style={styles.button} key={index} onPress={() => selectCourse(course.code)}>
                <Text>{course.code}</Text>
                <Text>{course.title}</Text>
            </TouchableOpacity>
        )
    })

    const selectedCourses = selected.map((course, index) => {
        return(
            <Text key={index}>{course}</Text>
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