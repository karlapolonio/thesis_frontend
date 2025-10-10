import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "../styles/LoginStyle";
import axios from "axios";
import { useUser } from "../UserContext";
import Constants from "expo-constants";

const { API_KEY, BACKEND_URL } = Constants.expoConfig.extra;
const API_BASE_URL = `${BACKEND_URL}/account`;

const Login = ({ navigation }) => {
  const { setUserId } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        { email, password },
        { headers: { "x-api-key": API_KEY } }
      );

      console.log("User logged in:", response.data);
      setUserId(response.data.user_id);

      setTimeout(() => {
        if (response.data.has_profile) {
          navigation.navigate("Main");
        } else {
          navigation.navigate("Form");
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Something went wrong"
      );
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <View style={[styles.input, { flexDirection: "row", alignItems: "center" }]}>
          <TextInput
            style={{ flex: 1 }}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#555"
            />
          </Pressable>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#063b00ff" }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text>Don’t have an account yet? </Text>
          <TouchableOpacity
            onPress={() => !loading && navigation.navigate("Register")}
            disabled={loading}
          >
            <Text style={{ color: "green", fontWeight: "bold" }}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;