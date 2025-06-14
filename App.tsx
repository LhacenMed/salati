import "./global.css";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import TabLayout from "./app/tabs/_layout";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "context/LanguageContext";
import LoginScreen from "./app/auth/LoginScreen";
import SignupScreen from "./app/auth/SignupScreen";
import WelcomeScreen from "./app/auth/WelcomeScreen";
import { useAuth } from "./app/hooks/useAuth";
import {
  useFonts,
  Inter_900Black,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import { EventRegister } from "react-native-event-listeners";
import * as NavigationBar from "expo-navigation-bar";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import PrayersScreen from "./app/screens/PrayersScreen";
import ProfileScreen from "./app/screens/ProfileScreen";

// Configure Reanimated logger to disable strict mode
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const Stack = createStackNavigator();

function InsideLayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="Tabs" component={TabLayout} />
      <Stack.Screen name="Prayers" component={PrayersScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const listener = EventRegister.addEventListener("ChangeTheme", (data) => {
      setDarkMode(data);
    });

    return () => {
      EventRegister.removeAllListeners();
    };
  }, [darkMode]);

  SystemUI.setBackgroundColorAsync("#1e1e1e");

  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    InterSemi: Inter_600SemiBold,
    InterBold: Inter_700Bold,
    InterBlack: Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
      setLoading(false);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    NavigationBar.setPositionAsync("absolute");
    NavigationBar.setBackgroundColorAsync("#ffffff00");
  }, []);

  if (loading || !appReady || authLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: "#171717" }]}>
        <ActivityIndicator size="large" color="#8438ff" />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar style={darkMode ? "light" : "dark"} />
            <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                  <Stack.Screen name="Inside" component={InsideLayout} />
                ) : (
                  <Stack.Screen name="Auth" component={AuthStack} />
                )}
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
    backgroundColor: "#171717",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
