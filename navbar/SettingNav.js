import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../UserContext";
import { useNavigation } from "@react-navigation/native";

export default function SettingNav() {
  const { setUserId } = useUser();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      // 1️⃣ Remove both user data and profile flag
      await AsyncStorage.multiRemove(["userId", "hasProfile"]);

      // 2️⃣ Clear userId in context
      setUserId(null);

      // 3️⃣ Navigate back to Login screen (reset navigation stack)
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
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  logoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
