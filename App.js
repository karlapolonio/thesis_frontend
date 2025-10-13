import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { UserProvider } from "./UserContext";
import { useColorScheme, StyleSheet } from "react-native";

import Register from "./screens/RegisterScreen";
import Login from "./screens/LoginScreen";
import Form from "./screens/FormScreen";
import Main from "./screens/MainScreen";
import StartupScreen from "./screens/StartUpScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const scheme = useColorScheme();
  const backgroundColor = scheme === 'dark' ? '#000' : '#fff';
  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <UserProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Startup"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Startup" component={StartupScreen} />
              <Stack.Screen name="Login" component={Login} options={{ animation: "fade_from_bottom" }} />
              <Stack.Screen name="Register" component={Register} options={{ animation: "fade_from_bottom" }} />
              <Stack.Screen name="Form" component={Form} options={{ animation: "fade_from_bottom" }} />
              <Stack.Screen name="Main" component={Main} options={{ animation: "fade_from_bottom" }} />
            </Stack.Navigator>
          </NavigationContainer>
        </UserProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});