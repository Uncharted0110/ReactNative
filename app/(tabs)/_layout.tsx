import { Slot } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  // Remove the Tabs component to eliminate the bottom navigation bar and white patch
  return <Slot />;
}