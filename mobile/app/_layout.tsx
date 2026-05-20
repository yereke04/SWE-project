import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Palette } from '@/constants/theme';

// This component handles the redirection logic
function NavigationRoot() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // If not logged in and not in auth screen -> Redirect to Login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // If logged in and in auth screen -> Redirect to Dashboard
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Palette.background }}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.background } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ animation: 'fade' }} />
      <Stack.Screen name="auth/register" options={{ animation: 'slide_from_right' }} />
      
      {/* We will add these screens later in Phase 4 */}
      <Stack.Screen name="supplier/[id]" options={{ presentation: 'modal', title: 'Merchant Details' }} />
      <Stack.Screen name="chat/[id]" options={{ title: 'Messages', headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <NavigationRoot />
    </AuthProvider>
  );
}
