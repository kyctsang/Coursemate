import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import {GroupDetails} from "./GroupDetails";
import {NewGroup} from "./NewGroup";
import {AllGroups} from "./AllGroups";
import {SearchScreen} from "./Search";
import {MeetingTime} from "./MeetingTime";

export const Group = ({navigation}) => {
    const Stack = createStackNavigator();
    return(
        <Stack.Navigator initialRouteName="Group">
            <Stack.Screen name="Group" component={AllGroups} />
            <Stack.Screen name="Group Details" component={GroupDetails}/>
            <Stack.Screen name="New Group" component={NewGroup} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Meeting Time" component={MeetingTime} />
        </Stack.Navigator>
    )
}