import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LottieView from 'lottie-react-native';
import React, { useContext, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RadarChart from '../RadarComponent';

import { UserContext } from '../_layout';

import PushupTrain from '../pushup_train';
import PushupStepsSheet from '../PushupStepsSheet'; // Import the new bottom sheet component

import Constants from 'expo-constants';
import TwistsTrain from '../twists_train';
import TwistsStepsSheet from '../TwistsStepsSheet';

// Define WorkoutSummaryItem type for type safety
type WorkoutSummaryItem = {
  workout_name?: string;
  total_reps?: number;
};

interface MuscleGroupData {
  chest: number;
  bicep: number;
  leg: number;
  glutes: number;
  abs: number;
  back: number;
  tricep: number;
}

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

function Dashboard({ navigation }: { navigation: any }) {
  // State for dynamic stats
  const [workoutData, setWorkoutData] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const { email, username } = useContext(UserContext);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [activeDays, setActiveDays] = useState<number>(0);
  const [showWorkoutData, setShowWorkoutData] = useState(false);
  const [stickmanAnim] = useState(new Animated.Value(0));
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayData, setOverlayData] = useState<{ date: string, summary: any[] } | null>(null);

  const IP_ADDR = Constants.expoConfig?.extra?.IP_ADDR;


  // Stickman animation effect
  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(stickmanAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      stickmanAnim.stopAnimation();
      stickmanAnim.setValue(0);
    }
  }, [loading]);

  // Fetch workout summary from backend
  const fetchWorkoutSummary = async () => {
    if (!email) return;
    try {
      const res = await fetch(`http://${IP_ADDR}:3000/api/workout-summary?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok) {
        setTotalSessions(data.total_sessions || 0);
        setActiveDays(data.active_days || 0);

        if (data.recent_workouts) {
          const muscleData = calculateMuscleGroupData(data.recent_workouts);
          setMuscleGroupData(muscleData);
        }
      } else {
        console.error("in else block", data);
        setTotalSessions(0);
        setActiveDays(0);
        setMuscleGroupData({
          chest: 1000, bicep: 0, leg: 0, glutes: 0, abs: 0, back: 0, tricep: 0
        });
      }
    } catch (err) {
      console.error('Error fetching workout summary:', err);
      setTotalSessions(0);
      setActiveDays(0);
      setMuscleGroupData({
        chest: 1000, bicep: 0, leg: 0, glutes: 0, abs: 0, back: 0, tricep: 0
      });
    }
  };

  // Fetch all days' total reps for the current month
  const fetchAllDaysWorkoutData = async () => {
    if (!email) return;
    setLoading(true);
    const currentDate = new Date();
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const daysInMonth = new Date(yyyy, currentDate.getMonth() + 1, 0).getDate();
    const newWorkoutData: Record<number, number> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dd = String(day).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      try {
        const res = await fetch(
          `http://${IP_ADDR}:3000/api/workouts?email=${encodeURIComponent(email)}&date=${dateStr}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          newWorkoutData[day] = 0;
          continue;
        }
        const data = await res.json();

        // Combine all reps for the day (use total_reps, not reps)
        if (res.ok && data.summary && Array.isArray(data.summary) && data.summary.length > 0) {
          const totalReps = data.summary.reduce(
            (sum: number, workout: { total_reps?: number }) => sum + (workout.total_reps || 0),
            0
          );
          newWorkoutData[day] = totalReps;
        } else {
          newWorkoutData[day] = 0;
        }
      } catch (err) {
        newWorkoutData[day] = 0;
      }
    }
    setWorkoutData(newWorkoutData);
    setLoading(false);
  };

  const [muscleGroupData, setMuscleGroupData] = useState<MuscleGroupData>({
    chest: 0,
    bicep: 0,
    leg: 0,
    glutes: 0,
    abs: 0,
    back: 0,
    tricep: 0,
  });

  const calculateMuscleGroupData = (workoutSummary: WorkoutSummaryItem[]): MuscleGroupData => {
    const muscleData: MuscleGroupData = {
      chest: 100,
      bicep: 0,
      leg: 0,
      glutes: 0,
      abs: 0,
      back: 0,
      tricep: 0,
    };

    // Calculate based on workout types
    workoutSummary.forEach((workout: WorkoutSummaryItem) => {
      const reps = workout.total_reps || 0;
      const intensity = Math.min(reps / 2, 100); // Scale reps to percentage (adjust as needed)

      switch (workout.workout_name?.toLowerCase()) {
        case 'pushup':
        case 'pushups':
          muscleData.chest = 10;
          muscleData.tricep;
          break;
        case 'russian twists':
        case 'twists':
          muscleData.abs;
          break;
        case 'squats':
          muscleData.leg;
          muscleData.glutes;
          break;
        case 'plank':
          muscleData.abs;
          muscleData.back;
          break;
        case 'pull-ups':
        case 'pullups':
          muscleData.back;
          muscleData.bicep;
          break;
        default:
          // Generic workout - distribute across all muscle groups
          (Object.keys(muscleData) as Array<keyof MuscleGroupData>).forEach((key) => {
            muscleData[key] += intensity * 0.1;
          });
      }
    });

    // Cap values at 100
    (Object.keys(muscleData) as Array<keyof MuscleGroupData>).forEach((key) => {
      muscleData[key] = Math.min(muscleData[key], 100);
    });

    return muscleData;
  };

  // Fetch summary and daily reps on mount and when email changes
  React.useEffect(() => {
    fetchWorkoutSummary();
    fetchAllDaysWorkoutData();
  }, [email]);

  // Fetch workout details for a specific date and show overlay
  const handleDayPress = async (dateStr: string) => {
    if (!email) {
      Alert.alert('Error', 'No user email found');
      return;
    }
    try {
      const res = await fetch(
        `http://${IP_ADDR}:3000/api/workouts?email=${encodeURIComponent(email)}&date=${dateStr}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setOverlayData({ date: dateStr, summary: [] });
        setOverlayVisible(true);
        return;
      }
      const data = await res.json();
      setOverlayData({ date: dateStr, summary: Array.isArray(data.summary) ? data.summary : [] });
      setOverlayVisible(true);
    } catch (err) {
      setOverlayData({ date: dateStr, summary: [] });
      setOverlayVisible(true);
    }
  };

  const getCurrentMonth = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[new Date().getMonth()];
  };

  const getDaysInMonth = () => {
    const currentDate = new Date();
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  };

  const getIntensityColor = (workoutCount: number) => {
    if (workoutCount === 0) return '#8da9c4';         // No workout
    if (workoutCount <= 20) return '#ffcc80';          // Light: 1-20 reps
    if (workoutCount <= 55) return '#ff9800';          // Moderate: 21-55 reps
    if (workoutCount > 55) return '#f57c00';           // Intense: 56+ reps
    return '#e8e8e8';
  };

  // Modified renderCalendar to make each day clickable
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const currentDate = new Date();
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const workoutCount = workoutData[day] || 0;
      const color = getIntensityColor(workoutCount);
      const dd = String(day).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayBox, { backgroundColor: color }]}
          onPress={() => handleDayPress(dateStr)}
        >
          <Text style={styles.dayText}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#152238' }}>
        <LottieView
          source={require('../../assets/bottle.json')}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ flexGrow: 1, backgroundColor: '#152238' }}>
      <View style={[styles.container, { flex: 1 }]}>{/* Ensure flex: 1 on main container */}
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              Hi {username ? username : 'User'}! 👋
            </Text>
            <Text style={styles.subGreeting}>Ready to crush your goals?</Text>
          </View>
          <TouchableOpacity
            style={styles.workoutButton}
            onPress={() => navigation.navigate('WorkoutSelection')}
          >
            <Text style={styles.workoutButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Daily Exercise Tracker</Text>
          <Text style={styles.monthTitle}>{getCurrentMonth()} 2024</Text>

          {/* Summary Stats */}
          <View style={styles.summaryRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{activeDays}</Text>
              <Text style={styles.statLabel}>Active Days</Text>
            </View>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </View>
        </View>

        {/* Radar Chart Section - ADD THIS */}
        <View style={{ backgroundColor: '#2c3e50', borderRadius: 15, padding: 16, marginTop: 20, marginBottom: 20 }}>
          <RadarChart
            email="adityakl1509@gmail.com"
            apiUrl={`http://${IP_ADDR}:3000`}
            maxValue={170}
            size={300}
          />
        </View>

        {/* Overlay for workout details */}
        {overlayVisible && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'flex-end',
            alignItems: 'center',
            zIndex: 100,
            paddingBottom: 150, // <-- optional
          }}>
            <View style={{
              backgroundColor: '#1a2236', // Changed from '#fff' to dark
              borderRadius: 18,
              padding: 24,
              width: '85%',
              maxWidth: 350,
              alignItems: 'center',
              elevation: 8,
            }}>
              {overlayData && overlayData.summary.length > 0 ? (
                overlayData.summary.map((item, idx) => (
                  <View key={idx} style={{ alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6 }}>
                      <Image
                        source={
                          item.workout_name === 'pushup'
                            ? require('../../assets/pushup.png')
                            : item.workout_name === 'russian twists'
                              ? require('../../assets/twists.png')
                              : require('../../assets/pushup_steps.png')
                        }
                        style={{
                          width: 120,
                          height: 70,
                          borderRadius: 10,
                          backgroundColor: '#222a3a', // Match dark theme
                          marginRight: 24, // Increased spacing
                        }}
                        resizeMode="contain"
                      />
                      <Text style={{ fontSize: 15, color: '#fff' }}>
                        X {item.total_reps ?? 0}
                      </Text>
                    </View>

                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                      {(item as WorkoutSummaryItem).workout_name?.replace(/(^|\s)\S/g, (l: string) => l.toUpperCase())}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ fontSize: 15, color: '#bbb', marginVertical: 18 }}>
                  No workouts found for this day.
                </Text>
              )}

              <TouchableOpacity
                style={{
                  marginTop: 8,
                  backgroundColor: '#ff6b35',
                  borderRadius: 16,
                  paddingHorizontal: 32,
                  paddingVertical: 10,
                }}
                onPress={() => setOverlayVisible(false)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// New WorkoutSelection page
function WorkoutSelection({ navigation }: { navigation: any }) {
  const [showPushupSheet, setShowPushupSheet] = useState(false);
  const [showTwistsSheet, setShowTwistsSheet] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Workout</Text>
      <TouchableOpacity
        style={[styles.workoutButton, styles.selectionButton, styles.iconButton]}
        onPress={() => setShowPushupSheet(true)}
      >
        <MaterialCommunityIcons name="arm-flex" size={24} color="#fff" style={styles.iconLeft} />
        <Text style={styles.workoutButtonText}>Pushups</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.workoutButton, styles.selectionButton, styles.iconButton]}
        onPress={() => setShowTwistsSheet(true)}
      >
        <MaterialCommunityIcons name="rotate-3d-variant" size={24} color="#fff" style={styles.iconLeft} />
        <Text style={styles.workoutButtonText}>Russian Twists</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.workoutButton, styles.selectionButton, styles.iconButton]}
        onPress={() => Alert.alert('Coming Soon', 'Squats workout coming soon!')}
      >
        <MaterialCommunityIcons name="human-handsup" size={24} color="#fff" style={styles.iconLeft} />
        <Text style={styles.workoutButtonText}>Squats</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.workoutButton, styles.selectionButton, styles.iconButton]}
        onPress={() => Alert.alert('Coming Soon', 'Plank workout coming soon!')}
      >
        <MaterialCommunityIcons name="human" size={24} color="#fff" style={styles.iconLeft} />
        <Text style={styles.workoutButtonText}>Plank</Text>
      </TouchableOpacity>
      {showPushupSheet && (
        <PushupStepsSheet visible={showPushupSheet} onClose={() => setShowPushupSheet(false)} />
      )}
      {showTwistsSheet && (
        <TwistsStepsSheet visible={showTwistsSheet} onClose={() => setShowTwistsSheet(false)} />
      )}
    </View>
  );
}

