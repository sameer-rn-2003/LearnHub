import CommonTextInput from "@/src/components/CommonTextInput";
import { LoginApi } from "@/src/hooks/request";
import { heightPixel, isValidPassword, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type LoginFormValues = {
  username: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setApiError("");
    try {
      let loginBody = {
        username: values.username.trim(),
        password: values.password,
      };
      const response = await LoginApi(loginBody);
      console.log(JSON.stringify(response?.data?.data?.user));
      router.replace("/(tabs)/home");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to sign in. Please try again.";
      setApiError(message);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? heightPixel(40) : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.card}>
            <View style={styles.logoWrap}>
              <View style={styles.logoBox}>
                <Ionicons name="school" size={heightPixel(24)} color="#fff" />
              </View>

              <Text style={styles.title}>LearnHub</Text>
              <Text style={styles.subtitle}>
                Continue your learning journey
              </Text>
            </View>

            <View style={styles.form}>
              <CommonTextInput
                control={control}
                name="username"
                rules={{
                  validate: (value) =>
                    value?.trim() ? true : "Username is required",
                }}
                label="USERNAME"
                icon="person-outline"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your username"
              />

              <CommonTextInput
                control={control}
                name="password"
                rules={{
                  validate: (value) => isValidPassword(value) || true,
                }}
                label="PASSWORD"
                icon="lock-closed-outline"
                placeholder="********"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                required
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((v) => !v)}
              />

              {!!apiError && (
                <Text style={styles.apiErrorText}>{apiError}</Text>
              )}

              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isSubmitting}
                style={[
                  styles.signInButton,
                  (!isValid || isSubmitting) && styles.signInButtonDisabled,
                ]}
              >
                <Text style={styles.signInText}>
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={heightPixel(18)}
                  color="#fff"
                />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: widthPixel(28),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: widthPixel(28),
    paddingTop: heightPixel(48),
    paddingBottom: heightPixel(32),
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: heightPixel(10) },
    shadowOpacity: 0.15,
    shadowRadius: heightPixel(25),
    elevation: 6,
  },

  logoWrap: {
    alignItems: "center",
    marginBottom: heightPixel(36),
  },

  screen: {
    flex: 1,
    backgroundColor: "#EEF2FF",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(60),
    paddingBottom: heightPixel(40),
  },

  keyboardAvoider: {
    flex: 1,
  },

  logoBox: {
    width: widthPixel(60),
    height: heightPixel(60),
    borderRadius: widthPixel(18),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    marginBottom: heightPixel(16),
  },

  title: {
    fontSize: heightPixel(30),
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: heightPixel(14),
    color: "#6B7280",
    marginTop: heightPixel(6),
  },

  form: {
    marginBottom: heightPixel(36),
  },

  signInButton: {
    marginTop: heightPixel(24),
    height: heightPixel(54),
    borderRadius: widthPixel(28),
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: widthPixel(8),
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: heightPixel(8) },
    shadowOpacity: 0.3,
    shadowRadius: heightPixel(15),
    elevation: 5,
  },

  signInButtonDisabled: {
    backgroundColor: "#A5B4FC",
  },

  signInText: {
    color: "#FFFFFF",
    fontSize: heightPixel(16),
    fontWeight: "700",
  },
  apiErrorText: {
    color: "#D33A4C",
    fontSize: heightPixel(12),
    fontWeight: "600",
    marginTop: heightPixel(4),
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: widthPixel(6),
  },

  footerText: {
    color: "#6B7280",
    fontSize: heightPixel(13),
  },

  createAccount: {
    color: "#4F46E5",
    fontWeight: "700",
    fontSize: heightPixel(13),
  },
});
