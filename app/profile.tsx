import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Back arrow button */}
      <View style={{ position: 'absolute', top: 48, left: 20, zIndex: 10 }}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={32}
          color="#fff"
          onPress={() => router.back()}
        />
      </View>
      <Text style={styles.title}>Profile Page</Text>
      {/* Add profile details and settings here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#152238',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
