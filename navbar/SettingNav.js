import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/SettingNavStyle";

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Edit Profile", "Profile")}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Notifications", "Manage notifications")}>
          <Text style={styles.buttonText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Theme", "Switch app theme")}>
          <Text style={styles.buttonText}>Theme</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
