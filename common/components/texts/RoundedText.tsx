import React from 'react';
import { Text, TextProps, View } from 'react-native';
import { borders, colors, halfPadding, texts } from '../../styles';

interface Props extends TextProps {
  children: string;
  color?: string;
  backgroundColor?: string;
  noBorder?: boolean;
}

export default function ({
  color,
  backgroundColor: bg,
  children,
  noBorder,
  style,
  ...props
}: Props) {
  const tintColor = color ?? colors.black;
  const backgroundColor = bg ? bg : colors.white;
  return (
    <View
      style={[
        {
          paddingVertical: 4,
          paddingHorizontal: halfPadding,
          ...borders.default,
          borderRadius: 32,
          borderColor: noBorder ? colors.lightGrey : tintColor,
          backgroundColor,
        },
        style,
      ]}
      {...props}
    >
      <Text style={[texts.small, { color: tintColor }]}>{children}</Text>
    </View>
  );
}
