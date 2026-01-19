import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, Card, Snackbar } from 'react-native-paper';
import axios from 'axios';
import CJTelecomLogo from '../../assets/cjtelecom-logo.png';

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', { usuario, password });
      if (res.data.token) {
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
        <Card.Title title="Iniciar Sesión" />
        <Card.Content>
          <TextInput
            label="Usuario"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} />} 
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
        style={{ backgroundColor: '#b00020' }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f4f6fa' },
  card: { padding: 8 },
  logo: { width: 180, height: 48, marginBottom: 8 },
  input: { marginBottom: 12 },
  button: { marginTop: 8 }
});
