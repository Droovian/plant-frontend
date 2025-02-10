import { useEffect, useState, useCallback } from "react"
import { FlatList, Text, TouchableOpacity, View, SafeAreaView, TextInput, RefreshControl, Modal, Alert, Image } from "react-native"
import { useRouter } from "expo-router"
import CustomButton from "@/components/Button"
import { Ionicons, Feather } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "@clerk/clerk-expo"
import AntDesign from '@expo/vector-icons/AntDesign';

interface Post {
  _id: string
  title: string
  content: string
  type: string
  userId: string
  createdAt?: Date
}

interface PostResponse {
  posts: Post[]
  currentPage: number
  totalPages: number
  totalPosts: number
}

const Community = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { getToken, userId } = useAuth()
  
  const [posts, setPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchPosts = useCallback(async (page: number, isRefresh: boolean = false) => {
    const token = await getToken();
    
    if(!token){
      return null;
    }
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/community/all?page=${page}&limit=5`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      const data: PostResponse = await response.json()
      
      if (isRefresh) {
        setPosts(data.posts)
      } else {

        setPosts(prevPosts => {
          const newPosts = data.posts.filter(
            newPost => !prevPosts.some(existingPost => existingPost._id === newPost._id)
          )
          return [...prevPosts, ...newPosts]
        })
      }
      
      setCurrentPage(data.currentPage)
      setTotalPages(data.totalPages)
      
      return data
    } catch (error) {
      console.error("Error fetching posts:", error)
      Alert.alert("An error occurred. Please try again later.")
      return null
    }
  }, [])

  useEffect(() => {
    fetchPosts(1)
  }, [])

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

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchPosts(1, true)
    setRefreshing(false)
  }, [])

  const loadMorePosts = useCallback(async () => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true)
      await fetchPosts(currentPage + 1)
      setIsLoadingMore(false)
    }
  }, [currentPage, totalPages, isLoadingMore])

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

  const renderPost = ({ item }: { item: Post }) => {
    return (
      <View key={item._id} className="rounded-xl p-4 mb-4 bg-white border border-gray-200">
      <TouchableOpacity
        onPress={() => router.push(`/community/post/${item?._id}`)}
        className="flex-row justify-between items-start"
      >
        <View className="flex-1 mr-4">
          <Text className="text-lg font-semibold text-gray-900 mb-1">{item.title}</Text>
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {item.content}
          </Text>
          <View className="flex-row items-center mt-2">
            <View className={`rounded-full px-2 py-1 ${item.type === "Help" ? "bg-red-100" : "bg-green-100"}`}>
              <Text className={`text-xs ${item.type === "Help" ? "text-red-600" : "text-green-600"}`}>
                {item.type}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 ml-2">2h ago</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedPost(item)
            setIsModalVisible(true)
          }}
          className="p-2"
        >
          <Feather name="more-vertical" size={16} color="gray" />
        </TouchableOpacity>
        
      </TouchableOpacity>
    </View>
    )
  };
  
  const renderFooter = () => {
    return isLoadingMore ? (
      <View className="p-4 justify-center items-center">
        <Text className="text-gray-500">Loading more posts...</Text>
      </View>
    ) : null
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top }} className="bg-white">
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 shadow-2xl">
            <View className="w-16 h-1 bg-gray-300 self-center rounded-full mb-4"></View>
            
            <Text className="text-xl font-bold text-gray-800 text-center mb-6">Post Options</Text>
            
            {selectedPost && selectedPost?.userId === userId && (
                <TouchableOpacity 
                  onPress={() => deletePost(selectedPost._id)} 
                  className="py-4 flex-row items-center justify-center border-b border-gray-100"
                >
                  <Feather name="trash-2" size={20} color="red" className="mr-3" />
                  <Text className="text-red-500 text-base font-semibold">Delete Post</Text>
                </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={() => setIsModalVisible(false)} 
              className="py-4 flex-row items-center justify-center"
            >
              <Feather name="x" size={20} color="blue" className="mr-3" />
              <Text className="text-blue-500 text-base font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View className="flex-1 px-4">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Community</Text>
          <Text className="text-base text-gray-600 mt-2">Connect, share, and grow with fellow gardeners.</Text>
        </View>

        <View className="flex-row items-center bg-gray-100 rounded-full mb-4">
          <Ionicons name="search" size={20} color="gray" style={{ marginLeft: 12 }} />
          <TextInput
            className="flex-1 p-3 pl-2"
            placeholder="Search posts..."
            placeholderTextColor={"#636363"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
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

        <View className="absolute bottom-20 right-4">
            <AntDesign name="pluscircle" size={40} color="green" onPress={() => router.push("/community/create")} />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Community