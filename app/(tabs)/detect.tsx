import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '@/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
const PlaceholderImage = require('@/assets/images/icon.png');
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from '@/components/ImageViewer';

export default function Detect() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result?.assets[0].uri);
      console.log(result?.assets[0]);
      
    }
    else{
      alert('Image not selected');
    }
  }
  
  const uploadImageAsync = async () => {
    if(!selectedImage){
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
      const response = await fetch('http://192.168.0.140:3000/api/images/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        alert('Image uploaded successfully');
      } else {
        alert('Image upload failed');
      }
    }
    catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
      </View>
      <View style={styles.footerContainer}>
        <CustomButton theme="primary" label="Choose a photo" onPress={pickImageAsync} />
        <CustomButton label="Use this photo" onPress={uploadImageAsync} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});
