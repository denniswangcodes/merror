import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';
import { LOGO_START, LOGO_END } from '../context/theme.context';
import { useAppTheme } from '../lib/theme';

export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="merrorLogoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={LOGO_START} />
          <Stop offset="1" stopColor={LOGO_END} />
        </LinearGradient>
      </Defs>
      <Rect width="32" height="32" rx="9" fill="url(#merrorLogoGradient)" />
      <Path d="M16 6L22 16H10L16 6Z" fill="white" />
      <Path d="M16 26L22 16H10L16 26Z" fill="white" fillOpacity="0.38" />
    </Svg>
  );
}

export function HeaderLogo() {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <LogoMark size={24} />
      <Text style={{ fontSize: 19, fontWeight: '800', letterSpacing: -0.3, color: theme.text }}>merror</Text>
    </View>
  );
}
