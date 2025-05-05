import React from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: '/loading',
        params: { imageUri: result.assets[0].uri }
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: '/loading',
        params: { imageUri: result.assets[0].uri }
      });
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors.light.primary }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
            
      <ThemedText style={styles.description} darkColor="white" lightColor="white">
        Snap a photo of any restaurant menu to see dish images, ingredients, and detailed descriptions. 
        Our AI instantly visualizes what you're about to order!
      </ThemedText>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Colors.light.secondary }]}
        onPress={pickImage}
      >
        <ThemedText style={styles.buttonText}>Select from Gallery</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Colors.light.background }]}
        onPress={takePhoto}
      >
        <ThemedText style={[styles.buttonText, { color: Colors.light.text }]}>Take Photo</ThemedText>
      </TouchableOpacity>
      
      <View style={styles.featureContainer}>
        <View style={styles.featureItem}>
          <View style={[styles.featureDot, { backgroundColor: Colors.light.secondary }]} />
          <ThemedText style={styles.featureText} darkColor="white" lightColor="white">
            See dish images
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <View style={[styles.featureDot, { backgroundColor: Colors.light.secondary }]} />
          <ThemedText style={styles.featureText} darkColor="white" lightColor="white">
            Detailed descriptions
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <View style={[styles.featureDot, { backgroundColor: Colors.light.secondary }]} />
          <ThemedText style={styles.featureText} darkColor="white" lightColor="white">
            Ingredient lists
          </ThemedText>
        </View>
      </View>
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
  logoContainer: {
    marginBottom: -50,
  },
  logo: {
    width: 325,
    height: 325,
  },
  description: {
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    width: '80%',
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 15,
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
  featureContainer: {
    marginTop: 20,
    width: '80%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
  }
});