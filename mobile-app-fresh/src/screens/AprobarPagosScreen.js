  // ...existing code...


import React, { useState, useEffect, useContext } from 'react';
import { Modal, Portal, Provider, Snackbar, ActivityIndicator } from 'react-native-paper';
import { getDatosOc } from '../api/datosOc';
import { aprobarPlanilla } from '../api/aprobarPlanilla';
import { UserContext } from '../context/UserContext';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, Checkbox, Button } from 'react-native-paper';
import { getAprobaciones } from '../api/aprobaciones';
import { getSolicitantes } from '../api/solicitantes';
import { TextInput, List } from 'react-native-paper';





export default function AprobarPagosScreen() {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmParams, setConfirmParams] = useState([]);
  const [sqlDebugModalVisible, setSqlDebugModalVisible] = useState(false);
  const [sqlDebugs, setSqlDebugs] = useState([]);
  const { ipLocal } = useContext(UserContext);
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
  const [paramsOc, setParamsOc] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [loadingDatosOc, setLoadingDatosOc] = useState(false);
  const [solicitantes, setSolicitantes] = useState([]);

  // DEBUG: Detectar claves duplicadas en combinación de 'Corre' e 'IdSite'
  useEffect(() => {
    if (Array.isArray(resultados) && resultados.length > 0) {
      const comboCount = {};
      const comboItems = {};
      resultados.forEach(item => {
        const combo = `${String(item.Corre)}_${String(item.IdSite)}`;
        comboCount[combo] = (comboCount[combo] || 0) + 1;
        if (!comboItems[combo]) comboItems[combo] = [];
        comboItems[combo].push(item);
      });
      const duplicados = Object.entries(comboCount).filter(([k, v]) => v > 1);
      if (duplicados.length > 0) {
        duplicados.forEach(([combo]) => {
          const items = comboItems[combo];
          items.forEach(item => {
            console.warn(`Duplicado encontrado -> Corre: ${item.Corre}, IdSite: ${item.IdSite}`, item);
          });
        });
      }
    }
  }, [resultados]);

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

  const safe = v => (v === undefined || v === null ? '' : String(v));

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
          data={tab === 'todos' ? resultados : resultados.filter(item => seleccionados.includes(String(item.Corre)))}
          keyExtractor={(item) => {
            // Usar el campo 'Corre' del store, que es único para cada registro
            return String(item.Corre);
          }}
          renderItem={({ item }) => {
            // Usar el campo 'Corre' como identificador único
            const uniqueId = String(item.Corre);
            return (
              <View style={styles.tableRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={styles.cellCheckbox}>
                    <Checkbox
                      status={seleccionados.includes(uniqueId) ? 'checked' : 'unchecked'}
                      onPress={() => toggleSeleccion(uniqueId)}
                    />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', color: '#7B3FF2', marginRight: 4 }}>Correlativo:</Text>
                    <Text>{safe(item.Corre)}</Text>
                  </View>
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
                      const params = {
                        idoc: item.idoc,
                        fila: item.fila ? String(item.fila).split(',')[0] : '',
                        Site: item.IdSite ? String(item.IdSite) : '',
                        Tipo_Trabajo: item.Tipo_Trabajo ? String(item.Tipo_Trabajo) : ''
                      };
                      setParamsOc(params);
                      const result = await getDatosOc(params);
                      setDatosOc(result);
                      setLoadingDatosOc(false);
                      // Mostrar snackbar si la consulta retorna vacío o error
                      if ((Array.isArray(result) && result.length === 0) || (result && result.error)) {
                        setSnackbarMsg('No existe datos registrados para la OC');
                        setSnackbarVisible(true);
                        setModalVisible(false);
                      }
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
      {/* Botones de acción solo en la pestaña Seleccionados */}
      {tab === 'seleccionados' && (
        <View style={{ width: '100%' }}>
          <View style={styles.actionButtonsRow}>
            <Button
              mode="contained"
              disabled={seleccionados.length === 0}
              style={[
                styles.actionButtonFull,
                { backgroundColor: seleccionados.length === 0 ? '#BDBDBD' : '#4CAF50' }
              ]}
              onPress={() => {
                if (seleccionados.length === 0) {
                  setSnackbarMsg('Debes seleccionar al menos un registro para aprobar.');
                  setSnackbarVisible(true);
                  return;
                }
                if (!ipLocal) {
                  setSnackbarMsg('No se pudo obtener la IP local.');
                  setSnackbarVisible(true);
                  return;
                }
                const seleccionadosData = resultados.filter(item => seleccionados.includes(String(item.Corre)));
                const paramsList = seleccionadosData.map(item => ({
                  ipLocal: String(ipLocal),
                  CorFil: parseInt(item.Corre, 10),
                  cIdSite: String(item.IdSite)
                }));
                // Ejecutar directamente la aprobación sin mostrar modal de parámetros
                (async () => {
                  let errores = [];
                  let sqlDebugsTemp = [];
                  for (const params of paramsList) {
                    try {
                      const resp = await aprobarPlanilla(params);
                      // Log completo de la respuesta
                      console.log(`Respuesta API para Corre ${params.CorFil}:`, resp?.data, resp);
                      if (resp && resp.data && resp.data.sqlDebug) {
                        sqlDebugsTemp.push(`Corre ${params.CorFil}: ${resp.data.sqlDebug}`);
                        // Mostrar en consola
                        console.log(`SQL ejecutado para Corre ${params.CorFil}:`, resp.data.sqlDebug);
                      }
                      // Mostrar mensaje de éxito específico si viene en la respuesta
                      if (resp && resp.data && resp.data.message) {
                        setSnackbarMsg(`Corre ${params.CorFil}: ${resp.data.message}`);
                        setSnackbarVisible(true);
                      }
                    } catch (e) {
                      console.error(`Error en Corre ${params.CorFil}:`, e);
                      errores.push(`Error en Corre ${params.CorFil}: ${e?.response?.data?.message || e.message}`);
                    }
                  }
                  if (errores.length === 0) {
                    setSnackbarMsg('Aprobación exitosa.');
                  } else {
                    setSnackbarMsg('Algunos registros no se aprobaron: ' + errores.join('; '));
                  }
                  setSnackbarVisible(true);
                  cargarAprobaciones();
                })();
              }}
              title="Aprobar"
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>Aprobar recibo</Text>
            </Button>
            <Button
              mode="contained"
              disabled={seleccionados.length === 0}
              style={[
                styles.actionButtonFull,
                { backgroundColor: seleccionados.length === 0 ? '#BDBDBD' : '#F44336' }
              ]}
              onPress={() => {}}
              title="Rechazar"
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>Rechazar</Text>
            </Button>
          </View>
          <View style={styles.actionButtonsRow}>
            <Button
              mode="contained"
              disabled={seleccionados.length === 0}
              style={[
                styles.actionButtonFull,
                { backgroundColor: seleccionados.length === 0 ? '#BDBDBD' : '#FF9800' }
              ]}
              onPress={() => {}}
              title="Observar"
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>Observar</Text>
            </Button>
            <Button
              mode="contained"
              disabled={seleccionados.length === 0}
              style={[
                styles.actionButtonFull,
                { backgroundColor: seleccionados.length === 0 ? '#BDBDBD' : '#2196F3' }
              ]}
              onPress={() => {}}
              title="Regularizar"
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>Regularizar</Text>
            </Button>
          </View>
        </View>
      )}
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Datos OC</Text>
          {loadingDatosOc && <ActivityIndicator animating size="large" style={{marginVertical: 16}} />}
          {!loadingDatosOc && datosOc && Array.isArray(datosOc) && datosOc.length > 0 && (
            datosOc.map((row, idx) => (
              <View key={idx} style={{marginBottom: 12}}>
                {Object.entries(row)
                  .filter(([key]) => key !== 'IdMoneda')
                  .map(([key, value]) => {
                    let label = key;
                    if (key === 'idoc') label = 'OC';
                    else if (key === 'SubOc') label = 'Monto OC';
                    else if (key === 'SubPlanilla') label = 'Monto Pago';
                    else if (key === 'Porce') label = 'Porcentaje';
                    return (
                      <Text key={key}><Text style={styles.cellLabel}>{label}:</Text> {String(value ?? '')}</Text>
                    );
                  })}
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
          style={{backgroundColor: snackbarMsg.includes('exitosa') ? '#4CAF50' : '#F44336'}}
        >
          {snackbarMsg}
        </Snackbar>

        {/* Modal para mostrar SQL Debug */}
        <Modal visible={sqlDebugModalVisible} onDismiss={() => setSqlDebugModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>SQL ejecutado</Text>
          {sqlDebugs.length > 0 ? sqlDebugs.map((sql, idx) => (
            <Text key={idx} style={{marginBottom: 8, fontSize: 12, color: '#333'}}>{sql}</Text>
          )) : <Text>No hay SQL para mostrar.</Text>}
          <Button mode="contained" style={{marginTop: 12}} onPress={() => setSqlDebugModalVisible(false)}>Cerrar</Button>
        </Modal>
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
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
    width: '100%',
  },
  actionButtonFull: {
    flex: 1,
    marginHorizontal: 2,
    minWidth: 0,
    borderRadius: 8,
    paddingVertical: 10,
    maxWidth: '100%',
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
