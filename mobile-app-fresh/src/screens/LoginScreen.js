import React, { useState, useContext } from 'react';
import { Platform } from 'react-native';
let Network = null;
if (Platform.OS !== 'web') {
  Network = require('expo-network');
}
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, Card, Snackbar } from 'react-native-paper';
import axios from 'axios';
import { Platform } from 'react-native';
const CJTelecomLogo = Platform.OS === 'web'
  ? { uri: '/logo.png' }
  : require('../../assets/logo.png');
import { UserContext } from '../context/UserContext';

// URL pública del backend en Railway
const API_URL = 'https://cjmovil-production.up.railway.app/api/auth/login';

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUserData } = useContext(UserContext);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(API_URL, { usuario, password });
      if (res.data.token) {
        // Obtener IP local y tipo de red (compatible con Expo)
        let ipLocal = '';
        let networkType = '';
        if (Platform.OS !== 'web' && Network) {
          try {
            ipLocal = await Network.getIpAddressAsync();
          } catch (e) {
            ipLocal = '';
          }
          try {
            networkType = await Network.getNetworkStateAsync();
            networkType = networkType.type || '';
          } catch (e) {
            networkType = '';
          }
        }
        // Guardar datos globales
        setUserData({
          cuadrilla: res.data.Cuadrilla,
          idusuario: res.data.usuario,
          nombreEmpleado: res.data.nombre,
          ipLocal,
          networkType
        });
        navigation.replace('MainMenu');
      }
    } catch (err) {
      let errorMsg = '';
      if (err.response) {
        errorMsg = `Error de respuesta: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`;
      } else if (err.request) {
        errorMsg = 'No se recibió respuesta del servidor. Verifica tu conexión.';
      } else {
        errorMsg = `Error: ${err.message}`;
      }
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  // Ejemplo de animación con useNativeDriver: false
  // Animated.timing(valorAnimado, { toValue: 1, duration: 500, useNativeDriver: false });

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
            {/* Eliminado: <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#7B3FF2', marginBottom: 8 }}>Cj 6</Text> */}
          <Image source={CJTelecomLogo} style={styles.logo} resizeMode="contain" />
        </View>
        <Card.Title title="Iniciar Sesión" titleStyle={{ color: '#231F36' }} />
        <Card.Content>
          <TextInput
            label="Usuario"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            style={styles.input}
            theme={{ colors: { background: '#2B2542', text: '#FFFFFF', placeholder: '#B0AFC7' } }}
          />
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} />}
            theme={{ colors: { background: '#2B2542', text: '#FFFFFF', placeholder: '#B0AFC7' } }}
          />
          <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button}>
            Entrar
          </Button>
        </Card.Content>
      </Card>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={{ backgroundColor: '#FF8C3B' }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#231F36' },
  card: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 16 },
  logo: { width: 180, height: 48, marginBottom: 8 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, backgroundColor: '#7B3FF2' }
});
