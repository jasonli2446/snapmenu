import { useEffect, useState, useRef } from 'react';
import { StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_CONFIG } from '@/constants/Api';
import { Colors } from '@/constants/Colors';

// Dynamic loading messages for different stages
const loadingMessages = {
  upload: [
    "Uploading menu image...",
    "Getting ready to analyze...",
    "Preparing your menu...",
    "Starting the process..."
  ],
  ocr: [
    "Processing with OCR...",
    "Reading menu text...",
    "Identifying dishes...",
    "Extracting menu items...",
    "Analyzing menu layout..."
  ],
  enrichment: [
    "Enhancing dish information...",
    "Finding dish images...",
    "Rendering entree photos...",
    "Generating beautiful food images...",
    "Matching dishes to images...",
    "Creating photo gallery...",
    "Generating descriptions...",
    "Adding nutritional context...",
    "Applying cuisine tags...",
    "Looking for dietary information...",
  ],
  completion: [
    "Analysis complete!",
    "Your menu is ready!",
    "Dishes successfully identified!"
  ]
};

export default function LoadingScreen() {
  const { imageUri } = useLocalSearchParams();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(loadingMessages.upload[0]);
  const [stage, setStage] = useState<'upload' | 'ocr' | 'enrichment' | 'completion'>('upload');
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIndexRef = useRef(0);
  const windowWidth = Dimensions.get('window').width;
  
  // Function to cycle through messages for current stage
  const startMessageCycle = (currentStage: 'upload' | 'ocr' | 'enrichment' | 'completion') => {
    // Clear any existing interval
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
    }
    
    // Reset message index
    messageIndexRef.current = 0;
    
    // Set initial message
    setStatusText(loadingMessages[currentStage][0]);
    
    // Create new interval to cycle messages
    messageIntervalRef.current = setInterval(() => {
      messageIndexRef.current = (messageIndexRef.current + 1) % loadingMessages[currentStage].length;
      setStatusText(loadingMessages[currentStage][messageIndexRef.current]);
    }, 3000);
  };
  
  useEffect(() => {
    const processImage = async () => {
      try {
        if (!imageUri) {
          throw new Error('No image URI provided');
        }
        
        // Stage 1: Upload
        setStage('upload');
        startMessageCycle('upload');
        setProgress(20);
        
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri as string,
          name: 'menu.jpg',
          type: 'image/jpeg',
        } as any);

        // Stage 2: OCR Processing
        setTimeout(() => {
          setStage('ocr');
          startMessageCycle('ocr');
          setProgress(45);
        }, 2000);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/extract-dishes`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to extract dishes');

        // Stage 3: Enrichment (after API call completes successfully)
        setStage('enrichment');
        startMessageCycle('enrichment');
        setProgress(75);

        const data = await response.json();
        
        // Final stage: Completion
        setTimeout(() => {
          setStage('completion');
          startMessageCycle('completion');
          setProgress(100);
          
          // Navigate to results page with the data
          setTimeout(() => {
            if (messageIntervalRef.current) {
              clearInterval(messageIntervalRef.current);
            }
            router.replace({
              pathname: '/results',
              params: { 
                results: JSON.stringify(data.enriched_dishes || data.dishes),
                imageUri: imageUri as string
              }
            });
          }, 1500);
        }, 1500);
        
      } catch (err) {
        console.error(err);
        if (messageIntervalRef.current) {
          clearInterval(messageIntervalRef.current);
        }
        setStatusText("Error occurred ⚠️");
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    };

    processImage();
    
    // Cleanup interval on unmount
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [imageUri]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors.light.primary }]}>
      <ThemedText style={styles.title} darkColor="white" lightColor="white">
        Processing Menu
      </ThemedText>
      
      {imageUri && (
        <ThemedView style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri as string }}
            style={styles.menuImage}
            contentFit="contain"
          />
        </ThemedView>
      )}
      
      <ActivityIndicator 
        size="large" 
        color={Colors.light.secondary} 
        style={styles.loader} 
      />
      
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    width: 325,
    height: 325,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
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
    transition: 'width 0.5s ease',
  },
});