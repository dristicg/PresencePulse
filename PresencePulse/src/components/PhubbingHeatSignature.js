import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { getHeatSignatureData } from '../database/databaseService';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 60) / 6;

// Logic provided by user
function getPhubbingHeatScore(hourData) {
  return (hourData.micro_check_count * 1) + 
         (hourData.phubbing_count * 3) + 
         (hourData.burst_count * 2);
}

function getHeatColor(score) {
  if (score === 0) return '#E8F4FD';
  if (score <= 5) return '#AED6F1';
  if (score <= 15) return '#F7DC6F';
  if (score <= 30) return '#FF7043';
  return '#C0392B';
}

function getInterpretation(score) {
  if (score === 0) return "All clear — no concerning activity";
  if (score <= 5) return "Light activity — mostly harmless";
  if (score <= 15) return "Moderate drift — worth being aware";
  if (score <= 30) return "High distraction window";
  return "Critical phubbing zone — your worst hour";
}

const PhubbingHeatSignature = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getHeatSignatureData();
      setData(result);
    } catch (error) {
      console.error('HeatSignature fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Analyzing heat signatures...</Text>
      </View>
    );
  }

  const hasData = data.some(h => (h.micro_check_count + h.phubbing_count + h.burst_count) > 0);
  
  if (!hasData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Not enough data yet</Text>
        <Text style={styles.emptySubtitle}>Keep tracking for 2–3 days to unlock your weight signature.</Text>
      </View>
    );
  }

  // Find hottest hour
  let maxScore = -1;
  let hottestHour = -1;
  data.forEach(h => {
    const score = getPhubbingHeatScore(h);
    if (score > maxScore) {
      maxScore = score;
      hottestHour = h.hour;
    }
  });

  const formatHour = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}${ampm}`;
  };

  const renderCell = (hourItem) => {
    const score = getPhubbingHeatScore(hourItem);
    const bgColor = getHeatColor(score);
    const hasGlow = score > 15;

    return (
      <TouchableOpacity
        key={hourItem.hour}
        style={[
          styles.cell,
          { backgroundColor: bgColor },
          hasGlow && {
            shadowColor: bgColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 8,
          }
        ]}
        onPress={() => setSelectedHour(hourItem)}
      >
        <Text style={[styles.cellText, score > 30 && { color: '#FFF' }]}>
          {formatHour(hourItem.hour)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.summaryLine}>
        Your hottest hour is <Text style={styles.bold}>{formatHour(hottestHour)}</Text>
      </Text>

      <View style={styles.grid}>
        {data.map(renderCell)}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#E8F4FD'}]} /><Text style={styles.legendText}>Cool</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#F7DC6F'}]} /><Text style={styles.legendText}>Moderate</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#FF7043'}]} /><Text style={styles.legendText}>Hot</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#C0392B'}]} /><Text style={styles.legendText}>Critical</Text></View>
      </View>

      <Modal
        visible={!!selectedHour}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedHour(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setSelectedHour(null)}
        >
          <View style={styles.modalContent}>
            {selectedHour && (
              <>
                <Text style={styles.modalTitle}>
                  {formatHour(selectedHour.hour)}:00 — {formatHour((selectedHour.hour + 1) % 24)}:00
                </Text>
                
                <View style={styles.modalStatRow}>
                  <Text style={styles.modalStatLabel}>Micro-checks:</Text>
                  <Text style={styles.modalStatValue}>{selectedHour.micro_check_count} times</Text>
                </View>

                <View style={styles.modalStatRow}>
                  <Text style={styles.modalStatLabel}>While with others:</Text>
                  <Text style={styles.modalStatValue}>{selectedHour.phubbing_count} times</Text>
                </View>

                <View style={styles.modalStatRow}>
                  <Text style={styles.modalStatLabel}>Burst events:</Text>
                  <Text style={styles.modalStatValue}>{selectedHour.burst_count} times</Text>
                </View>

                <View style={[styles.modalStatRow, { marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 }]}>
                  <Text style={[styles.modalStatLabel, {fontWeight: '900'}]}>Heat Score:</Text>
                  <Text style={[styles.modalStatValue, {fontWeight: '900', color: getHeatColor(getPhubbingHeatScore(selectedHour))}]}>
                    {getPhubbingHeatScore(selectedHour)}
                  </Text>
                </View>

                <Text style={styles.interpretationText}>
                  {getInterpretation(getPhubbingHeatScore(selectedHour))}
                </Text>

                <TouchableOpacity 
                  style={styles.closeBtn} 
                  onPress={() => setSelectedHour(null)}
                >
                  <Text style={styles.closeBtnText}>DONE</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  center: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#71717A',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 30,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2B2B',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7D7D7D',
    textAlign: 'center',
    marginTop: 8,
  },
  summaryLine: {
    fontSize: 15,
    marginBottom: 15,
    color: '#2B2B2B',
    fontWeight: '500',
  },
  bold: {
    fontWeight: '900',
    color: '#7C3AED',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#444',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#7D7D7D',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    elevation: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2B2B2B',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalStatLabel: {
    fontSize: 14,
    color: '#7D7D7D',
    fontWeight: '600',
  },
  modalStatValue: {
    fontSize: 14,
    color: '#2B2B2B',
    fontWeight: '800',
  },
  interpretationText: {
    marginTop: 20,
    fontSize: 15,
    fontStyle: 'italic',
    color: '#444',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  closeBtn: {
    marginTop: 25,
    backgroundColor: '#2B2B2B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default PhubbingHeatSignature;
