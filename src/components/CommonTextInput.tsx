import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { heightPixel, widthPixel } from "../utils/Helper";

interface CommonTextInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  touched?: boolean;
  control?: Control<any>;
  name?: string;
  rules?: RegisterOptions;
  defaultValue?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const CommonTextInput: React.FC<CommonTextInputProps> = ({
  label,
  icon,
  error,
  touched,
  control,
  name,
  rules,
  defaultValue,
  required,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  ...rest
}) => {
  const renderInput = (
    inputProps: TextInputProps,
    resolvedError?: string,
    resolvedTouched?: boolean,
  ) => {
    const showError = resolvedTouched && !!resolvedError;

    return (
      <View style={styles.container}>
        <View style={styles.labelRow}>
          {required && <View style={styles.requiredDot} />}
          <Text style={styles.label}>{label}</Text>
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name={icon} size={16} color="#97A3B8" />

          <TextInput
            {...inputProps}
            style={styles.input}
            placeholderTextColor="#BCC4D3"
          />

          {showPasswordToggle && (
            <Pressable onPress={onTogglePassword} hitSlop={8}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#97A3B8"
              />
            </Pressable>
          )}
        </View>

        {showError && <Text style={styles.errorText}>{resolvedError}</Text>}
      </View>
    );
  };

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field, fieldState, formState }) =>
          renderInput(
            {
              ...rest,
              value: field.value == null ? "" : String(field.value),
              onChangeText: field.onChange,
              onBlur: field.onBlur,
            },
            (fieldState.error?.message as string | undefined) || error,
            fieldState.isTouched || formState.isSubmitted || touched,
          )
        }
      />
    );
  }

  return renderInput(rest, error, touched);
};

export default CommonTextInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: heightPixel(12),
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: widthPixel(4),
    marginBottom: heightPixel(8),
  },
  label: {
    color: "#9AA5B7",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  requiredDot: {
    width: widthPixel(6),
    height: heightPixel(6),
    borderRadius: 3,
    backgroundColor: "#E14D5D",
    marginBottom: heightPixel(8),
  },
  inputWrap: {
    height: heightPixel(48),
    borderRadius: widthPixel(16),
    borderWidth: 1,
    borderColor: "#E5E9F0",
    backgroundColor: "#EEF1F5",
    paddingHorizontal: widthPixel(12),
    flexDirection: "row",
    alignItems: "center",
    gap: widthPixel(10),
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#4E5D77",
    fontWeight: "500",
  },
  errorText: {
    color: "#D33A4C",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
});
