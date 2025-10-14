import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../UserContext";
import { useNavigation } from "@react-navigation/native";

export default function SettingNav() {
  const { setUserId } = useUser();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["userId", "hasProfile"]);
      setUserId(null);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
      console.log("Logged out successfully — cleared AsyncStorage.");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
      console.error("Logout error:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Edit Profile", "Profile")}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* App Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Notifications", "Manage notifications")}>
          <Text style={styles.buttonText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Theme", "Switch app theme")}>
          <Text style={styles.buttonText}>Theme</Text>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fafafaff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e7d32",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#145a32",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#27ae60",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#c0392b",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
