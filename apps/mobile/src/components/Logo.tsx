import React from 'react';
import { View, Text, Image } from 'react-native';
import { useAppTheme } from '../lib/theme';

export function LogoMark({ size = 26 }: { size?: number }) {
  return <Image source={require('../../assets/icon.png')} style={{ width: size, height: size, borderRadius: size * 0.22 }} resizeMode="cover" />;
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
