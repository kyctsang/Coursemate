import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, Image, TouchableOpacity, Linking } from "react-native";
import { Button } from '../components';

import { Typography, Colors, Base } from '../styles';
import InsetShadow from 'react-native-inset-shadow'

import { IconButton } from '../components';
import Firebase from '../config/firebase';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';
import 'firebase/database';
import ToggleSwitch from 'rn-toggle-switch'
import Swiper from 'react-native-swiper'
import { moderateScale } from 'react-native-size-matters';


import { launchImageLibrary } from 'react-native-image-picker';


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
  const [coursesOne, setCoursesOne] = useState({})
  const [coursesTwo, setCoursesTwo] = useState({})

  const username = user.email.substring(0, user.email.length - 10)
  const [toggleValue, setToggleValue] = useState();
  const [friendsNumber, setFriendsNumber] = useState();
  const [displayName, setDisplayName] = useState();
  const noSavedCoursesText = '[No Saved Courses]'
  //const [image, setImage] = useState(null);
  //const addImage=()=>{};




  var ref = db.ref('users/' + username + '/friends');
  ref.once('value')
    .then(function (snapshot) {
      var a = snapshot.numChildren();
      setFriendsNumber(a);
    });
  console.log('wtt' + friendsNumber);

  function changeMode() {
    const ref = db.ref('users/' + username)
    ref.off()
    ref.on('value', (data) => {
      if (data.val() != null) {
        console.log("not NULL!!!")
        if (toggleValue) {
          setPrivacy('private')
          ref.update({
            public: false
          })
        } else {
          setPrivacy('public')
          ref.update({
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
      if (data.val() == null) {
        console.log("NULL!!!")
        ref.set({
          UID: user.uid,
          public: true,
          sem1: { empty: 'empty' },
          sem2: { empty: 'empty' }
        })
        setToggleValue(true)
        console.log("inserted")
      } else {
        console.log("PUBLIX:" + data.val().public)
        setToggleValue(data.val().public)
        setDisplayName(data.val().displayName)
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

  if (Object.keys(coursesOne).length == 0) {
    const ref2 = db.ref('users/' + username + '/sem1')
    ref2.off()
    ref2.on('value', (data) => {
      // console.log(data.val())
      if (data.val() == null) {
        setCoursesOne({ coursesOne: 'empty' })
      } else {
        setCoursesOne(data.val())
      }
    })
  }

  if (Object.keys(coursesTwo).length == 0) {
    const ref2 = db.ref('users/' + username + '/sem2')
    ref2.off()
    ref2.on('value', (data) => {
      // console.log(data.val())
      if (data.val() == null) {
        setCoursesTwo({ coursesTwo: 'empty' })

      } else {
        setCoursesTwo(data.val())
      }
    })
  }


  const selectedCoursesOne = Object.entries(coursesOne).map((course, index) => {
    // alert(course[1])
    if (course[1] == 'empty') {
      return (
        <View key={index} style={styles.unavailableTextContainer}>
          <Text style={styles.unavailableText}>{noSavedCoursesText}</Text>
        </View>
      )
    }
    console.log(course[0] + " " + course[1])
    return (
      <View key={index} style={styles.havecourses}>
        <Text style={styles.courseTitle}>{course[0]} {course[1]}</Text>
      </View>
    )
  })

  const selectedCoursesTwo = Object.entries(coursesTwo).map((course, index) => {
    // alert(course[1])
    if (course[1] == 'empty') {
      return (
        <View key={index} style={styles.unavailableTextContainer}>
          <Text style={styles.unavailableText}>{noSavedCoursesText}</Text>
        </View>
      )
    }
    console.log(course[0] + " " + course[1])
    return (
      <View key={index} style={styles.havecourses}>
        <Text style={styles.courseTitle}>{course[0]} {course[1]}</Text>
      </View>
    )
  })

  var tempmode = privacy;
  tempmode = tempmode.charAt(0).toUpperCase() + tempmode.slice(1);
  const [isEnabled, setIsEnabled] = useState(false);
  console.log('hiii' + toggleValue);
  var test = toggleValue;
  console.log('test' + test);


  return (
    <ScreenContainer>
      <StatusBar style='dark-content' />
      <View style={styles.proPicContainer}>
        {/* clickable function is not working*/}
        <TouchableOpacity onPress={Linking}>
          <Image
            style={styles.tinyLogo}
            source={require('../assets/emptyProPic.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.userInfoContainer}>
        <View style={styles.namesContainer}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.userName}>@{user.email.substring(0, user.email.length - 10)}</Text>
          <View style={styles.toggleSwitch}>
            <ToggleSwitch
              text={{ on: 'Public', off: 'Private', activeTextColor: 'white', inactiveTextColor: 'white' }}
              textStyle={{ fontWeight: 'bold', fontSize: 22 }}
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
        </View>


        <View style={styles.friendsContainer}>

          <Text style={styles.friendsNumber}>{friendsNumber}</Text>
          <Text style={styles.friendsText}>Friends</Text>
          <View style={styles.button}>
            <Button
              onPress={handleSignOut}
              backgroundColor={Colors.orangeButton}
              title='Sign Out'
              tileColor='fff'
              titleSize={20}
              width={110}
            />
          </View>
        </View>


      </View>


      <View style={styles.addButton}></View>
      <View style={{ flex: 1 }}>
        <Swiper style={styles.wrapper} showsButtons={false}>
          <View style={styles.slide1}>
            <Text style={styles.semTitle}>2021-2022 Sem 1</Text>
            <View style={styles.coursesConainer}>
              {selectedCoursesOne}
            </View>
          </View>
          <View style={styles.slide2}>
            <Text style={styles.semTitle}>2021-2022 Sem 2</Text>
            <View style={styles.coursesConainer}>
              {selectedCoursesTwo}
            </View>
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
    ...Base.page,
    paddingTop: 20,
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
    alignItems: 'center'
    //backgroundColor: '#9DD6EB'
  },
  slide2: {
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#97CAE5'
  },
  courses: {
    backgroundColor: '#F0F0F0',
    borderColor: '#707070',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // flexBasis: '40%',
    borderWidth: 1.5,
    borderRadius: 4,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 8,
    height: 100,
    width: '70%'
  },
  havecourses: {
    backgroundColor: '#F0F0F0',
    borderColor: '#707070',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: '40%',
    borderWidth: 1.5,
    borderRadius: 4,
    marginHorizontal: 10,
    marginVertical: 5,
    height: 40
  },
  courseTitle: {
    fontWeight: 'bold',
    textAlign: 'center'
  },
  displayName: {
    //...Typography.title,
    fontSize: 28,
    //paddingBottom:3,
    //paddingTop:3,
    fontWeight: 'bold'

  },
  userName: {
    //...Typography.title,
    fontSize: 20,
    //paddingBottom:3,
    //paddingTop:3,
    color: '#6a6969',
    fontStyle: 'italic'

  },
  text: {
    ...Typography.text,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20
  },
  newtext: {
    ...Typography.text,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    fontWeight: 'bold',
    justifyContent: 'center',
    flex: 1
  },
  toggleSwitchContainer: {
    //alignItems: 'center',
  },
  toggleSwitch: {
    transform: [{ scale: 0.6 }],
    marginLeft: -28,
    marginBottom: -28,
    marginTop: -5,
    //transform: [{ scaleX:  moderateScale(1, 0.2) }, { scaleY:  moderateScale(1, 0.2) }] ,
    //height: 50,

    //alignItems: 'center',
    //justifyContent: 'flex-start',
    //alignSelf: 'stretch'
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  wrapper: {
  },
  tinyLogo: {
    width: 140,
    height: 140,
    borderRadius: 20
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    transform: [{ scaleX: 0.65 }, { scaleY: 0.65 }],
    marginBottom: -28,
  },
  unavailableTextContainer: {
    paddingVertical: '20%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  unavailableText: {
    fontSize: 20,
    color: '#808080',
    fontStyle: 'italic',
    // fontWeight: 'bold'
  },
  addButton: {
    borderBottomWidth: 2,
    borderColor: Colors.border,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5%'
  },
  semTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    paddingVertical: 10
  },
  coursesConainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  friendsText: {
    fontSize: 20
  },
  friendsNumber: {
    // alignItems: 'center',
    fontSize: 28,
    fontWeight: 'bold'
  },
  friendsContainer: {
    // backgroundColor: 'grey',
    width: '25%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  namesContainer: {
    // backgroundColor: '#C0C0C0',
    // paddingHorizontal: 12,
    // borderRadius: 10,
    width: 'auto',
    height: '100%',
    justifyContent: 'center',
  },
  userInfoContainer: {
    // backgroundColor: 'grey',
    //justifyContent: 'center',
    alignItems: 'center',
    height: '15%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '8%',
    marginBottom: '8%', //new
    marginTop: '3%' //new
  },
  proPicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    height: '25%',
    // backgroundColor: '#000'
  }
});