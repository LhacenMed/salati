import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ActivityIndicator } from "react-native";
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

export default function PrayerTimes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

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
      setHijriDate(
        `${data.data.date.hijri.date} ${data.data.date.hijri.month.en}, ${data.data.date.hijri.year} H`
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching prayer times:", err);
      setError("Failed to load prayer times");
    } finally {
      setLoading(false);
    }
  };

  const updateNextPrayer = useCallback(() => {
    if (!prayerTimes) return;

    const now = new Date();
    const prayers = [
      { name: "Fajr", time: prayerTimes.Fajr },
      { name: "Dhuhr", time: prayerTimes.Dhuhr },
      { name: "Asr", time: prayerTimes.Asr },
      { name: "Maghrib", time: prayerTimes.Maghrib },
      { name: "Isha", time: prayerTimes.Isha },
    ];

    const currentTime = now.getHours() * 60 + now.getMinutes();
    let next = prayers[0];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerTime = hours * 60 + minutes;

      if (prayerTime > currentTime) {
        next = prayer;
        break;
      }
    }

    setNextPrayer(next);
  }, [prayerTimes]);

  const updateTimeUntilNext = useCallback(() => {
    if (!nextPrayer) return;

    const now = new Date();
    const [hours, minutes] = nextPrayer.time.split(":").map(Number);
    const nextDate = new Date(now);
    nextDate.setHours(hours, minutes, 0);

    if (nextDate < now) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    const diff = nextDate.getTime() - now.getTime();
    const minutesUntil = Math.floor(diff / 1000 / 60);
    const hoursUntil = Math.floor(minutesUntil / 60);
    const remainingMinutes = minutesUntil % 60;

    setTimeUntilNext(
      `${String(hoursUntil).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`
    );
  }, [nextPrayer]);

  // Add current time update function
  const updateCurrentTime = useCallback(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setCurrentTime(`${hours}:${minutes}`);
  }, []);

  // Add effect for updating current time
  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, [updateCurrentTime]);

  // Fetch prayer times once when component mounts
  useEffect(() => {
    fetchPrayerTimes();
    // Fetch new data at midnight
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - Date.now();

    const midnightTimeout = setTimeout(() => {
      fetchPrayerTimes();
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  // Update next prayer when prayer times change
  useEffect(() => {
    if (prayerTimes) {
      updateNextPrayer();
    }
  }, [prayerTimes, updateNextPrayer]);

  // Update countdown every minute
  useEffect(() => {
    updateTimeUntilNext();
    const interval = setInterval(updateTimeUntilNext, 60000);
    return () => clearInterval(interval);
  }, [updateTimeUntilNext]);

  if (loading) {
    return (
      <View className="items-center justify-center rounded-xl bg-gray-800 p-4">
        <ActivityIndicator size="large" color="#84cc16" />
      </View>
    );
  }

  if (error || !prayerTimes) {
    return (
      <View className="rounded-xl bg-gray-800 p-4">
        <Text className="text-red-500">{error || "No prayer times available"}</Text>
      </View>
    );
  }

  return (
    <View className="rounded-xl bg-gray-800 p-4">
      {/* Time and Date */}
      <View className="mb-4 border-b border-gray-700 pb-4">
        <Text className="mb-1 text-4xl font-bold text-white">{currentTime}</Text>
        <Text className="mb-1 text-gray-400">{hijriDate}</Text>
        <Text className="text-gray-400">
          {nextPrayer?.name} in {timeUntilNext}
        </Text>
      </View>

      {/* Prayer Times Grid */}
      <View className="flex-row flex-wrap justify-between">
        <View className="items-center gap-1">
          <Ionicons
            name="moon-outline"
            size={24}
            color={nextPrayer?.name === "Fajr" ? "#84cc16" : "#fff"}
          />
          <Text
            className={`mt-1 text-sm ${nextPrayer?.name === "Fajr" ? "text-lime-500" : "text-gray-400"}`}
          >
            Fajr
          </Text>
          <Text
            className={`text-base font-medium ${nextPrayer?.name === "Fajr" ? "text-lime-500" : "text-white"}`}
          >
            {prayerTimes.Fajr}
          </Text>
        </View>
        <View className="items-center gap-1">
          <Ionicons
            name="sunny-outline"
            size={24}
            color={nextPrayer?.name === "Dhuhr" ? "#84cc16" : "#fff"}
          />
          <Text
            className={`mt-1 text-sm ${nextPrayer?.name === "Dhuhr" ? "text-lime-500" : "text-gray-400"}`}
          >
            Dhuhr
          </Text>
          <Text
            className={`text-base font-medium ${nextPrayer?.name === "Dhuhr" ? "text-lime-500" : "text-white"}`}
          >
            {prayerTimes.Dhuhr}
          </Text>
        </View>
        <View className="items-center gap-1">
          <Ionicons
            name="partly-sunny-outline"
            size={24}
            color={nextPrayer?.name === "Asr" ? "#84cc16" : "#fff"}
          />
          <Text
            className={`mt-1 text-sm ${nextPrayer?.name === "Asr" ? "text-lime-500" : "text-gray-400"}`}
          >
            Asr
          </Text>
          <Text
            className={`text-base font-medium ${nextPrayer?.name === "Asr" ? "text-lime-500" : "text-white"}`}
          >
            {prayerTimes.Asr}
          </Text>
        </View>
        <View className="items-center gap-1">
          <Ionicons
            name="partly-sunny-outline"
            size={24}
            color={nextPrayer?.name === "Maghrib" ? "#84cc16" : "#fff"}
          />
          <Text
            className={`mt-1 text-sm ${nextPrayer?.name === "Maghrib" ? "text-lime-500" : "text-gray-400"}`}
          >
            Maghrib
          </Text>
          <Text
            className={`text-base font-medium ${nextPrayer?.name === "Maghrib" ? "text-lime-500" : "text-white"}`}
          >
            {prayerTimes.Maghrib}
          </Text>
        </View>
        <View className="items-center gap-1">
          <Ionicons
            name="moon-outline"
            size={24}
            color={nextPrayer?.name === "Isha" ? "#84cc16" : "#fff"}
          />
          <Text
            className={`mt-1 text-sm ${nextPrayer?.name === "Isha" ? "text-lime-500" : "text-gray-400"}`}
          >
            Isha
          </Text>
          <Text
            className={`text-base font-medium ${nextPrayer?.name === "Isha" ? "text-lime-500" : "text-white"}`}
          >
            {prayerTimes.Isha}
          </Text>
        </View>
      </View>
    </View>
  );
}
