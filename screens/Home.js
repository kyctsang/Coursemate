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
        <View key={index} style={styles.courses}>
          <Text style={styles.courseTitle}>No saved course yet!</Text>
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
        <View key={index} style={styles.courses}>
          <Text style={styles.courseTitle}>No saved course yet!</Text>
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
      <View style={styles.row, { flexDirection: 'column' }, {
        justifyContent: 'center',
        alignItems: 'center', paddingBottom: 0
      }}>
        <View style={{ paddingBottom: 0 }}>
          {/* clickable function is not working*/}
          <TouchableOpacity onPress={Linking}>
            <Image
              style={styles.tinyLogo}
              source={{
                uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',

              }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: '15%', justifyContent: 'space-between', paddingHorizontal: '8%', marginBottom:'8%', marginTop:'3%'}}>
        <View style={{ width: 'auto', height: '100%', justifyContent: 'center', }}>
          <Text style={styles.title}>{displayName}</Text>
          <Text style={styles.username}>@{user.email.substring(0, user.email.length - 10)}</Text>
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

        <View style={{ width: '25%', height: '100%', justifyContent: 'center', alignItems: 'center', }}>

          <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{friendsNumber}</Text>
          <Text style={{ fontSize: 20 }}>Friends</Text>
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

      <View style={{ flex: 1 }}>
        <Swiper style={styles.wrapper} showsButtons={false}>
          <View style={styles.slide1}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>2021-2022 Sem 1</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              {selectedCoursesOne}
            </View>
          </View>
          <View style={styles.slide2}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>2021-2022 Sem 2</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
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
    height: 50,
    borderWidth: 3,
    borderRadius: 5,
    margin: 3,
    width: '80%',
    justifyContent: 'center',
    backgroundColor: '#f57c00'
  },
  havecourses: {
    height: 50,
    borderWidth: 3,
    borderRadius: 5,
    margin: 3,
    width: '40%',
    justifyContent: 'center',
    backgroundColor: '#f57c00'
  },
  courseTitle: {
    fontWeight: 'bold',
    textAlign: 'center'
  },
  title: {
    //...Typography.title,
    fontSize: 28,
    //paddingBottom:3,
    //paddingTop:3,
    fontWeight: 'bold'

  },
  username: {
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
});