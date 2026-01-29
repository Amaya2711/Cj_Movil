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
  const [accionActual, setAccionActual] = useState(''); // 'aprobar' | 'rechazar' | 'observar'
  const [observacionInput, setObservacionInput] = useState('');
  const [rechazoConfirmVisible, setRechazoConfirmVisible] = useState(false);
  const [observarConfirmVisible, setObservarConfirmVisible] = useState(false);
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
        console.warn('Registros con la misma llave (Corre + IdSite):');
        let mensaje = 'Duplicados Corre-IdSite: ';
        duplicados.forEach(([combo]) => {
          const items = comboItems[combo];
          items.forEach(item => {
            console.warn(`Corre: ${item.Corre}, IdSite: ${item.IdSite}`);
            mensaje += `[${item.Corre},${item.IdSite}] `;
          });
        });
        // Ya no se muestra el mensaje de duplicados automáticamente en el Snackbar
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
     // Buscar el registro correspondiente
     const registro = resultados.find(item => String(item.Corre) === String(id));
     if (!registro || registro.IdResponsable === undefined || registro.IdResponsable === null || registro.IdResponsable === '') {
       setSnackbarMsg('No se puede seleccionar: falta IdResponsable');
       setSnackbarVisible(true);
       return;
     }
     // Ya no se realiza la validación ni se muestra mensaje de advertencia al seleccionar registros
     setSeleccionados(prev =>
       prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
     );
   };

   const toggleExpandido = (id) => {
     setExpandido(prev => ({ ...prev, [id]: !prev[id] }));
   };

  const safe = v => {
    if (v === undefined || v === null) return '';
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Card style={styles.filtrosCard}>
          <View style={styles.filtrosRow}>
            <View style={{ flex: 1 }}>
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
                style={{ backgroundColor: '#fff', marginRight: 4, minHeight: 40 }}
                dense={true}
              />
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
            </View>
            <Button
              mode="contained"
              onPress={buscar}
              style={styles.searchButton}
              icon={({ size, color }) => (
                <View style={{ justifyContent: 'center', alignItems: 'center', width: 24, height: 24 }}>
                  <List.Icon icon="magnify" color="#fff" style={{ margin: 0, padding: 0 }} />
                </View>
              )}
              contentStyle={{ flexDirection: 'row-reverse', height: 36, justifyContent: 'center', alignItems: 'center' }}
              accessibilityLabel="Buscar"
            />
          </View>
          <View style={styles.tabsContainerRow}>
            <Button mode={tab === 'todos' ? 'contained' : 'outlined'} style={styles.tabButton} onPress={() => setTab('todos')}>
              <Text style={{color: tab === 'todos' ? '#fff' : '#7B3FF2', textAlign: 'center', fontSize: 13}}>Pendientes</Text>
            </Button>
            <Button mode={tab === 'seleccionados' ? 'contained' : 'outlined'} style={styles.tabButton} onPress={() => setTab('seleccionados')}>
              <Text style={{color: tab === 'seleccionados' ? '#fff' : '#7B3FF2', textAlign: 'center', fontSize: 13}}>Seleccionados</Text>
            </Button>
          </View>
        </Card>
        <Card style={styles.resultadosCard}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.seccionTitulo}>Resultados</Text>
            <Text style={styles.cantidadRegistros}>{`Registros: ${tab === 'todos' ? (Array.isArray(resultados) ? resultados.length : 0) : seleccionados.length}`}</Text>
          </View>
          <FlatList
            data={tab === 'todos' ? resultados : resultados.filter(item => seleccionados.includes(String(item.Corre)))}
            keyExtractor={(item) => {
              // Usar la concatenación de 'Corre' e 'IdSite' como key única
              return `${String(item.Corre)}_${String(item.IdSite)}`;
            }}
            renderItem={({ item }) => {
              // ...existing code...
              const uniqueId = String(item.Corre);
              return (
                <Card style={{ marginBottom: 12, padding: 8 }}>
                  {/* Check primero, luego Corre */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Checkbox
                        status={seleccionados.includes(uniqueId) ? 'checked' : 'unchecked'}
                        onPress={() => toggleSeleccion(uniqueId)}
                      />
                      <Text style={{ fontSize: 12, color: '#888', fontWeight: 'bold', marginLeft: 2 }}>Nro: {safe(item.Corre)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Button
                        mode="text"
                        onPress={() => toggleExpandido(uniqueId)}
                        compact={true}
                        style={{ minWidth: 110, height: 32, borderRadius: 16, paddingVertical: 0, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', marginRight: 2, borderWidth: 0, backgroundColor: 'transparent' }}
                        labelStyle={{ color: '#7B3FF2', fontSize: 12, lineHeight: 15, fontWeight: 'bold' }}
                      >
                        <Text style={{ color: '#7B3FF2', fontSize: 12, lineHeight: 15, fontWeight: 'bold' }}>{expandido[uniqueId] ? 'Ocultar' : 'Ver Detalle'}</Text>
                      </Button>
                      <Button
                        mode="text"
                        onPress={async () => {
                          setLoadingDatosOc(true);
                          setModalVisible(true);
                          // Guardar el registro completo para mostrar Total y Moneda
                          setParamsOc(item);
                          try {
                            // Extraer parámetros correctos del item
                            const idoc = safe(item.IdOc) || safe(item.idoc) || safe(item.OC) || safe(item.idOC) || '';
                            const fila = safe(item.Fila) || safe(item.fila) || '';
                            const IdSite = safe(item.IdSite) || safe(item.Site) || '';
                            const Tipo_Trabajo = safe(item.Tipo_Trabajo) || safe(item.TipoTrabajo) || safe(item.tipo_trabajo) || '';
                            const data = await getDatosOc({ idoc, fila, IdSite, Tipo_Trabajo });
                            setDatosOc(data);
                          } catch (e) {
                            setDatosOc({ error: true, message: 'No se pudo obtener datos de OC' });
                          }
                          setLoadingDatosOc(false);
                        }}
                        compact={true}
                        style={{ minWidth: 80, height: 32, borderRadius: 16, paddingVertical: 0, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 0, backgroundColor: 'transparent' }}
                        labelStyle={{ color: '#2196F3', fontSize: 12, lineHeight: 15, fontWeight: 'bold' }}
                      >
                        <Text style={{ color: '#2196F3', fontSize: 12, lineHeight: 15, fontWeight: 'bold' }}>Datos OC</Text>
                      </Button>
                    </View>
                  </View>
                  <View style={[styles.cell, { flexDirection: 'row', alignItems: 'center' }]}> 
                    <Text style={{marginRight: 12, fontSize: 13}}><Text style={styles.cellLabel}>Fecha:</Text> {safe(item.FecIngreso)}</Text>
                    <Text style={{marginRight: 12, fontSize: 13}}><Text style={styles.cellLabel}>Total:</Text> {safe(item.Subtotal)} {safe(item.Moneda)}</Text>
                  </View>
                  <View style={styles.cell}><Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Sol.:</Text> {safe(item.Solicitante)}</Text></View>
                  <View style={styles.cell}><Text style={{fontSize: 13}}>{safe(item.Responsable)}</Text></View>
                  {/* Mostrar Monto OC (SubOc) si existe */}
                  {item.SubOc !== undefined && item.SubOc !== null && item.SubOc !== '' && (
                    <View style={styles.cell}>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Monto OC:</Text> {safe(item.SubOc)} {safe(item.Moneda)}</Text>
                    </View>
                  )}
                  {expandido[uniqueId] && (
                    <View style={styles.detalleCard}>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Fecha:</Text> {safe(item.FecIngreso)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Detalle:</Text> {safe(item.Detalle)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Bien/Servicio:</Text> {safe(item.Bien)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Comprobante:</Text> {safe(item.Comprobante)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Gestor:</Text> {safe(item.Gestor)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Proyecto:</Text> {safe(item.nombreProyecto)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Site:</Text> {safe(item.Site)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Subtotal:</Text> {safe(item.Subtotal)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>IGV:</Text> {safe(item.IGV)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Estado:</Text> {safe(item.EstadoPla)}</Text>
                      <Text style={{fontSize: 13}}><Text style={styles.cellLabel}>Observación:</Text> {safe(item.Observacion)}</Text>
                      <Text style={{fontSize: 13, color: '#7B3FF2', fontWeight: 'bold'}}><Text style={styles.cellLabel}>Total del registro:</Text> {safe(item.Subtotal)}</Text>
                    </View>
                  )}
                </Card>
              );
            }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginVertical: 16 }}>No hay registros para mostrar.</Text>}
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
                  setAccionActual('aprobar');
                  setConfirmModalVisible(true);
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 13 }}>Aprobar recibo</Text>
              </Button>
              <Button
                mode="contained"
                disabled={seleccionados.length === 0}
                style={[
                  styles.actionButtonFull,
                  { backgroundColor: seleccionados.length === 0 ? '#BDBDBD' : '#F44336' }
                ]}
                onPress={() => {
                  setRechazoConfirmVisible(true);
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 13 }}>Rechazar</Text>
              </Button>
            </View>
            <View style={[styles.actionButtonsRow, { marginTop: 4 }]}> {/* Menos espacio vertical entre filas de botones */}
              <Button
                mode="contained"
                disabled={seleccionados.length === 0}
                style={[
                  styles.actionButtonFull,
                  { backgroundColor: seleccionados.length === 0 ? '#BDBDBD' : '#FF9800' }
                ]}
                onPress={() => {
                  setObservarConfirmVisible(true);
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 13 }}>Observar</Text>
              </Button>
              <Button
                mode="contained"
                disabled={seleccionados.length === 0}
                style={[
                  styles.actionButtonFull,
                  { backgroundColor: seleccionados.length === 0 ? '#BDBDBDBD' : '#2196F3' }
                ]}
                onPress={() => {
                  setAccionActual('regularizar');
                  setConfirmModalVisible(true);
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 13 }}>Regularizar</Text>
              </Button>
            </View>
          </View>
        )}
        <Portal>
          {/* Modal de confirmación para rechazar */}
          <Modal visible={rechazoConfirmVisible} onDismiss={() => setRechazoConfirmVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿Está seguro que desea rechazar los pagos seleccionados?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
              <Button mode="outlined" onPress={() => setRechazoConfirmVisible(false)}><Text>Cancelar</Text></Button>
              <Button mode="contained" style={{ marginLeft: 8 }} onPress={() => {
                setRechazoConfirmVisible(false);
                setAccionActual('rechazar');
                setConfirmModalVisible(true);
              }}><Text style={{ color: '#fff' }}>Sí, rechazar</Text></Button>
            </View>
          </Modal>
          {/* Modal de confirmación para observar */}
          <Modal visible={observarConfirmVisible} onDismiss={() => setObservarConfirmVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿Está seguro que desea observar los pagos seleccionados?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
              <Button mode="outlined" onPress={() => setObservarConfirmVisible(false)}><Text>Cancelar</Text></Button>
              <Button mode="contained" style={{ marginLeft: 8 }} onPress={() => {
                setObservarConfirmVisible(false);
                setAccionActual('observar');
                setConfirmModalVisible(true);
              }}><Text style={{ color: '#fff' }}>Sí, observar</Text></Button>
            </View>
          </Modal>
          {/* Modal de confirmación para aprobar/rechazar/observar/regularizar */}
          <Modal visible={confirmModalVisible} onDismiss={() => { setConfirmModalVisible(false); setObservacionInput(''); }} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {accionActual === 'aprobar' ? 'Confirmar aprobación' : accionActual === 'rechazar' ? 'Confirmar rechazo' : accionActual === 'regularizar' ? 'Confirmar regularización' : 'Confirmar observación'}
            </Text>
            {(accionActual === 'rechazar' || accionActual === 'observar') && (
              <TextInput
                label="Ingrese observación"
                value={observacionInput}
                onChangeText={setObservacionInput}
                multiline
                numberOfLines={3}
                style={{ marginBottom: 12, backgroundColor: '#fff', width: 300, maxWidth: '100%' }}
                maxLength={200}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
              <Button mode="outlined" onPress={() => { setConfirmModalVisible(false); setObservacionInput(''); }}><Text>Cancelar</Text></Button>
              <Button
                mode="contained"
                style={{ marginLeft: 8 }}
                onPress={async () => {
                  if ((accionActual === 'rechazar' || accionActual === 'observar') && !observacionInput.trim()) {
                    setSnackbarMsg('Debe ingresar una observación.');
                    setSnackbarVisible(true);
                    return;
                  }
                  setConfirmModalVisible(false);
                  let ipLocalMod = ipLocal;
                  if (!ipLocalMod) {
                    ipLocalMod = '192.168.0.1';
                  }
                  const seleccionadosData = resultados.filter(item => seleccionados.includes(String(item.Corre)));
                  let IdEstValue = 1;
                  if (accionActual === 'rechazar') IdEstValue = 3;
                  if (accionActual === 'observar') IdEstValue = 2;
                  const montoLimiteSoles = 2000;
                  const montoLimiteDolares = 530;
                  const paramsList = seleccionadosData.map(item => {
                    let IdEst = IdEstValue;
                    if (accionActual === 'aprobar') {
                      const monto = Number(item.Total);
                      const moneda = (item.Moneda || '').toUpperCase();
                      if ((moneda.includes('SOL') && monto > 2000) || (moneda.includes('DOL') && monto > 530)) {
                        IdEst = 6;
                      }
                    }
                    return {
                      ipLocal: String(ipLocalMod),
                      CorFil: parseInt(item.Corre, 10),
                      cIdSite: String(item.IdSite),
                      IdEst,
                      IdResponsable: item.IdResponsable !== undefined ? parseInt(item.IdResponsable, 10) : null,
                      txtOb: (accionActual === 'rechazar' || accionActual === 'observar') ? observacionInput : (item.Observacion !== undefined ? String(item.Observacion) : ''),
                      cIdRegularizar: accionActual === 'regularizar' ? 1 : 0
                    };
                  });
                  if (accionActual === 'aprobar' && paramsList.some(p => p.IdEst === 6)) {
                    setSnackbarMsg('Monto debe pasar por RE-APROBACION');
                    setSnackbarVisible(true);
                  }
                  (async () => {
                    let errores = [];
                    let sqlDebugsTemp = [];
                    for (const params of paramsList) {
                      try {
                        const resp = await aprobarPlanilla(params);
                        if (resp && resp.data && resp.data.sqlDebug) {
                          sqlDebugsTemp.push(`Corre ${params.CorFil}: ${resp.data.sqlDebug}`);
                          console.log(`SQL ejecutado para Corre ${params.CorFil}:`, resp.data.sqlDebug);
                        }
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
                      setSnackbarMsg(accionActual === 'aprobar' ? 'Aprobación exitosa.' : accionActual === 'rechazar' ? 'Rechazo exitoso.' : accionActual === 'regularizar' ? 'Regularización exitosa.' : 'Observación exitosa.');
                    } else {
                      setSnackbarMsg('Algunos registros no se procesaron: ' + errores.join('; '));
                    }
                    setSnackbarVisible(true);
                    cargarAprobaciones();
                  })();
                  setObservacionInput('');
                }}
              >
                <Text style={{ color: '#fff' }}>{accionActual === 'aprobar' ? 'Aprobar' : accionActual === 'rechazar' ? 'Rechazar' : accionActual === 'regularizar' ? 'Regularizar' : 'Observar'}</Text>
              </Button>
            </View>
          </Modal>
          {/* Modal Datos OC */}
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>Datos OC</Text>
            {loadingDatosOc && <ActivityIndicator animating size="large" style={{marginVertical: 16}} />}
            {!loadingDatosOc && datosOc && Array.isArray(datosOc) && datosOc.length > 0 && (
              datosOc.map((row, idx) => {
                // Buscar el registro original seleccionado para mostrar el Total
                let registroOriginal = null;
                if (paramsOc && paramsOc.Total !== undefined) {
                  registroOriginal = paramsOc;
                } else if (paramsOc && paramsOc.Corre && resultados && Array.isArray(resultados)) {
                  registroOriginal = resultados.find(r => String(r.Corre) === String(paramsOc.Corre));
                }
                return (
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
                    {registroOriginal && (
                      <>
                        <Text style={{fontWeight:'bold', color:'#7B3FF2', marginTop: 8}}>
                          <Text style={styles.cellLabel}>Total del registro:</Text> {registroOriginal.Subtotal} {registroOriginal.Moneda}
                        </Text>
                        {row.SubPlanilla !== undefined && !isNaN(Number(row.SubPlanilla)) && !isNaN(Number(registroOriginal.Subtotal)) && (
                          (() => {
                            const montoPagoFicticio = Number(row.SubPlanilla) + Number(registroOriginal.Subtotal);
                            const montoOc = Number(row.SubOc);
                            const color = montoPagoFicticio > montoOc ? 'red' : 'black';
                            return (
                              <Text style={{fontWeight:'bold', color, marginTop: 4}}>
                                <Text style={styles.cellLabel}>Monto Pago ficticio:</Text> {montoPagoFicticio} {registroOriginal.Moneda}
                              </Text>
                            );
                          })()
                        )}
                      </>
                    )}
                  </View>
                );
              })
            )}
            {!loadingDatosOc && datosOc && Array.isArray(datosOc) && datosOc.length === 0 && (
              <Text>No hay resultados para la OC.</Text>
            )}
            {!loadingDatosOc && datosOc && datosOc.error && (
              <Text style={{color: 'red'}}>Error: {datosOc.message}</Text>
            )}
            <Button mode="contained" onPress={() => setModalVisible(false)} style={{marginTop: 16}}><Text style={{ color: '#fff' }}>Cerrar</Text></Button>
          </Modal>
          {/* Snackbar */}
          {(() => { if (typeof snackbarMsg !== 'string') { console.warn('snackbarMsg no string:', snackbarMsg); } return null; })()}
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={2500}
            style={{backgroundColor: snackbarMsg && snackbarMsg.includes('exitosa') ? '#4CAF50' : '#F44336'}}
          >
            {safe(snackbarMsg)}
          </Snackbar>
          {/* Modal para mostrar SQL Debug */}
          <Modal visible={sqlDebugModalVisible} onDismiss={() => setSqlDebugModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>SQL ejecutado</Text>
            {sqlDebugs.length > 0 ? sqlDebugs.map((sql, idx) => (
              <Text key={idx} style={{marginBottom: 8, fontSize: 12, color: '#333'}}>{sql}</Text>
            )) : <Text>No hay SQL para mostrar.</Text>}
            <Button mode="contained" style={{marginTop: 12}} onPress={() => setSqlDebugModalVisible(false)}><Text style={{ color: '#fff' }}>Cerrar</Text></Button>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
    filtrosRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    tabsContainerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 0,
    },
    tabsContainer: {
      display: 'none', // Oculto, ya no se usa
    },
    tabButton: {
      marginHorizontal: 4,
      borderRadius: 8,
      minWidth: 100,
      height: 36,
      paddingVertical: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchButton: {
      minWidth: 36,
      width: 36,
      height: 36,
      borderRadius: 18,
      marginLeft: 4,
      backgroundColor: '#7B3FF2',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 0,
      paddingHorizontal: 0,
      elevation: 2,
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
    paddingVertical: 9,
    paddingHorizontal: 7,
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
