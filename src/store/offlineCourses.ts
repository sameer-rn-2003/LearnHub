import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

const COURSE_CACHE_KEY = "@learnhub/course_catalog_cache";
const COURSE_PROGRESS_KEY = "@learnhub/course_video_progress";
const ENROLLED_COURSE_IDS_KEY = "@learnhub/enrolled_course_ids";
const ENROLLED_COURSES_KEY = "@learnhub/enrolled_courses";
const OFFLINE_VIDEO_FOLDER_NAME = "learnhub-videos";

type CourseProgressMap = Record<string, CourseVideoProgress>;

type CachedCourse = {
  id: string;
  name: string;
  description: string;
  author_name: string;
  images?: string[];
  price: number;
  createdAt?: string;
  categories?: EnrolledCourseCategory[];
};

export type CourseVideoProgress = {
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: string;
};

export type EnrolledCourseCategory = {
  id: string;
  name: string;
};

export type EnrolledCourse = {
  id: string;
  name: string;
  description: string;
  author_name: string;
  images: string[];
  price: number;
  createdAt?: string;
  categories?: EnrolledCourseCategory[];
  enrolledAt: string;
};

export type EnrollCoursePayload = Omit<EnrolledCourse, "enrolledAt"> & {
  enrolledAt?: string;
};

const getLocalStorage = () => {
  try {
    return (globalThis as any)?.localStorage ?? null;
  } catch {
    return null;
  }
};

const parseJson = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return (parsed as T) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeLocalStorage = (key: string, value: string) => {
  const localStorageRef = getLocalStorage();
  if (!localStorageRef) return;
  localStorageRef.setItem(key, value);
};

const readLocalStorage = (key: string) => {
  const localStorageRef = getLocalStorage();
  if (!localStorageRef) return null;
  return localStorageRef.getItem(key);
};

const getOfflineVideoDirectoryUri = () => {
  if (!FileSystem.documentDirectory) return null;
  return `${FileSystem.documentDirectory}${OFFLINE_VIDEO_FOLDER_NAME}/`;
};

const ensureOfflineVideoDirectory = async () => {
  const directoryUri = getOfflineVideoDirectoryUri();
  if (!directoryUri) {
    throw new Error("Offline downloads are not available on this platform.");
  }

  const info = await FileSystem.getInfoAsync(directoryUri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
  }

  return directoryUri;
};

const getVideoFileUri = (courseId: string) => {
  const directoryUri = getOfflineVideoDirectoryUri();
  if (!directoryUri) return null;
  const safeId = encodeURIComponent(courseId);
  return `${directoryUri}${safeId}.mp4`;
};

export const saveCourseCatalogCache = async <T>(courses: T[]) => {
  const payload = JSON.stringify(courses);
  await AsyncStorage.setItem(COURSE_CACHE_KEY, payload);
  writeLocalStorage(COURSE_CACHE_KEY, payload);
};

export const getCourseCatalogCache = async <T>() => {
  const asyncRaw = await AsyncStorage.getItem(COURSE_CACHE_KEY);
  if (asyncRaw) return parseJson<T[]>(asyncRaw, []);
  return parseJson<T[]>(readLocalStorage(COURSE_CACHE_KEY), []);
};

const getEnrolledCourseIds = async () => {
  const asyncRaw = await AsyncStorage.getItem(ENROLLED_COURSE_IDS_KEY);
  if (asyncRaw) return parseJson<string[]>(asyncRaw, []);
  return parseJson<string[]>(readLocalStorage(ENROLLED_COURSE_IDS_KEY), []);
};

const saveEnrolledCourseIds = async (courseIds: string[]) => {
  const payload = JSON.stringify(courseIds);
  await AsyncStorage.setItem(ENROLLED_COURSE_IDS_KEY, payload);
  writeLocalStorage(ENROLLED_COURSE_IDS_KEY, payload);
};

const normalizeEnrolledCourse = (
  course: Partial<EnrolledCourse> & { id?: string },
) => {
  if (!course.id) return null;

  return {
    id: course.id,
    name: course.name?.trim() || "Saved Course",
    description: course.description ?? "",
    author_name: course.author_name?.trim() || "Instructor",
    images: Array.isArray(course.images) ? course.images : [],
    price: Number(course.price ?? 0),
    createdAt: course.createdAt,
    categories: course.categories,
    enrolledAt: course.enrolledAt ?? new Date().toISOString(),
  } as EnrolledCourse;
};

const dedupeEnrolledCourses = (courses: EnrolledCourse[]) => {
  const map = new Map<string, EnrolledCourse>();
  courses.forEach((course) => {
    map.set(course.id, course);
  });
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime(),
  );
};

const getStoredEnrolledCourses = async () => {
  const asyncRaw = await AsyncStorage.getItem(ENROLLED_COURSES_KEY);
  const localRaw = readLocalStorage(ENROLLED_COURSES_KEY);
  const rawPayload = asyncRaw ?? localRaw;
  const parsed = parseJson<(Partial<EnrolledCourse> & { id?: string })[]>(
    rawPayload,
    [],
  );

  const normalized = parsed
    .map((course) => normalizeEnrolledCourse(course))
    .filter((course): course is EnrolledCourse => !!course);

  return dedupeEnrolledCourses(normalized);
};

const saveEnrolledCourses = async (courses: EnrolledCourse[]) => {
  const normalized = dedupeEnrolledCourses(courses);
  const payload = JSON.stringify(normalized);
  await AsyncStorage.setItem(ENROLLED_COURSES_KEY, payload);
  writeLocalStorage(ENROLLED_COURSES_KEY, payload);
  await saveEnrolledCourseIds(normalized.map((course) => course.id));
};

