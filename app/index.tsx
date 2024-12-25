import { Link, router } from "expo-router";
import { Image, StyleSheet, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Plant Perfect</Text>
      <Text className="text-red-500 text-3xl">Gardening app</Text>

      <Link href="/home">Go to Home</Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text:{
    color: '#000000',
    fontSize: 30
  }
});