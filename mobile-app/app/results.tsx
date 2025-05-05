import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

// Define the type for enriched dish data
type Dish = string | {
  name: string;
  description?: string;
  tags?: string[];
};

// Tag colors based on category
const TAG_COLORS = {
  'vegetarian': '#43A047', // Green
  'vegan': '#2E7D32', // Dark Green
  'gluten-free': '#7B1FA2', // Purple
  'spicy': '#D32F2F', // Red
  'very-spicy': '#B71C1C', // Dark Red
  'contains-nuts': '#FF6D00', // Orange
  'chef\'s-special': '#FFC107', // Amber
  'popular': '#1976D2', // Blue
  'signature-dish': '#F57C00', // Orange
  'default': '#757575', // Grey
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

  // Helper function to determine tag color
  const getTagColor = (tag: string) => {
    return TAG_COLORS[tag] || TAG_COLORS.default;
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
                    
                    {/* Display tags */}
                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {item.tags.map((tag, tagIdx) => (
                          <View 
                            key={tagIdx} 
                            style={[styles.tag, { backgroundColor: getTagColor(tag) }]}
                          >
                            <ThemedText style={styles.tagText}>{tag}</ThemedText>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {item.description && 
                      <ThemedText style={styles.dishDescription}>{item.description}</ThemedText>
                    }
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});