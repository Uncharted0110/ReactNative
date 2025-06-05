import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function PlankStepsSheet({
  visible,
  onClose,
}: Readonly<{
  visible: boolean;
  onClose: () => void;
}>) {
  const [targetTime, setTargetTime] = useState('30');
  const [numSets, setNumSets] = useState('3');
  const [breakTime, setBreakTime] = useState('60');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={require('../assets/pushup_steps.png')}
              style={styles.plankImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>Instructions</Text>
            <View style={styles.steps}>
              <Text style={styles.step}>1. Start in a forearm plank position with elbows under shoulders and body in a straight line.</Text>
              <Text style={styles.step}>2. Engage your core and glutes, keeping your hips level.</Text>
              <Text style={styles.step}>3. Hold the position for the desired time, breathing steadily.</Text>
              <Text style={styles.step}>4. Avoid letting your hips sag or pike up.</Text>
              <Text style={styles.step}>5. Rest and repeat for the number of sets.</Text>
            </View>
            <View style={styles.optionsSection}>
              <Text style={styles.optionsLabel}>Target time each set (seconds):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={targetTime}
                onChangeText={setTargetTime}
                maxLength={3}
              />
              <Text style={styles.optionsLabel}>Number of sets:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={numSets}
                onChangeText={setNumSets}
                maxLength={2}
              />
              <Text style={styles.optionsLabel}>Break time (seconds):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={breakTime}
                onChangeText={setBreakTime}
                maxLength={3}
              />
            </View>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                onClose();
                // Use navigation instead of router.push for navigation
                // navigation.navigate('PlankTrain');
                // If using router, use a valid route or fallback
                // For now, just close the sheet
              }}
            >
              <Text style={styles.startButtonText}>Start Plank Training</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: height * 0.9,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  steps: {
    marginBottom: 24,
  },
  step: {
    fontSize: 16,
    marginBottom: 10,
  },
  optionsSection: {
    marginBottom: 24,
  },
  optionsLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginBottom: 4,
    width: 80,
    alignSelf: 'flex-start',
  },
  closeButton: {
    alignSelf: 'center',
    backgroundColor: '#ff6b35',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  plankImage: {
    width: '100%',
    height: 140,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff4e6',
  },
  startButton: {
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 10,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
