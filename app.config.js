export default {
    expo: {
        name: "Salati",
        slug: "salati",
        scheme: "salati",
        version: "1.0.0",
        web: {
            favicon: "./assets/favicon.png",
        },
        experiments: {
            tsconfigPaths: true,
        },
        plugins: [
            [
                "expo-build-properties",
                {
                    ios: {
                        useFrameworks: "static",
                    },
                },
            ],
            [
                "expo-build-properties",
                {
                    android: {
                        minSdkVersion: 24,
                    },
                },
            ],
            // "@react-native-firebase/app",
            // "@react-native-firebase/auth",
            // "@react-native-google-signin/google-signin",
        ],
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
        },
        notification: {
            icon: "./assets/notification-icon.png",
            color: "#84cc16",
            iosDisplayInForeground: true,
            androidMode: "default",
            androidCollapsedTitle: "Prayer Time",
        },
        assetBundlePatterns: ["**/*"],
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.salati.app",
            // googleServicesFile: process.env.GOOGLE_SERVICES_INFOPLIST,
            // infoPlist: {
            //     ITSAppUsesNonExemptEncryption: false,
            // },
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/icon.png",
                backgroundColor: "#ffffff",
            },
            package: "com.salati.app",
            // googleServicesFile: "./firebase/google-services.json",
            notification: {
                icon: "./assets/notification-icon.png",
                color: "#84cc16",
                androidMode: "default",
            },
        },
        extra: {
            eas: {
                projectId: "97f020aa-f989-47a6-b3f0-29151db83523",
            },
        },
    },
};