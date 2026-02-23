import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, TextInput, Button, List } from 'react-native-paper';
import { getSolicitantes } from '../api/solicitantes';
import { getOcPorEnvio } from '../api/oc';

export default function OcScreen() {
  const [filtroSolicitante, setFiltroSolicitante] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [solicitantes, setSolicitantes] = useState([]);
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [activeTab, setActiveTab] = useState('1era');
  const [detallePorPestana, setDetallePorPestana] = useState({
    '1era': [],
    '2da': [],
    '3era': [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  const buscar = async () => {
    setShowSuggestions(false);
    await cargarDetallePorPestana(activeTab);
  };

  const getEnvioByTab = (tab) => {
    if (tab === '1era') return 'AP1';
    if (tab === '2da') return 'AP2';
    if (tab === '3era') return 'AP3';
    return 'AP1';
  };

  const cargarDetallePorPestana = async (tab) => {
    const envio = getEnvioByTab(tab);
    setLoading(true);
    const data = await getOcPorEnvio(envio);
    setDetallePorPestana((prev) => ({
      ...prev,
      [tab]: Array.isArray(data) ? data : [],
    }));
    setLoading(false);
  };

  useEffect(() => {
    cargarDetallePorPestana(activeTab);
  }, [activeTab]);

  const data = useMemo(() => {
    const current = detallePorPestana[activeTab] || [];
    if (!filtroSolicitante) return current;
    return current.filter((item) =>
      JSON.stringify(item || {})
        .toLowerCase()
        .includes(String(filtroSolicitante).toLowerCase())
    );
  }, [detallePorPestana, activeTab, filtroSolicitante]);

  return (
    <View style={styles.container}>
      <Card style={styles.filtrosCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Filtros</Text>
          <View style={styles.filtrosRow}>
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
                style={{ backgroundColor: '#fff', marginRight: 4, minHeight: 32, height: 32 }}
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
              onPress={buscar}
              style={styles.searchButton}
              icon="magnify"
              contentStyle={{ flexDirection: 'row-reverse', height: 36 }}
              accessibilityLabel="Buscar"
            />
          </View>
          <TextInput
            label="Proyecto"
            value={filtroProyecto}
            onChangeText={setFiltroProyecto}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { background: '#FFFFFF' } }}
          />
          <Button mode="contained">Buscar</Button>
        </Card.Content>
      </Card>

      <Card style={styles.detallesCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Detalles</Text>

          <View style={styles.tabsRow}>
            <Button
              mode={activeTab === '1era' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('1era')}
              style={styles.tabButton}
            >
              1era Ap.
            </Button>
            <Button
              mode={activeTab === '2da' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('2da')}
              style={styles.tabButton}
            >
              2da Ap.
            </Button>
            <Button
              mode={activeTab === '3era' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('3era')}
              style={styles.tabButton}
            >
              3era Ap.
            </Button>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item, index) =>
              String(item?.IdOC || item?.id || item?.Id || `${activeTab}-${index}`)
            }
            renderItem={({ item }) => (
              <Card style={styles.itemCard}>
                <Card.Content>
                  <Text style={styles.itemTitle}>{String(item?.NroOc || item?.OC || item?.oc || 'OC')}</Text>
                  <Text>{String(item?.Solicitante || item?.NombreEmpleado || item?.Estado || 'Sin detalle')}</Text>
                </Card.Content>
              </Card>
            )}
            ListEmptyComponent={<Text>{loading ? 'Cargando...' : 'No hay datos para esta pestaña.'}</Text>}
          />
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filtrosCard: { marginBottom: 12 },
  filtrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
    minHeight: 36,
    paddingVertical: 2,
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
  detallesCard: { flex: 1 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 10 },
  input: { marginBottom: 10 },
  tabsRow: { flexDirection: 'row', marginBottom: 12 },
  tabButton: { marginRight: 8 },
  itemCard: { marginBottom: 8 },
  itemTitle: { fontWeight: 'bold', marginBottom: 4 },
});
