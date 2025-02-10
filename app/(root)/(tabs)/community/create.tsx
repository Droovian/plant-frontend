import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '@/components/Button';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CreatePost = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [type, setType] = useState<string>('General');
  const { getToken } = useAuth();
  const router = useRouter();
  const { user } = useUser();

  if (!user) {
    router.push('/(auth)/sign-in');
    return null;
  }

  const userId = user?.id;

  const handleSubmit = async () => {
    const token = await getToken();

    if (!token) {
      alert('Please sign in to create a post');
      return;
    }

    if (!title.trim() || !content.trim() || !type || !userId) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/community/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, type, userId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      alert('Post created successfully!');
      setTitle('');
      setContent('');
      setType('General');
    } catch (error) {
      alert('An error occurred. Please try again later.');
      console.error('Error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="format-title" size={24} color="#4A5568" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter post title"
                  placeholderTextColor="#A0AEC0"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="text" size={24} color="#4A5568" style={styles.icon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={content}
                  onChangeText={setContent}
                  placeholder="Enter your message"
                  placeholderTextColor="#A0AEC0"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.pickerContainer}>
                <MaterialCommunityIcons name="format-list-bulleted-type" size={24} color="#4A5568" style={styles.icon} />
                <Picker
                  selectedValue={type}
                  onValueChange={(itemValue: string) => setType(itemValue)}
                  style={styles.picker}
                >
                  {['General', 'Help', 'Tips', 'DIY', 'Organic', 'Identification', 'Inspiration', 'Projects'].map((item) => (
                    <Picker.Item key={item} label={item} value={item} color="#2D3748" />
                  ))}
                </Picker>
              </View>
            </View>
           
            <CustomButton title="Create Post" onPress={handleSubmit} bgVariant="plant" className='mt-32 w-3/4 mx-auto' />
          </ScrollView>
          
            

        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollView: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D3748',
  },
  textArea: {
    height: 120,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    paddingLeft: 12,
  },
  picker: {
    flex: 1,
    height: 50,
  },
});

export default CreatePost;