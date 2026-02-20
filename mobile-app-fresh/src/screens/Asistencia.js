
import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, TextInput, List, Button } from 'react-native-paper';
import { UserContext } from '../context/UserContext';
import { getSolicitantes } from '../api/solicitantes';

export default function AsistenciaScreen() {
  const { nombreEmpleado, CodVal, ipLocal } = useContext(UserContext);
  const [filtroSolicitante, setFiltroSolicitante] = useState('');
  const [solicitantes, setSolicitantes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    cargarSolicitantes('');
  }, []);

  const cargarSolicitantes = async (nombre = '') => {
    const data = await getSolicitantes(nombre);
    setSolicitantes(data);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Datos del Solicitante" />
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Buscar solicitante"
                value={filtroSolicitante}
                onChangeText={async text => {
                  setFiltroSolicitante(text);
                  setShowSuggestions(true);
                  await cargarSolicitantes(text);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{ backgroundColor: '#fff', marginBottom: 8, minHeight: 32, height: 32 }}
                dense={true}
              />
              {showSuggestions && filtroSolicitante.length > 0 && (
                <Card style={{ maxHeight: 200, marginBottom: 8 }}>
                  {solicitantes.filter(s => typeof s.NombreEmpleado === 'string' && s.NombreEmpleado.toLowerCase().includes(filtroSolicitante.toLowerCase())).length === 0 ? (
                    <List.Item title={<Text>No se encontraron solicitantes</Text>} />
                  ) : (
                    solicitantes.filter(s => typeof s.NombreEmpleado === 'string' && s.NombreEmpleado.toLowerCase().includes(filtroSolicitante.toLowerCase())).map(s => (
                      <List.Item
                        key={String(s.IdEmpleado || s.NombreEmpleado)}
                        title={String(s.NombreEmpleado)}
                        onPress={() => {
                          setFiltroSolicitante(s.NombreEmpleado);
                          setShowSuggestions(false);
                        }}
                      />
                    ))
                  )}
                </Card>
              )}
            </View>
            <Button
              mode="contained"
              icon="magnify"
              style={{ marginBottom: 8, width: 36, height: 36, justifyContent: 'center', alignItems: 'center', padding: 0, minWidth: 0, marginLeft: 4 }}
              labelStyle={{ display: 'none' }}
              onPress={() => {
                console.log('Solicitante seleccionado:', filtroSolicitante);
              }}
              accessibilityLabel="Buscar o seleccionar solicitante"
              contentStyle={{ justifyContent: 'center', alignItems: 'center', width: 24, height: 24, padding: 0 }}
            />
          </View>
          {/* Datos del solicitante eliminados según requerimiento */}
        </Card.Content>
      </Card>
      {/* Aquí puedes agregar el contenido específico de la página de Asistencia */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f6fa',
  },
  card: {
    marginBottom: 16,
  },
});
