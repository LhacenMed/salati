import { Text, StyleSheet, View } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

const Page = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 justify-center items-center bg-slate-900">
      <Text className="text-xl text-white">Bookings Screen</Text>
    </View>
  );
};

export default Page;
