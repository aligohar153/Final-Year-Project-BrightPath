// BrightPath - Reusable Input Component
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS } from '../../utils/colors';

const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error = '',
  icon = null,
  rightIcon = null,
  onRightIconPress = null,
  multiline = false,
  numberOfLines = 1,
  style = {},
  inputStyle = {},
  editable = true,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(borderAnim, { toValue: 1, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(borderAnim, { toValue: 0, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary],
  });

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Animated.View
        style={[
          styles.container,
          { borderColor },
          error ? { borderColor: COLORS.error } : null,
          isFocused && styles.focused,
          !editable && styles.disabled,
        ]}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDisabled}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          maxLength={maxLength}
          style={[
            styles.input,
            icon && { paddingLeft: 0 },
            multiline && { height: 90, textAlignVertical: 'top', paddingTop: 12 },
            inputStyle,
          ]}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}>
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconRight}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#CCC',
    marginBottom: 8,
    marginLeft: 10,
    letterSpacing: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderWidth: 1.5,
    borderColor: '#EEE',
    borderRadius: 25,
    borderTopLeftRadius: 10, // Organic touch
    paddingHorizontal: 20,
    minHeight: 56,
  },
  focused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4D96FF',
    elevation: 4,
    shadowColor: '#4D96FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  disabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '800',
    paddingVertical: 12,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 10,
    padding: 4,
  },
  eyeText: {
    fontSize: 18,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 10,
    marginTop: 5,
    marginLeft: 10,
    fontWeight: '800',
  },
});

export default AppInput;





