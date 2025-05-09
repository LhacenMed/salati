// import { ScreenContent } from 'components/ScreenContent';
// import { StatusBar } from 'expo-status-bar';

// import './global.css';

// export default function App() {
//   return (
//     <>
//       <ScreenContent title="Home" path="App.tsx"></ScreenContent>
//       <StatusBar style="auto" />
//     </>
//   );
// }

import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { useEffect, useState, useMemo } from "react";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { FIREBASE_AUTH } from "./FirebaseConfig";
// import ForgotPassword from "./app/screens/ForgotPassword";
// import LoginScreen from "./app/auth/LoginScreen";
// import SignupScreen from "./app/auth/SignupScreen";
// import WelcomeScreen from "./app/auth/WelcomeScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import Onboarding from "./app/screens/Onboarding";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import TabLayout from "./app/tabs/_layout";
// import Splash from "./app/screens/Splash";
// import LoginScreenTest from "./app/screens/LoginScreen(test)";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "context/LanguageContext";
import {
  useFonts,
  Inter_900Black,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";
// import {
//   AmaticSC_400Regular,
//   AmaticSC_700Bold,
// } from "@expo-google-fonts/amatic-sc";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
// import SettingsScreen from "@/screens/settings(test)";
import * as SystemUI from "expo-system-ui";
import { EventRegister } from "react-native-event-listeners";
import * as NavigationBar from "expo-navigation-bar";
// import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
// import TripsScreen from "./app/screens/TripsScreen";

const Stack = createStackNavigator();

function InsideLayout() {
  return (
    <>
      <TabLayout />
    </>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const listener = EventRegister.addEventListener("ChangeTheme", (data) => {
      setDarkMode(data);
    });

    return () => {
      EventRegister.removeAllListeners();
    };
  }, [darkMode]);

  SystemUI.setBackgroundColorAsync("#1e1e1e"); // Navigation bar color
  // const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  const [viewedOnboarding, setViewedOnboarding] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    InterSemi: Inter_600SemiBold,
    InterBold: Inter_700Bold,
    InterBlack: Inter_900Black,
    // Amatic: AmaticSC_400Regular,
    // AmaticBold: AmaticSC_700Bold,
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem("@viewedOnboarding");
        if (value !== null) {
          setViewedOnboarding(true);
        }
      } catch (error) {
        console.error("Failed to fetch onboarding status", error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
  //     setUser(user);
  //     setLoading(false);
  //   });
  //   return unsubscribe;
  // }, []);

  useEffect(() => {
    // Enable edge-to-edge mode to see content behind the navigation bar
    NavigationBar.setPositionAsync("absolute");
    // Set transparent background
    NavigationBar.setBackgroundColorAsync("#ffffff00");
  }, []);

  // if (!appReady || !splashAnimationFinished) {
  //   return (
  //     <Splash
  //       onAnimationFinish={(isCancelled) => {
  //         if (!isCancelled) {
  //           setSplashAnimationFinished(true);
  //         }
  //       }}
  //     />
  //   );
  // }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={"black"} />
      </View>
    );
  }

  // const getInitialRoute = () => {
  //   if (user) return "Inside";
  //   return viewedOnboarding ? "WelcomeScreen" : "Onboarding";
  // };

  return (
    <LanguageProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar style={darkMode ? 'light' : 'dark'} />
            <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
              <Stack.Navigator initialRouteName={'Inside'}>
                <Stack.Screen
                  name="Inside"
                  component={InsideLayout}
                  options={{
                    headerShown: false,
                    ...TransitionPresets.SlideFromRightIOS,
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
