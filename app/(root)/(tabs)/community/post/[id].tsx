import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';  // Make sure you're using expo-router here
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';

interface Post {
  id: string;
  title: string;
  content: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
}

const PostDetail = () => {
  const { id, info } = useLocalSearchParams();
  
console.log(id);

  const postId = id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>('');

  useEffect(() => {
    if (postId) {
      fetchPostDetails(postId);
    //   fetchComments(postId);
    }
  }, [postId]);

  const fetchPostDetails = async (postId: string) => {
    try {
      const response = await fetch(`http://192.168.0.140:3000/api/community/${postId}`);
      const data = await response.json();
      setPost(data);
    } catch (error) {
      alert('Error fetching post details');
    }
  };

//   const fetchComments = async (postId: string) => {
//     try {
//       const response = await fetch(`http://192.168.0.140:3000/api/community/comments/${postId}`);
//       const data = await response.json();
//       setComments(data);
//     } catch (error) {
//       alert('Error fetching comments');
//     }
//   };

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      try {
        const response = await fetch(`http://192.168.0.140:3000/api/community/comments/${postId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentText }),
        });
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setCommentText('');
      } catch (error) {
        alert('Error submitting comment');
      }
    }
  };

  if (!post) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-6">{post.title}</Text>
      <Text className="text-lg text-gray-700 mb-4">{post.content}</Text>

      <View className="mb-6">
        <Text className="text-xl font-bold">Comments</Text>
        {comments.map((comment) => (
          <View key={comment.id} className="mb-4">
            <Text className="text-sm font-semibold">{comment.user}</Text>
            <Text>{comment.text}</Text>
          </View>
        ))}
        <TextInput
          className="border p-2 mb-4 rounded"
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity onPress={handleCommentSubmit}>
          <Text className="text-blue-500">Post Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostDetail;
