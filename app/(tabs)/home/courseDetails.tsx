import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  CourseVideoProgress,
  clearCourseVideoProgress,
  deleteOfflineVideo,
  downloadOfflineVideo,
  enrollInCourse,
  getCourseVideoProgress,
  getOfflineVideoInfo,
  isCourseEnrolled,
  saveCourseVideoProgress,
} from "@/src/store/offlineCourses";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import {
  clearIncompleteCourseReminder,
  scheduleIncompleteCourseReminder,
} from "@/src/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f";
const JS_YOUTUBE_VIDEO_ID = "PkZNo7MFNFg";
const LESSON_DURATION_SECONDS = 120;
const OFFLINE_VIDEO_DOWNLOAD_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

type ProductCategory = {
  id: string;
  name: string;
};

type ProductDetails = {
  id: string;
  name: string;
  description: string;
  author_name: string;
  images: string[];
  price: number;
  createdAt?: string;
  categories?: ProductCategory[];
};

type PlayerMode = "stream" | "offline";

const EMPTY_PROGRESS: CourseVideoProgress = {
  positionSeconds: 0,
  durationSeconds: 0,
  completed: false,
  updatedAt: new Date(0).toISOString(),
};

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatPercent = (positionSeconds: number, durationSeconds: number) => {
  if (!durationSeconds) return 0;
  const ratio = (positionSeconds / durationSeconds) * 100;
  return Math.max(0, Math.min(100, Math.round(ratio)));
};

const formatFileSizeMb = (bytes: number) =>
  `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const buildYoutubeHtml = (
  videoId: string,
  durationSeconds: number,
) => `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; background: #05070E; overflow: hidden; }
      .frame-wrap { width: 100vw; height: 100vh; }
      iframe { border: 0; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div class="frame-wrap">
      <iframe
        src="https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&start=0&end=${durationSeconds}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  </body>
</html>`;

const buildOfflineVideoHtml = (
  videoUri: string,
  resumeSeconds: number,
  durationSeconds: number,
) => {
  const safeUri = JSON.stringify(videoUri);
  const safeResumeAt = Math.max(0, Math.floor(resumeSeconds));
  const safeDuration = Math.max(1, Math.floor(durationSeconds));

  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; background: #05070E; overflow: hidden; }
      .wrap { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
      video { width: 100%; height: 100%; background: #05070E; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <video id="player" controls playsinline preload="auto" src=${safeUri}></video>
    </div>
    <script>
      const video = document.getElementById("player");
      const resumeAt = ${safeResumeAt};
      const lessonDuration = ${safeDuration};
      const send = (payload) => {
        if (!window.ReactNativeWebView) return;
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      };

      video.addEventListener("loadedmetadata", () => {
        const effectiveDuration = Math.min(video.duration || lessonDuration, lessonDuration);
        if (resumeAt > 0 && resumeAt < effectiveDuration) {
          video.currentTime = resumeAt;
        }
        send({
          type: "ready",
          positionSeconds: Math.floor(video.currentTime || 0),
          durationSeconds: Math.floor(effectiveDuration || lessonDuration),
          completed: false,
        });
      });

      video.addEventListener("timeupdate", () => {
        const positionSeconds = Math.floor(video.currentTime || 0);
        const durationSeconds = Math.floor(Math.min(video.duration || lessonDuration, lessonDuration));
        const completed = !!durationSeconds && positionSeconds >= durationSeconds - 1;

        if (positionSeconds >= lessonDuration) {
          video.pause();
          video.currentTime = lessonDuration;
          send({
            type: "ended",
            positionSeconds: lessonDuration,
            durationSeconds,
            completed: true,
          });
          return;
        }

        send({ type: "progress", positionSeconds, durationSeconds, completed });
      });

      video.addEventListener("pause", () => {
        send({
          type: "pause",
          positionSeconds: Math.floor(video.currentTime || 0),
          durationSeconds: Math.floor(video.duration || 0),
          completed: video.ended,
        });
      });

      video.addEventListener("ended", () => {
        send({
          type: "ended",
          positionSeconds: Math.floor(video.duration || 0),
          durationSeconds: Math.floor(video.duration || 0),
          completed: true,
        });
      });
    </script>
  </body>
</html>`;
};

