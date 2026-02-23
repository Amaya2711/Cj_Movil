import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Platform, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import 'react-native-gesture-handler';
// Eliminado hack de modificación de fuente para compatibilidad con React Native moderno
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme, Button } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';

import LoginScreen from './src/screens/LoginScreen';
import MainMenuScreen from './src/screens/MainMenuScreen';
import AprobarPagosScreen from './src/screens/AprobarPagosScreen';
import ReAprobarPagosScreen from './src/screens/ReAprobarPagosScreen';
import { UserProvider } from './src/context/UserContext';

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
            // No cargar la fuente manualmente, Expo la gestiona automáticamente
        setFontsLoaded(true);
      } catch (err) {
        console.error('Error cargando fuentes:', err);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#231F36' }}>
        <Text style={{ color: '#7B3FF2', fontSize: 20, marginBottom: 16 }}>Cargando recursos...</Text>
        <Button loading={true} mode="contained" style={{ backgroundColor: '#7B3FF2' }}>
          Cargando
        </Button>
      </View>
    );
  }

  return (
    <UserProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </UserProvider>
  );
}
