import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, Radii } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, fontSize: Fonts.sizes.sm },
    md: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.xl, fontSize: Fonts.sizes.md },
    lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl, fontSize: Fonts.sizes.lg },
  };

  const currentSize = sizeStyles[size];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#94A3B8', '#94A3B8'] : [Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center justify-center rounded-xl overflow-hidden"
          style={{
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
          }}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <>
              {icon}
              <Text
                className="font-semibold text-white"
                style={[
                  { fontSize: currentSize.fontSize },
                  icon ? { marginLeft: Spacing.sm } : null,
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, { bg: string; border: string; textColor: string }> = {
    secondary: { bg: Colors.primaryFaded, border: 'transparent', textColor: Colors.primary },
    outline: { bg: 'transparent', border: Colors.border, textColor: Colors.text },
    danger: { bg: Colors.dangerLight, border: 'transparent', textColor: Colors.danger },
    ghost: { bg: 'transparent', border: 'transparent', textColor: Colors.primary },
  };

  const v = variantStyles[variant] || variantStyles.outline;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={`flex-row items-center justify-center rounded-xl overflow-hidden ${fullWidth ? 'w-full' : ''}`}
      style={[
        {
          backgroundColor: isDisabled ? '#F1F5F9' : v.bg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: v.border,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            className="font-semibold"
            style={[
              {
                fontSize: currentSize.fontSize,
                color: isDisabled ? '#94A3B8' : v.textColor,
              },
              icon ? { marginLeft: Spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}


