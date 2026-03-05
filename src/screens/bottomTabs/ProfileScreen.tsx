import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const USER_EMAIL_KEY = "@learnhub/user_email";
const USER_PROFILE_IMAGE_KEY = "@learnhub/user_profile_image";

const DEFAULT_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330";

export default function ProfileScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("Not available");
  const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [message, setMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadProfile = async () => {
        const storedEmail = await AsyncStorage.getItem(USER_EMAIL_KEY);
        const storedProfileImage = await AsyncStorage.getItem(
          USER_PROFILE_IMAGE_KEY,
        );

        if (!isMounted) return;

        if (storedEmail) {
          setEmail(storedEmail);
        }

        if (storedProfileImage) {
          setProfileImage(storedProfileImage);
        }
      };

      void loadProfile();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const displayName = useMemo(() => {
    if (!email || !email.includes("@")) return "LearnHub User";
    return email.split("@")[0];
  }, [email]);

  const onSelectFromGallery = useCallback(async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setMessage("Gallery permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const selectedUri = result.assets[0].uri;
    setProfileImage(selectedUri);
    await AsyncStorage.setItem(USER_PROFILE_IMAGE_KEY, selectedUri);
    setMessage("Profile picture updated.");
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />

        <Text style={styles.nameText}>{displayName}</Text>
        <Text style={styles.emailText}>Email ID: {email}</Text>

        <Pressable style={styles.button} onPress={onSelectFromGallery}>
          <Text style={styles.buttonText}>Select From Gallery</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/(tabs)/bookmarks")}
        >
          <Text style={styles.secondaryButtonText}>Check Bookmarks</Text>
        </Pressable>

        {!!message && <Text style={styles.messageText}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FF",
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(30),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: widthPixel(20),
    alignItems: "center",
    paddingVertical: heightPixel(28),
    paddingHorizontal: widthPixel(18),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileImage: {
    width: widthPixel(96),
    height: heightPixel(96),
    borderRadius: widthPixel(48),
    marginBottom: heightPixel(12),
  },
  nameText: {
    fontSize: heightPixel(20),
    fontWeight: "700",
    color: "#111827",
    marginBottom: heightPixel(4),
  },
  emailText: {
    fontSize: heightPixel(13),
    color: "#6B7280",
    marginBottom: heightPixel(14),
  },
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: widthPixel(20),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(18),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: heightPixel(13),
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: heightPixel(10),
    borderRadius: widthPixel(20),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(18),
    backgroundColor: "#EEF2FF",
  },
  secondaryButtonText: {
    color: "#4338CA",
    fontSize: heightPixel(13),
    fontWeight: "700",
  },
  messageText: {
    marginTop: heightPixel(10),
    fontSize: heightPixel(12),
    color: "#374151",
  },
});
