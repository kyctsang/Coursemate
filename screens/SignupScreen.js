import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View, Button as RNButton, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';

import { Typography, Colors, Base } from '../styles'

import { Button, InputField, ErrorMessage, ValidMessage } from '../components';
import Firebase from '../config/firebase';
import * as firebase from 'firebase';
import 'firebase/database';

const auth = Firebase.auth();
const db = firebase.database();

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState('eye-off');
  const [usernameError, setUsernameError] = useState(true);
  const [passwordError, setPasswordError] = useState(true)
  const [message, setMessage] = useState('')

  const handlePasswordVisibility = () => {
    if (rightIcon === 'eye') {
      setRightIcon('eye-off');
      setPasswordVisibility(!passwordVisibility);
    } else if (rightIcon === 'eye-off') {
      setRightIcon('eye');
      setPasswordVisibility(!passwordVisibility);
    }
  };

  const onHandleSignup = async () => {
    try {
      await auth.createUserWithEmailAndPassword(username + '@gmail.com', password);
    } catch (error) {
      setSignupError(true);
      setMessage(error.message)
    }
  };

  function checkUsername(text) {
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if (text.match(letterNumber)) {
      const ref = db.ref('users/' + text)
      ref.on('value', (data) => {
        if (data.val() != null) {
          // console.log("username is taken!")
          setUsernameError(true)
          setMessage("Username is taken!")
        } else {
          setUsernameError(false)
          setMessage("Valid username!")
        }
      })
    } else {
      setUsernameError(true)
      setMessage("No special character for username!")
    }
    setUsername(text)
  }

  function checkPassword(text) {
    if (text.length < 6) {
      setPasswordError(true)
    } else {
      setPasswordError(false)
    }
    setPassword(text)
  }
  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
      <View style={styles.container}>
        <StatusBar style='dark-content' />
        <Text style={styles.appName}>CourseMate</Text>
        <Text style={styles.title}>Create new account</Text>
        <InputField
          inputStyle={{
            fontSize: 14
          }}
          containerStyle={{
            backgroundColor: '#fff',
            marginBottom: 20
          }}
          leftIcon='account'
          placeholder='Enter username'
          autoCapitalize='none'
          autoFocus={true}
          value={username}
          onChangeText={text => checkUsername(text)}
        />
        <InputField
          inputStyle={{
            fontSize: 14
          }}
          containerStyle={{
            backgroundColor: '#fff',
            marginBottom: 20
          }}
          leftIcon='lock'
          placeholder='Enter password (min 6 characters)'
          autoCapitalize='none'
          autoCorrect={false}
          secureTextEntry={passwordVisibility}
          textContentType='password'
          rightIcon={rightIcon}
          value={password}
          onChangeText={text => checkPassword(text)}
          handlePasswordVisibility={handlePasswordVisibility}
        />
        {usernameError ? <ErrorMessage error={message} visible={true} /> : <ValidMessage valid={message} visible={true} />}
        <TouchableOpacity disabled={!usernameError && !passwordError ? false : true} style={[styles.signUpButton, { backgroundColor: !usernameError && !passwordError ? Colors.orangeButton : '#e6a86a' }]} onPress={onHandleSignup}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600' }}>Signup</Text>
        </TouchableOpacity>
        <Button
          onPress={() => navigation.navigate('Login')}
          backgroundColor={Colors.button2}
          title='Go back to Login'
          tileColor='#fff'
          titleSize={16}
          containerStyle={{
            marginBottom: 24
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Base.auth
  },
  title: {
    ...Typography.title
  },
  appName: {
    ...Typography.appName
  },
  signUpButton: {
    backgroundColor: '#f57c00',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12
  }
});
