import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");

const BOOKMARK_REMINDER_ID_KEY = "@learnhub/bookmark_reminder_notification_id";
const COURSE_REMINDER_KEY_PREFIX = "@learnhub/course_reminder_notification_id:";

const isExpoGo = Constants.executionEnvironment === "storeClient";

let isInitialized = false;
let notificationsModule: NotificationsModule | null = null;

const getNotificationsModule = async (): Promise<NotificationsModule | null> => {
  if (Platform.OS === "web" || isExpoGo) return null;
  if (notificationsModule) return notificationsModule;
  notificationsModule = await import("expo-notifications");
  return notificationsModule;
};

export const initializeNotifications = async () => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;
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

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

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

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

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

const getCourseReminderStorageKey = (courseId: string) =>
  `${COURSE_REMINDER_KEY_PREFIX}${courseId}`;

export const clearIncompleteCourseReminder = async (courseId: string) => {
  const reminderKey = getCourseReminderStorageKey(courseId);
  const reminderId = await AsyncStorage.getItem(reminderKey);
  if (!reminderId) return;

  const Notifications = await getNotificationsModule();
  if (Notifications) {
    try {
      await Notifications.cancelScheduledNotificationAsync(reminderId);
    } catch {}
  }

  await AsyncStorage.removeItem(reminderKey);
};

export const scheduleIncompleteCourseReminder = async (
  courseId: string,
  courseTitle: string,
) => {
  const allowed = await initializeNotifications();
  if (!allowed) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await clearIncompleteCourseReminder(courseId);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Course Reminder",
      body: `Continue "${courseTitle}" from where you paused.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 4 * 60 * 60,
    },
  });

  await AsyncStorage.setItem(
    getCourseReminderStorageKey(courseId),
    notificationId,
  );
};
