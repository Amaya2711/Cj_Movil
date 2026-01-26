import React, { useState, useEffect } from 'react';
import { Modal, Portal, Provider, Snackbar, ActivityIndicator } from 'react-native-paper';
import { getDatosOc } from '../api/datosOc';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, Checkbox, Button } from 'react-native-paper';
import { getAprobaciones } from '../api/aprobaciones';
import { getSolicitantes } from '../api/solicitantes';
import { TextInput, List } from 'react-native-paper';





export default function AprobarPagosScreen() {
  console.log('AprobarPagosScreen montado');
  const [filtroSolicitante, setFiltroSolicitante] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [resultadosOriginales, setResultadosOriginales] = useState([]); // datos originales
  const [seleccionados, setSeleccionados] = useState([]); // array de ids seleccionados
  const [expandido, setExpandido] = useState({}); // control de expansión por registro
  const [tab, setTab] = useState('todos'); // 'todos' | 'seleccionados'
  const [modalVisible, setModalVisible] = useState(false);
  const [datosOc, setDatosOc] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [loadingDatosOc, setLoadingDatosOc] = useState(false);
  const [solicitantes, setSolicitantes] = useState([]);

  // DEBUG: Detectar claves duplicadas en resultados
  useEffect(() => {
    if (Array.isArray(resultados) && resultados.length > 0) {
      const keyCount = {};
      resultados.forEach((item, index) => {
        const key = String(item.IdAprobacion || item.Id || `${item.FecIngreso}_${item.Solicitante}_${item.Total}_${index}`);
        keyCount[key] = (keyCount[key] || 0) + 1;
      });
      const duplicados = Object.entries(keyCount).filter(([k, v]) => v > 1);
      if (duplicados.length > 0) {
        console.warn('Claves duplicadas detectadas en resultados:', duplicados.map(([k, v]) => ({ key: k, repeticiones: v })));
      }
    }
  }, [resultados]);

  useEffect(() => {
    // Al cargar la pantalla, consultar el backend y solicitantes
    cargarAprobaciones();
    // Cargar todos los solicitantes al inicio (sin filtro)
    cargarSolicitantes('');
  }, []);

  const cargarSolicitantes = async (nombre = '') => {
    try {
      const data = await getSolicitantes(nombre);
      setSolicitantes(data);
    } catch (error) {
      setSolicitantes([]);
    }
  };

  const cargarAprobaciones = async () => {
    try {
      const data = await getAprobaciones();
      setResultados(data);
      setResultadosOriginales(data);
    } catch (error) {
      setResultados([]);
      setResultadosOriginales([]);
    }
    setSeleccionados([]);
  };

  const buscar = async () => {
    // Limpiar resultados antes de buscar
    setResultados([]);
    setResultadosOriginales([]);
    setSeleccionados([]);
    // Buscar el solicitante seleccionado
    const seleccionado = solicitantes.find(s => String(s.NombreEmpleado) === filtroSolicitante);
    let idSolicitante = 0;
    if (seleccionado && seleccionado.IdEmpleado) {
      idSolicitante = seleccionado.IdEmpleado;
    } else {
      alert('Solicitante no existe, mostrando todos los datos');
    }
    try {
      const aprobaciones = await getAprobaciones(idSolicitante); // 0 muestra todos los datos
      setResultados(Array.isArray(aprobaciones) ? aprobaciones : []);
      setResultadosOriginales(Array.isArray(aprobaciones) ? aprobaciones : []);
    } catch (error) {
      setResultados([]);
      setResultadosOriginales([]);
    }
    // ...los resultados en pantalla siempre serán los obtenidos en la búsqueda
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
    <Provider>
    <View style={styles.container}>
      <Card style={styles.filtrosCard}>
        <TextInput
          label="Buscar solicitante"
          value={filtroSolicitante}
          onChangeText={async text => {
            setFiltroSolicitante(text);
            setShowSuggestions(true);
            // Consultar al backend usando el filtro
            await cargarSolicitantes(text);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          style={{ marginBottom: 8, backgroundColor: '#fff' }}
        />
        {/* Etiqueta IdEmpleado eliminada por requerimiento */}
        {showSuggestions && filtroSolicitante.length > 0 && (
          <Card style={{ maxHeight: 200, marginBottom: 8 }}>
            {solicitantes.filter(s => typeof s.NombreEmpleado === 'string' && s.NombreEmpleado.toLowerCase().includes(filtroSolicitante.toLowerCase())).length === 0 ? (
              <List.Item title="No se encontraron solicitantes" />
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
        {/*
        <Text style={{marginBottom: 8, color: solicitantes.length ? '#4CAF50' : '#F44336'}}>
          {solicitantes.length > 0
            ? `Solicitantes cargados: ${solicitantes.length}`
            : 'No se encontraron solicitantes.'}
        </Text>
        */}
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
            // Usar id único si existe, si no, combinar con el índice
            const uniqueId = item.IdAprobacion || item.Id || `${item.FecIngreso}_${item.Solicitante}_${item.Total}_${index}`;
            return seleccionados.includes(uniqueId);
          })}
          keyExtractor={(item, index) => {
            // Siempre usar el índice para garantizar unicidad
            return String(item.IdAprobacion || item.Id || `${item.FecIngreso}_${item.Solicitante}_${item.Total}`) + '_' + index;
          }}
          renderItem={({ item, index }) => {
            const safe = v => (v === undefined || v === null ? '' : String(v));
            // Usar el mismo identificador único que keyExtractor
            const uniqueId = item.IdAprobacion || item.Id || `${safe(item.FecIngreso)}_${safe(item.Solicitante)}_${safe(item.Total)}_${index}`;
            return (
              <View style={styles.tableRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={styles.cellCheckbox}>
                    <Checkbox
                      status={seleccionados.includes(uniqueId) ? 'checked' : 'unchecked'}
                      onPress={() => toggleSeleccion(uniqueId)}
                    />
                  </View>
                  <View style={{ flex: 1 }} /> {/* Espacio flexible para empujar el botón a la derecha */}
                  <Button mode="text" style={[styles.expandButton, { alignSelf: 'flex-end' }]} onPress={() => toggleExpandido(uniqueId)}>
                    <Text style={{color: '#2196F3'}}>{expandido[uniqueId] ? 'Cerrar detalle' : 'Ver detalle'}</Text>
                  </Button>
                  <Button
                    mode="text"
                    style={[styles.expandButton, { alignSelf: 'flex-end' }]}
                    onPress={async () => {
                      const idocVal = item.idoc;
                      if (idocVal === null || idocVal === undefined || Number(idocVal) <= 0) {
                        setSnackbarMsg('No existe datos registrados para la OC');
                        setSnackbarVisible(true);
                        return;
                      }
                      setLoadingDatosOc(true);
                      setModalVisible(true);
                      setDatosOc(null);
                      const result = await getDatosOc({
                        idoc: item.idoc,
                        fila: item.fila,
                        Site: item.IdSite ? String(item.IdSite) : '',
                        Tipo_Trabajo: item.Tipo_Trabajo ? String(item.Tipo_Trabajo) : ''
                      });
                      setDatosOc(result);
                      setLoadingDatosOc(false);
                    }}
                    title="Datos Oc"
                  >
                    <Text style={{color: '#7B3FF2'}}>Datos Oc</Text>
                  </Button>
                </View>
                <View style={[styles.cell, { flexDirection: 'row', alignItems: 'center' }]}> 
                  <Text style={{marginRight: 12}}><Text style={styles.cellLabel}>Fec.Ing:</Text> {safe(item.FecIngreso)}</Text>
                  <Text><Text style={styles.cellLabel}>Total:</Text> {safe(item.Total)} {safe(item.Moneda)}</Text>
                </View>
                <View style={styles.cell}><Text><Text style={styles.cellLabel}>Solicitante:</Text> {safe(item.Solicitante)}</Text></View>
                {expandido[uniqueId] && (
                  <View style={styles.detalleCard}>
                    <Text><Text style={styles.cellLabel}>Fec.Ing:</Text> {safe(item.FecIngreso)}</Text>
                    <Text><Text style={styles.cellLabel}>Detalle:</Text> {safe(item.Detalle)}</Text>
                    <Text><Text style={styles.cellLabel}>Bien/Servicio:</Text> {safe(item.Bien)}</Text>
                    <Text><Text style={styles.cellLabel}>Comprobante:</Text> {safe(item.Comprobante)}</Text>
                    <Text><Text style={styles.cellLabel}>Gestor:</Text> {safe(item.Gestor)}</Text>
                    <Text><Text style={styles.cellLabel}>Proyecto:</Text> {safe(item.nombreProyecto)}</Text>
                    <Text><Text style={styles.cellLabel}>Site:</Text> {safe(item.Site)}</Text>
                    <Text><Text style={styles.cellLabel}>Subtotal:</Text> {safe(item.Subtotal)}</Text>
                    <Text><Text style={styles.cellLabel}>IGV:</Text> {safe(item.IGV)}</Text>
                    <Text><Text style={styles.cellLabel}>Estado:</Text> {safe(item.EstadoPla)}</Text>
                    <Text><Text style={styles.cellLabel}>Observación:</Text> {safe(item.Observacion)}</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      </Card>
      {/* Botones de acción */}
      <View style={styles.actionButtonsContainer}>
        <Button mode="contained" style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={() => {}} title="Aceptar"><Text style={{color: '#fff', textAlign: 'center'}}>Aceptar</Text></Button>
        <Button mode="contained" style={[styles.actionButton, { backgroundColor: '#F44336' }]} onPress={() => {}} title="Rechazar"><Text style={{color: '#fff', textAlign: 'center'}}>Rechazar</Text></Button>
        <Button mode="contained" style={[styles.actionButton, { backgroundColor: '#FF9800' }]} onPress={() => {}} title="Observar"><Text style={{color: '#fff', textAlign: 'center'}}>Observar</Text></Button>
        <Button mode="contained" style={[styles.actionButton, { backgroundColor: '#2196F3' }]} onPress={() => {}} title="Regularizar"><Text style={{color: '#fff', textAlign: 'center'}}>Regularizar</Text></Button>
      </View>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Datos OC</Text>
          {loadingDatosOc && <ActivityIndicator animating size="large" style={{marginVertical: 16}} />}
          {!loadingDatosOc && datosOc && Array.isArray(datosOc) && datosOc.length > 0 && (
            datosOc.map((row, idx) => (
              <View key={idx} style={{marginBottom: 12}}>
                {Object.entries(row).map(([key, value]) => (
                  <Text key={key}><Text style={styles.cellLabel}>{key}:</Text> {String(value ?? '')}</Text>
                ))}
              </View>
            ))
          )}
          {!loadingDatosOc && datosOc && Array.isArray(datosOc) && datosOc.length === 0 && (
            <Text>No hay resultados para la OC.</Text>
          )}
          {!loadingDatosOc && datosOc && datosOc.error && (
            <Text style={{color: 'red'}}>Error: {datosOc.message}</Text>
          )}
          <Button mode="contained" onPress={() => setModalVisible(false)} style={{marginTop: 16}}>Cerrar</Button>
        </Modal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2500}
          style={{backgroundColor: '#F44336'}}
        >
          {snackbarMsg}
        </Snackbar>
      </Portal>
    </View>
    </Provider>
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
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 24,
    borderRadius: 12,
    alignItems: 'flex-start',
    elevation: 4,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#7B3FF2',
  },
});
