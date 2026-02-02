import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, DataTable, ActivityIndicator, Button, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { getReporteGastos } from '../api/ReporteGastos';
import { BarChart } from 'react-native-chart-kit';

export default function ReportePagosScreen() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getReporteGastos();
      console.log('Respuesta del backend (gastos):', res);
      if (res.error) throw new Error(res.message);
      setResultados(res.result || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // KPIs ejemplo
  const kpi = resultados.reduce(
    (acc, r) => {
      acc.Total += Number(r.Total || 0);
      acc.Gasto += Number(r.Gasto || 0);
      return acc;
    },
    { Total: 0, Gasto: 0 }
  );

  // Filtros por columna
  const columnas = resultados[0] ? Object.keys(resultados[0]) : [];
  const filtrar = (col, val) => {
    setFiltros({ ...filtros, [col]: val });
  };
  // Relacionar moneda seleccionada con símbolo
  const simboloPorMoneda = {
    SOLES: 'S/.',
    DOLARES: '$',
    EUROS: '€',
    'PESO DOMINICANO': 'RD$'
  };

  const resultadosFiltrados = resultados.filter(row => {
    let cumpleMoneda = true;
    if (monedaSeleccionada) {
      // Normalizar ambos valores para evitar problemas de mayúsculas/minúsculas y símbolos
      const normalizar = v => (v || '').toString().trim().toUpperCase().replace(/[^A-Z ]/g, '');
      cumpleMoneda = normalizar(row.Moneda) === normalizar(monedaSeleccionada);
    }
    return cumpleMoneda && Object.entries(filtros).every(([col, val]) =>
      !val || String(row[col]).toLowerCase().includes(String(val).toLowerCase())
    );
  });

  // Datos para gráfico: solo una moneda a la vez
  const monedas = Array.from(new Set(resultados.map(r => r.Moneda))).filter(Boolean);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState(monedas[0] || '');
  useEffect(() => {
    if (monedas.length && !monedaSeleccionada) setMonedaSeleccionada(monedas[0]);
  }, [monedas]);

  // Eje X: proyectos, Eje Y: valores (monto total por proyecto)
  // Eje X: solo proyectos, Eje Y: suma de valores por proyecto

  // Calcular los proyectos con mayor gasto (mayor subtotal) para la moneda seleccionada
  const proyectosConSubtotal = resultadosFiltrados
    .filter(r => r.Moneda === monedaSeleccionada)
    .reduce((acc, r) => {
      if (!acc[r.Proyecto]) acc[r.Proyecto] = 0;
      acc[r.Proyecto] += Number(r.Subtotal || 0);
      return acc;
    }, {});

  // Ordenar proyectos por subtotal descendente y tomar los 3 primeros
  const proyectosPorMoneda = Object.entries(proyectosConSubtotal)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([proyecto]) => proyecto);

  // Mostrar valores en miles
  const valoresPorProyecto = proyectosPorMoneda.map(proyecto => (proyectosConSubtotal[proyecto] || 0) / 1000);

  const chartData = {
    labels: proyectosPorMoneda, // Eje X: proyectos
    datasets: [
      {
        data: valoresPorProyecto, // Eje Y: valores
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.titulo}>Reporte de Gastos</Text> */}
      <Card style={styles.cardGrafico}>
        {/* <Text style={styles.graficoTitle}>Gráfico cruzado Proyecto-Cliente-Moneda</Text> */}
        <Picker
          selectedValue={monedaSeleccionada}
          onValueChange={setMonedaSeleccionada}
          style={{ marginVertical: 8 }}
        >
          {monedas.map(moneda => (
            <Picker.Item key={moneda} label={moneda} value={moneda} />
          ))}
        </Picker>
        <BarChart
          data={chartData}
          width={350}
          height={220}
          yAxisLabel="$"
          yAxisSuffix="K"
          chartConfig={{
            backgroundColor: '#e3f2fd',
            backgroundGradientFrom: '#e3f2fd',
            backgroundGradientTo: '#e3f2fd',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(123, 63, 242, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(44, 44, 44, ${opacity})`,
          }}
          style={{ marginVertical: 8 }}
        />
        {/* <Text style={{ fontSize: 12, marginTop: 4 }}>
          Selecciona la moneda para ver los totales por Proyecto-Cliente.
        </Text> */}
      </Card>
      <ScrollView style={{ flex: 1 }}>
        <Card style={styles.cardResultados}>
          <Text style={styles.resultadosTitle}>Resultados</Text>
          {loading ? (
            <ActivityIndicator animating size="large" style={{ marginVertical: 16 }} />
          ) : (
            <DataTable>
              <DataTable.Header>
                {columnas.map((col) => (
                  <DataTable.Title
                    key={col}
                    style={
                      col === 'Proyecto'
                        ? { minWidth: 180, maxWidth: 250, flex: 2 }
                        : col === 'Suma'
                        ? { minWidth: 120, maxWidth: 180, flex: 1, justifyContent: 'flex-end' }
                        : col === 'Moneda'
                        ? { minWidth: 24, maxWidth: 36, flex: 0.2, paddingHorizontal: 0 }
                        : undefined
                    }
                    numeric={col === 'Moneda' || col === 'Suma' || (col !== 'Moneda' && typeof row !== 'undefined' && typeof row[col] === 'number')}
                  >
                    <Text style={col === 'Suma' ? { textAlign: 'center', width: '100%' } : undefined}>
                      {col === 'Moneda' ? '' : col === 'Suma' ? 'Monto' : col}
                    </Text>
                  </DataTable.Title>
                ))}
              </DataTable.Header>
              {resultadosFiltrados.map((row, idx) => (
                <DataTable.Row key={idx}>
                  {columnas.map((col) => (
                    <DataTable.Cell
                      key={col}
                      numeric={col === 'Moneda' || col === 'Suma' || (col !== 'Moneda' && typeof row[col] === 'number')}
                      style={col === 'Suma' ? { justifyContent: 'flex-end' } : col === 'Moneda' ? { minWidth: 24, maxWidth: 36, paddingHorizontal: 0 } : undefined}
                    >
                      {col === 'Subtotal' && !isNaN(Number(row[col]))
                        ? Number(row[col]).toLocaleString('es-CO', { minimumFractionDigits: 0 })
                        : col === 'Suma' && !isNaN(Number(row[col]))
                        ? Number(row[col]).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : col === 'Moneda'
                        ? (row[col] === 'SOLES' ? 'S/.'
                            : row[col] === 'DOLARES' ? '$'
                            : row[col] === 'EUROS' ? '€'
                            : row[col] === 'PESO DOMINICANO' ? 'RD$'
                            : String(row[col]))
                        : String(row[col])}
                    </DataTable.Cell>
                  ))}
                </DataTable.Row>
              ))}
            </DataTable>
          )}
          {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
        </Card>
        <Button mode="contained" onPress={cargarDatos} style={styles.button}>
          Recargar
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  cardKpi: { margin: 12, padding: 16, backgroundColor: '#e3f2fd' },
  cardGrafico: { margin: 12, padding: 16 },
  cardResultados: { margin: 12, padding: 16 },
  kpiTitle: { fontWeight: 'bold', marginBottom: 8 },
  graficoTitle: { fontWeight: 'bold', marginBottom: 8 },
  resultadosTitle: { fontWeight: 'bold', marginBottom: 8 },
  button: { margin: 12 },
});
