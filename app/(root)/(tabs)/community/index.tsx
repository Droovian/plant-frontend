import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { FlatList, Text, TouchableOpacity, View, SafeAreaView, TextInput, RefreshControl, Modal, Alert } from "react-native"
import { useRouter } from "expo-router"
import CustomButton from "@/components/Button"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "@clerk/clerk-expo"
import Entypo from '@expo/vector-icons/Entypo';

interface Post {
  _id: string
  title: string
  content: string
  type: string
  userId: string
}

const Community: React.FC = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { getToken, userId } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const fetchPosts = useCallback(async () => {
    
    const token = await getToken();
    console.log('render');
    
    if(!token){
      return;
    }
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/community/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      alert("An error occurred. Please try again later.")
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    filterPosts()
  }, [searchQuery, posts])

  const filterPosts = () => {
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredPosts(filtered)
  }

  const deletePost = async (postId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/community/del/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setPosts(posts.filter((post) => post._id !== postId))
        setIsModalVisible(false);
        Alert.alert("Post deleted successfully.")
      }
      else{
        Alert.alert("Error", "Failed to delete post")
      }
    }
    catch(error){
      console.error("Error deleting post:", error)
      alert("An error occurred. Please try again later.")
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchPosts()
    setRefreshing(false)
  }, [fetchPosts])

  const renderPost = ({ item }: { item: Post }) => {

    return (
        <View
          key={item._id}
          className="rounded-xl p-4 mb-4 bg-white"
        >
          <TouchableOpacity onPress={() => router.push(`/community/post/${item?._id}`)} className="flex-row justify-between items-start">
            <View className="flex justify-center mr-4">
              <Text className="text-lg font-semibold text-gray-900 mb-1">{item.title}</Text>
              <Text className="text-sm text-gray-600" numberOfLines={2}>
                {item.content}
              </Text>
            </View>
            
            <View className="my-auto items-center flex-row gap-5">
              <View>
                  <View className={`rounded-full p-3 ${item.type === "Help" ? "bg-red-100" : "bg-green-100"}`}>
                    <AntDesign name="tagso" size={20} color={item.type === "Help" ? "red" : "green"} />
                  </View>
                  
                  <Text className="text-xs text-gray-600 mt-1">{item.type}</Text>
                  </View>
                  <TouchableOpacity
                  onPress={() => {
                    setSelectedPost(item);
                    setIsModalVisible(true);
                    console.log(item?.userId);
                  }}
                  >
                <Entypo name="dots-three-horizontal" size={15} color="black" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
    )
  };
  

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top }} className="bg-green-50">

    <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-semibold mb-4">Post Options</Text>
            {selectedPost && selectedPost?.userId === userId && (
              <TouchableOpacity onPress={() => deletePost(selectedPost._id)} className="py-3 border-b border-gray-200">
                <Text className="text-red-500">Delete Post</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setIsModalVisible(false)} className="py-3">
              <Text className="text-blue-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View className="flex-1 px-4">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Community</Text>
          <Text className="text-base text-gray-600 mt-2">Connect, share, and grow with fellow gardeners.</Text>
        </View>

        <View className="flex-row items-center bg-white rounded-full border border-gray-200 mb-4">
          <Ionicons name="search" size={20} color="gray" style={{ marginLeft: 12 }} />
          <TextInput
            className="flex-1 p-3 pl-2"
            placeholder="Search posts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-10">
              <Ionicons name="leaf-outline" size={48} color="gray" />
              <Text className="text-center text-gray-500 mt-4">No posts available. Be the first to contribute!</Text>
            </View>
          }
          contentContainerStyle={
            filteredPosts.length === 0 ? { flexGrow: 1, justifyContent: "center" } : { paddingBottom: 80 }
          }
        />

        <View className="absolute bottom-20 right-4 left-4">
          <CustomButton
            title="Create Post"
            bgVariant="plant"
            onPress={() => router.push("/community/create")}
            // icon={<AntDesign name="plus" size={20} color="white" style={{ marginRight: 8 }} />}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Community

