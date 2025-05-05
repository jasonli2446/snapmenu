import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, ScrollView, Alert, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_CONFIG } from '@/constants/Api';

// Define the type for enriched dish data
type Dish = string | {
  name: string;
  description?: string;
};

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<Dish[] | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      sendImageToBackend(uri);
    }
  };

  const sendImageToBackend = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'menu.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${API_CONFIG.BASE_URL}/extract-dishes`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract dishes');

      const data = await response.json();
      setOcrResult(data.enriched_dishes || data.dishes);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not connect to backend. Make sure it is running and on the same network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">SnapMenu</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.buttonContainer}>
        <Button title="Upload Menu Photo" onPress={pickImage} color="#0a7ea4" />
      </ThemedView>
      
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.menuImage}
          contentFit="cover"
        />
      )}
      
      {loading && <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />}
      
      {ocrResult && (
        <ThemedView style={styles.resultsContainer}>
          <ThemedText type="subtitle" style={styles.resultsTitle}>Detected Dishes:</ThemedText>
          {Array.isArray(ocrResult) && ocrResult.map((item, idx) => (
            <ThemedView key={idx} style={styles.dishItem}>
              {typeof item === 'string' ? (
                <ThemedText>{item}</ThemedText>
              ) : (
                <>
                  <ThemedText style={{fontWeight: 'bold'}}>{item.name}</ThemedText>
                  {item.description && <ThemedText>{item.description}</ThemedText>}
                </>
              )}
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 100,
  },
  titleContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
    width: '100%',
  },
  menuImage: {
    width: 300,
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
  },
  loader: {
    marginVertical: 20,
  },
  resultsContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  resultsTitle: {
    marginBottom: 16,
  },
  dishItem: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#0a7ea4',
  }
});