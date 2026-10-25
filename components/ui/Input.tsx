import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

export type InputProps = TextInputProps & {
  hasError?: boolean;
};

export function Input({ hasError = false, style, ...props }: InputProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  return (
    <TextInput
      {...props}
      placeholderTextColor={props.placeholderTextColor ?? palette.muted}
      style={[
        styles.input,
        {
          color: palette.text,
          backgroundColor: palette.subtleBg,
          borderColor: hasError ? palette.danger : palette.border,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 44,
  },
});
