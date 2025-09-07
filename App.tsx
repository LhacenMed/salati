import "react-native-gesture-handler";

// Global styles and utilities
import "./global.css";

// React and React Native core
import { View, TouchableOpacity, Text } from "react-native";

// Expo
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { Ionicons } from "@expo/vector-icons";

// React Navigation
import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

// Third-party libraries
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import * as NavigationBar from "expo-navigation-bar";
// import { EventRegister } from "react-native-event-listeners";

// Components
// import TabBar from "./components/TabBar";

// Contexts
import { ThemeProvider, useThemeContext } from "./context/ThemeContext";
import { LanguageProvider } from "context/LanguageContext";

// Hooks
import { useAppReady } from "./app/hooks/useAppReady";
import { useAuth } from "./app/hooks/useAuth";

// Auth Screens
import LoginScreen from "./app/auth/LoginScreen";
import SignupScreen from "./app/auth/SignupScreen";
import WelcomeScreen from "./app/auth/WelcomeScreen";

// App Screens
import PrayersScreen from "./app/screens/PrayersScreen";
import ProfileScreen from "./app/screens/ProfileScreen";

// Tab Screens
import Home from "./app/tabs/Home";
import Explore from "./app/tabs/Explore";
import Bookings from "./app/tabs/Bookings";
import Settings from "./app/tabs/Settings";

import React from "react";

// Configure Reanimated logger to disable strict mode
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

type RootStackParamList = {
  // Auth Screens
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  // App Screens
  MainApp: undefined;
  Prayers: undefined;
  Profile: undefined;
};

const Tab = createMaterialTopTabNavigator();
const RootStack = createStackNavigator<RootStackParamList>();

// Material Top Tabs Navigator
const TopTabsNavigator = () => {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      initialRouteName="Home"
      // comment if you want to use the default tab bar
      // tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        tabBarStyle: {
          position: "relative",
          backgroundColor: isDark ? "hsl(0 0% 4%)" : "hsl(0 0% 100%)",
          borderTopColor: isDark ? "hsl(0 0% 15%)" : "hsl(0 0% 90%)",
          borderTopWidth: 1,
          paddingVertical: 10,
        },
        tabBarActiveTintColor: "black",
        // tabBarLabelStyle: { fontSize: 20 },
        tabBarShowIcon: true,
        tabBarShowLabel: false,
        tabBarIndicatorStyle: { display: "none" },
        tabBarPressColor: isDark ? "hsl(0 0% 15%)" : "hsl(0 0% 90%)",
        swipeEnabled: true, // Controlled by FeaturesContext
        animationEnabled: false, // Make swipe animation disabled when pressing a tab button
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? "#8438ff" : "#666"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={24}
              color={focused ? "#8438ff" : "#666"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={Bookings}
        options={{
          tabBarLabel: "Bookings",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={24}
              color={focused ? "#8438ff" : "#666"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={focused ? "#8438ff" : "#666"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Create header right component to avoid hook call in options
const HeaderRight = () => {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <View className="mr-4 flex-row items-center space-x-3">
      <TouchableOpacity className="p-2">
        <Ionicons name="search" size={22} color={isDark ? "#fff" : "#000"} />
      </TouchableOpacity>
      <TouchableOpacity className="p-2">
        <Ionicons name="ellipsis-vertical" size={22} color={isDark ? "#fff" : "#000"} />
      </TouchableOpacity>
    </View>
  );
};

// Screen configurations
const getAuthenticatedScreens = (isDark: boolean) => {
  return [
    <RootStack.Screen
      key="MainApp"
      name="MainApp"
      component={TopTabsNavigator}
      options={({ route }: any) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";
        return {
          headerShown: true,
          headerTitle: routeName,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
            color: isDark ? "#fff" : "#000",
          },
          headerStyle: {
            backgroundColor: isDark ? "hsl(0 0% 4%)" : "hsl(0 0% 100%)",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "hsl(0 0% 15%)" : "hsl(0 0% 90%)",
            height: 90,
          },
          headerLeft: () => null,
          headerRight: () => <HeaderRight />,
          ...TransitionPresets.SlideFromRightIOS,
        };
      }}
    />,
    <RootStack.Screen
      key="Prayers"
      name="Prayers"
      component={PrayersScreen}
      options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    />,
    <RootStack.Screen
      key="Profile"
      name="Profile"
      component={ProfileScreen}
      options={{
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
      }}
    />,
  ];
};

const getUnauthenticatedScreens = (isDark: boolean) => [
  <RootStack.Screen
    key="Welcome"
    name="Welcome"
    component={WelcomeScreen}
    options={{
      headerShown: false,
      ...TransitionPresets.ModalSlideFromBottomIOS,
    }}
  />,
  <RootStack.Screen
    key="Login"
    name="Login"
    component={LoginScreen}
    options={{
      headerShown: false,
      ...TransitionPresets.SlideFromRightIOS,
    }}
  />,
  <RootStack.Screen
    key="SignUp"
    name="SignUp"
    component={SignupScreen}
    options={{
      headerShown: false,
      ...TransitionPresets.SlideFromRightIOS,
    }}
  />,
];

const getSharedScreens = (isDark: boolean) => [
  <RootStack.Screen
    key="MainApp"
    name="MainApp"
    component={TopTabsNavigator}
    options={({ route }: any) => {
      const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";
      return {
        headerShown: true,
        headerTitle: routeName,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
          color: isDark ? "#fff" : "#000",
        },
        headerStyle: {
          backgroundColor: isDark ? "hsl(0 0% 4%)" : "hsl(0 0% 100%)",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "hsl(0 0% 15%)" : "hsl(0 0% 90%)",
          height: 90,
        },
        headerLeft: () => null,
        headerRight: () => <HeaderRight />,
        ...TransitionPresets.SlideFromRightIOS,
      };
    }}
  />,
];

// Main Navigation Component
const AppNavigator = () => {
  const { user } = useAuth();
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* {user ? (
          // Authenticated user screens
          <>
            {getAuthenticatedScreens(isDark)}
            {getSharedScreens(isDark)}
          </>
        ) : (
          // Unauthenticated user screens
          <>
            {getUnauthenticatedScreens(isDark)}
            {getSharedScreens(isDark)}
          </>
        )} */}
        {getAuthenticatedScreens(isDark)}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 20 }}>
            Something went wrong. Please restart the app.
          </Text>
          <Text style={{ fontSize: 14, textAlign: "center", color: "#666" }}>
            {this.state.error?.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// App Initialization Component
const AppContent = () => {
  const { isReady } = useAppReady();

  // Don't render anything until app is ready
  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
};

export default function App() {
  React.useEffect(() => {
    SystemUI.setBackgroundColorAsync("#1e1e1e");
  }, []);

  React.useEffect(() => {
    NavigationBar.setPositionAsync("absolute");
    NavigationBar.setBackgroundColorAsync("#ffffff00");
  }, []);

  return (
    <LanguageProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar style="auto" translucent />
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </LanguageProvider>
  );
}
