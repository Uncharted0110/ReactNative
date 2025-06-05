import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); // Add username state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();

    const IP_ADDR = Constants.expoConfig?.extra?.IP_ADDR;


    const handleSignup = async () => {
        if (!email || !username || !password || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }
        if (username.length > 10) {
            Alert.alert('Error', 'Username must be at most 10 characters');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const res = await fetch(`http://${IP_ADDR}:3000/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username }), // send username
            });
            const data = await res.json();

            if (res.ok) {
                router.replace('/login');
            } else {
                Alert.alert('Signup Failed', data.message || 'Unknown error');
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
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                placeholder="Email"
                placeholderTextColor={"#888"} // Gray placeholder
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Username"
                placeholderTextColor={"#888"} // Gray placeholder

                value={username}
                onChangeText={setUsername}
                style={styles.input}
                autoCapitalize="none"
                maxLength={10} // Enforce max length in UI
            />
            <TextInput
                placeholder="Password"
                placeholderTextColor={"#888"} // Gray placeholder

                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                placeholder="Confirm Password"
                placeholderTextColor={"#888"} // Gray placeholder

                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Sign Up" onPress={handleSignup} />
            <Text onPress={() => router.push('/login')} style={styles.link}>
                Already have an account? Login
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#152238' // Light blue background
    },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#ffffff' },
    input: { borderBottomWidth: 1, marginBottom: 15, padding: 8, color: '#ffffff', borderColor: '#7f8c8d' },
    link: { marginTop: 15, color: '#ffffff', textAlign: 'center' },
    logo: {
        width: 240,         // 👈 Change width
        height: 240,        // 👈 Change height
        resizeMode: 'contain', // or 'cover', 'stretch'
        alignSelf: 'center',
        marginBottom: 20,
    }
});
