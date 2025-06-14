import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech'; // <-- Add Speech import
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = 'http://192.168.164.193:5000'; // Replace with your computer's IP

export default function PushupTrain() {
  // --- Get params from navigation ---
  const { reps, sets, breakTime } = useLocalSearchParams<{ reps?: string; sets?: string; breakTime?: string }>();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState('Position yourself for pushup');
  const [previousFeedback, setPreviousFeedback] = useState(''); // <-- Track previous feedback
  const [repCount, setRepCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [sessionId] = useState('user_' + Date.now());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true); // <-- Audio toggle state
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<number | null>(null);
  const isCapturingRef = useRef(false); // Prevent overlapping captures
  const [startTime, setStartTime] = useState<number | null>(null);

  // Initialize session when component mounts
  useEffect(() => {
    initializeSession();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Stop any ongoing speech when component unmounts
      Speech.stop();
    };
  }, []);

  // <-- Audio feedback effect - only speaks when feedback changes
  useEffect(() => {
    if (feedback && feedback !== previousFeedback && isAudioEnabled && isCameraOpen) {
      // Only speak if feedback has actually changed and audio is enabled
      speakFeedback(feedback);
      setPreviousFeedback(feedback);
    }
  }, [feedback, isAudioEnabled, isCameraOpen]);

  // <-- Speech function
  const speakFeedback = (text: string) => {
    // Stop any current speech before starting new one
    Speech.stop();
    
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9, // Slightly slower for better comprehension
      volume: 0.8,
    });
  };

  // <-- Toggle audio function
  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (!isAudioEnabled) {
      // If turning audio on, speak current feedback
      if (feedback && isCameraOpen) {
        speakFeedback(feedback);
      }
    } else {
      // If turning audio off, stop current speech
      Speech.stop();
    }
  };

  const initializeSession = async () => {
    setStartTime(Date.now());

    try {
      setConnectionStatus('Connecting...');
      const response = await fetch(`${API_BASE_URL}/start_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Session initialized:', result);
      setConnectionStatus('Connected');
    } catch (error) {
      console.error('Error initializing session:', error);
      setConnectionStatus('Connection Failed');
      Alert.alert('Error', 'Failed to connect to pose detection service. Check your server and IP address.');
    }
  };

  const captureAndAnalyze = async () => {
    // Prevent overlapping captures
    if (isCapturingRef.current || !cameraRef.current) {
      return;
    }

    try {
      isCapturingRef.current = true;
      setIsAnalyzing(true);

      // Optimized capture settings to reduce flash
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3, // Lower quality for faster processing
        base64: true,
        skipProcessing: true, // Skip post-processing for speed
        exif: false, // Don't include EXIF data
      });

      console.log(`Photo captured, base64 length: ${photo.base64?.length ?? 0}`);

      const response = await fetch(`${API_BASE_URL}/analyze_frame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          image: photo.base64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        return;
      }

      const data = await response.json();
      console.log('Feedback from backend:', data.feedback);
      setFeedback(data.feedback); // This will trigger the useEffect for audio
      setRepCount(data.rep_count);
    } catch (error) {
      console.error('Error analyzing frame:', error);
    } finally {
      isCapturingRef.current = false;
      setIsAnalyzing(false);
    }
  };

  const startAnalysis = () => {
    console.log('Starting analysis...');
    // Reset previous feedback when starting analysis
    setPreviousFeedback('');
    // Increased interval to 1200ms to reduce frequency and flashing
    intervalRef.current = setInterval(captureAndAnalyze, 1200);
  };

  const stopAnalysis = () => {
    console.log('Stopping analysis...');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isCapturingRef.current = false;
    setIsAnalyzing(false);
    // Stop speech when stopping analysis
    Speech.stop();
  };

  const resetSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reset_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (response.ok) {
        setRepCount(0);
        setFeedback('Position yourself for pushup');
        setPreviousFeedback(''); // Reset previous feedback
        console.log('Session reset successfully');
        // Stop any ongoing speech
        Speech.stop();
      }
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/debug_session`);
      const result = await response.json();
      console.log('Debug info:', result);
      Alert.alert('Debug Info', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Debug test failed:', error);
      Alert.alert('Debug Error', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const toggleCamera = async () => {
    if (!isCameraOpen) {
      if (!permission?.granted) {
        const response = await requestPermission();
        if (!response.granted) {
          Alert.alert(
            'Camera Permission Required',
            'Please grant camera permission to use this feature.'
          );
          return;
        }
      }

      setIsCameraOpen(true);
      // Longer delay to let camera fully initialize
      setTimeout(startAnalysis, 2000);
    } else {
      // When closing, end the session as well
      await endSession();
      stopAnalysis();
      setIsCameraOpen(false);
      setFeedback('Position yourself for pushup');
      setPreviousFeedback(''); // Reset previous feedback
    }
  };

  const endSession = async () => {
    const endTime = Date.now();
    const timeTaken = startTime ? Math.floor((endTime - startTime) / 1000) : 0; // in seconds
    try {
      const response = await fetch('http://192.168.1.5:5000/end_session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: 'adityakl1509@gmail.com', // Make sure you have userId available in your component
          workout_name: 'pushup',
          time_taken: timeTaken, // Calculate or track this as needed
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Session ended:', data);
      } else {
        console.error('Failed to end session:', data.message);
      }
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera access is required.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Workout summary UI ---
  const WorkoutSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Target Reps</Text>
        <Text style={styles.summaryValue}>{reps || 10}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Sets</Text>
        <Text style={styles.summaryValue}>{sets || 3}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Break (s)</Text>
        <Text style={styles.summaryValue}>{breakTime || 60}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Show workout summary at the top */}
      {!isCameraOpen && <WorkoutSummary />}
      {isCameraOpen ? (
        <CameraView
          style={styles.camera}
          facing="front"
          ref={cameraRef}
          animateShutter={false}
          enableTorch={false}
        >
          <View style={styles.overlay}>
            {/* Connection status */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {connectionStatus} | {isAnalyzing ? '🔍 Analyzing...' : '📷 Ready'}
              </Text>
            </View>

            {/* Audio toggle button */}
            <TouchableOpacity
              style={[styles.audioToggle, { backgroundColor: isAudioEnabled ? 'rgba(0,255,0,0.8)' : 'rgba(255,0,0,0.8)' }]}
              onPress={toggleAudio}
            >
              <Text style={styles.audioToggleText}>
                {isAudioEnabled ? '🔊' : '🔇'}
              </Text>
            </TouchableOpacity>

            {/* Rep counter */}
            <View style={styles.repContainer}>
              <Text style={styles.repCount}>Reps: {repCount}</Text>
            </View>

            {/* Feedback */}
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>

            {/* Analysis indicator */}
            {isAnalyzing && (
              <View style={styles.analyzingIndicator}>
                <View style={styles.pulse} />
              </View>
            )}

            {/* Controls */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={resetSession}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.debugButton]}
                onPress={testConnection}
              >
                <Text style={styles.buttonText}>Debug</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={toggleCamera}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      ) : (
        <>
          <Text style={styles.title}>Pushup Training</Text>
          <Text style={styles.message}>
            AI-powered form analysis with real-time feedback!
          </Text>
          <Text style={styles.connectionStatus}>
            Status: {connectionStatus}
          </Text>
          
          {/* Audio toggle for main screen */}
          <View style={styles.audioControlContainer}>
            <TouchableOpacity
              style={[styles.audioControlButton, { backgroundColor: isAudioEnabled ? '#4CAF50' : '#F44336' }]}
              onPress={toggleAudio}
            >
              <Text style={styles.audioControlText}>
                {isAudioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={toggleCamera}>
            <Text style={styles.buttonText}>Start Training</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.debugButton]}
            onPress={testConnection}
          >
            <Text style={styles.buttonText}>Test Connection</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    // Remove alignItems/justifyContent so content can scroll if needed
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff4e6',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 18,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#ff6b35',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 10,
  },
  connectionStatus: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  // <-- New audio control styles
  audioControlContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  audioControlButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  audioControlText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  audioToggle: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  audioToggleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 20,
  },
  statusContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  repContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'rgba(0,255,0,0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
  repCount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  analyzingIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 12,
    height: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
  },
  pulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
    opacity: 0.8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#FF9500',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
  },
  debugButton: {
    backgroundColor: '#8E44AD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});