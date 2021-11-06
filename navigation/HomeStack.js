import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import HomeScreen from '../screens/HomeScreen';
import { Home} from '../screens/Homes';
import { Group } from '../screens/Group';
import { Course } from '../screens/Course';
import { Search } from '../screens/Search';
import { Notifications } from '../screens/Notifications';


const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();



export default function HomeStack() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Course" component={Course} />
      <Tabs.Screen name="Group" component={Group} />
      <Tabs.Screen name="Home" component={Home} />
      <Tabs.Screen name="Search" component={Search} />
      <Tabs.Screen name="Notifications" component={Notifications} />
    </Tabs.Navigator>

    
  );
}
