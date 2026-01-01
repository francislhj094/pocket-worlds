import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GameProvider } from "@/contexts/GameContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back", headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/welcome" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/verify-email" />
      <Stack.Screen name="auth/forgot-password" />
      <Stack.Screen name="auth/account-success" />
      <Stack.Screen name="avatar-creator" />
      <Stack.Screen name="home" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="games/obby-rush" />
      <Stack.Screen name="games/memory-match" />
      <Stack.Screen name="games/dodge-master" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <GameProvider>
              <RootLayoutNav />
            </GameProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
