import { useRouter } from 'expo-router';
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

export default function PushupStepsSheet({
  visible,
  onClose,
}: Readonly<{
  visible: boolean;
  onClose: () => void;
}>) {
  const [targetReps, setTargetReps] = useState('10');
  const [numSets, setNumSets] = useState('3');
  const [breakTime, setBreakTime] = useState('60');
  const router = useRouter();

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
              style={styles.pushupImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>Instructions</Text>
            <View style={styles.steps}>
              <Text style={styles.step}>1. Start in a high plank position with your hands flat on the floor, shoulder-width apart.</Text>
              <Text style={styles.step}>2. Keep your body in a straight line from head to heels.</Text>
              <Text style={styles.step}>3. Lower your body until your chest nearly touches the floor.</Text>
              <Text style={styles.step}>4. Pause, then push yourself back up to the starting position.</Text>
              <Text style={styles.step}>5. Repeat for the desired number of repetitions.</Text>
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
                router.push('/pushup_train');
              }}
            >
              <Text style={styles.startButtonText}>Start Pushup Training</Text>
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
    backgroundColor: '(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#2c3e50',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: height * 0.9, // allow scrolling if needed
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
  pushupImage: {
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
