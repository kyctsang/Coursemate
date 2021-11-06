import React from 'react';
import { View, Text } from 'react-native';

const ScreenContainer = ({ children }) => (
    <View >{children}</View>
  );

export const Search = ({navigation}) => {
    return(
        <ScreenContainer>
            <Text>Search</Text>
        </ScreenContainer>
    )
    
}