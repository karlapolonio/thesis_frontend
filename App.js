import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './UserContext';

import Register from './screens/RegisterScreen';
import Login from './screens/LoginScreen';
import Form from './screens/FormScreen';
import Main from './screens/MainScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ animation: "slide_from_left" }}
            />
            <Stack.Screen
              name="Register"
              component={Register}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Form"
              component={Form}
              options={{ animation: "fade_from_bottom" }}
            />
            <Stack.Screen
              name="Main"
              component={Main}
              options={{ animation: "fade_from_bottom" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
