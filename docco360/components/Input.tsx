import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4" collapsable={false}>
      {label && <Text className="text-sm font-semibold text-text mb-2">{label}</Text>}
      <View
        collapsable={false}
        className={`flex-row items-center bg-[#F1F5F9] rounded-xl border-2 px-4 min-h-[52px] ${
          isFocused ? 'border-primary bg-white shadow-sm' : 'border-transparent'
        } ${error ? 'border-danger' : ''}`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? Colors.primary : Colors.textTertiary}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          className="flex-1 text-sm text-text py-3"
          style={style}
          placeholderTextColor={Colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} className="ml-2 p-1">
            <Ionicons
              name={rightIcon}
              size={20}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-xs text-danger mt-1 ml-1">{error}</Text>}
    </View>
  );
}