const getCatalogCourseById = async (courseId: string) => {
  const cachedCourses = await getCourseCatalogCache<CachedCourse>();
  return cachedCourses.find((course) => course.id === courseId) ?? null;
};

export const getEnrolledCourses = async () => {
  const storedCourses = await getStoredEnrolledCourses();
  if (storedCourses.length > 0) {
    return storedCourses;
  }

  const enrolledCourseIds = await getEnrolledCourseIds();
  if (enrolledCourseIds.length === 0) {
    return [];
  }

  const migratedCourses: EnrolledCourse[] = [];
  for (const courseId of enrolledCourseIds) {
    const cachedCourse = await getCatalogCourseById(courseId);
    migratedCourses.push({
      id: courseId,
      name: cachedCourse?.name || "Saved Course",
      description: cachedCourse?.description || "",
      author_name: cachedCourse?.author_name || "Instructor",
      images: cachedCourse?.images ?? [],
      price: Number(cachedCourse?.price ?? 0),
      createdAt: cachedCourse?.createdAt,
      categories: cachedCourse?.categories,
      enrolledAt: new Date().toISOString(),
    });
  }

  await saveEnrolledCourses(migratedCourses);
  return migratedCourses;
};

export const isCourseEnrolled = async (courseId: string) => {
  const enrolledCourses = await getEnrolledCourses();
  return enrolledCourses.some((course) => course.id === courseId);
};

export const enrollInCourse = async (payload: string | EnrollCoursePayload) => {
  const courseId = typeof payload === "string" ? payload : payload.id;
  if (!courseId) return;

  const enrolledCourses = await getEnrolledCourses();
  const enrolledIndex = enrolledCourses.findIndex(
    (course) => course.id === courseId,
  );
  if (enrolledIndex >= 0) {
    if (typeof payload !== "string") {
      const normalizedCourse = normalizeEnrolledCourse(payload);
      if (!normalizedCourse) return;
      const previousCourse = enrolledCourses[enrolledIndex];
      const nextCourses = [...enrolledCourses];
      nextCourses[enrolledIndex] = {
        ...previousCourse,
        ...normalizedCourse,
        enrolledAt: previousCourse.enrolledAt || normalizedCourse.enrolledAt,
      };
      await saveEnrolledCourses(nextCourses);
    }
    return;
  }

  const normalizedCourse = (() => {
    if (typeof payload === "string") return null;
    return normalizeEnrolledCourse(payload);
  })();

  if (normalizedCourse) {
    await saveEnrolledCourses([...enrolledCourses, normalizedCourse]);
    return;
  }

  const cachedCourse = await getCatalogCourseById(courseId);
  const fallbackCourse = normalizeEnrolledCourse({
    id: courseId,
    name: cachedCourse?.name,
    description: cachedCourse?.description,
    author_name: cachedCourse?.author_name,
    images: cachedCourse?.images,
    price: cachedCourse?.price,
    createdAt: cachedCourse?.createdAt,
    categories: cachedCourse?.categories,
  });

  if (!fallbackCourse) return;
  await saveEnrolledCourses([...enrolledCourses, fallbackCourse]);
};

const getProgressMap = async (): Promise<CourseProgressMap> => {
  const asyncRaw = await AsyncStorage.getItem(COURSE_PROGRESS_KEY);
  if (asyncRaw) return parseJson<CourseProgressMap>(asyncRaw, {});
  return parseJson<CourseProgressMap>(readLocalStorage(COURSE_PROGRESS_KEY), {});
};

const saveProgressMap = async (payload: CourseProgressMap) => {
  const serialized = JSON.stringify(payload);
  await AsyncStorage.setItem(COURSE_PROGRESS_KEY, serialized);
  writeLocalStorage(COURSE_PROGRESS_KEY, serialized);
};

export const getCourseVideoProgress = async (courseId: string) => {
  const payload = await getProgressMap();
  return payload[courseId] ?? null;
};

export const saveCourseVideoProgress = async (
  courseId: string,
  progress: CourseVideoProgress,
) => {
  const payload = await getProgressMap();
  payload[courseId] = progress;
  await saveProgressMap(payload);
};

export const clearCourseVideoProgress = async (courseId: string) => {
  const payload = await getProgressMap();
  delete payload[courseId];
  await saveProgressMap(payload);
};

export const getOfflineVideoInfo = async (courseId: string) => {
  const fileUri = getVideoFileUri(courseId);
  if (!fileUri) {
    return { exists: false, uri: null as string | null, size: 0 };
  }

  const info = await FileSystem.getInfoAsync(fileUri);
  return {
    exists: !!info.exists,
    uri: info.exists ? fileUri : null,
    size: info.exists ? Number(info.size ?? 0) : 0,
  };
};

export const downloadOfflineVideo = async (
  courseId: string,
  remoteUri: string,
  onProgress?: (progress: number) => void,
) => {
  const directoryUri = await ensureOfflineVideoDirectory();
  const safeId = encodeURIComponent(courseId);
  const fileUri = `${directoryUri}${safeId}.mp4`;

  const downloader = FileSystem.createDownloadResumable(
    remoteUri,
    fileUri,
    {},
    (state) => {
      if (!onProgress) return;
      if (!state.totalBytesExpectedToWrite) return;
      const ratio = state.totalBytesWritten / state.totalBytesExpectedToWrite;
      onProgress(Math.max(0, Math.min(1, ratio)));
    },
  );

  const result = await downloader.downloadAsync();
  if (!result?.uri) {
    throw new Error("Unable to download video.");
  }

  return result.uri;
};

export const deleteOfflineVideo = async (courseId: string) => {
  const fileUri = getVideoFileUri(courseId);
  if (!fileUri) return;
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) return;
  await FileSystem.deleteAsync(fileUri, { idempotent: true });
};
