import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlankCamera() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [feedback, setFeedback] = useState("Initializing...");
  const [cumulativeTime, setCumulativeTime] = useState(0);
  const [sending, setSending] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const timerIntervalRef = useRef(null);

  // Send camera frames every second while permission granted and running
  useEffect(() => {
    let captureInterval;

    if (permission?.granted && isRunning && !isEnded) {
      captureInterval = setInterval(async () => {
        if (cameraRef.current && !sending) {
          try {
            setSending(true);
            const photo = await cameraRef.current.takePictureAsync({ base64: true });

            const response = await fetch('http://192.168.1.5:5001/plank', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: photo.base64 }),
            });

            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            setFeedback(result.feedback || "No feedback");
          } catch (err) {
            setFeedback("Error sending frame: " + err.message);
          } finally {
            setSending(false);
          }
        }
      }, 1000);
    }

    return () => {
      if (captureInterval) clearInterval(captureInterval);
    };
  }, [permission, sending, isRunning, isEnded]);

  // Timer increments only if isRunning AND feedback includes 'good plank' and not ended
  useEffect(() => {
    if (isRunning && !isEnded && feedback.toLowerCase().includes('good plank')) {
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          setCumulativeTime((time) => time + 0.1);
        }, 100);
      }
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [feedback, isRunning, isEnded]);

  const toggleRunning = () => {
    if (isEnded) return; // Prevent toggling after ended
    setIsRunning((prev) => !prev);
    setFeedback((prev) => (isRunning ? "Analysis paused." : "Resumed analysis."));
  };

  const handleEnd = async () => {
    // Stop analysis and timer
    setIsRunning(false);
    setIsEnded(true);
    setFeedback("Sending final time...");

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    try {
      const response = await fetch('http://192.168.1.5:5001/plank/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final_time: cumulativeTime }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setFeedback(result.message || "Final time sent successfully!");
    } catch (err) {
      setFeedback("Error sending final time: " + err.message);
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
      <CameraView
        style={styles.camera}
        facing="front"
        ref={cameraRef}
        enableZoomGesture
        flash="off"
      />
      <View style={styles.feedbackBox}>
        <Text style={styles.feedbackText}>{feedback}</Text>
        <Text style={styles.timer}>⏱️ {cumulativeTime.toFixed(1)} s</Text>
        {sending && <ActivityIndicator color="#fff" />}
        {!isEnded && (
          <>
            <TouchableOpacity style={styles.toggleButton} onPress={toggleRunning}>
              <Text style={styles.buttonText}>{isRunning ? "Stop" : "Resume"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endButton} onPress={handleEnd}>
              <Text style={styles.buttonText}>End</Text>
            </TouchableOpacity>
          </>
        )}
        {isEnded && (
          <Text style={{ color: '#FFD700', marginTop: 10, textAlign: 'center' }}>
            Analysis ended.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  feedbackBox: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#000000cc',
    padding: 16,
    borderRadius: 10,
    width: '80%',
  },
  feedbackText: { color: 'white', fontSize: 16, marginBottom: 6 },
  timer: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  message: { fontSize: 16, textAlign: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  toggleButton: { marginTop: 12, backgroundColor: '#FF4500', padding: 10, borderRadius: 8 },
  endButton: { marginTop: 12, backgroundColor: '#32CD32', padding: 10, borderRadius: 8 },
});
