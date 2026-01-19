import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, Card, Snackbar } from 'react-native-paper';
import axios from 'axios';
import CJTelecomLogo from '../../assets/logo.png';
import { UserContext } from '../context/UserContext';

// Cambia esta IP por la IP local de tu PC
const API_URL = 'http://192.168.137.184:4000/api/auth/login';

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
        // Guardar datos globales
        setUserData({
          cuadrilla: res.data.Cuadrilla,
          idusuario: res.data.usuario,
          nombreEmpleado: res.data.nombre
        });
        navigation.replace('MainMenu');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
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
