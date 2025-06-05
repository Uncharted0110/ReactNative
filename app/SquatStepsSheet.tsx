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

export default function SquatStepsSheet({
  visible,
  onClose,
}: Readonly<{
  visible: boolean;
  onClose: () => void;
}>) {
  const [targetReps, setTargetReps] = useState('12');
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
              source={require('../assets/squats_steps.png')}
              style={styles.squatImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>Instructions</Text>
            <View style={styles.steps}>
              <Text style={styles.step}>1. Stand with feet shoulder-width apart, toes slightly turned out.</Text>
              <Text style={styles.step}>2. Keep your chest up and back straight.</Text>
              <Text style={styles.step}>3. Lower your body by bending your knees and hips, as if sitting back into a chair.</Text>
              <Text style={styles.step}>4. Go down until your thighs are parallel to the floor.</Text>
              <Text style={styles.step}>5. Push through your heels to return to the starting position.</Text>
            </View>
            <View style={styles.optionsSection}>
              <Text style={styles.optionsLabel}>Targeted reps each set:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={targetReps}
                onChangeText={setTargetReps}
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
                // navigation.navigate('SquatTrain');
                // If using router, use a valid route or fallback
                // For now, just close the sheet
              }}
            >
              <Text style={styles.startButtonText}>Start Squat Training</Text>
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
    backgroundColor: '#2c3e50',
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
    color: '#ffffff',
  },
  steps: {
    marginBottom: 24,
  },
  step: {
    fontSize: 16,
    marginBottom: 10,
    color: '#ecf0f1',
  },
  optionsSection: {
    marginBottom: 24,
  },
  optionsLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#ecf0f1',
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
    color: '#ffffff',
    backgroundColor: '#34495e', // Darker background for input
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
  squatImage: {
    width: '100%',
    height: 140,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#96ccff',
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
