import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

import * as firebase from 'firebase';

const database = firebase.database();

const ScreenContainer = ({ children }) => (
    <View >{children}</View>
  );

export const Course = ({navigation}) => {
    const [ course, setCourse ] = useState()
    function gotData(data){
        console.log(data.val())
        setCourse(data.val())
    }
    useEffect(() => {
        const ref = database.ref('test1/' );
        ref.on('value', gotData);
    }, []);
    

    return(
        <ScreenContainer>
            <Text>Course</Text>
            <Text>{course}</Text>
        </ScreenContainer>
    )
    
}