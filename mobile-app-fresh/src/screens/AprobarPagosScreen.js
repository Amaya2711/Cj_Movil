import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import { Card, Checkbox } from 'react-native-paper';

const mockResults = [
  { id: '1', folio: 'FOL123', beneficiario: 'Juan Pérez', monto: 1500, estatus: 'Pendiente' },
  { id: '2', folio: 'FOL456', beneficiario: 'Ana López', monto: 2000, estatus: 'Pendiente' },
];


export default function AprobarPagosScreen() {
  const [filtroSolicitante, setFiltroSolicitante] = useState('');
  const [resultados, setResultados] = useState(mockResults);
  const [seleccionados, setSeleccionados] = useState([]); // array de ids seleccionados

  const buscar = () => {
    // Aquí irá la lógica real de consulta a la base de datos
    setResultados(mockResults.filter(r =>
      (!filtroSolicitante || r.folio.includes(filtroSolicitante))
    ));
    setSeleccionados([]);
  };

  const toggleSeleccion = (id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.titulo}>Aprobar pagos</Text> */}
      <Card style={styles.filtrosCard}>
        <Text style={styles.seccionTitulo}>Filtros de búsqueda</Text>
        <TextInput
          style={styles.input}
          placeholder="Solicitante"
          value={filtroSolicitante}
          onChangeText={setFiltroSolicitante}
        />
        <Button title="Buscar" onPress={buscar} />
      </Card>
      <Card style={styles.resultadosCard}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={styles.seccionTitulo}>Resultados</Text>
          <Text style={styles.cantidadRegistros}>{`Registros: ${resultados.length}`}</Text>
        </View>
        <View style={styles.tableHeader}>
          <View style={styles.headerCellCheckbox}></View>
          <Text style={styles.headerCell}>Folio</Text>
          <Text style={styles.headerCell}>Beneficiario</Text>
          <Text style={styles.headerCell}>Monto</Text>
          <Text style={styles.headerCell}>Estatus</Text>
        </View>
        <FlatList
          data={resultados}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <View style={styles.cellCheckbox}>
                <Checkbox
                  status={seleccionados.includes(item.id) ? 'checked' : 'unchecked'}
                  onPress={() => toggleSeleccion(item.id)}
                />
              </View>
              <Text style={styles.cell}>{item.folio}</Text>
              <Text style={styles.cell}>{item.beneficiario}</Text>
              <Text style={styles.cell}>${item.monto}</Text>
              <Text style={styles.cell}>{item.estatus}</Text>
            </View>
          )}
        />
      </Card>
      {/* Puedes agregar aquí un área de detalles para los seleccionados si lo deseas */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filtrosCard: {
    marginBottom: 16,
    padding: 12,
  },
  resultadosCard: {
    flex: 1,
    marginBottom: 16,
    padding: 12,
  },
  seccionTitulo: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detalleCard: {
    padding: 12,
    backgroundColor: '#e3f2fd',
  },
});
