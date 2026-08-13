import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND_GRADIENT } from '../context/theme.context';

interface GradientButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  label: string;
  icon?: React.ReactNode;
  /** Reuse the exact style object a plain TouchableOpacity button used (padding, borderRadius, etc). */
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

/** Drop-in replacement for a solid accent-colored button — fills with the brand's purple → pink → orange gradient. */
export function GradientButton({ onPress, disabled, loading, label, icon, style, textStyle, accessibilityLabel }: GradientButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style, disabled ? { opacity: 0.5 } : null]}
    >
      <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {icon}
          <Text style={[{ color: '#fff', fontWeight: '700', fontSize: 15 }, textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
