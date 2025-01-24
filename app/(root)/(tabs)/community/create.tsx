import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '@/components/Button';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useAuth } from '@clerk/clerk-expo';

const Create = () => {
  const [title, setTitle] = useState<string>('');
  const { getToken } = useAuth();
  const [content, setContent] = useState<string>('');
  const [type, setType] = useState<string>('General');
  const router = useRouter();
  const { user } = useUser();

  if (!user) {
    router.push('/(auth)/sign-in');
    return null;
  }

  const userId = user?.id;

  const handleSubmit = async () => {

    const token = await getToken();

    if(!token){
      alert('Please sign in to create a post');
    }

    if (!title || !content || !type || !userId) {
      return alert('Please fill in all fields');
    }

    try {
      await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/community/add`, {
        method: 'POST',
        headers: {
           Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          type,
          userId,
        }),
      });

      alert('Post created successfully!');
      setTitle('');
      setContent('');
      setType('General'); 
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={60}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <View className="rounded-lg p-4 mb-4">
        <Text className="text-md font-medium text-gray-700 mb-2">Title</Text>
        <TextInput
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter post title"
        />
      </View>

      <View className="rounded-lg p-4 mb-4">
        <Text className="text-md font-medium text-gray-700 mb-2">Message</Text>
        <TextInput
          className="w-full h-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={content}
          onChangeText={setContent}
          placeholder="Enter your message"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View className="rounded-lg p-4 mb-4">
        <Text className="text-md font-medium text-gray-700 mb-2">Type</Text>
        {/* <View className="border rounded-md"> */}
          <Picker
            selectedValue={type}
            onValueChange={(itemValue: string) => setType(itemValue)}
            style={{ backgroundColor: '' }}
          >
            <Picker.Item label="General" value="General" color='black' />
            <Picker.Item label="Help" value="Help" color='black'  />
            <Picker.Item label="Tips" value="Tips" color='black'  />
            <Picker.Item label="DIY" value="DIY" color='black'  />
            <Picker.Item label="Organic" value="Organic" color='black'  />
            <Picker.Item label="Identification" value="Identification" color='black'  />
            <Picker.Item label="Inspiration" value="Inspiration" color='black'  />
            <Picker.Item label="Projects" value="Projects" color='black'  />
          </Picker>
        {/* </View> */}
      </View>

      <CustomButton title="Submit" onPress={handleSubmit} bgVariant="plant" />
    </SafeAreaView>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Create;
