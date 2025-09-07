import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
// import { doc, setDoc } from "firebase/firestore";
// import { auth, db } from "../../firebase/config";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export default function QadaaCalculator({ onDataCreated }: { onDataCreated: () => void }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateDays = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, isStart: boolean) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }

    if (selectedDate) {
      setDateRange((prev) => ({
        ...prev,
        [isStart ? "startDate" : "endDate"]: selectedDate,
      }));
    }
  };

  const createQadaaData = async () => {
    try {
      // const user = auth.currentUser;
      // if (!user) {
      //   Alert.alert("Error", "User not authenticated");
      //   return;
      // }

      if (dateRange.endDate < dateRange.startDate) {
        Alert.alert("Error", "End date cannot be before start date");
        return;
      }

      setLoading(true);
      const days = calculateDays(dateRange.startDate, dateRange.endDate);

      // const userDocRef = doc(db, "users", user.uid);
      // await setDoc(
      //   userDocRef,
      //   {
      //     progress: {
      //       fajr: { done: 0, total: days },
      //       dhuhr: { done: 0, total: days },
      //       asr: { done: 0, total: days },
      //       maghrib: { done: 0, total: days },
      //       isha: { done: 0, total: days },
      //     },
      //     qadaaInfo: {
      //       startDate: dateRange.startDate.toISOString(),
      //       endDate: dateRange.endDate.toISOString(),
      //       totalDays: days,
      //       totalPrayers: days * 5,
      //       createdAt: new Date().toISOString(),
      //     },
      //   },
      //   { merge: true }
      // );

      Alert.alert("Success", `Created Qadaa data for ${days} days.`, [
        {
          text: "OK",
          onPress: () => {
            setModalVisible(false);
            onDataCreated();
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating Qadaa data:", error);
      Alert.alert("Error", "Failed to create Qadaa data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="mt-4 rounded-lg bg-lime-600 px-6 py-3"
      >
        <Text className="text-center font-semibold text-white">Calculate Qadaa Prayers</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-[90%] max-w-sm rounded-2xl bg-gray-900 p-6">
            <Text className="mb-6 text-center text-xl font-bold text-white">
              Calculate Qadaa Prayers
            </Text>

            <View className="mb-6">
              <Text className="mb-2 text-gray-300">Start Date:</Text>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                className="rounded-lg bg-gray-800 p-4"
              >
                <Text className="text-white">{dateRange.startDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-gray-300">End Date:</Text>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                className="rounded-lg bg-gray-800 p-4"
              >
                <Text className="text-white">{dateRange.endDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>

            {(showStartPicker || showEndPicker) && (
              <DateTimePicker
                value={showStartPicker ? dateRange.startDate : dateRange.endDate}
                mode="date"
                onChange={(event, date) => handleDateChange(event, date, showStartPicker)}
              />
            )}

            <View className="mt-4 flex-row justify-end gap-4">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2">
                <Text className="text-gray-400">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={createQadaaData}
                disabled={loading}
                className="rounded-lg bg-lime-600 px-4 py-2"
              >
                <Text className="font-semibold text-white">
                  {loading ? "Creating..." : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
