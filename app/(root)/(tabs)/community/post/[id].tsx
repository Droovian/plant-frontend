import React, { useEffect, useState, useCallback } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  Text,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from "react-native"
import { useUser } from "@clerk/clerk-expo"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import CustomButton from "@/components/Button"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "@clerk/clerk-expo"

interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  type?: string
}

interface Comment {
  id: string
  user: string
  text: string
  createdAt: string
}

const PostDetail = () => {
  const { id } = useLocalSearchParams()
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const userId = user?.id
  const postId = id as string
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false)

  const fadeAnim = useState(new Animated.Value(0))[0]

  useEffect(() => {
    if (postId) {
      fetchPostDetails(postId)
      fetchComments(postId)
    }
  }, [postId])

  // console.log(comments);
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const fetchPostDetails = async (postId: string) => {
    const token = await getToken();
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/community/${postId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      setPost(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching post details:", error)
      alert("Error fetching post details")
      setIsLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {

    const token = await getToken();
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/community/${postId}/comments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error("Error fetching comments:", error)
      alert("Error fetching comments")
    }
  }

  const handleCommentSubmit = async () => {

    const token = await getToken();
    if (commentText.trim()) {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/community/${postId}/comment`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
           },
          body: JSON.stringify({
            text: commentText,
            userId: userId,
            postId: postId,
          }),
        })
        const newComment = await response.json()
        setComments([...comments, newComment])
        setCommentText("")
        setShowCommentInput(false)
      } catch (error) {
        console.error("Error submitting comment:", error)
        alert("Error submitting comment")
      }
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([fetchPostDetails(postId), fetchComments(postId)])
    setRefreshing(false)
  }, [postId])

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-green-100">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center bg-green-50">
        <MaterialCommunityIcons name="post-outline" size={64} color="#4CAF50" />
        <Text className="text-lg text-green-700 text-center mt-4">Post not found</Text>
        <CustomButton title="Go Back" onPress={() => router.back()} bgVariant="plant" className="mt-4" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-green-50" style={{ paddingTop: insets.top }}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />}>
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="bg-white rounded-lg shadow-lg mx-4 mt-20 overflow-hidden"
        >
          <View className="bg-black p-4">
            <Text className="text-2xl font-bold text-white">{post.title}</Text>
            <View className="flex-row items-center mt-2">
              <Ionicons name="person-circle-outline" size={20} color="white" />
              <Text className="text-sm text-white ml-2">{post.author}</Text>
              <Text className="text-xs text-white ml-auto">{new Date(post.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View className="p-4">
            <Text className="text-lg text-gray-800">{post.content}</Text>
          </View>
        </Animated.View>

        <View className="bg-white rounded-lg shadow-lg mx-4 mt-6 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">Comments ({comments.length})</Text>
            <TouchableOpacity onPress={() => setShowCommentInput(!showCommentInput)}>
              <Ionicons
                name={showCommentInput ? "close-circle-outline" : "add-circle-outline"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>

          {showCommentInput && (
            <Animated.View 
            style={{ opacity: fadeAnim }}
            className="mb-4">
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-700 min-h-[80px] mb-2"
                placeholder="Add a comment..."
                placeholderTextColor={"#636363"}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <CustomButton bgVariant="plant" title="Post Comment" onPress={handleCommentSubmit} className="w-full" />
            </Animated.View>
          )}

          {comments.map((comment, idx) => (
            <Animated.View
              style={{ opacity: fadeAnim }}
              key={comment.id || idx}
              className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0"
            >
              <View className="flex-row items-center p-3">
                <Ionicons name="person-circle-outline" size={24} color="black"  />
                <Text className="text-gray-600 text-sm font-semibold ml-2">{comment.text}</Text>
                <Text className="text-xs text-gray-500 ml-auto">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md"
        style={{ marginTop: insets.top }}
      >
        <Ionicons name="arrow-back" size={24} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  )
}

export default PostDetail

