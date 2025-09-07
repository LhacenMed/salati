import React, { useContext } from "react";
import { View, TouchableOpacity, Animated, Dimensions } from "react-native";
import { Tooltip } from "react-native-paper";
// import { useTheme } from "@/contexts/ThemeContext";
import HomeIcon from "./icons/tab-icons/HomeIcon";
import ExploreIcon from "./icons/tab-icons/ExploreIcon";
import BookingsIcon from "./icons/tab-icons/BookingsIcon";
import SettingsIcon from "./icons/tab-icons/SettingsIcon";
import { Canvas, BackdropBlur } from "@shopify/react-native-skia";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

interface TabBarProps {
  state: any;
  // descriptors: any;
  navigation: any;
}

const TabBar: React.FC<TabBarProps> = ({
  state,
  // descriptors,
  navigation,
}) => {
  // const { isDark } = useTheme();
  const animatedValues = React.useRef(state.routes.map(() => new Animated.Value(0))).current;
  const { theme } = useContext(ThemeContext);

  const animateTab = (index: number, focused: boolean) => {
    Animated.spring(animatedValues[index], {
      toValue: focused ? -5 : 5,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  React.useEffect(() => {
    state.routes.forEach((route: any, index: number) => {
      const isFocused = state.index === index;
      animateTab(index, isFocused);
    });
  }, [state.index]);

  const renderIcon = (routeName: string, isFocused: boolean) => {
    const iconProps = { isFocused, width: 24, height: 24 };
    switch (routeName) {
      case "Home":
        return <HomeIcon {...iconProps} />;
      case "Explore":
        return <ExploreIcon {...iconProps} />;
      case "Bookings":
        return <BookingsIcon {...iconProps} />;
      case "Settings":
        return <SettingsIcon {...iconProps} />;
      default:
        return <HomeIcon {...iconProps} />;
    }
  };

  const getTooltipText = (routeName: string) => {
    switch (routeName) {
      case "Home":
        return "Home";
      case "Explore":
        return "Explore";
      case "Bookings":
        return "Bookings";
      case "Settings":
        return "Settings";
      default:
        return routeName;
    }
  };

  const insets = useSafeAreaInsets();

  // Calculate tab bar height (padding + content + safe area)
  const tabBarHeight = 70 + insets.bottom; // Adjust based on your actual tab bar height

  return (
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
      {/* Backdrop Blur Canvas - positioned to capture screen content behind */}
      <Canvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: screenWidth,
          height: tabBarHeight,
        }}
      >
        <BackdropBlur blur={2} clip={{ x: 0, y: 0, width: screenWidth, height: tabBarHeight }}>
          {/* Semi-transparent overlay for frosted glass effect */}
          {/* <Fill color="rgba(0, 0, 0, .9)" /> */}
        </BackdropBlur>
      </Canvas>

      {/* Tab Bar Content */}
      <View
        className="border-border flex-row border-t"
        style={{
          backgroundColor: "transparent",
          paddingBottom: insets.bottom,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          // const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <View
              key={route.key}
              style={{
                flex: 1,
                paddingVertical: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tooltip
                title={getTooltipText(route.name)}
                enterTouchDelay={500}
                leaveTouchDelay={1000}
              >
                <TouchableOpacity onPress={onPress} activeOpacity={1}>
                  <Animated.View
                    className="items-center justify-center"
                    style={{
                      transform: [{ translateY: animatedValues[index] }],
                    }}
                  >
                    {renderIcon(route.name, isFocused)}
                  </Animated.View>
                  <Animated.Text
                    className="text-foreground text-center text-xs font-medium"
                    style={{
                      opacity: animatedValues[index].interpolate({
                        inputRange: [-5, 0],
                        outputRange: [1, 0],
                      }),
                      transform: [{ translateY: 4 }],
                      color: theme === "dark" ? "white" : "black",
                    }}
                  >
                    {route.name}
                  </Animated.Text>
                </TouchableOpacity>
              </Tooltip>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TabBar;
