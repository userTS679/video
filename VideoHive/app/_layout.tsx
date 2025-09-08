import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Slot } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();
  const { initialize, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return null; // Or your loading view
  }

  return <Slot />;
}