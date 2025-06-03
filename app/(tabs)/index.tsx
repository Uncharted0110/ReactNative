import { NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PushupTrain from '../pushup_train';

const Stack = createStackNavigator();

function Dashboard({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to the Fitness App!</Text>
      <Text style={styles.message}>Get ready to achieve your fitness goals.</Text>
      <Button
        title="Start Workout Session"
        onPress={() => navigation.navigate('Workouts')}
      />
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
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Workouts" component={Workouts} />
        <Stack.Screen name="PushupTrain" component={PushupTrain} />
      </Stack.Navigator>
    </NavigationIndependentTree>
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
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  workout: {
    fontSize: 18,
    marginBottom: 10,
    color: 'blue',
  },
});