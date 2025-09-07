import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Pressable, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import { auth, db } from "../../firebase/config";
// import {
//   doc,
//   getDoc,
//   updateDoc,
//   collection,
//   addDoc,
//   serverTimestamp,
//   deleteDoc,
//   getDocs,
//   deleteField,
// } from "firebase/firestore";
import QadaaCalculator from "./QadaaCalculator";

interface PrayerData {
  done: number;
  total: number;
}

interface UserProgress {
  fajr: PrayerData;
  dhuhr: PrayerData;
  asr: PrayerData;
  maghrib: PrayerData;
  isha: PrayerData;
}

interface PrayerItemProps {
  name: string;
  completed: number;
  total: number;
  onMarkDone: () => Promise<void>;
  isCompleted: boolean;
  isUpdating?: boolean;
}

function PrayerItem({
  name,
  completed,
  total,
  onMarkDone,
  isCompleted,
  isUpdating,
}: PrayerItemProps) {
  const progress = (completed / total) * 100;

  return (
    <Pressable className="mb-6 overflow-hidden rounded-2xl bg-gray-900/50 p-4">
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-white">{name}</Text>
            {isCompleted && (
              <View className="rounded-full bg-lime-500/20 px-2 py-0.5">
                <Text className="text-xs font-medium text-lime-500">Completed</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text className="text-sm text-gray-400">{total - completed} left</Text>
            </View>
            <Text className="text-gray-600">•</Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="checkmark-circle" size={14} color="#84cc16" />
              <Text className="text-sm text-gray-400">{completed} done</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={onMarkDone}
          disabled={isCompleted || isUpdating}
          className={`rounded-xl px-4 py-2 ${
            isCompleted ? "bg-lime-500/10" : isUpdating ? "bg-gray-700" : "bg-gray-800"
          }`}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#84cc16" />
          ) : (
            <Text className={`text-sm font-medium ${isCompleted ? "text-lime-500" : "text-white"}`}>
              {isCompleted ? "Done" : "Mark Done"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-800">
        <View
          className={`h-full rounded-full ${isCompleted ? "bg-lime-500" : "bg-lime-600"}`}
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Progress Stats */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">Progress</Text>
        <Text className="text-xs font-medium text-gray-400">{Math.round(progress)}%</Text>
      </View>
    </Pressable>
  );
}

export default function PrayerProgress() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [updatingPrayer, setUpdatingPrayer] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const fetchPrayerData = useCallback(async () => {
    try {
      // const user = auth.currentUser;
      // if (!user) {
      //   setError("User not authenticated");
      //   setLoading(false);
      //   return;
      // }

      // const userDocRef = doc(db, "users", user.uid);
      // const userDoc = await getDoc(userDocRef);

      // if (!userDoc.exists()) {
      //   setError("No prayer data found.");
      //   setLoading(false);
      //   return;
      // }

      // const userData = userDoc.data();
      // if (!userData.progress) {
      //   setError("No prayer data found.");
      //   setLoading(false);
      //   return;
      // }

      // setProgress(userData.progress as UserProgress);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching prayer data:", err);
      setError("Error loading prayer data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrayerData();
  }, [fetchPrayerData]);

  const handleMarkDone = async (prayerName: string) => {
    try {
      // const user = auth.currentUser;
      // if (!user || !progress) return;

      // const prayerKey = prayerName.toLowerCase();
      // const currentPrayer = progress[prayerKey as keyof UserProgress];

      // if (currentPrayer.done >= currentPrayer.total) return;

      setUpdatingPrayer(prayerName);

      // Update progress in Firestore
      // const userDocRef = doc(db, "users", user.uid);
      // const updatedProgress = {
      //   ...progress,
      //   [prayerKey]: {
      //     ...currentPrayer,
      //     done: currentPrayer.done + 1,
      //   },
      // };

      // await updateDoc(userDocRef, {
      //   [`progress.${prayerKey}.done`]: currentPrayer.done + 1,
      // });

      // // Add log entry
      // const logsCollectionRef = collection(userDocRef, "logs");
      // await addDoc(logsCollectionRef, {
      //   prayer: prayerKey,
      //   timestamp: serverTimestamp(),
      //   action: "mark_done",
      // });

      // // Update local state for just this prayer
      // setProgress(updatedProgress);
    } catch (err) {
      console.error("Error marking prayer as done:", err);
      Alert.alert("Error", "Failed to update prayer status");
    } finally {
      setUpdatingPrayer(null);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      "Reset Prayer Data",
      "Are you sure you want to delete all prayer data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // const user = auth.currentUser;
              // if (!user) return;

              // setIsResetting(true);

              // // Delete all logs first
              // const userDocRef = doc(db, "users", user.uid);
              // const logsCollectionRef = collection(userDocRef, "logs");
              // const logsSnapshot = await getDocs(logsCollectionRef);

              // const deleteLogs = logsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
              // await Promise.all(deleteLogs);

              // // Remove only prayer-related fields from user document
              // await updateDoc(userDocRef, {
              //   progress: deleteField(),
              //   qadaaInfo: deleteField(),
              // });

              // Reset local state
              setProgress(null);
              setError("No prayer data found.");
            } catch (err) {
              console.error("Error resetting prayer data:", err);
              Alert.alert("Error", "Failed to reset prayer data");
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#84cc16" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="mb-4 text-lg text-gray-400">{error}</Text>
        {error.includes("No prayer data found") && (
          <QadaaCalculator onDataCreated={fetchPrayerData} />
        )}
      </View>
    );
  }

  const prayers = progress
    ? [
        { name: "Fajr", ...progress.fajr },
        { name: "Dhuhr", ...progress.dhuhr },
        { name: "Asr", ...progress.asr },
        { name: "Maghrib", ...progress.maghrib },
        { name: "Isha", ...progress.isha },
      ]
    : [];

  return (
    <View className="space-y-4">
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-white">Prayer Progress</Text>
        <TouchableOpacity
          onPress={handleReset}
          disabled={isResetting}
          className="rounded-lg bg-red-500/10 px-3 py-1.5"
        >
          {isResetting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <View className="flex-row items-center gap-1">
              <Ionicons name="refresh" size={16} color="#ef4444" />
              <Text className="text-sm font-medium text-red-500">Reset</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Prayer Items */}
      <View>
        {prayers.map((prayer, index) => (
          <PrayerItem
            key={index}
            name={prayer.name}
            completed={prayer.done}
            total={prayer.total}
            isCompleted={prayer.done === prayer.total}
            onMarkDone={() => handleMarkDone(prayer.name)}
            isUpdating={updatingPrayer === prayer.name}
          />
        ))}
      </View>
    </View>
  );
}
