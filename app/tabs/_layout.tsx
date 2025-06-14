import React, { useEffect } from "react";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import TabBar from "../../components/TabBar";
import Home from "./Home";
import Explore from "./Explore";
import Bookings from "./Bookings";
import Settings from "./Settings";
import * as NavigationBar from "expo-navigation-bar";

interface CustomTabNavigationOptions extends BottomTabNavigationOptions {
  blurEnabled?: boolean;
}

const Tab = createBottomTabNavigator<{
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Settings: undefined;
}>();

export default function TabLayout() {
  useEffect(() => {
    // Enable edge-to-edge mode to see content behind the navigation bar
    NavigationBar.setPositionAsync("absolute");
    // Set transparent background
    NavigationBar.setBackgroundColorAsync("#ffffff00");
  }, []);
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ blurEnabled: true } as CustomTabNavigationOptions}
      />
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{ blurEnabled: true } as CustomTabNavigationOptions}
      />
      <Tab.Screen
        name="Bookings"
        component={Bookings}
        options={{ blurEnabled: true } as CustomTabNavigationOptions}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{ blurEnabled: true } as CustomTabNavigationOptions}
      />
    </Tab.Navigator>
  );
}
