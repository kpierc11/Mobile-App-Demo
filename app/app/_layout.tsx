
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="()"
          options={{
            headerShown: true,
            title: "MyQuattro",
            headerStyle: {
              
            },
            contentStyle: {
              paddingTop: 0,
            },
          }}
        />
        <Stack.Screen name="(tabs)"
          options={{
            headerShown: true,
            title: "MyQuattro",
            headerStyle: {
              
            },
            contentStyle: {
              paddingTop: 0,
            },
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'light' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

