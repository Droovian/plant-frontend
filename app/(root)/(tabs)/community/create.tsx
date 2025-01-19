import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import CustomButton from '@/components/Button'
import { useRouter } from 'expo-router'
import { useUser } from '@clerk/clerk-expo'
import { Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Create = () => {
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const router = useRouter();
  const user = useUser();

    if (!user) {
        router.push("/(auth)/sign-in");
    }
    
    const userId = user?.user?.id;

  const handleSubmit = async () => {

    // Handle form submission here
    // For example, you can send a POST request to your API
    // create post on http://192.168.0.140:3000/api/community/add

    if (!title || !content || !userId) {
      return alert('Please fill in all fields')
    }
   
    try {
        
        await fetch("http://192.168.0.140:3000/api/community/add", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                content,
                userId
            })
        });

        alert("Post created successfully!");

    }
    catch (error) {
        alert('An error occurred. Please try again later.')
    }
    // Redirect to the community feed screen

  }

  return (
    
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <View className="rounded-lg p-4 mb-4">
        <Text className="text-md font-medium text-gray-700 mb-2">Title</Text>
        <TextInput
          className="w-full px-3 py-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter post title"
        />
      </View>

      <View className="rounded-lg p-4 mb-4">
        <Text className="text-md font-medium text-gray-700 mb-2">Message</Text>
        <TextInput
          className="w-full h-32 px-3 py-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={content}
          onChangeText={setContent}
          placeholder="Enter your message"
          multiline
          textAlignVertical="top"
        />
      </View>

      <CustomButton
        title='Submit'
        onPress={handleSubmit}
        bgVariant='plant'
      />
    </SafeAreaView>
  )
}

export default Create

// Note: StyleSheet.create({}) is not needed when using NativeWind

