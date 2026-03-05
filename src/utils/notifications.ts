import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const BOOKMARK_REMINDER_ID_KEY = "@learnhub/bookmark_reminder_notification_id";

let isInitialized = false;

export const initializeNotifications = async () => {
  if (Platform.OS === "web") return false;
  if (isInitialized) return true;

  const currentPermission = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermission.status;

  if (finalStatus !== "granted") {
    const requestPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestPermission.status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  isInitialized = true;
  return true;
};

export const notifyFiveBookmarksReached = async () => {
  const allowed = await initializeNotifications();
  if (!allowed) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Great job!",
      body: "You saved 5 bookmarks.",
    },
    trigger: null,
  });
};

export const scheduleBookmarkReminderAfter24Hours = async () => {
  const allowed = await initializeNotifications();
  if (!allowed) return;

  const oldReminderId = await AsyncStorage.getItem(BOOKMARK_REMINDER_ID_KEY);
  if (oldReminderId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(oldReminderId);
    } catch {}
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Learning Reminder",
      body: "You have bookmarked courses waiting for you.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
    },
  });

  await AsyncStorage.setItem(BOOKMARK_REMINDER_ID_KEY, notificationId);
};
