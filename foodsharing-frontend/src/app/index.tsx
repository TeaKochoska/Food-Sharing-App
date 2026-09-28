import { styles } from '@/styles/home.styles';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function HomeScreen() {
  const [message, setMessage] = useState<string>('Connecting to backend...');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Користиме localhost кога ја тестираме апликацијата во прелистувач (web)
    // (Ако е на Android емулатор, користиме http://10.0.2.2:5000)
    fetch('http://10.0.2.2:5000/')
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setMessage('Failed to connect to backend.');
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Food Sharing App</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <Text style={styles.text}>{message}</Text>
        )}
      </View>
    </View>
  );
}