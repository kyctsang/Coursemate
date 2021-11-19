import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import {GroupDetails} from "./GroupDetails";
import {NewGroup} from "./NewGroup";
import {AllGroups} from "./AllGroups";

const Stack = createStackNavigator();
export const Group = ({navigation}) => (
    <Stack.Navigator initialRouteName="GroupScreen" headerMode="none">
        <Stack.Screen name="GroupScreen" component={AllGroups} />
        <Stack.Screen name="GroupDetails" component={GroupDetails} test = '123'/>
        <Stack.Screen name="NewGroup" component={NewGroup} />
    </Stack.Navigator>
)