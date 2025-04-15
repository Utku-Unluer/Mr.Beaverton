import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const Logo = ({ width = 200, height = 200 }) => {
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 200 200">
        {/* Ana logo arka planı */}
        <Circle cx="100" cy="100" r="90" fill="#3F51B5" />
        <Circle cx="100" cy="100" r="75" fill="#303F9F" />

        {/* "L" harfi */}
        <Path
          d="M60 60 L60 140 L100 140"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Dil simgesi */}
        <Path
          d="M120 60 C150 80, 150 120, 120 140"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />

        {/* Nokta */}
        <Circle cx="120" cy="100" r="6" fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

export default Logo;
