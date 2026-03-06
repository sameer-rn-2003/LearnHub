import CommonTextInput from "@/src/components/CommonTextInput";
import { LoginApi } from "@/src/hooks/request";
import { extractTokenFields, setAuthTokens } from "@/src/store/authTokens";
import { useAppTheme } from "@/src/theme/useAppTheme";
import {
  heightPixel,
  isValidEmail,
  isValidPassword,
  widthPixel,
} from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  email: string;
  password: string;
};

const USER_EMAIL_KEY = "@learnhub/user_email";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setApiError("");
    try {
      const loginBody = {
        email: values.email.trim(),
        password: values.password,
      };
      const response = await LoginApi(loginBody);
      const tokenFields = extractTokenFields(response?.data);
      console.log("response:::::", response);
      if (!tokenFields?.accessToken || !tokenFields?.refreshToken) {
        setApiError("Token data missing in login response.");
        return;
      }
      await setAuthTokens({
        accessToken: tokenFields.accessToken,
        refreshToken: tokenFields.refreshToken,
      });
      await AsyncStorage.setItem(USER_EMAIL_KEY, loginBody.email);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 401) {
        setApiError("Invalid email or password.");
        return;
      }

      const message =
        error?.response?.data?.message ||
        "Unable to sign in. Please try again.";
      setApiError(message);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
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
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                shadowColor: colors.accentStrong,
              },
            ]}
          >
            <View style={styles.logoWrap}>
              <View
                style={[
                  styles.logoBox,
                  { backgroundColor: colors.accentStrong },
                ]}
              >
                <Ionicons name="school" size={heightPixel(24)} color="#fff" />
              </View>

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                LearnHub
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Continue your learning journey
              </Text>
            </View>

            <View style={styles.form}>
              <CommonTextInput
                control={control}
                name="email"
                rules={{
                  validate: (value) => isValidEmail(value) || true,
                }}
                label="EMAIL"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="name@example.com"
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
                  {
                    backgroundColor: colors.accentStrong,
                    shadowColor: colors.accentStrong,
                  },
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
    paddingHorizontal: widthPixel(28),
    paddingTop: heightPixel(48),
    paddingBottom: heightPixel(32),
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
    marginBottom: heightPixel(16),
  },

  title: {
    fontSize: heightPixel(30),
    fontWeight: "800",
  },

  subtitle: {
    fontSize: heightPixel(14),
    marginTop: heightPixel(6),
  },

  form: {
    marginBottom: heightPixel(36),
  },

  signInButton: {
    marginTop: heightPixel(24),
    height: heightPixel(54),
    borderRadius: widthPixel(28),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: widthPixel(8),
    shadowOffset: { width: 0, height: heightPixel(8) },
    shadowOpacity: 0.3,
    shadowRadius: heightPixel(15),
    elevation: 5,
  },

  signInButtonDisabled: {
    backgroundColor: "#8FA9E4",
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
