// BrightPath - Reusable Button Component
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';

const AppButton = ({
  title,
  onPress,
  variant = 'primary',  // primary | secondary | outline | ghost | danger
  size = 'md',           // sm | md | lg | xl
  gradient = null,
  loading = false,
  disabled = false,
  icon = null,
  style = {},
  textStyle = {},
  fullWidth = true,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const sizeStyles = {
    sm: { height: 38, paddingHorizontal: 16, borderRadius: 12 },
    md: { height: 48, paddingHorizontal: 24, borderRadius: 16 },
    lg: { height: 56, paddingHorizontal: 32, borderRadius: 18 },
    xl: { height: 64, paddingHorizontal: 40, borderRadius: 20 },
  };

  const textSizes = { sm: 13, md: 15, lg: 17, xl: 19 };

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary': return { bg: COLORS.secondary, text: COLORS.textWhite };
      case 'outline':   return { bg: 'transparent', text: COLORS.primary, border: COLORS.primary };
      case 'ghost':     return { bg: COLORS.divider, text: COLORS.textMedium };
      case 'danger':    return { bg: COLORS.red, text: COLORS.textWhite };
      case 'success':   return { bg: COLORS.green, text: COLORS.textWhite };
      default:          return { bg: COLORS.primary, text: COLORS.textWhite };
    }
  };

  const variantStyle = getVariantStyle();
  const sz = sizeStyles[size];
  const isDisabled = disabled || loading;

  const buttonContent = (
    <View style={[styles.inner, sz]}>
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, { color: variantStyle.text, fontSize: textSizes[size] }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { width: '100%' }, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={isDisabled ? null : onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}>
        {gradient ? (
          <LinearGradient
            colors={isDisabled ? [COLORS.textDisabled, COLORS.textDisabled] : gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, sz, isDisabled && styles.disabled]}>
            {buttonContent}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.button,
              sz,
              { backgroundColor: isDisabled ? COLORS.textDisabled : variantStyle.bg },
              variantStyle.border && { borderWidth: 2, borderColor: variantStyle.border },
              isDisabled && styles.disabled,
            ]}>
            {buttonContent}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconWrap: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default AppButton;





