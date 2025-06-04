import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
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

  return <Slot />;
}