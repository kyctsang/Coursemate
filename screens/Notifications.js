import React from 'react';
import { View, Text } from 'react-native';

const ScreenContainer = ({ children }) => (
    <View >{children}</View>
  );

export const Notifications = ({navigation}) => {
    return(
        <ScreenContainer>
            <Text>Notification</Text>
        </ScreenContainer>
    )
    
}