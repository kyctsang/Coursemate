import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";

import { Typography, Colors, Base } from '../styles';
import InsetShadow from 'react-native-inset-shadow'

import { IconButton } from '../components';
import Firebase from '../config/firebase';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';
import 'firebase/database';

const auth = Firebase.auth();
const db = firebase.database();

const ScreenContainer = ({ children }) => (
  <View style={styles.container}>{children}</View>
);

export const Home = ({ navigation }) => {
  const [privacy, setPrivacy] = useState('public')
  const [courses, setCourses] = useState({})
  const { user } = useContext(AuthenticatedUserContext);

  useEffect(() => {
    const username = user.email.substring(0,user.email.length-10)
    const ref = db.ref('users/' + username)
    ref.off()
    ref.on('value', (data) => {
      // console.log('current data:')
      // console.log(data)
      if(data.val()==null){
        console.log("NULL!!!")
        ref.set({
            UID: user.uid,
            public: true
        })
        console.log("inserted")
      }
    })
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.log(error);
    }
  };
  
  if (Object.keys(courses).length==0) {
    const ref2 = db.ref('users/'+user.uid+'/courses')
    ref2.on('value', (data) => {
      // console.log(data.val())
      if (data.val() == null){
        setCourses({courses: 'empty'})
      }else{
        setCourses(data.val())
      }
    })
  }

  const selectedCourses = Object.entries(courses).map((course, index) => {
    if (course[1] == 'empty') {
      return(
        <View key={index} style={styles.courses}>
          <Text style={styles.courseTitle}>No saved course yet!</Text>
        </View>
      )
    }
    console.log(course[0] + " " + course[1])
    return(
      <View key={index} style={styles.courses}>
          <Text style={styles.courseTitle}>{course[0]} {course[1]}</Text>
      </View>
    )
  })
  

  return (
  <ScreenContainer>
    <StatusBar style='dark-content' />
      <View style={styles.row}>
        <Text style={styles.title}>Welcome {user.email.substring(0,user.email.length-10)}!</Text>
        <IconButton
          name='logout'
          size={24}
          color='#000'
          onPress={handleSignOut}
        />
      </View>
      <Text style={styles.text}>Your UID is: {user.uid} </Text>
      <Text>User profile: {privacy}</Text>
      <View style={{height:170}}></View>
      <View style={styles.coursesContainer}>
        <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 20, marginBottom: 10}}>2021-2022 S1</Text>
        {selectedCourses}
      </View>
  </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    ...Base.base,
    paddingTop: 50,
    paddingHorizontal: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  coursesContainer: {
    justifyContent: 'center', 
    alignItems: 'center',
  },
  courses: {
    height: 50, 
    borderWidth: 3, 
    borderRadius: 5, 
    margin: 3, 
    width:'80%',
    justifyContent: 'center',
    backgroundColor: '#fcba03'
  },
  courseTitle: {
    fontWeight: 'bold', 
    textAlign: 'center'
  },
  title: {
    ...Typography.title
  },
  text: {
    ...Typography.text
  }
});