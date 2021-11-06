import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';

import * as firebase from 'firebase';

const database = firebase.database();

const ScreenContainer = ({ children }) => (
    <View >{children}</View>
  );

export const Course = ({navigation}) => {
    const [ courses, setCourses ] = useState([])
    function gotData(data){
        console.log(data.val())
        data.val().forEach(element => {
            console.log("CODE: " + element.code)
            console.log("TITLE: " + element.title)
        });
        setCourses(data.val())
        console.log(courses) 

    }
    useEffect(() => {
        const ref = database.ref('course/' );
        ref.on('value', gotData);
    }, []);
    
    const courseList = courses.map((course) => {
        return(
            <Text key={course.code}>{course.code}</Text>
            // console.log(course.code + course.title)
        )
    })

    return(
        <ScreenContainer>
            <Text>Course</Text>
            {/* <Text>{course}</Text> */}
            <ScrollView>
            {courseList}
            </ScrollView>
        </ScreenContainer>
    )
    
}