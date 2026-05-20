import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Palette, BorderRadius, Spacing } from '@/constants/theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
  style?: ViewStyle;
}

export const AppButton = ({ title, onPress, loading, variant = 'primary', style }: AppButtonProps) => {
  let bg = Palette.primary;
  let text = '#fff';
  let border = 'transparent';

  if (variant === 'outline') {
    bg = 'transparent';
    text = Palette.primary;
    border = Palette.primary;
  } else if (variant === 'danger') {
    bg = Palette.error;
  }

  return (
    <TouchableOpacity 
      style={[styles.base, { backgroundColor: bg, borderColor: border }, style]} 
      onPress={onPress} 
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={text} />
      ) : (
        <Text style={[styles.text, { color: text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    width: '100%',
  },
  text: {
    fontWeight: '700',
    fontSize: 16,
  },
});
