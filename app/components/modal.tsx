import { Link } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen({text}:any) {
  return (
    <View style={styles.container}>
      <Text>{text}</Text>
      <ActivityIndicator style={{ marginTop: 20 }} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
