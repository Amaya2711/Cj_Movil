import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import { Card, Checkbox, Button } from 'react-native-paper';
import { getAprobaciones } from '../api/aprobaciones';




export default function AprobarPagosScreen() {
  const [filtroSolicitante, setFiltroSolicitante] = useState('');
  const [resultados, setResultados] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]); // array de ids seleccionados
  const [expandido, setExpandido] = useState({}); // control de expansión por registro
  const [tab, setTab] = useState('todos'); // 'todos' | 'seleccionados'

  useEffect(() => {
    // Al cargar la pantalla, consultar el backend
    cargarAprobaciones();
  }, []);

  const cargarAprobaciones = async () => {
    try {
      const data = await getAprobaciones();
      setResultados(data);
    } catch (error) {
      setResultados([]);
    }
    setSeleccionados([]);
  };

  const buscar = () => {
    // Filtro local por solicitante
    setResultados(prev => prev.filter(r =>
      (!filtroSolicitante || (r.Solicitante && r.Solicitante.toLowerCase().includes(filtroSolicitante.toLowerCase())))
    ));
    setSeleccionados([]);
  };

  // ...existing code...

   const toggleSeleccion = (id) => {
     setSeleccionados(prev =>
       prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
     );
   };

   const toggleExpandido = (id) => {
     setExpandido(prev => ({ ...prev, [id]: !prev[id] }));
   };

  return (
    <View style={styles.container}>
      <Card style={styles.filtrosCard}>
        <TextInput
          style={styles.input}
          placeholder="Solicitante"
          value={filtroSolicitante}
          onChangeText={setFiltroSolicitante}
        />
        <Button mode="contained" onPress={buscar}>Buscar</Button>
      </Card>
      {/* Pestañas para alternar entre todos y seleccionados */}
      <View style={styles.tabsContainer}>
        <Button mode={tab === 'todos' ? 'contained' : 'outlined'} style={styles.tabButton} onPress={() => setTab('todos')}><Text style={{color: tab === 'todos' ? '#fff' : '#7B3FF2', textAlign: 'center'}}>Todos</Text></Button>
        <Button mode={tab === 'seleccionados' ? 'contained' : 'outlined'} style={styles.tabButton} onPress={() => setTab('seleccionados')}><Text style={{color: tab === 'seleccionados' ? '#fff' : '#7B3FF2', textAlign: 'center'}}>Seleccionados</Text></Button>
      </View>
      <Card style={styles.resultadosCard}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={styles.seccionTitulo}>Resultados</Text>
          <Text style={styles.cantidadRegistros}>{`Registros: ${tab === 'todos' ? (Array.isArray(resultados) ? resultados.length : 0) : seleccionados.length}`}</Text>
        </View>
        <FlatList
          data={tab === 'todos' ? resultados : resultados.filter((item, index) => {
            const id = `${item.FecIngreso}_${item.Solicitante}_${item.Total}_${index}`;
            return seleccionados.includes(id);
          })}
          keyExtractor={(item, index) => `${item.FecIngreso}_${item.Solicitante}_${item.Total}_${index}`}
          renderItem={({ item, index }) => {
            const id = `${item.FecIngreso}_${item.Solicitante}_${item.Total}_${index}`;
            return (
              <View style={styles.tableRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={styles.cellCheckbox}>
                    <Checkbox
                      status={seleccionados.includes(id) ? 'checked' : 'unchecked'}
                      onPress={() => toggleSeleccion(id)}
                    />
                  </View>
                  <View style={{ flex: 1 }} /> {/* Espacio flexible para empujar el botón a la derecha */}
                  <Button mode="text" style={[styles.expandButton, { alignSelf: 'flex-end' }]} onPress={() => toggleExpandido(id)}>
                    <Text style={{color: '#2196F3'}}>{expandido[id] ? 'Cerrar detalle' : 'Ver detalle'}</Text>
                  </Button>
                </View>
                <View style={[styles.cell, { flexDirection: 'row', alignItems: 'center' }]}> 
                  <Text style={{marginRight: 12}}><Text style={styles.cellLabel}>Fec.Ing:</Text> {String(item.FecIngreso)}</Text>
                  <Text><Text style={styles.cellLabel}>Total:</Text> {String(item.Total)} {String(item.Moneda)}</Text>
                </View>
                <View style={styles.cell}><Text><Text style={styles.cellLabel}>Solicitante:</Text> {String(item.Solicitante)}</Text></View>
                {expandido[id] && (
                  <View style={styles.detalleCard}>
                    <Text><Text style={styles.cellLabel}>Fec.Ing:</Text> {String(item.FecIngreso)}</Text>
                    <Text><Text style={styles.cellLabel}>Detalle:</Text> {String(item.Detalle)}</Text>
                    <Text><Text style={styles.cellLabel}>Bien/Servicio:</Text> {String(item.Bien)}</Text>
                    <Text><Text style={styles.cellLabel}>Comprobante:</Text> {String(item.Comprobante)}</Text>
                    <Text><Text style={styles.cellLabel}>Gestor:</Text> {String(item.Gestor)}</Text>
                    <Text><Text style={styles.cellLabel}>Proyecto:</Text> {String(item.nombreProyecto || '')}</Text>
                    <Text><Text style={styles.cellLabel}>Site:</Text> {String(item.Site || '')}</Text>
                    <Text><Text style={styles.cellLabel}>Subtotal:</Text> {String(item.Subtotal)}</Text>
                    <Text><Text style={styles.cellLabel}>IGV:</Text> {String(item.IGV)}</Text>
                    <Text><Text style={styles.cellLabel}>Estado:</Text> {String(item.EstadoPla || '')}</Text>
                    <Text><Text style={styles.cellLabel}>Observación:</Text> {String(item.Observacion)}</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      </Card>
      {/* Botones de acción */}
      <View style={styles.actionButtonsContainer}>
        <Button mode="contained" style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={() => {}}><Text style={{color: '#fff', textAlign: 'center'}}>Aceptar</Text></Button>
        <Button mode="contained" style={[styles.actionButton, { backgroundColor: '#F44336' }]} onPress={() => {}}><Text style={{color: '#fff', textAlign: 'center'}}>Rechazar</Text></Button>
        <Button mode="contained" style={[styles.actionButton, { backgroundColor: '#FF9800' }]} onPress={() => {}}><Text style={{color: '#fff', textAlign: 'center'}}>Observar</Text></Button>
        <Button mode="contained" style={[styles.actionButton, { backgroundColor: '#2196F3' }]} onPress={() => {}}><Text style={{color: '#fff', textAlign: 'center'}}>Regularizar</Text></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 8,
      gap: 8,
    },
    tabButton: {
      marginHorizontal: 4,
      borderRadius: 8,
      minWidth: 120,
    },
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
  cellLabel: {
    fontWeight: 'bold',
    color: '#7B3FF2',
    marginRight: 4,
  },
  detalleCard: {
    padding: 12,
    backgroundColor: '#e3f2fd',
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
  },
  expandButton: {
    alignSelf: 'flex-end',
    marginVertical: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 2,
    minWidth: 0,
    borderRadius: 8,
    paddingVertical: 6,
    maxWidth: '25%',
  },
});
