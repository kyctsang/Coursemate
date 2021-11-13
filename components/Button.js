import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';

const Button = ({
  title,
  disabled = false,
  backgroundColor = '#000',
  titleColor = '#fff',
  titleSize = 14,
  onPress,
  width = '100%',
  containerStyle
}) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={args => {
        if (args.pressed) {
          return [
            styles.base,
            {
              opacity: 0.5,
              backgroundColor,
              width
            },
            containerStyle
          ];
        }

        return [
          styles.base,
          {
            opacity: 1,
            backgroundColor,
            width
          },
          containerStyle
        ];
      }}
    >
      <Text style={[styles.text, { color: titleColor, fontSize: titleSize }]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '600'
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 12
  }
});

export default Button;
