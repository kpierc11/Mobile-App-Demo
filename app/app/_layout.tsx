import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image, Text } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerTintColor: "#215387",
          headerTitleAlign:"left",
          headerTitle:"MyQuattro™"
          // headerTitle: () => (
          //   <><Image
          //     source={require("../assets/images/hbs-logo.png")}
          //     style={{
          //       width: 120,
          //       height: 32,
          //       resizeMode: "contain",
          //     }} /><Text>MyQuattro</Text></>
          // ),
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            title:"Devices",
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
