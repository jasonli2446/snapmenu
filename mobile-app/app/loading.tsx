import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_CONFIG } from '@/constants/Api';
import { Colors } from '@/constants/Colors';

export default function LoadingScreen() {
  const { imageUri } = useLocalSearchParams();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Uploading image...");
  
  useEffect(() => {
    const processImage = async () => {
      try {
        if (!imageUri) {
          throw new Error('No image URI provided');
        }
        
        setStatusText("Uploading image...");
        setProgress(33);
        
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri as string,
          name: 'menu.jpg',
          type: 'image/jpeg',
        } as any);

        setStatusText("Processing with OCR...");
        setProgress(66);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/extract-dishes`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to extract dishes');

        const data = await response.json();
        
        setStatusText("Analysis complete!");
        setProgress(100);
        
        // Navigate to results page with the data
        setTimeout(() => {
          router.replace({
            pathname: '/results',
            params: { 
              results: JSON.stringify(data.enriched_dishes || data.dishes),
              imageUri: imageUri as string
            }
          });
        }, 500);
        
      } catch (err) {
        console.error(err);
        setStatusText("Error occurred ⚠️");
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    };

    processImage();
  }, [imageUri]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors.light.primary }]}>
      {imageUri && (
        <Image
          source={{ uri: imageUri as string }}
          style={styles.menuImage}
          contentFit="cover"
        />
      )}
      
      <ActivityIndicator size="large" color={Colors.light.secondary} style={styles.loader} />
      
      <ThemedText style={styles.statusText} darkColor="white" lightColor="white">
        {statusText}
      </ThemedText>
      
      <ThemedView style={styles.progressBarContainer}>
        <ThemedView 
          style={[styles.progressBar, { width: `${progress}%` }]} 
          darkColor={Colors.light.secondary} 
          lightColor={Colors.light.secondary} 
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuImage: {
    width: 250,
    height: 250,
    marginBottom: 30,
    borderRadius: 10,
    opacity: 0.7,
  },
  loader: {
    marginBottom: 20,
  },
  statusText: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '80%',
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  }
});