import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import MainMenuScreen from '../screens/MainMenuScreen';
import ReAprobarPagosScreen from '../screens/ReAprobarPagosScreen';
import ReportePlanillaScreen from '../screens/ReportePlanillaScreen';
import ReportePagosScreen from '../screens/ReportePagos';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="MainMenu" component={MainMenuScreen} options={{ title: 'Menú Principal' }} />
      <Stack.Screen name="ReAprobarPagos" component={ReAprobarPagosScreen} />
      <Stack.Screen name="ReportePlanilla" component={ReportePlanillaScreen} options={{ title: 'Reporte Dinámico de Planillas' }} />
      <Stack.Screen name="ReportePagos" component={ReportePagosScreen} options={{ title: 'Reporte de Gastos' }} />
    </Stack.Navigator>
  );
}