import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  useFrameworkReady();
  
  const { initialize, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFBFF', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🎉</Text>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#2D1B69', marginBottom: 8 }}>ChillConnect</Text>
        <Text style={{ fontSize: 16, color: '#6B46C1' }}>Loading your vibe... ✨</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="(auth)" />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="calling" />
            <Stack.Screen name="chat" />
          </>
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}