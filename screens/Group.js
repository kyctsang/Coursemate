import React from 'react';
import { View, Text } from 'react-native';

const ScreenContainer = ({ children }) => (
    <View >{children}</View>
  );

export const Group = ({navigation}) => {
    return(
        <ScreenContainer>
            <Text>Group</Text>
        </ScreenContainer>
    )
    
}