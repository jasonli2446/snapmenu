import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { TAG_COLORS } from '@/constants/TagColors';

// Define the type for enriched dish data
type Dish = string | {
  name: string;
  description?: string;
  tags?: string[];
  image_url?: string;
};

export default function ResultsScreen() {
  const { results, imageUri } = useLocalSearchParams();
  
  let parsedResults: Dish[] = [];
  try {
    parsedResults = JSON.parse(results as string);
  } catch (e) {
    console.error("Failed to parse results:", e);
  }

  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  
  const handleImageLoad = (idx: number) => {
    setLoadingImages(prev => ({...prev, [idx]: false}));
  };

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
          <ThemedText type="title" style={styles.titleText} darkColor="white" lightColor="white">
            Menu Results
          </ThemedText>
        </ThemedView>
        
        {imageUri && (
          <View style={styles.menuImageContainer}>
            <Image
              source={{ uri: imageUri as string }}
              style={styles.menuImage}
              contentFit="cover"
            />
          </View>
        )}
        
        {parsedResults && parsedResults.length > 0 ? (
          <ThemedView style={styles.resultsContainer}>
            <ThemedText type="subtitle" style={styles.resultsTitle}>
              Detected Dishes
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
                    
                    {/* Display dish image if available */}
                    {item.image_url && (
                      <View style={styles.imageContainer}>
                        {loadingImages[idx] !== false && (
                          <ActivityIndicator 
                            style={styles.imageLoader}
                            color={Colors.light.primary} 
                            size="large"
                          />
                        )}
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.dishImage}
                          contentFit="contain"
                          onLoad={() => handleImageLoad(idx)}
                        />
                      </View>
                    )}
                    
                    {item.description && 
                      <ThemedText style={styles.dishDescription}>
                        {item.description}
                      </ThemedText>
                    }
                  </>
                )}
              </ThemedView>
            ))}
          </ThemedView>
        ) : (
          <ThemedView style={styles.noResultsContainer}>
            <ThemedText darkColor="white" lightColor="white" style={styles.noResultsText}>
              No dishes were detected in this image.
            </ThemedText>
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
    paddingBottom: 100,
  },
  titleContainer: {
    marginTop: 50,
    marginBottom: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 34,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuImageContainer: {
    width: 220,
    height: 220,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 5,
    borderColor: Colors.light.secondary,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuImage: {
    width: '100%',
    height: '100%',
  },
  resultsContainer: {
    width: '100%',
    padding: 24,
    borderRadius: 15,
    backgroundColor: Colors.light.background,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noResultsContainer: {
    width: '100%',
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  noResultsText: {
    fontSize: 18,
    textAlign: 'center',
  },
  resultsTitle: {
    marginBottom: 20,
    color: Colors.light.text,
    fontSize: 24,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.secondary,
    paddingBottom: 10,
  },
  dishItem: {
    marginBottom: 30,
    paddingLeft: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  dishText: {
    fontSize: 17,
    color: Colors.light.text,
    lineHeight: 24,
  },
  dishName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 5,
  },
  dishDescription: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 10,
    lineHeight: 22,
  },
  button: {
    width: '80%',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 40,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
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
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    marginVertical: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dishImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -15,
    zIndex: 1,
  },
});