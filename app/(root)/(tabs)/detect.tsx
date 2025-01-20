import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '@/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
const PlaceholderImage = require('@/assets/images/icon.png');
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from '@/components/ImageViewer';

export default function Detect() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [prediction, setPrediction] = useState<string | undefined>(undefined);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result?.assets[0].uri);
      console.log(result?.assets[0]);
    } else {
      alert('Image not selected');
    }
  }

  const uploadImageAsync = async () => {
    if (!selectedImage) {
      alert('No image selected to upload');
      return;
    }
    const formData = new FormData();

    formData.append('image', {
      uri: selectedImage,
      name: 'image.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      console.log(formData);
      
      const response = await fetch('http://192.168.0.140:8000/api/images/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPrediction(data.prediction); // assuming response contains the prediction
        setConfidence(data.confidence); // confidence of the prediction

        alert('Image uploaded and prediction received!');
      } else {
        alert('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  return (
    <SafeAreaView className='bg-[#25292e] flex-1 items-center justify-center'>
      <View className='mb-7'>
        <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
      </View>

      <CustomButton bgVariant='plant' title="Choose a photo" onPress={pickImageAsync} className='w-[140px]' />
      <CustomButton bgVariant='plant' title="Use this photo" onPress={uploadImageAsync} className='w-[140px] mt-5' />

      {prediction && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionText}>Prediction: {prediction}</Text>
          <Text style={styles.predictionText}>Confidence: {(confidence ?? 0) * 100}%</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  predictionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  predictionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25292e',
  },
});
