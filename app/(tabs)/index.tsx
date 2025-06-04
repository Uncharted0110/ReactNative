import { NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import PushupTrain from '../pushup_train';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

function Dashboard({ navigation }: { navigation: any }) {
  // Sample workout data - replace with real data from your app
  const [workoutData, setWorkoutData] = useState<Record<number, number>>({
    1: 2, 2: 0, 3: 1, 4: 3, 5: 1, 6: 0, 7: 2,
    8: 1, 9: 2, 10: 0, 11: 1, 12: 3, 13: 2, 14: 1,
    15: 0, 16: 2, 17: 1, 18: 3, 19: 0, 20: 1, 21: 2,
    22: 1, 23: 0, 24: 2, 25: 3, 26: 1, 27: 0, 28: 2,
    29: 1, 30: 2, 31: 0
  });

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
    if (workoutCount === 0) return '#e8e8e8';
    if (workoutCount === 1) return '#ffcc80';
    if (workoutCount === 2) return '#ff9800';
    if (workoutCount >= 3) return '#f57c00';
    return '#e8e8e8';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const workoutCount = workoutData[day] || 0;
      const color = getIntensityColor(workoutCount);
      
      days.push(
        <View key={day} style={[styles.dayBox, { backgroundColor: color }]}>
          <Text style={styles.dayText}>{day}</Text>
        </View>
      );
    }
    
    return days;
  };

  const getTotalWorkouts = () => {
    return Object.values(workoutData).reduce((sum, count) => sum + count, 0);
  };

  const getActiveDays = () => {
    return Object.values(workoutData).filter(count => count > 0).length;
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hi User! 👋</Text>
            <Text style={styles.subGreeting}>Ready to crush your goals?</Text>
          </View>
          <TouchableOpacity 
            style={styles.workoutButton}
            onPress={() => navigation.navigate('Workouts')}
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
              <Text style={styles.statNumber}>{getTotalWorkouts()}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{getActiveDays()}</Text>
              <Text style={styles.statLabel}>Active Days</Text>
            </View>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Workout Intensity</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#e8e8e8' }]} />
                <Text style={styles.legendText}>No workout</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#ffcc80' }]} />
                <Text style={styles.legendText}>Light</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#ff9800' }]} />
                <Text style={styles.legendText}>Moderate</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#f57c00' }]} />
                <Text style={styles.legendText}>Intense</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
          options={{ title: 'Fitness Dashboard' }}
        />
        <Stack.Screen name="Workouts" component={Workouts} />
        <Stack.Screen name="PushupTrain" component={PushupTrain} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 20,
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
    color: '#2c3e50',
    marginBottom: 5,
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
    backgroundColor: 'white',
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
    color: '#2c3e50',
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
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
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
  },
  workout: {
    fontSize: 18,
    marginBottom: 10,
    color: 'blue',
  },
});