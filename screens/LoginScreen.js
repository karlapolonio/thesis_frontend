import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, Alert, KeyboardAvoidingView} from "react-native";
import styles from "../styles/LoginStyle";
import axios from "axios";
import { useUser } from "../UserContext";
import { BACKEND_URL } from "../Config";

const API_BASE_URL = `${BACKEND_URL}/account`;

const Login = ({ navigation }) => {

  const { setUserId } = useUser(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      },
      {
        headers: {
            "x-api-key": "",
        },
      }
    );

      console.log("User logged in:", response.data);
      console.log(response.data.user_id);
      setUserId(response.data.user_id); 

      if (response.data.has_profile) {
          navigation.navigate("Main");
      } else {
          navigation.navigate("Form");
      }
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Something went wrong"
      );
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
            />

            <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "center" }}>
              <Text>Don’t have an account yet? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={{ color: "green", fontWeight: "bold" }}>Register</Text>
              </TouchableOpacity>
            </View>
        </View>
    </KeyboardAvoidingView>
  );
};

export default Login;
