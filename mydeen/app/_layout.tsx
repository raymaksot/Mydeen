import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import { authEmitter } from '../authEmitter';

import useColorScheme from '../hooks/useColorScheme';

export default function RootLayout() {
  const { useRouter } = require('expo-router');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuth, setIsAuth] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('token');
      setIsAuth(!!token);
    })();
  }, []);

  React.useEffect(() => {
    const handler = async () => {
      await SecureStore.setItemAsync('token', 'demo_token');
      setIsAuth(true);
    };
    authEmitter.on('auth-success', handler);
    return () => {
      authEmitter.off('auth-success', handler);
    };
  }, []);


  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Slot обеспечивает корректную работу вложенных экранов и навигации */}
      <StatusBar style="auto" />
    {/* Только Slot, без Stack — навигаторы определяются вложенными маршрутами */}
    <Slot />
    </ThemeProvider>
  );
}
