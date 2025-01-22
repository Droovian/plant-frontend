import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { FlatList, Text, TouchableOpacity, View, SafeAreaView, TextInput, RefreshControl } from "react-native"
import { useRouter } from "expo-router"
import CustomButton from "@/components/Button"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface Post {
  _id: string
  title: string
  content: string
  type: string
}

const Community: React.FC = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [posts, setPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/community/all`, {
        method: "GET",
        headers: {
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchPosts()
    setRefreshing(false)
  }, [fetchPosts])

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      key={item._id}
      onPress={() => router.push(`/community/post/${item?._id}`)}
      className="rounded-xl p-4 mb-4 shadow-md border border-gray-400 bg-transparent"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <Text className="text-lg font-semibold text-gray-900 mb-1">{item.title}</Text>
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {item.content}
          </Text>
        </View>
        <View className="items-center">
          <View className={`rounded-full p-2 ${item.type === "Help" ? "bg-red-100" : "bg-green-100"}`}>
            <AntDesign name="tagso" size={20} color={item.type === "Help" ? "red" : "green"} />
          </View>
          <Text className="text-xs text-gray-600 mt-1">{item.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top }} className="bg-green-50">
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

