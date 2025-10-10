import { SafeAreaProvider } from 'react-native-safe-area-context';
import Register from './screens/RegisterScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <Register/>
    </SafeAreaProvider>
  );
}
