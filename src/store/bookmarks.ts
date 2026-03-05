import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  notifyFiveBookmarksReached,
  scheduleBookmarkReminderAfter24Hours,
} from "../utils/notifications";

const BOOKMARKS_KEY = "learnhub_bookmarks";

type BookmarkCategory = {
  id: string;
  name: string;
};

export type BookmarkableCourse = {
  id: string;
  name: string;
  description: string;
  author_name: string;
  images: string[];
  price: number;
  categories?: BookmarkCategory[];
};

export type BookmarkedCourse = {
  id: string;
  name: string;
  description: string;
  author_name: string;
  images: string[];
  price: number;
  categories: BookmarkCategory[];
};

const parseBookmarks = (raw: string | null): BookmarkedCourse[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadBookmarks = async (): Promise<BookmarkedCourse[]> => {
  const asyncRaw = await AsyncStorage.getItem(BOOKMARKS_KEY);
  if (asyncRaw) return parseBookmarks(asyncRaw);

  try {
    const localRaw = (globalThis as any)?.localStorage?.getItem(BOOKMARKS_KEY);
    return parseBookmarks(localRaw ?? null);
  } catch {
    return [];
  }
};

const saveBookmarks = async (bookmarks: BookmarkedCourse[]) => {
  const payload = JSON.stringify(bookmarks);
  await AsyncStorage.setItem(BOOKMARKS_KEY, payload);

  try {
    (globalThis as any)?.localStorage?.setItem(BOOKMARKS_KEY, payload);
  } catch (error: any) {
    console.log("errorr::", error);
  }
};

const toBookmarkedCourse = (course: BookmarkableCourse): BookmarkedCourse => ({
  id: course.id,
  name: course.name,
  description: course.description,
  author_name: course.author_name,
  images: Array.isArray(course.images) ? course.images : [],
  price: Number(course.price) || 0,
  categories: Array.isArray(course.categories) ? course.categories : [],
});

export const useBookmarks = () => {
  const [bookmarkedCourses, setBookmarkedCourses] = useState<
    BookmarkedCourse[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      void loadBookmarks().then((items) => {
        if (isMounted) {
          setBookmarkedCourses(items);
        }
      });

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const bookmarkedIds = useMemo(
    () => new Set(bookmarkedCourses.map((course) => course.id)),
    [bookmarkedCourses],
  );

  const isBookmarked = useCallback(
    (courseId: string) => bookmarkedIds.has(courseId),
    [bookmarkedIds],
  );

  const toggleBookmark = useCallback((course: BookmarkableCourse) => {
    let nowBookmarked = false;

    setBookmarkedCourses((prev) => {
      const alreadyBookmarked = prev.some((item) => item.id === course.id);
      const updatedBookmarks = alreadyBookmarked
        ? prev.filter((item) => item.id !== course.id)
        : [...prev, toBookmarkedCourse(course)];

      void saveBookmarks(updatedBookmarks);
      if (!alreadyBookmarked && updatedBookmarks.length === 5) {
        void notifyFiveBookmarksReached();
        void scheduleBookmarkReminderAfter24Hours();
      }
      nowBookmarked = !alreadyBookmarked;

      return updatedBookmarks;
    });

    return nowBookmarked;
  }, []);

  return {
    bookmarkedCourses,
    bookmarkedIds,
    isBookmarked,
    toggleBookmark,
  };
};
