import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { fontSizes } from '../../theme/typography';

type Props = {
  label?: string;
  errorText?: string;
  containerStyle?: ViewStyle;
  accessoryRight?: React.ReactNode;
  dense?: boolean;
} & TextInputProps;

export default function FormField({ label, errorText, containerStyle, style, accessoryRight, dense, ...rest }: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, dense && styles.labelDense]}>{label}</Text> : null}
      <View style={[styles.inputWrapper, dense && { height: 40 }] }>
        <TextInput
          style={[styles.input, dense && { fontSize: 12 }, style]}
          placeholderTextColor={colors.textMuted}
          {...rest}
        />
        {accessoryRight ? <View style={styles.right}>{accessoryRight}</View> : null}
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
    paddingLeft: spacing.md,
    paddingRight: 44,
    height: 50,
    position: 'relative',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: Math.max(fontSizes.sm(), 16), // Минимум 16px для предотвращения зума на iOS
  },
  right: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelDense: {
    fontSize: 12,
  },
  error: {
    marginTop: spacing.xs,
    color: 'red',
    fontSize: fontSizes.xs(),
  },
});


