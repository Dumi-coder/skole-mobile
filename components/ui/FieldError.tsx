import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Themed";
import { Button } from "@/components/ui/Button";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type FieldErrorProps = {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "inline" | "form";
};

export function FieldError({
  message,
  onRetry,
  retryLabel = "Try again",
  variant = "inline",
}: FieldErrorProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];

  if (!message) return null;

  const isForm = variant === "form";

  return (
    <View
      style={[
        styles.wrap,
        isForm && [
          styles.formBox,
          {
            backgroundColor: palette.errorBoxBg,
            borderColor: palette.errorBoxBorder,
          },
        ],
      ]}
    >
      <Text style={[styles.error, { color: palette.danger }]}>{message}</Text>
      {onRetry ? (
        <Button label={retryLabel} variant="secondary" onPress={onRetry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    paddingVertical: 4,
  },
  formBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  error: {
    fontSize: 13,
    fontWeight: "500",
  },
});
