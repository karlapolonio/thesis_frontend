import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, Alert, KeyboardAvoidingView } from "react-native";
import styles from '../styles/RegisterStyle';
import axios from "axios";
import { useUser } from "../UserContext"; 

const Register = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { BACKEND_URL, API_KEY } = useUser();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      const response = await axios.post(
        `${BACKEND_URL}/account/register`,
        {
          username,
          email,
          password,
        },
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      Alert.alert("Success", "Account created!");
      console.log("User registered:", response.data);

      navigation.navigate("Login");
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
            <Text style={styles.title}>Registration</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />

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

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "center" }}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={{ color: "green", fontWeight: "bold" }}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
    </KeyboardAvoidingView>
  );
};

export default Register;
