import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { signInWithCredential, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { useAuth } from "../hooks/useAuth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
};

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, "Welcome">;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { user } = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "3227817482-pohntsk5t090q6p3mb95mk1voicdmg1j.apps.googleusercontent.com",
      // iosClientId: "430663825446-nbhh00udgfp0e79h4kg95b5cbdgqd7qj.apps.googleusercontent.com",
      scopes: ["email", "profile"],
      profileImageSize: 150,
    });
  }, []);

  async function onGoogleButtonPress() {
    try {
      // Sign out from any existing Google session
      await GoogleSignin.signOut();

      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);

      // Check if this is a new user by trying to get their document
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      // If the document doesn't exist, create it
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: userCredential.user.displayName || "",
          email: userCredential.user.email || "",
          photoURL: userCredential.user.photoURL || "",
          createdAt: serverTimestamp(),
          provider: "google",
        });
      }

      return userCredential;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      // You might want to show an error message to the user here
    }
  }

  // Handles sign-out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await GoogleSignin.signOut();
      setLoggedIn(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Sign Out Error:", error);
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

        {user && (
          <View
            style={{ flexDirection: "column", alignItems: "center", marginBottom: 10, gap: 10 }}
          >
            <Image
              source={{ uri: user.photoURL || "" }}
              style={{ width: 30, height: 30, borderRadius: 15 }}
            />
            <Text style={{ color: "green" }}>Name: {user.displayName}</Text>
            <Text style={{ color: "green" }}>Email: {user.email}</Text>
            <Text style={{ color: "green" }}>UID: {user.uid}</Text>
            <Text style={{ color: "green" }}>
              Phone number: {user.phoneNumber ? user.phoneNumber : "Null"}
            </Text>
            <Text style={{ color: "green" }}>Provider ID: {user.providerId}</Text>
          </View>
        )}

        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={onGoogleButtonPress}
        />

        {user && (
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSignOut}>
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
