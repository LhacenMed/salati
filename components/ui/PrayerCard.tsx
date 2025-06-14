import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Inside: undefined;
  Prayers: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function PrayerCard() {
  const [isPressed, setIsPressed] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={() => navigation.navigate("Prayers")}
      className={`mb-4 flex-row items-center justify-between rounded-xl p-4 ${
        isPressed ? "bg-gray-700" : "bg-gray-800 transition-colors duration-100"
      }`}
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name="sunny-outline" size={24} color="#FFD700" />
        <Text className="text-lg font-medium text-white">Start your day with these prayers</Text>
      </View>
      <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-900">
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </View>
    </Pressable>
  );
}