function Workouts({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <TouchableOpacity onPress={() => navigation.navigate('PushupTrain')}>
        <Text style={styles.workout}>- Pushups</Text>
      </TouchableOpacity>
      <Text style={styles.workout}>- Russian Twists</Text>
      <Text style={styles.workout}>- Squats</Text>
      <Text style={styles.workout}>- Plank</Text>
      <Text style={styles.workout}>- Burpees</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ title: 'Fitness Dashboard', headerShown: false }}
        />
        <Stack.Screen
          name="WorkoutSelection"
          component={WorkoutSelection}
          options={{ title: 'Select Workout' }}
        />
        <Stack.Screen name="Workouts" component={Workouts} />
        <Stack.Screen name="PushupTrain" component={PushupTrain} />
        <Stack.Screen name="TwistTrain" component={TwistsTrain} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#152238', // Match the normal page color
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#152238',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    paddingTop: 50, // Added for more space above
    paddingBottom: 10, // Added for more space below
  },
  subGreeting: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  workoutButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  workoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsSection: {
    backgroundColor: '#2c3e50',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  monthTitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#8da9c4',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#152238',
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 5,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayBox: {
    width: (width - 80) / 7 - 4,
    height: (width - 80) / 7 - 4,
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  legendContainer: {
    marginTop: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
  },
  workout: {
    fontSize: 18,
    marginBottom: 10,
    color: 'blue',
  },
  selectionButton: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 12,
  },
});