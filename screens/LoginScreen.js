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
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const { setUserId, BACKEND_URL, API_KEY } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/account/login`,
        { email, password },
        { headers: { "x-api-key": API_KEY } }
      );

      const { user_id, has_profile } = response.data;

      setUserId(user_id);
      await AsyncStorage.setItem('userId', user_id.toString());
      await AsyncStorage.setItem("hasProfile", has_profile ? "true" : "false");

      setTimeout(() => {
        if (has_profile) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Form' }],
          });
        }
        setLoading(false);
      }, 500);

    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Something went wrong. Please try again."
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