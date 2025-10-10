import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRef } from 'react';

import HomeNav from '../navbar/HomeNav';
import LogNav from '../navbar/LogNav';
import ResultNav from '../navbar/ResultNav';
import SettingNav from '../navbar/SettingNav';

const Tab = createBottomTabNavigator();

export default function Main() {
  const tabRef = useRef();

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <Tab.Navigator
        ref={tabRef}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: '#7e7e7eff',
          tabBarStyle: {
            height: 60,
            paddingBottom: 5,
            paddingTop: 5,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: '#fff',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeNav}
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />,
          }}
        />
        <Tab.Screen
          name="Log"
          component={LogNav}
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="calendar-today" size={28} color={color} />,
          }}
        />
        <Tab.Screen
          name="Camera"
          component={HomeNav}
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="photo-camera" size={28} color={color} />,
          }}
          listeners={({ navigation }) => ({
            tabPress: async (e) => {
              e.preventDefault();

              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                alert('Camera permission is required!');
                return;
              }

              const result = await ImagePicker.launchCameraAsync({ quality: 1 });
              if (!result.canceled) {
                navigation.navigate('Result', { photoUri: result.assets[0].uri });
              }
            },
          })}
        />
        <Tab.Screen
          name="Result"
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="restaurant" size={28} color={color} />,
          }}
        >
          {({ route }) => <ResultNav photoUri={route.params?.photoUri} />}
        </Tab.Screen>
        <Tab.Screen
          name="Settings"
          component={SettingNav}
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={28} color={color} />,
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
