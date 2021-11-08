import React from 'react';
import { StyleSheet, Text } from 'react-native';

const ValidMessage = ({ valid, visible }) => {
  if (!valid || !visible) {
    return null;
  }

  return <Text style={styles.validText}>✅ {valid}</Text>;
};

const styles = StyleSheet.create({
  validText: {
    color: 'green',
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '600'
  }
});

export default ValidMessage;
