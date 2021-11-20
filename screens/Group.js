import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import {GroupDetails} from "./GroupDetails";
import {NewGroup} from "./NewGroup";
import {AllGroups} from "./AllGroups";
import {SearchScreen} from "./Search";
import {MeetingTime} from "./MeetingTime";

const Stack = createStackNavigator();
export const Group = ({navigation}) => (
    <Stack.Navigator initialRouteName="GroupScreen" headerMode="none">
        <Stack.Screen name="GroupScreen" component={AllGroups} />
        <Stack.Screen name="GroupDetails" component={GroupDetails}/>
        <Stack.Screen name="NewGroup" component={NewGroup} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="MeetingTime" component={MeetingTime} />
    </Stack.Navigator>
)