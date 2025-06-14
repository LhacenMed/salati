import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface TimingsResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimes;
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
      };
    };
    meta: {
      timezone: string;
    };
  };
}

export default function PrayersScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [date, setDate] = useState<string>("");
  const [hijriDate, setHijriDate] = useState<string>("");

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=Nouakchott&country=Mauritania&method=3`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prayer times");
      }

      const data: TimingsResponse = await response.json();
      setPrayerTimes(data.data.timings);
      setDate(data.data.date.readable);
      setHijriDate(
        `${data.data.date.hijri.date} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching prayer times:", err);
      setError("Failed to load prayer times");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const PrayerTimeCard = ({
    name,
    time,
    icon,
  }: {
    name: string;
    time: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View className="mb-4 rounded-xl bg-gray-800/50 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-lime-500/10 p-2">
            <Ionicons name={icon} size={24} color="#84cc16" />
          </View>
          <Text className="text-lg font-semibold text-white">{name}</Text>
        </View>
        <Text className="text-xl font-bold text-lime-500">{time}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ paddingTop: insets.top }} className="flex-1 bg-[#171717]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#84cc16" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ paddingTop: insets.top }} className="flex-1 bg-[#171717]">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-red-500">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ paddingTop: insets.top }} className="flex-1 bg-[#171717]">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-white">Prayer Times</Text>
          <View className="mt-2">
            <Text className="text-base text-gray-400">{date}</Text>
            <Text className="text-base text-gray-400">{hijriDate}</Text>
          </View>
        </View>

        {/* Prayer Times */}
        {prayerTimes && (
          <View>
            <PrayerTimeCard name="Fajr" time={prayerTimes.Fajr} icon="sunny-outline" />
            <PrayerTimeCard name="Sunrise" time={prayerTimes.Sunrise} icon="partly-sunny-outline" />
            <PrayerTimeCard name="Dhuhr" time={prayerTimes.Dhuhr} icon="sunny-outline" />
            <PrayerTimeCard name="Asr" time={prayerTimes.Asr} icon="partly-sunny-outline" />
            <PrayerTimeCard name="Maghrib" time={prayerTimes.Maghrib} icon="moon-outline" />
            <PrayerTimeCard name="Isha" time={prayerTimes.Isha} icon="star-outline" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
