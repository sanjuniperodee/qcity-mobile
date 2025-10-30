import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { fontSizes } from '../../theme/typography';

type Props = {
  label?: string;
  errorText?: string;
  containerStyle?: ViewStyle;
} & TextInputProps;

export default function FormField({ label, errorText, containerStyle, style, ...rest }: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          {...rest}
        />
      </View>
      {!!errorText && <Text style={styles.error}>{errorText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: fontSizes.sm(),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSizes.sm(),
  },
  error: {
    marginTop: spacing.xs,
    color: 'red',
    fontSize: fontSizes.xs(),
  },
});


