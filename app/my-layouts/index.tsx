import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";

const MyLayoutsList = () => {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const fetchLayouts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/layout?userId=${userId}`);
      setLayouts(response.data);
    } catch (error) {
      console.error("Error fetching layouts:", error);
      Alert.alert("Error", "Failed to fetch layouts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchLayouts();
    }
  }, [userId]);

  const navigateToLayout = (layoutId: string) => {
    router.push(`/my-layouts/${layoutId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteLayout = async (layoutId: string) => {
    Alert.alert(
      "Delete Layout",
      "Are you sure you want to delete this layout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/layout/${layoutId}`);
              setLayouts((prevLayouts) => prevLayouts.filter((layout: any) => layout._id !== layoutId));
            } catch (error) {
              console.error("Error deleting layout:", error);
              Alert.alert("Error", "Failed to delete layout.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <AnimatePresence>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}
        transition={{ type: "timing", duration: 300 }}
        key={item._id}
        className="mx-4 my-2 bg-white rounded-xl shadow-md overflow-hidden"
      >
        <View className="p-4 border-l-4 border-green-500">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-800">Layout #{item.id}</Text>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => handleDeleteLayout(item.id)} className="mr-2">
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-green-700">Saved</Text>
              </View>
            </View>
          </View>
          <View className="mt-2">
            <Text className="text-gray-500 text-sm">Created on</Text>
            <Text className="text-gray-700">{formatDate(item.createdAt)}</Text>
          </View>
          <View className="flex-row justify-end mt-2">
            <TouchableOpacity className="flex-row items-center" onPress={() => navigateToLayout(item.id)}>
              <Ionicons name="chevron-forward" size={16} color="#16a34a" />
              <Text className="text-green-600 text-sm">View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </MotiView>
    </AnimatePresence>
  );

  const EmptyListComponent = () => (
    <View className="flex-1 justify-center items-center p-8">
      <View className="bg-gray-50 rounded-2xl p-6 items-center w-full max-w-sm">
        <Ionicons name="leaf-outline" size={48} color="#16a34a" />
        <Text className="text-xl font-bold text-gray-800 mt-4 text-center">No Layouts Yet</Text>
        <Text className="text-gray-500 text-center mt-2">
          You haven't created any layouts. Create your first layout to see it here.
        </Text>
        <TouchableOpacity
          className="mt-6 bg-green-500 py-3 px-6 rounded-full"
          onPress={() => router.push("/garden/planner")}
        >
          <Text className="text-white font-semibold">Create New Layout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLayouts();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="bg-white rounded-full p-2 shadow">
          <Ionicons name="arrow-back" size={24} color="#16a34a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">My Layouts</Text>
        <TouchableOpacity
          onPress={() => router.push("/garden/planner")}
          className="bg-green-800 rounded-full p-2 shadow"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="text-gray-600 mt-4">Loading your layouts...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={layouts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyListComponent />}
          contentContainerClassName="pb-6 flex-grow"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyLayoutsList;