import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PushupTrain() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pushup Training</Text>
      <Text style={styles.message}>Here you can start your pushup training session!</Text>
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
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
});