import { Text, StyleSheet, View } from 'react-native';
// import React from 'react';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Animated from 'react-native-reanimated';
import { Canvas, Image, BackdropBlur, useImage } from "@shopify/react-native-skia";

const Page = () => {
  // const insets = useSafeAreaInsets();
  const image = useImage(require("../../assets/icon.png"));

  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Text className="text-xl text-white">Bookings Screen</Text>
      <Canvas style={{ width: 256, height: 256 }}>
        <Image image={image} x={0} y={0} width={256} height={256} fit="cover" />
        <BackdropBlur blur={2} clip={{ x: 0, y: 0, width: 256, height: 256 }}>
          {/* optional children like Fill with color overlay */}
        </BackdropBlur>
      </Canvas>
    </View>
  );
};

export default Page;
