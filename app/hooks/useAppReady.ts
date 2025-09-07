import { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useAuth } from "./useAuth";

export const useAppReady = () => {
  const [isReady, setIsReady] = useState(false);
  const { isLoading: authLoading } = useAuth();

  // Prevent splash screen from auto-hiding
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn("App initialization timeout - forcing ready state");
      setIsReady(true);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    "Outfit-Regular": require("../../assets/fonts/Outfit/OutfitRegular.ttf"),
    // "Outfit-Bold": require("../../assets/fonts/Outfit/OutfitBold.ttf"),
    // "Poppins-Regular": require("../../assets/fonts/Poppins/Poppins-Regular.ttf"),
    // "Poppins-Bold": require("../../assets/fonts/Poppins/Poppins-Bold.ttf"),
    // "Poppins-Italic": require("../../assets/fonts/Poppins/Poppins-Italic.ttf"),
    // "Poppins-BoldItalic": require("../../assets/fonts/Poppins/Poppins-BoldItalic.ttf"),
  });

  useEffect(() => {
    const prepareApp = async () => {
      try {
        console.log("App initialization started", { fontsLoaded, authLoading, fontError });

        // Wait for all resources to be ready
        if (!fontsLoaded || authLoading) {
          console.log("Waiting for resources...", { fontsLoaded, authLoading });
          return;
        }

        // Handle font loading errors
        if (fontError) {
          console.warn("Font loading error:", fontError);
          // Continue anyway to prevent infinite loading
        }

        // Add any additional initialization here
        // await initializeAsyncStorage();
        // await loadCachedData();
        // await setupAnalytics();

        // Small delay to ensure smooth transition
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("App initialization completed successfully");
        setIsReady(true);
      } catch (error) {
        console.error("App initialization error:", error);
        // Even on error, mark as ready to prevent infinite loading
        setIsReady(true);
      }
    };

    prepareApp();
  }, [fontsLoaded, fontError, authLoading]);

  // Hide splash screen when ready
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return {
    isReady,
    hasError: !!fontError,
  };
};
