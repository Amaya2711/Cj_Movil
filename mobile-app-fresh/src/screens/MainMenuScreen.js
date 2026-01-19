import React, { useContext } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { UserContext } from '../context/UserContext';

const SEGMENTS = 8;

export default function MainMenuScreen({ navigation }) {
  const { nombreEmpleado } = useContext(UserContext);
  const OPTIONS = [
    { label: 'Aprobar', onPress: () => navigation.navigate('AprobarPagos') },
    { label: 'Re-Aprobar', onPress: () => {} },
    { label: 'Opción 3', onPress: () => {} },
    { label: 'Opción 4', onPress: () => {} },
    { label: 'Opción 5', onPress: () => {} },
    { label: 'Opción 6', onPress: () => {} },
    { label: 'Opción 7', onPress: () => {} },
    { label: 'Opción 8', onPress: () => {} },
  ];
  const handleLogout = () => {
    navigation.replace('Login');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.bienvenida}>Bienvenido, {nombreEmpleado}</Text>
      <View style={styles.grid}>
        {OPTIONS.slice(0, SEGMENTS).map((opt, idx) => (
          <View key={idx} style={styles.segment}>
            <Button mode="contained" onPress={opt.onPress} style={styles.menuButton}>
              {opt.label}
            </Button>
          </View>
        ))}
      </View>
      <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
        Salir / Cerrar sesión
      </Button>
    </View>
  );
}

const numColumns = 2;
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6fa' },
  bienvenida: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#231F36' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  segment: {
    width: Dimensions.get('window').width / numColumns - 32,
    marginBottom: 16,
    alignItems: 'center',
  },
  menuButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#7B3FF2',
  },
  logoutButton: {
    marginTop: 16,
    alignSelf: 'center',
    width: '60%',
  },
});
