import { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import MenuItem from "../../components/ui/MenuItem";
import ColorSchemePopup from "../../components/ui/ColorSchemePopup";
import { ThemeContext } from "context/ThemeContext";
import { ThemeMode } from "context/ThemeContext";

const Page = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const themes = useContext(ThemeContext);
  const backgroundColor = themes.theme === "dark" ? "#171717" : "rgb(249, 249, 249)";

  const handleColorSchemeSelect = (scheme: string) => {
    // Update the theme when a new scheme is selected
    themes.toggleTheme(scheme as ThemeMode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={[styles.scrollViewContainer, { backgroundColor: backgroundColor }]}
        contentContainerStyle={{ paddingTop: 20 }}
        scrollEnabled={!modalVisible}
      >
        {/* Profile Section */}
        <Text style={styles.firstSectionTitle}>Profile</Text>
        <View style={styles.section}>
          <MenuItem
            icon="mail-outline"
            title="Email"
            // value={user?.email || "No email"}
            isFirst
            isLast={false}
            showValue={true}
            showChevron={false}
          />
          <MenuItem
            icon="logo-google"
            title="Google"
            // value={user?.email?.endsWith("@gmail.com") ? "Connected" : "Not connected"}
            isFirst={false}
            isLast
            showValue={true}
            showChevron={false}
          />
        </View>
        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.section}>
          <MenuItem icon="document-text-outline" title="Terms of Use" isFirst isLast={false} />
          <MenuItem
            icon="shield-outline"
            title="Privacy Policy"
            value=""
            isFirst={false}
            isLast={false}
            showValue={true}
            showChevron={true}
          />
          <MenuItem
            icon="information-circle-outline"
            title="Check for updates"
            value="1.0.11(48)"
            isFirst={false}
            isLast
            showValue={true}
            showChevron={true}
          />
        </View>
        {/* App Section */}
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.section}>
          <MenuItem
            icon={
              themes.mode === "system"
                ? themes.theme === "dark"
                  ? "moon-outline"
                  : "sunny-outline"
                : themes.mode === "dark"
                  ? "moon-outline"
                  : "sunny-outline"
            }
            title="Color Scheme"
            value={themes.mode.charAt(0).toUpperCase() + themes.mode.slice(1)}
            isFirst
            isLast={false}
            showValue={true}
            showChevron={true}
            onPress={() => setModalVisible(true)}
          />
          <MenuItem
            icon="earth"
            title="App Language"
            value="English"
            isFirst={false}
            isLast
            showValue={true}
            showChevron={false}
          />
        </View>
        {/* Contact Section */}
        <View style={styles.miniSection}>
          <MenuItem icon="chatbubble-outline" title="Contact Us" isFirst isLast />
        </View>
        {/* Danger Zone */}
        <View style={styles.miniSection}>
          <MenuItem
            icon="log-out-outline"
            title="Log Out"
            isDanger
            isFirst
            showChevron={false}
            onPress={() => {
              // auth.signOut();
            }}
          />
          <MenuItem
            icon="person-remove-outline"
            title="Delete Account"
            isDanger
            isLast
            showChevron={false}
          />
        </View>
        <Text style={styles.footerText}>Footer Text</Text>
      </ScrollView>
      <ColorSchemePopup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleColorSchemeSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#171717",
    zIndex: 1,
    elevation: 3,
  },
  headerLeftContainer: {
    width: 28,
    alignItems: "flex-start",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerRightContainer: {
    width: 28,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  firstSectionTitle: {
    color: "#666666",
    fontSize: 12,
    marginLeft: 35,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#666666",
    fontSize: 12,
    marginLeft: 35,
    marginTop: 16,
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 20,
    backgroundColor: "#2A2A2A",
    borderRadius: 18,
    marginBottom: 8,
  },
  miniSection: {
    marginHorizontal: 20,
    backgroundColor: "#2A2A2A",
    borderRadius: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  footerText: {
    color: "#666666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 130,
  },
  scrollViewContainer: {
    flex: 1,
    backgroundColor: "#171717",
  },
});

export default Page;