export default function CourseDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ productData?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const saveTimestampRef = useRef(0);

  const [mode, setMode] = useState<PlayerMode>("stream");
  const [offlineVideoUri, setOfflineVideoUri] = useState<string | null>(null);
  const [offlineFileSize, setOfflineFileSize] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [offlineStartAtSeconds, setOfflineStartAtSeconds] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [playbackProgress, setPlaybackProgress] =
    useState<CourseVideoProgress>(EMPTY_PROGRESS);
  const [statusMessage, setStatusMessage] = useState("");

  const product = useMemo(() => {
    if (!params.productData || typeof params.productData !== "string") {
      return null;
    }

    try {
      const decoded = decodeURIComponent(params.productData);
      return JSON.parse(decoded) as ProductDetails;
    } catch {
      return null;
    }
  }, [params.productData]);

  const theme = useMemo(
    () =>
      isDark
        ? {
            screen: "#04060D",
            card: "#0E1322",
            cardBorder: "#212B45",
            textPrimary: "#EFF3FF",
            textSecondary: "#A9B6D8",
            accent: "#8DAFFF",
            accentStrong: "#3D68D8",
            overlay: "rgba(4, 9, 18, 0.62)",
            warningBg: "#1A2440",
            warningText: "#B6CCFF",
            chipBg: "rgba(75, 98, 155, 0.32)",
            chipText: "#DCE7FF",
          }
        : {
            screen: "#EEF3FF",
            card: "#FFFFFF",
            cardBorder: "#DEE6F7",
            textPrimary: "#101A2F",
            textSecondary: "#5F6F8D",
            accent: "#1844B5",
            accentStrong: "#0A2342",
            overlay: "rgba(8, 17, 34, 0.5)",
            warningBg: "#EEF4FF",
            warningText: "#1E3A8A",
            chipBg: "#E7EEFF",
            chipText: "#24417B",
          },
    [isDark],
  );

  const completionPercent = useMemo(
    () =>
      formatPercent(
        playbackProgress.positionSeconds,
        playbackProgress.durationSeconds,
      ),
    [playbackProgress.durationSeconds, playbackProgress.positionSeconds],
  );

  const canPlayOffline = !!offlineVideoUri;
  const effectiveMode: PlayerMode =
    mode === "offline" && canPlayOffline ? "offline" : "stream";

  const showToast = useCallback((message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  }, []);

  useEffect(() => {
    if (!product?.id) return;

    let isMounted = true;
    void (async () => {
      const [savedProgress, offlineInfo, enrolled] = await Promise.all([
        getCourseVideoProgress(product.id),
        getOfflineVideoInfo(product.id),
        isCourseEnrolled(product.id),
      ]);

      if (!isMounted) return;

      if (savedProgress) {
        setPlaybackProgress(savedProgress);
        setOfflineStartAtSeconds(savedProgress.positionSeconds);
      }
      setIsEnrolled(enrolled);

      if (offlineInfo.exists && offlineInfo.uri) {
        setOfflineVideoUri(offlineInfo.uri);
        setOfflineFileSize(offlineInfo.size);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id || !product?.name) return;
    if (playbackProgress.completed) {
      void clearIncompleteCourseReminder(product.id);
    }
  }, [playbackProgress.completed, product?.id, product?.name]);

  useEffect(() => {
    return () => {
      if (!product?.id || !product?.name) return;
      if (playbackProgress.completed) return;
      if (playbackProgress.positionSeconds < 45) return;
      void scheduleIncompleteCourseReminder(product.id, product.name);
    };
  }, [
    playbackProgress.completed,
    playbackProgress.positionSeconds,
    product?.id,
    product?.name,
  ]);

  const persistProgress = useCallback(
    async (payload: CourseVideoProgress) => {
      if (!product?.id) return;
      const now = Date.now();
      if (!payload.completed && now - saveTimestampRef.current < 2500) return;
      saveTimestampRef.current = now;
      await saveCourseVideoProgress(product.id, payload);
    },
    [product?.id],
  );

  const onOfflineVideoEvent = useCallback(
    (rawEvent: string) => {
      if (!product?.id || !product?.name) return;

      try {
        const payload = JSON.parse(rawEvent) as {
          type: string;
          positionSeconds: number;
          durationSeconds: number;
          completed: boolean;
        };

        const nextProgress: CourseVideoProgress = {
          positionSeconds: Math.max(0, Number(payload.positionSeconds) || 0),
          durationSeconds: Math.max(0, Number(payload.durationSeconds) || 0),
          completed: !!payload.completed,
          updatedAt: new Date().toISOString(),
        };

        setPlaybackProgress((prev) => ({
          ...prev,
          ...nextProgress,
        }));
        void persistProgress(nextProgress);

        if (nextProgress.completed) {
          void clearIncompleteCourseReminder(product.id);
          setStatusMessage("Course completed. Great work.");
          showToast("Course completed");
          return;
        }

        if (payload.type === "pause" && nextProgress.positionSeconds > 45) {
          void scheduleIncompleteCourseReminder(product.id, product.name);
          setStatusMessage(
            `Saved at ${formatTime(nextProgress.positionSeconds)}. We'll remind you later.`,
          );
        }
      } catch {}
    },
    [persistProgress, product?.id, product?.name, showToast],
  );

  const handleEnroll = useCallback(async () => {
    if (!product?.id) return;
    if (isEnrolled || isEnrolling) return;

    setIsEnrolling(true);
    try {
      await enrollInCourse({
        id: product.id,
        name: product.name,
        description: product.description,
        author_name: product.author_name,
        images: product.images ?? [],
        price: product.price,
        createdAt: product.createdAt,
        categories: product.categories,
      });
      setIsEnrolled(true);
      setStatusMessage(
        "Enrollment successful. Player and downloads are unlocked.",
      );
      showToast("Enrolled successfully");
    } finally {
      setIsEnrolling(false);
    }
  }, [isEnrolled, isEnrolling, product, showToast]);

  const handleDownloadOffline = useCallback(async () => {
    if (!product?.id) return;
    if (!isEnrolled) {
      setStatusMessage("Enroll first to enable downloads.");
      showToast("Enroll first");
      return;
    }
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setStatusMessage("Downloading offline lesson...");

    try {
      const uri = await downloadOfflineVideo(
        product.id,
        OFFLINE_VIDEO_DOWNLOAD_URL,
        (progress) => setDownloadProgress(progress),
      );

      const info = await getOfflineVideoInfo(product.id);
      setOfflineVideoUri(uri);
      setOfflineFileSize(info.size);
      setOfflineStartAtSeconds(playbackProgress.positionSeconds);
      setMode("offline");
      setStatusMessage(
        "Offline lesson downloaded. You can watch without internet.",
      );
      showToast("Download complete");
    } catch {
      setStatusMessage("Unable to download right now. Please try again.");
      showToast("Download failed");
    } finally {
      setIsDownloading(false);
    }
  }, [
    isDownloading,
    isEnrolled,
    playbackProgress.positionSeconds,
    product?.id,
    showToast,
  ]);

  const handleDeleteOffline = useCallback(async () => {
    if (!product?.id) return;
    await deleteOfflineVideo(product.id);
    await clearCourseVideoProgress(product.id);
    setOfflineVideoUri(null);
    setOfflineFileSize(0);
    setOfflineStartAtSeconds(0);
    setPlaybackProgress(EMPTY_PROGRESS);
    setMode("stream");
    setStatusMessage("Offline lesson removed from device.");
    showToast("Offline file removed");
  }, [product?.id, showToast]);

  const webHtml = useMemo(() => {
    if (effectiveMode === "offline" && offlineVideoUri) {
      return buildOfflineVideoHtml(
        offlineVideoUri,
        offlineStartAtSeconds,
        LESSON_DURATION_SECONDS,
      );
    }
    return buildYoutubeHtml(JS_YOUTUBE_VIDEO_ID, LESSON_DURATION_SECONDS);
  }, [effectiveMode, offlineStartAtSeconds, offlineVideoUri]);

  const webViewSource = useMemo(() => {
    if (effectiveMode === "offline") {
      return Platform.OS === "android"
        ? { html: webHtml, baseUrl: "file:///" }
        : { html: webHtml };
    }

    return { html: webHtml };
  }, [effectiveMode, webHtml]);

  const handleOpenDetailsWebView = useCallback(() => {
    if (!product) return;

    router.push({
      pathname: "/(tabs)/home/courseDetailsWebView",
      params: {
        productData: encodeURIComponent(JSON.stringify(product)),
        completionPercent: `${completionPercent}`,
      },
    });
  }, [completionPercent, product, router]);

  if (!product) {
    return (
      <View style={[styles.emptyScreen, { backgroundColor: theme.screen }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
        </Pressable>
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            Course details unavailable
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Go back and open a course again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.screen }]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.roundIconButton,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Course Studio
          </Text>
          <View style={styles.roundIconButton} />
        </View>

        <ImageBackground
          source={{ uri: product.images?.[0] || FALLBACK_IMAGE }}
          imageStyle={styles.heroImage}
          style={styles.hero}
        >
          <View
            style={[styles.heroOverlay, { backgroundColor: theme.overlay }]}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroBadge}>JAVASCRIPT COURSE</Text>
            <Text style={styles.heroTitle}>{product.name}</Text>
            <Text style={styles.heroSubtitle}>By {product.author_name}</Text>
          </View>
        </ImageBackground>

        <View
          style={[
            styles.playerCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setMode("stream")}
              disabled={!isEnrolled}
              style={[
                styles.modeButton,
                mode === "stream" && { backgroundColor: theme.accentStrong },
                !isEnrolled && styles.actionButtonDisabled,
              ]}
            >
              <Ionicons
                name="play-circle-outline"
                size={heightPixel(16)}
                color={mode === "stream" ? "#FFFFFF" : theme.textSecondary}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color: mode === "stream" ? "#FFFFFF" : theme.textSecondary,
                  },
                ]}
              >
                Stream
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setOfflineStartAtSeconds(playbackProgress.positionSeconds);
                setMode("offline");
              }}
              disabled={!isEnrolled}
              style={[
                styles.modeButton,
                mode === "offline" && canPlayOffline
                  ? { backgroundColor: theme.accentStrong }
                  : null,
                !isEnrolled && styles.actionButtonDisabled,
              ]}
            >
              <Ionicons
                name="download-outline"
                size={heightPixel(16)}
                color={
                  mode === "offline" && canPlayOffline
                    ? "#FFFFFF"
                    : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color:
                      mode === "offline" && canPlayOffline
                        ? "#FFFFFF"
                        : theme.textSecondary,
                  },
                ]}
              >
                Offline
              </Text>
            </Pressable>
          </View>

          <View style={styles.playerSurface}>
            {isEnrolled ? (
              <WebView
                source={webViewSource}
                onMessage={(event) =>
                  onOfflineVideoEvent(event.nativeEvent.data)
                }
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                originWhitelist={["*"]}
                allowFileAccess
                allowFileAccessFromFileURLs
                allowUniversalAccessFromFileURLs
                mixedContentMode="always"
                onError={() => {
                  setStatusMessage(
                    "Offline player failed to load. Try re-downloading.",
                  );
                }}
                style={styles.webview}
              />
            ) : (
              <View style={styles.lockedPlayer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#FFFFFF"
                />
                <Text style={styles.lockedPlayerTitle}>
                  Enroll to unlock this lesson
                </Text>
                <Text style={styles.lockedPlayerSubtitle}>
                  Streaming and offline download are enabled after enrollment.
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.playerNote, { color: theme.textSecondary }]}>
            This is a short 2-minute JavaScript lesson. Offline playback runs
            from your downloaded local file.
          </Text>

          {!isEnrolled && (
            <Pressable
              onPress={handleEnroll}
              disabled={isEnrolling}
              style={[
                styles.enrollButton,
                { backgroundColor: theme.accentStrong },
                isEnrolling && styles.actionButtonDisabled,
              ]}
            >
              <Ionicons name="school-outline" size={16} color="#FFFFFF" />
              <Text style={styles.enrollButtonText}>
                {isEnrolling ? "Enrolling..." : "Enroll To Unlock"}
              </Text>
            </Pressable>
          )}

          {isDownloading && (
            <View style={styles.downloadRow}>
              <ActivityIndicator size="small" color={theme.accent} />
              <Text
                style={[styles.downloadText, { color: theme.textSecondary }]}
              >
                Downloading... {Math.round(downloadProgress * 100)}%
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable
              onPress={handleDownloadOffline}
              disabled={isDownloading || !isEnrolled}
              style={[
                styles.actionButtonPrimary,
                { backgroundColor: theme.accentStrong },
                (isDownloading || !isEnrolled) && styles.actionButtonDisabled,
              ]}
            >
              <Ionicons
                name="cloud-download-outline"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonPrimaryText}>
                {canPlayOffline ? "Re-download" : "Download Offline"}
              </Text>
            </Pressable>
            {canPlayOffline && (
              <Pressable
                onPress={handleDeleteOffline}
                disabled={isDownloading}
                style={[
                  styles.actionButtonGhost,
                  { borderColor: theme.cardBorder },
                  isDownloading && styles.actionButtonDisabled,
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={theme.textPrimary}
                />
                <Text
                  style={[
                    styles.actionButtonGhostText,
                    {
                      color: theme.textPrimary,
                    },
                  ]}
                >
                  Remove
                </Text>
              </Pressable>
            )}
          </View>

          {!!canPlayOffline && (
            <View
              style={[
                styles.downloadMeta,
                {
                  backgroundColor: theme.warningBg,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Text
                style={[styles.downloadMetaText, { color: theme.warningText }]}
              >
                Offline file ready: {formatFileSizeMb(offlineFileSize)}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.progressCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>
              Learning Progress
            </Text>
            <Text style={[styles.progressPercent, { color: theme.accent }]}>
              {completionPercent}%
            </Text>
          </View>

          <View
            style={[styles.progressTrack, { backgroundColor: theme.chipBg }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completionPercent}%`,
                  backgroundColor: theme.accentStrong,
                },
              ]}
            />
          </View>

          <View style={styles.progressMetaRow}>
            <Text
              style={[styles.progressMetaText, { color: theme.textSecondary }]}
            >
              Resume from {formatTime(playbackProgress.positionSeconds)}
            </Text>
            <Text
              style={[styles.progressMetaText, { color: theme.textSecondary }]}
            >
              Duration {formatTime(playbackProgress.durationSeconds)}
            </Text>
          </View>

          <Text style={[styles.statusText, { color: theme.warningText }]}>
            {statusMessage ||
              "Pause anytime. We save your timestamp automatically."}
          </Text>
        </View>

        <View
          style={[
            styles.descriptionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.descriptionHeader}>
            <Text style={[styles.descriptionTitle, { color: theme.textPrimary }]}>
              Course Details
            </Text>
            <Ionicons name="globe-outline" size={16} color={theme.accentStrong} />
          </View>

          <Text style={[styles.descriptionBody, { color: theme.textSecondary }]}>
            Open a dedicated browser-style WebView page to read full course
            details, categories, price, and current progress.
          </Text>

          <Pressable
            onPress={handleOpenDetailsWebView}
            style={[
              styles.openDetailsButton,
              { backgroundColor: theme.accentStrong },
            ]}
          >
            <Ionicons name="open-outline" size={16} color="#FFFFFF" />
            <Text style={styles.openDetailsButtonText}>Open In WebView</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: widthPixel(18),
    paddingTop: heightPixel(14),
    paddingBottom: heightPixel(32),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: heightPixel(14),
  },
  headerTitle: {
    fontSize: heightPixel(16),
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  roundIconButton: {
    width: widthPixel(36),
    height: heightPixel(36),
    borderRadius: widthPixel(18),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  hero: {
    height: heightPixel(210),
    borderRadius: widthPixel(22),
    overflow: "hidden",
    marginBottom: heightPixel(14),
    justifyContent: "flex-end",
  },
  heroImage: {
    borderRadius: widthPixel(22),
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(16),
  },
  heroBadge: {
    alignSelf: "flex-start",
    color: "#FDE68A",
    fontSize: heightPixel(11),
    letterSpacing: 1,
    fontWeight: "800",
    marginBottom: heightPixel(8),
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: heightPixel(22),
    fontWeight: "800",
  },
  heroSubtitle: {
    marginTop: heightPixel(4),
    color: "#E5EDFF",
    fontSize: heightPixel(12),
    fontWeight: "600",
  },
  playerCard: {
    borderWidth: 1,
    borderRadius: widthPixel(20),
    padding: widthPixel(12),
    marginBottom: heightPixel(12),
  },
  modeRow: {
    flexDirection: "row",
    marginBottom: heightPixel(10),
    gap: widthPixel(8),
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: widthPixel(6),
    borderRadius: widthPixel(999),
    paddingVertical: heightPixel(8),
    paddingHorizontal: widthPixel(12),
    backgroundColor: "rgba(125, 144, 185, 0.2)",
  },
  modeButtonText: {
    fontSize: heightPixel(12),
    fontWeight: "700",
  },
  playerSurface: {
    height: heightPixel(210),
    borderRadius: widthPixel(16),
    overflow: "hidden",
    backgroundColor: "#05070E",
  },
  lockedPlayer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: widthPixel(16),
    backgroundColor: "#05070E",
  },
  lockedPlayerTitle: {
    marginTop: heightPixel(8),
    color: "#FFFFFF",
    fontSize: heightPixel(14),
    fontWeight: "700",
  },
  lockedPlayerSubtitle: {
    marginTop: heightPixel(6),
    color: "#CBD5E1",
    fontSize: heightPixel(11),
    textAlign: "center",
    lineHeight: heightPixel(17),
  },
  webview: {
    flex: 1,
    backgroundColor: "#05070E",
  },
  playerNote: {
    marginTop: heightPixel(10),
    fontSize: heightPixel(11),
    lineHeight: heightPixel(17),
  },
  downloadRow: {
    marginTop: heightPixel(10),
    flexDirection: "row",
    alignItems: "center",
    gap: widthPixel(8),
  },
  downloadText: {
    fontSize: heightPixel(12),
    fontWeight: "600",
  },
  enrollButton: {
    marginTop: heightPixel(12),
    borderRadius: widthPixel(12),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: widthPixel(6),
  },
  enrollButtonText: {
    color: "#FFFFFF",
    fontSize: heightPixel(12),
    fontWeight: "700",
  },
  actionRow: {
    marginTop: heightPixel(12),
    flexDirection: "row",
    gap: widthPixel(8),
  },
  actionButtonPrimary: {
    flex: 1,
    borderRadius: widthPixel(12),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: widthPixel(6),
  },
  actionButtonPrimaryText: {
    color: "#FFFFFF",
    fontSize: heightPixel(12),
    fontWeight: "700",
  },
  actionButtonGhost: {
    borderRadius: widthPixel(12),
    borderWidth: 1,
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: widthPixel(6),
  },
  actionButtonGhostText: {
    fontSize: heightPixel(12),
    fontWeight: "700",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  downloadMeta: {
    marginTop: heightPixel(10),
    borderWidth: 1,
    borderRadius: widthPixel(12),
    paddingVertical: heightPixel(8),
    paddingHorizontal: widthPixel(10),
  },
  downloadMetaText: {
    fontSize: heightPixel(11),
    fontWeight: "600",
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: widthPixel(20),
    padding: widthPixel(14),
    marginBottom: heightPixel(12),
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: heightPixel(8),
  },
  progressTitle: {
    fontSize: heightPixel(15),
    fontWeight: "800",
  },
  progressPercent: {
    fontSize: heightPixel(14),
    fontWeight: "800",
  },
  progressTrack: {
    height: heightPixel(8),
    borderRadius: widthPixel(999),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: widthPixel(999),
  },
  progressMetaRow: {
    marginTop: heightPixel(9),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressMetaText: {
    fontSize: heightPixel(11),
    fontWeight: "600",
  },
  statusText: {
    marginTop: heightPixel(8),
    fontSize: heightPixel(11),
    fontWeight: "600",
  },
  descriptionCard: {
    borderWidth: 1,
    borderRadius: widthPixel(20),
    padding: widthPixel(14),
  },
  descriptionTitle: {
    fontSize: heightPixel(15),
    fontWeight: "800",
  },
  descriptionHeader: {
    marginBottom: heightPixel(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  descriptionBody: {
    fontSize: heightPixel(12),
    lineHeight: heightPixel(18),
  },
  openDetailsButton: {
    marginTop: heightPixel(12),
    borderRadius: widthPixel(12),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: widthPixel(6),
  },
  openDetailsButtonText: {
    color: "#FFFFFF",
    fontSize: heightPixel(12),
    fontWeight: "700",
  },
  emptyScreen: {
    flex: 1,
    padding: widthPixel(18),
  },
  backButton: {
    width: widthPixel(38),
    height: heightPixel(38),
    borderRadius: widthPixel(19),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: heightPixel(12),
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: widthPixel(18),
    padding: widthPixel(18),
  },
  emptyTitle: {
    fontSize: heightPixel(16),
    fontWeight: "800",
  },
  emptySubtitle: {
    marginTop: heightPixel(6),
    fontSize: heightPixel(12),
    lineHeight: heightPixel(18),
  },
});
