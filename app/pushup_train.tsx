import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = 'http://192.168.1.5:5000'; // Replace with your computer's IP

export default function PushupTrain() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState('Position yourself for pushup');
  const [repCount, setRepCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [sessionId] = useState('user_' + Date.now());
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<number | null>(null);

  // Initialize session when component mounts
  useEffect(() => {
    initializeSession();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initializeSession = async () => {
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
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5, // Adjust quality as needed
          base64: true, // Ensure base64 encoding
        });

        console.log(`Photo captured, base64 length: ${photo.base64?.length ?? 0}`);

        const response = await fetch(`${API_BASE_URL}/analyze_frame`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            image: photo.base64, // Send the base64-encoded image
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          return;
        }

        const data = await response.json();
        console.log('Feedback from backend:', data.feedback);
        setFeedback(data.feedback);
        setRepCount(data.rep_count);
      } catch (error) {
        console.error('Error analyzing frame:', error);
      }
    }
  };

  const startAnalysis = () => {
    console.log('Starting analysis...');
    // Capture and analyze frames every 800ms (slightly slower for stability)
    intervalRef.current = setInterval(captureAndAnalyze, 800);
  };

  const stopAnalysis = () => {
    console.log('Stopping analysis...');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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
        console.log('Session reset successfully');
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
      // Start analysis after a short delay to let camera initialize
      setTimeout(startAnalysis, 1500);
    } else {
      stopAnalysis();
      setIsCameraOpen(false);
      setFeedback('Position yourself for pushup');
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

  return (
    <View style={styles.container}>
      {isCameraOpen ? (
        <CameraView 
          style={styles.camera} 
          facing="front"
          ref={cameraRef}
        >
          <View style={styles.overlay}>
            {/* Connection status */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {connectionStatus} | {isAnalyzing ? '🔍 Analyzing...' : '📷 Ready'}
              </Text>
            </View>

            {/* Rep counter */}
            <View style={styles.repContainer}>
              <Text style={styles.repCount}>Reps: {repCount}</Text>
            </View>

            {/* Feedback */}
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  connectionStatus: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
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
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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