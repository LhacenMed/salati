import React, { useState, useCallback, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  LayoutChangeEvent,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrayerTimes from "../../components/ui/PrayerTimes";
import PrayerCard from "../../components/ui/PrayerCard";
import PrayerProgress from "../../components/ui/PrayerProgress";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

type RootStackParamList = {
  Inside: undefined;
  Prayers: undefined;
  Profile: undefined;
  Signup: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function Page() {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    const fetchUserPhoto = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists() && userDoc.data().photoURL) {
          setUserPhotoURL(userDoc.data().photoURL);
        }
      } catch (error) {
        console.error("Error fetching user photo:", error);
      }
    };

    fetchUserPhoto();
  }, []);

  const onHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch user photo
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists() && userDoc.data().photoURL) {
          setUserPhotoURL(userDoc.data().photoURL);
        }
      }
      // Force re-render PrayerProgress by changing its key
      setProgressKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [auth, firestore]);

  return (
    <SafeAreaView style={{ paddingTop: insets.top }} className="flex-1 bg-[#171717]">
      <StatusBar barStyle="light-content" />

      {/* Fixed Header with Prayer Info */}
      <View
        className="absolute left-0 right-0 z-10 bg-[#171717] px-4 py-8"
        onLayout={onHeaderLayout}
      >
        {/* Header */}
        <View className={styles.header}>
          <Text className={styles.headerText}>Hey there</Text>
          <View className={styles.headerIcons}>
            <TouchableOpacity className={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              className={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
            >
              {userPhotoURL ? (
                <Image
                  source={{ uri: userPhotoURL }}
                  className="h-10 w-10 rounded-full"
                  style={{ backgroundColor: "#262626" }}
                />
              ) : (
                <Ionicons name="person" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Prayer Card */}
        <PrayerCard />

        {/* Prayer Times Section */}
        <PrayerTimes />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight - 40, // Dynamic padding based on measured header height
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#84cc16" // Match the lime color used in the app
            colors={["#84cc16"]}
          />
        }
      >
        {/* Prayer Progress Section */}
        <View className="mb-[100px] mt-4">
          <PrayerProgress key={progressKey} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: `flex-row justify-between items-center py-4`,
  headerText: `text-2xl font-bold text-white`,
  headerIcons: `flex-row gap-3`,
  iconButton: `p-2`,
  profileButton: `w-10 h-10 rounded-full bg-gray-700 justify-center items-center`,
};
