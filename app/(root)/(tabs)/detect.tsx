import React, { useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import CustomButton from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';
import HeatImageViewer from '@/components/HeatMapViewer';

interface PredictionResult {
  class: string;
  confidence: number;
  insights: string;
  heatmap: string;
}

type PlantHealthImages = {
  healthy: ImageSourcePropType;
  diseased: ImageSourcePropType;
};

const PlaceholderImage = require('@/assets/images/placeholder.jpg');
const plantHealthTypes: PlantHealthImages = {
  healthy: require('@/assets/images/healthy-plant.jpg'),
  diseased: require('@/assets/images/diseased-plant.jpg'),
};

export default function Detect() {
  var base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAwBQTFRF7c5J78kt+/Xm78lQ6stH5LI36bQh6rcf7sQp671G89ZZ8c9V8c5U9+u27MhJ/Pjv9txf8uCx57c937Ay5L1n58Nb67si8tVZ5sA68tJX/Pfr7dF58tBG9d5e8+Gc6chN6LM+7spN1pos6rYs6L8+47hE7cNG6bQc9uFj7sMn4rc17cMx3atG8duj+O7B686H7cAl7cEm7sRM26cq/vz5/v767NFY7tJM78Yq8s8y3agt9dte6sVD/vz15bY59Nlb8txY9+y86LpA5LxL67pE7L5H05Ai2Z4m58Vz89RI7dKr+/XY8Ms68dx/6sZE7sRCzIEN0YwZ67wi6rk27L4k9NZB4rAz7L0j5rM66bMb682a5sJG6LEm3asy3q0w3q026sqC8cxJ6bYd685U5a457cIn7MBJ8tZW7c1I7c5K7cQ18Msu/v3678tQ3aMq7tNe6chu6rgg79VN8tNH8c0w57Q83akq7dBb9Nld9d5g6cdC8dyb675F/v327NB6////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/LvB3QAAAMFJREFUeNpiqIcAbz0ogwFKm7GgCjgyZMihCLCkc0nkIAnIMVRw2UhDBGp5fcurGOyLfbhVtJwLdJkY8oscZCsFPBk5spiNaoTC4hnqk801Qi2zLQyD2NlcWWP5GepN5TOtSxg1QwrV01itpECG2kaLy3AYiCWxcRozQWyp9pNMDWePDI4QgVpbx5eo7a+mHFOqAxUQVeRhdrLjdFFQggqo5tqVeSS456UEQgWE4/RBboxyC4AKCEI9Wu9lUl8PEGAAV7NY4hyx8voAAAAASUVORK5CYII=';
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [heatmap, setHeatmap] = useState<string | undefined>(undefined);

  const pickImageAsync = async (): Promise<void> => {
    setError(null);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setPredictionResult(null);
    }
  };

  const takePhotoAsync = async (): Promise<void> => {
    setError(null);
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError("Camera permission is required to take photos");
      return;
    }
    
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setPredictionResult(null);
    }
  };

  const uploadImageAsync = async (): Promise<void> => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
  
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any); 

      const apiUrl = process.env.EXPO_PUBLIC_PYAPI_KEY || '';
      console.log(`${apiUrl}/predict`);
      console.log("FormData:", formData);
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Fetch complete. Response Status:", response.status);
      const data = await response.json();
      // console.log("Response Data:", data);
      if (response.ok) {
        console.log(data.heatmap_base64);
        
        setPredictionResult({
          class: data.predicted_class,
          confidence: data.confidence,
          insights: data.insights,
          heatmap: data.heatmap
        });
      } else {
        setError(data.error || 'Failed to analyze image');
      }
    } catch (error) {
      setError('Network error: Unable to connect to the server');
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetDetection = (): void => {
    setSelectedImage(undefined);
    setPredictionResult(null);
    setError(null);
  };

  // Format the disease name for display
  const formatDiseaseName = (name: string): string => {
    if (!name) return '';
    return name.split('___').map(part => 
      part.replace(/_/g, ' ')
    ).join(' - ');
  };

  // Check if the plant is healthy based on prediction
  const isHealthy = (prediction: string): boolean => {
    return prediction?.toLowerCase().includes('healthy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <FontAwesome5 name="leaf" size={24} color="#4CAF50" />
          <Text style={styles.headerText}>Plant Disease Detection</Text>
        </View>

        <View style={styles.imageContainer}>
          <ImageViewer 
            imgSource={PlaceholderImage} 
            selectedImage={selectedImage} 
            style={styles.imageViewer}
          />
        </View>

        {!predictionResult && !loading && (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Take or upload a clear photo of a plant leaf to detect diseases
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <FontAwesome5 name="exclamation-circle" size={18} color="#D32F2F" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!predictionResult && (
          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <CustomButton 
                bgVariant='plant' 
                title="Gallery" 
                onPress={pickImageAsync} 
                className='flex-1 mr-2'
              />
              <CustomButton 
                bgVariant='plant' 
                title="Camera" 
                onPress={takePhotoAsync} 
                className='flex-1 ml-2'
              />
            </View>
            
            {selectedImage && (
              <CustomButton 
                bgVariant='plant' 
                title="Analyze Plant" 
                onPress={uploadImageAsync} 
                className='w-full mt-4'
                disabled={loading}
              />
            )}
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Analyzing your plant...</Text>
            <Text style={styles.loadingSubText}>This may take a moment</Text>
          </View>
        )}

        {predictionResult && (
          <View style={styles.resultContainer}>
            <View style={[
              styles.resultHeader,
              isHealthy(predictionResult.class) ? styles.healthyHeader : styles.diseasedHeader
            ]}>
              <Image 
                source={isHealthy(predictionResult.class) ? plantHealthTypes.healthy : plantHealthTypes.diseased}
                style={styles.resultIcon}
              />
              <Text style={styles.resultTitle}>
                {isHealthy(predictionResult.class) ? 'Healthy Plant' : 'Disease Detected'}
              </Text>
            </View>
            
            <View style={styles.resultDetails}>
              <View style={styles.detailGroup}>
                <Text style={styles.detailLabel}>Plant & Condition:</Text>
                <Text style={styles.detailValue}>{formatDiseaseName(predictionResult.class)}</Text>
              </View>
              
              <View style={styles.detailGroup}>
                <Text style={styles.detailLabel}>Confidence:</Text>
                <View style={styles.confidenceContainer}>
                  <View style={[
                    styles.confidenceBar,
                    { width: `${predictionResult.confidence * 100}%` },
                    predictionResult.confidence > 0.7 ? styles.highConfidence : 
                    predictionResult.confidence > 0.4 ? styles.mediumConfidence : styles.lowConfidence
                  ]} />
                  <Text style={styles.confidenceText}>{(predictionResult.confidence * 100).toFixed(1)}%</Text>
                </View>
              </View>
              
              {predictionResult.insights && (
                <View style={styles.detailGroup}>
                  <Text style={styles.detailLabel}>Insights & Recommendations:</Text>
                  <View style={styles.insightsContainer}>
                    <Text style={styles.insightsText}>{predictionResult.insights}</Text>
                  </View>
                </View>
              )}

            <View style={styles.imageContainer}>
              <Image 
                  source={{ uri: `data:image/jpeg;base64,${predictionResult.heatmap}` }} 
                  style={{ width: 300, height: 300 }} 
                />
              </View>
            </View>

            {/* <Image style={{width: 100, height: 50, borderWidth: 1, borderColor: 'red'}} source={{uri: base64Icon}}/> */}
            
            <View style={styles.actionButtons}>
              <CustomButton 
                bgVariant='plant' 
                title="Analyze Another Plant" 
                onPress={resetDetection} 
                className='w-full mt-4 mb-5'
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  imageContainer: { // Keep this container for margin/shadows etc.
    marginBottom: 20,
    // Removed background, padding, etc. if ImageViewer handles its own background
    // Ensure it doesn't clip the ImageViewer unnecessarily
  },
  imageViewer: { // Style applied TO the ImageViewer component
    width: 200, // Or use Dimensions API for dynamic width
    height: 200,
    borderRadius: 8, // Apply border radius to the viewer itself
    overflow: 'hidden', // Important to clip the overlay if needed
    alignSelf: 'center', // Center the viewer if imageContainer is wider
  },
  instructionContainer: {
    padding: 10,
    marginBottom: 15,
  },
  heatmapInfoText: {
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: -5, // Adjust spacing
    marginBottom: 15,
    fontStyle: 'italic',
},
  instructionText: {
    color: '#BDC3C7',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#FFCDD2',
    fontSize: 14,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 15,
  },
  loadingSubText: {
    color: '#9E9E9E',
    fontSize: 14,
    marginTop: 5,
  },
  resultContainer: {
    backgroundColor: '#32373E',
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  healthyHeader: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
  },
  diseasedHeader: {
    backgroundColor: 'rgba(255, 87, 34, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: '#FF5722',
  },
  resultIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resultDetails: {
    padding: 15,
  },
  detailGroup: {
    marginBottom: 20,
  },
  detailLabel: {
    color: '#9E9E9E',
    fontSize: 14,
    marginBottom: 8,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  confidenceContainer: {
    height: 24,
    backgroundColor: '#424242',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  confidenceBar: {
    height: '100%',
    borderRadius: 12,
  },
  highConfidence: {
    backgroundColor: '#4CAF50',
  },
  mediumConfidence: {
    backgroundColor: '#FFC107',
  },
  lowConfidence: {
    backgroundColor: '#FF5722',
  },
  confidenceText: {
    position: 'absolute',
    right: 10,
    top: 0,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  insightsContainer: {
    backgroundColor: '#3E444C',
    borderRadius: 8,
    padding: 15,
  },
  insightsText: {
    color: '#E0E0E0',
    fontSize: 15,
    lineHeight: 22,
  },
  actionButtons: {
    padding: 15,
    paddingTop: 0,
  },
  heatmapContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  
  heatmapImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});