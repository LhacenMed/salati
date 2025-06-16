import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
};

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, "Welcome">;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "3227817482-pohntsk5t090q6p3mb95mk1voicdmg1j.apps.googleusercontent.com",
      // iosClientId: "430663825446-nbhh00udgfp0e79h4kg95b5cbdgqd7qj.apps.googleusercontent.com",
      profileImageSize: 150,
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      setUserInfo(user);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.revokeAccess();
      setUserInfo(null);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Salati</Text>
        <Text style={styles.subtitle}>Your Prayer Companion</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Login</Text>
        </TouchableOpacity>

        <Text style={{ color: "red" }}>{JSON.stringify(error)}</Text>
        {userInfo && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: userInfo.user.photo }} style={{ width: 30, height: 30, borderRadius: 15 }} />
            <Text style={{ color: "green" }}>{JSON.stringify(userInfo.user)}</Text>
          </View>
          )}

        <GoogleSigninButton
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
        />

        {userInfo && (<TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={signOut}
        >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "space-between",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
});
