import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

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
    <ThemedView style={[styles.container, { backgroundColor: Colors.light.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" darkColor="white" lightColor="white">Results</ThemedText>
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
            <ThemedText type="subtitle" style={styles.resultsTitle} darkColor={Colors.light.text} lightColor={Colors.light.text}>
              Detected Dishes:
            </ThemedText>
            {Array.isArray(parsedResults) && parsedResults.map((item, idx) => (
              <ThemedView key={idx} style={styles.dishItem}>
                {typeof item === 'string' ? (
                  <ThemedText style={styles.dishText}>{item}</ThemedText>
                ) : (
                  <>
                    <ThemedText style={styles.dishName}>{item.name}</ThemedText>
                    {item.description && <ThemedText style={styles.dishDescription}>{item.description}</ThemedText>}
                  </>
                )}
              </ThemedView>
            ))}
          </ThemedView>
        ) : (
          <ThemedView style={styles.noResultsContainer}>
            <ThemedText darkColor="white" lightColor="white">No dishes were detected in this image.</ThemedText>
          </ThemedView>
        )}
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors.light.secondary }]}
          onPress={goHome}
        >
          <ThemedText style={styles.buttonText}>Scan Another Menu</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50,
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: 'center',
  },
  menuImage: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: Colors.light.secondary
  },
  resultsContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  noResultsContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  resultsTitle: {
    marginBottom: 16,
    color: Colors.light.text
  },
  dishItem: {
    marginBottom: 15,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.secondary,
  },
  dishText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  dishDescription: {
    fontSize: 14,
    color: Colors.light.text,
    marginTop: 4,
  },
  button: {
    width: '80%',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});