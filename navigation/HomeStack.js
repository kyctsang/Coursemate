import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '../styles';

import { Home } from '../screens/Home';
import { Group } from '../screens/Group';
import { Course } from '../screens/Course';
import { Search } from '../screens/Search';
import { Notifications } from '../screens/Notifications';


const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();



export default function HomeStack() {

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Colors.bottomTabBar,
      }}
    >
      <Tabs.Screen
        name="Course Schedule Planner"
        component={Course}
        options={{
          tabBarLabel: 'Course',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-page-variant" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Group"
        component={Group}
        options={{
          headerShown: false,
          tabBarLabel: 'Group',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="User Search"
        component={Search}
        initialParams={{ addMember: false, groupId: "" }}
        options={{
          headerShown: false,
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Notifications"
        component={Notifications}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
