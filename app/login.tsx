import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { UserContext } from './_layout';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setEmail: setContextEmail, setUsername: setContextUsername } = useContext(UserContext);

  const IP_ADDR = Constants.expoConfig?.extra?.IP_ADDR;

  // Ensure the server URL is correct and accessible 
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      const res = await fetch(`http://${IP_ADDR}:3000/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setContextEmail(email);
        setContextUsername(data.username); // Set username in context
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to connect to server');
    }
  };


  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => router.push('/signup')} style={styles.link}>No account? Sign up</Text>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8 },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
  logo: {
    width: 240,         // 👈 Change width
    height: 240,        // 👈 Change height
    resizeMode: 'contain', // or 'cover', 'stretch'
    alignSelf: 'center',
    marginBottom: 20,
  }

});
