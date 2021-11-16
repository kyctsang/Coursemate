import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Switch} from "react-native";

import { Typography, Colors, Base } from '../styles';
import InsetShadow from 'react-native-inset-shadow'

import { IconButton } from '../components';
import Firebase from '../config/firebase';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';
import 'firebase/database';
import ToggleSwitch from 'rn-toggle-switch'
import Swiper from 'react-native-swiper'

//import { Tab } from 'react-native-elements';
//import { NavigationContainer } from '@react-navigation/native';
//import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const auth = Firebase.auth();
const db = firebase.database();


const ScreenContainer = ({ children }) => (
  <View style={styles.container}>{children}</View>
);

export const Home = ({ navigation }) => {
  const [privacy, setPrivacy] = useState('public')
  //const [mode, setMode] = useState({})
  const { user } = useContext(AuthenticatedUserContext);
  const [courses, setCourses] = useState({})

  const username = user.email.substring(0,user.email.length-10)
  const [toggleValue, setToggleValue] = useState(true);
  function changeMode() {
    const ref = db.ref('users/' + username)
    ref.off()
    ref.on('value', (data) => {
      if(data.val()!=null){
        console.log("not NULL!!!")
        if (toggleValue) {
            setPrivacy('private')
            ref.set({
                public: false
            })
        } else {
            setPrivacy('public')
            ref.set({
                public: true
            })
        }
        console.log("inserted")
      }
    })
      
  }

  useEffect(() => {
    // const username = user.email.substring(0,user.email.length-10)
    const ref = db.ref('users/' + username)
    ref.off()
    ref.on('value', (data) => {
      // console.log('current data:')
      // console.log(data)
      if(data.val()==null){
        console.log("NULL!!!")
        ref.set({
            UID: user.uid,
            public: true,
            sem1: {empty:'empty'},
            sem2: {empty:'empty'}
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
    const ref2 = db.ref('users/'+username+'/sem1')
    ref2.off()
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
    // alert(course[1])
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
  
  var tempmode = privacy;
  tempmode = tempmode.charAt(0).toUpperCase() + tempmode.slice(1);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  return (
  <ScreenContainer>
    <StatusBar style='dark-content' />
      <View style={styles.row, {flexDirection: 'column'},{justifyContent: 'center',
    alignItems: 'center', paddingBottom:10}}>
        <View style={{flexDirection: 'row'}}>
        <Text style={styles.title}>{user.email.substring(0,user.email.length-10)} </Text>
        <IconButton
          name='logout'
          size={20}
          color='#000'
          onPress={handleSignOut}
        />
        </View>
          <View style={styles.toggleSwitch}>
            <ToggleSwitch
                text={{ on: 'Public', off: 'Private', activeTextColor: 'white', inactiveTextColor: 'white' }}
                textStyle={{ fontWeight: 'bold',fontSize:17 }}
                color={{ indicator: Colors.orangeButton, active: 'black', inactive: 'black', activeBorder: 'black', inactiveBorder: 'black' }}
                active={true}
                disabled={false}
                width={80}
                radius={25}
                onValueChange={(val) => {
                  setToggleValue(!toggleValue);
                  changeMode()
                }}
              />
              
          </View>
          <Text style={{textAlign: 'center', fontSize:17, fontWeight:'bold'}}>Friend 99</Text>
        
      </View>
        
        
      
      {/*<View style={styles.switch, {flexDirection: 'row'}}>
        
        <View style={styles.toggleSwitch}>
          <ToggleSwitch
              text={{ on: 'Public', off: 'Private', activeTextColor: 'white', inactiveTextColor: 'white' }}
              textStyle={{ fontWeight: 'bold' }}
              color={{ indicator: Colors.orangeButton, active: 'black', inactive: 'black', activeBorder: 'black', inactiveBorder: 'black' }}
              active={true}
              disabled={false}
              width={80}
              radius={25}
              onValueChange={(val) => {
                setToggleValue(!toggleValue);
                changeMode()
              }}
            />
        </View>
            </View>*/}
      
      <View style={{flex:1}}>
        <Swiper style={styles.wrapper} showsButtons={false}>
          <View style={styles.slide1}>
            <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 20, marginBottom: 10}}>2021-2022 S1</Text>
            {selectedCourses}
          </View>
          <View style={styles.slide2}>
            <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 20, marginBottom: 10}}>2021-2022 S2</Text>
            {selectedCourses}
          </View>
        </Swiper>
      </View>
      
  </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  switch: {
    //alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingRight: 20,
    paddingLeft: 20
  },
  container: {
    ...Base.base,
    paddingTop: 50,
    paddingHorizontal: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //marginBottom: 15,
    paddingRight: 20,
    paddingLeft: 20
  },
  coursesContainer: {
    justifyContent: 'center', 
    alignItems: 'center',
  },
  slide1: {
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#9DD6EB'
  },
  slide2: {
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#97CAE5'
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
    ...Typography.title,
    fontSize: 30,
    paddingBottom:10

  },
  text: {
    ...Typography.text,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom:20
  },
  newtext: {
    ...Typography.text,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom:20,
    fontWeight: 'bold', 
    justifyContent: 'center',
    flex:1
  },
  toggleSwitchContainer: {
    //flexBasis: '35%'
  },
  toggleSwitch: {
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
    alignItems: 'center'
  },
  wrapper: {},
});