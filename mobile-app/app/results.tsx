import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, Button } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Define the type for enriched dish data
type Dish = string | {
  name: string;
  description?: string;
};

export default function ResultsScreen() {
  const { results, imageUri } = useLocalSearchParams();
  
  let parsedResults: Dish[] = [];
  try {
    parsedResults = JSON.parse(results as string);
  } catch (e) {
    console.error("Failed to parse results:", e);
  }

  const goHome = () => {
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Menu Results</ThemedText>
      </ThemedView>
      
      {imageUri && (
        <Image
          source={{ uri: imageUri as string }}
          style={styles.menuImage}
          contentFit="cover"
        />
      )}
      
      {parsedResults && parsedResults.length > 0 ? (
        <ThemedView style={styles.resultsContainer}>
          <ThemedText type="subtitle" style={styles.resultsTitle}>Detected Dishes:</ThemedText>
          {Array.isArray(parsedResults) && parsedResults.map((item, idx) => (
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
      ) : (
        <ThemedView style={styles.noResultsContainer}>
          <ThemedText>No dishes were detected in this image.</ThemedText>
        </ThemedView>
      )}
      
      <ThemedView style={styles.buttonContainer}>
        <Button title="Scan Another Menu" onPress={goHome} color="#0a7ea4" />
      </ThemedView>
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
  menuImage: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
  resultsContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  noResultsContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  resultsTitle: {
    marginBottom: 16,
  },
  dishItem: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#0a7ea4',
  },
  buttonContainer: {
    marginTop: 30,
    width: '100%',
  }
});