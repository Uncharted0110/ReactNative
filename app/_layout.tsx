import { Slot, useRouter } from 'expo-router';
import React, { createContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Add UserContext for email
export const UserContext = createContext<{
  email: string | null,
  setEmail: (email: string | null) => void,
  username: string | null,
  setUsername: (username: string | null) => void
}>({
  email: null,
  setEmail: () => {},
  username: null,
  setUsername: () => {},
});

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Simulate async auth check
    const checkLogin = async () => {
      // e.g., check AsyncStorage/token here
      const loggedIn = false; // change as per your logic
      setIsLoggedIn(loggedIn);
    };
    checkLogin();
  }, []);

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace('/login');
    }
  }, [isLoggedIn]);

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <UserContext.Provider value={{ email, setEmail, username, setUsername }}>
      <Slot />
    </UserContext.Provider>
  );
}