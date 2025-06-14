import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, Timestamp, increment } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET } from "@env";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

type PrayerProgress = {
  total: number;
  done: number;
};

type UserProgress = {
  [K in PrayerName]: PrayerProgress;
};

interface UserData {
  email: string;
  name: string;
  createdAt: Timestamp;
  photoURL?: string;
  progress?: Partial<UserProgress>;
  qadaaInfo?: {
    createdAt: string;
  };
}

type RootStackParamList = {
  Profile: undefined;
  Inside: undefined;
  Auth: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PRAYER_NAMES: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const NOTIFICATIONS_ENABLED_KEY = "prayerNotificationsEnabled";

interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
  };
}

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<Record<
    PrayerName,
    { hour: number; minute: number }
  > | null>(null);
  const auth = getAuth();
  const firestore = getFirestore();

  // Cloudinary configuration using environment variables
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const CLOUDINARY_UPLOAD_PRESET = NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Fetch prayer times from Aladhan API
  const fetchPrayerTimes = async () => {
    try {
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=Nouakchott&country=Mauritania&method=3`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prayer times");
      }

      const data: AladhanResponse = await response.json();

      // Convert prayer times from "HH:mm" format to { hour: number, minute: number }
      const convertedTimes: Record<PrayerName, { hour: number; minute: number }> = {
        fajr: convertTimeStringToObject(data.data.timings.Fajr),
        dhuhr: convertTimeStringToObject(data.data.timings.Dhuhr),
        asr: convertTimeStringToObject(data.data.timings.Asr),
        maghrib: convertTimeStringToObject(data.data.timings.Maghrib),
        isha: convertTimeStringToObject(data.data.timings.Isha),
      };

      setPrayerTimes(convertedTimes);
      return convertedTimes;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      Alert.alert("Error", "Failed to fetch prayer times");
      return null;
    }
  };

  // Helper function to convert "HH:mm" to { hour: number, minute: number }
  const convertTimeStringToObject = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return { hour: hours, minute: minutes };
  };

  // Initialize notifications and prayer times
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load notification preference
        const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
        setNotificationsEnabled(enabled === "true");

        // If notifications are enabled, fetch times and schedule
        if (enabled === "true") {
          const times = await fetchPrayerTimes();
          if (times) {
            await schedulePrayerNotifications(times);
          }
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initializeApp();
  }, []);

  // Add notification response handler for marking prayers as done
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      try {
        const actionId = response.actionIdentifier;
        if (actionId !== "MARK_AS_DONE") return;

        const prayer = response.notification.request.content.data?.prayer;
        if (!prayer || typeof prayer !== "string" || !(prayer in PRAYER_NAMES)) {
          console.error("Invalid prayer type received:", prayer);
          return;
        }

        const user = auth.currentUser;
        if (!user) {
          console.error("No user logged in");
          return;
        }

        const userRef = doc(firestore, "users", user.uid);

        // Get current user data
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          console.error("User document not found");
          return;
        }

        const currentData = userDoc.data();

        // If progress structure doesn't exist, initialize it
        if (!currentData.progress || !currentData.progress[prayer as PrayerName]) {
          await updateDoc(userRef, {
            [`progress.${prayer}`]: {
              total: currentData.progress?.[prayer as PrayerName]?.total || 30,
              done: currentData.progress?.[prayer as PrayerName]?.done || 0,
            },
          });
        }

        // Increment the done count
        await updateDoc(userRef, {
          [`progress.${prayer}.done`]: increment(1),
        });

        // Refresh user data to show updated progress
        const updatedDoc = await getDoc(userRef);
        if (updatedDoc.exists()) {
          const newData = updatedDoc.data() as UserData;
          setUserData(newData);

          // Show current progress in the success message
          const prayerProgress = newData.progress?.[prayer as PrayerName];
          Alert.alert(
            "Prayer Marked as Done",
            `${PRAYER_NAMES[prayer as PrayerName]} prayer has been marked as completed (${prayerProgress?.done}/${prayerProgress?.total}). May Allah accept your prayers.`
          );
        }
      } catch (error) {
        console.error("Error in notification response handler:", error);
        Alert.alert("Error", "Failed to mark prayer as done. Please try again.");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [auth, firestore]);

  // Modified toggleNotifications to use fetched prayer times
  const toggleNotifications = async (value: boolean) => {
    try {
      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please enable notifications in your device settings to receive prayer time reminders."
          );
          return;
        }

        // Fetch fresh prayer times when enabling notifications
        const times = await fetchPrayerTimes();
        if (times) {
          await schedulePrayerNotifications(times);
        }
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }

      setNotificationsEnabled(value);
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, value.toString());
    } catch (error) {
      console.error("Error toggling notifications:", error);
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const schedulePrayerNotifications = async (
    times: Record<PrayerName, { hour: number; minute: number }>
  ) => {
    try {
      // First, cancel any existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule notifications for each prayer
      for (const [prayer, time] of Object.entries(times)) {
        const trigger = new Date();
        trigger.setHours(time.hour, time.minute, 0, 0);

        // If time has passed for today, schedule for next occurrence
        const now = new Date();
        if (trigger <= now) {
          trigger.setDate(trigger.getDate() + 1);
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🕌 Time for ${PRAYER_NAMES[prayer as PrayerName]} Prayer`,
            body: `It's time to pray ${PRAYER_NAMES[prayer as PrayerName]}.`,
            data: { prayer },
            categoryIdentifier: "prayers",
            sound: true,
          },
          trigger: {
            hour: time.hour,
            minute: time.minute,
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
          },
        });

        console.log(`Scheduled ${prayer} notification for ${time.hour}:${time.minute}`);
      }

      // Set notification categories with actions
      await Notifications.setNotificationCategoryAsync("prayers", [
        {
          identifier: "MARK_AS_DONE",
          buttonTitle: "Mark as Done",
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
      ]);
    } catch (error) {
      console.error("Error scheduling prayer notifications:", error);
      throw error;
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (uri: string) => {
    if (!auth.currentUser) return;

    setUploading(true);
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Upload to Cloudinary
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        // Update Firestore with new photo URL
        const userRef = doc(firestore, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          photoURL: data.secure_url,
        });

        // Update local state
        setUserData((prev) => (prev ? { ...prev, photoURL: data.secure_url } : null));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          setUserData({
            email: user.email || "",
            name: user.displayName || "Not set",
            createdAt: Timestamp.fromDate(new Date()),
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#84cc16" style={styles.loader} />
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.profileInfo}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={pickImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="large" color="#84cc16" />
              ) : userData?.photoURL ? (
                <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
              ) : (
                <Ionicons name="person-circle" size={80} color="#84cc16" />
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{userData?.name || "Not set"}</Text>

              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{userData?.email}</Text>

              <Text style={styles.label}>Member Since</Text>
              <Text style={styles.value}>
                {userData?.createdAt
                  ? userData.createdAt.toDate().toLocaleDateString()
                  : "Not available"}
              </Text>

              {userData?.progress && (
                <>
                  <Text style={styles.label}>Prayer Progress</Text>
                  <View style={styles.progressContainer}>
                    <Text style={styles.value}>
                      Fajr: {userData.progress.fajr?.done || 0}/{userData.progress.fajr?.total || 0}{" "}
                      completed
                    </Text>
                    <Text style={styles.value}>
                      Dhuhr: {userData.progress.dhuhr?.done || 0}/
                      {userData.progress.dhuhr?.total || 0} completed
                    </Text>
                    <Text style={styles.value}>
                      Asr: {userData.progress.asr?.done || 0}/{userData.progress.asr?.total || 0}{" "}
                      completed
                    </Text>
                    <Text style={styles.value}>
                      Maghrib: {userData.progress.maghrib?.done || 0}/
                      {userData.progress.maghrib?.total || 0} completed
                    </Text>
                    <Text style={styles.value}>
                      Isha: {userData.progress.isha?.done || 0}/{userData.progress.isha?.total || 0}{" "}
                      completed
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <View style={styles.notificationSetting}>
                <View style={styles.notificationTextContainer}>
                  <Ionicons
                    name="notifications"
                    size={20}
                    color="#84cc16"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.notificationText}>Prayer Time Reminders</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: "#4b5563", true: "#84cc16" }}
                  thumbColor={notificationsEnabled ? "#fff" : "#d1d5db"}
                />
              </View>

              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarContainer: {
    position: "relative",
    marginVertical: 20,
  },
  editIconContainer: {
    position: "absolute",
    right: -8,
    bottom: -8,
    backgroundColor: "#84cc16",
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: "#171717",
  },
  infoContainer: {
    width: "100%",
    backgroundColor: "#262626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#84cc16",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 16,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  notificationSetting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#262626",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
  },
  notificationTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  signOutButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  progressContainer: {
    backgroundColor: "#262626",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
});
