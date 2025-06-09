import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserContext } from './_layout';

const IP_ADDR = Constants.expoConfig?.extra?.IP_ADDR;

export default function ProfileScreen() {
  const router = useRouter();
  const { email, username, setUsername } = useContext(UserContext); // Added setUsername from context
  
  const [newUsername, setNewUsername] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    if (newUsername.length > 10) {
      Alert.alert('Error', 'Username must be at most 10 characters');
      return;
    }

    try {
      // Fixed API URL to use consistent IP_ADDR
      const response = await fetch(`http://${IP_ADDR}:3000/api/update-username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, username: newUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsername(newUsername); // This should now work with setUsername from context
        setNewUsername('');
        setShowUpdateForm(false);
        Alert.alert('Success', 'Username updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to update username');
      }
    } catch (error) {
      console.error('Update username error:', error);
      Alert.alert('Error', 'Failed to update username');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Fixed API endpoint - should be DELETE to /api/delete-account or similar
              const response = await fetch(`http://${IP_ADDR}:3000/api/delete-account`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email }),
              });

              if (response.ok) {
                Alert.alert('Success', 'Account deleted');
                router.replace('/login');
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={{ position: 'absolute', top: 48, left: 20, zIndex: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={32}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Profile Page</Text>
      
      {/* User Info */}
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.email}>{email}</Text>

      {/* Update Username */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => setShowUpdateForm(!showUpdateForm)}
      >
        <Text style={styles.actionButtonText}>Update Username</Text>
      </TouchableOpacity>

      {showUpdateForm && (
        <View style={styles.updateForm}>
          <TextInput
            style={styles.input}
            placeholder="Enter new username"
            placeholderTextColor="#888"
            value={newUsername}
            onChangeText={setNewUsername}
            maxLength={10}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUsername}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setShowUpdateForm(false);
                setNewUsername('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Delete Account */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#152238',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    color: '#888',
    fontSize: 16,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 8,
    width: 250,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#152238',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    width: 250,
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  updateForm: {
    backgroundColor: '#1e3a5f',
    padding: 20,
    borderRadius: 8,
    width: 250,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#152238',
    color: '#fff',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
    marginBottom: 15,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 5,
  },
  saveButtonText: {
    color: '#152238',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});