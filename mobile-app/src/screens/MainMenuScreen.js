import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

export default function MainMenuScreen({ navigation }) {
  const handleLogout = () => {
    navigation.replace('Login');
  };
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Menú Principal" />
        <Card.Content>
          <Text>Bienvenido. Seleccione una opción.</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined" onPress={handleLogout}>
            Salir / Cerrar sesión
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f4f6fa' },
  card: { padding: 8 }
});
