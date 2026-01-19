import * as React from 'react';
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
  return (
    <UserProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MainMenu" component={MainMenuScreen} options={{ title: 'Menú Principal' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </UserProvider>
  );
}
