import React, { useRef } from 'react';
import { View, StyleSheet, ViewProps, PanResponder } from 'react-native';

interface TouchCaptureProps extends ViewProps {
  onTouch: () => void;
}

export default function TouchCapture({ children, onTouch, ...props }: TouchCaptureProps) {
  const lastTouch = useRef(0);

  const handleTouch = () => {
    const now = Date.now();
    if (now - lastTouch.current > 500) {
      onTouch();
      lastTouch.current = now;
    }
  };


  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => false,
  });

  return (
    <View
      {...props}
      style={[styles.container, props.style]}
      onTouchEnd={handleTouch}
      {...panResponder.panHandlers}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});