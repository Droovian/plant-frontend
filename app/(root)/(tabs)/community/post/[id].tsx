import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '@/components/Button';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  createdAt: string;
}

const PostDetail = () => {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const userId = user?.id;
  const postId = id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (postId) {
      fetchPostDetails(postId);
      fetchComments(postId);
    }
  }, [postId]);

  const fetchPostDetails = async (postId: string) => {
    try {
      const response = await fetch(`http://192.168.0.140:3000/api/community/${postId}`);
      const data = await response.json();
      setPost(data);
      setIsLoading(false);
    } catch (error) {
      alert('Error fetching post details');
      setIsLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`http://192.168.0.140:3000/api/community/${postId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      alert('Error fetching comments');
    }
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      try {
        const response = await fetch(`http://192.168.0.140:3000/api/community/${postId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: commentText,
            userId: userId,
            postId: postId
          }),
        });
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setCommentText('');
      } catch (error) {
        alert('Error submitting comment');
      }
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!post) {
    return <Text className="text-lg text-red-500 text-center mt-6">Post not found</Text>;
  }

  return (
    <ScrollView className="bg-gray-50 flex-1">
      <View className="bg-white p-6 rounded-lg shadow-lg mx-4 mt-4">
        <Text className="text-3xl font-bold text-gray-800 mb-3">{post.title}</Text>
        <Text className="text-sm text-gray-600 mb-4">By {post.author} • {new Date(post.createdAt).toLocaleDateString()}</Text>
        <Text className="text-lg text-gray-700">{post.content}</Text>
      </View>

      <View className="bg-white p-6 rounded-lg shadow-lg mx-4 mt-6">
        <Text className="text-2xl font-semibold text-gray-800 mb-4">Comments</Text>
        {comments.map((comment, idx) => (
          <View key={comment.id || idx} className="border-b border-gray-200 pb-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="person-circle-outline" size={24} color="#7f8c8d" />
              <Text className="text-sm font-semibold text-gray-800 ml-3">{comment.user}</Text>
              <Text className="text-xs text-gray-500 ml-auto">{new Date(comment.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text className="text-gray-600">{comment.text}</Text>
          </View>
        ))}

        <View className="mt-6">
          <TextInput
            className="border border-gray-300 rounded-lg p-4 text-gray-700 min-h-[80px] mb-4"
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <CustomButton bgVariant='plant' title="Post Comment" onPress={handleCommentSubmit} className="w-full" />
        </View>
      </View>
    </ScrollView>
  );
};

export default PostDetail;
