import * as React from 'react';
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import LoginScreen from './src/screens/LoginScreen';
import MainMenuScreen from './src/screens/MainMenuScreen';
import { UserProvider } from './src/context/UserContext';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#7B3FF2', // Morado
    accent: '#2BB8F7', // Azul
    background: '#231F36', // Fondo oscuro
    surface: '#2B2542', // Un poco más claro para tarjetas
    text: '#FFFFFF', // Blanco
    placeholder: '#B0AFC7', // Gris claro para placeholder
    error: '#FF8C3B', // Naranja
  },
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        if (Platform.OS === 'web') {
          await Font.loadAsync({
            MaterialCommunityIcons: '/assets/vendor_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf',
          });
        } else {
          await Font.loadAsync({
            ...MaterialCommunityIcons.font,
          });
        }
        setFontsLoaded(true);
      } catch (err) {
        console.error('Error cargando fuentes:', err);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // O un componente de carga/spinner
  }

  return (
    <UserProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MainMenu" component={MainMenuScreen} options={{ title: 'Menú Principal' }} />
            <Stack.Screen name="AprobarPagos" component={require('./src/screens/AprobarPagosScreen').default} options={{ title: 'Aprobar pagos' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </UserProvider>
  );
}
