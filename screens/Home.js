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
    const ref = db.ref('users/'+user.uid)
    ref.on('value', (data) => {
      console.log(data.val())
      console.log('users/'+user.uid)
      if(data.val()==null){
        console.log("NULL!!!")
        ref.set({
            public: true
        })
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
    const ref = db.ref('users/'+user.uid+'/courses')
    ref.on('value', (data) => {
      // console.log(data.val())
      setCourses(data.val())
    })
  }

  const selectedCourses = Object.entries(courses).map((course, index) => {
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
        <Text style={styles.title}>Welcome {user.email}!</Text>
        <IconButton
          name='logout'
          size={24}
          color='#000'
          onPress={handleSignOut}
        />
      </View>
      <Text style={styles.text}>Your UID is: {user.uid} </Text>
      <Text>User profile: {privacy}</Text>
      <View style={styles.coursesContainer}>
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
    position: 'absolute', 
    bottom: 100, 
    width: '90%', 
    justifyContent: 'center'
  },
  courses: {
    height: 50, 
    borderWidth:3, 
    borderRadius:5, 
    margin:3, 
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