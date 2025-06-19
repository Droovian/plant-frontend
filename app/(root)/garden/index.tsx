import React, { useEffect, useState, useCallback } from "react"
import { Text, View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import useLocationStore from "@/store"
import Plant from "@/components/Plants"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import WeatherBanner from "@/components/WeatherBanner"
const Garden = () => {
  const { location, address, errorMsg, addressErrorMsg, weather, weatherErrorMsg, getLocation, getAddress } = useLocationStore();
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

    const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getLocation();
      await getAddress();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    ;(async () => {
      try {
        await getLocation()
        await getAddress()
      } catch (error) {
        console.error("Error initializing location/address:", error)
      }
    })()
  }, [])

  if (errorMsg || addressErrorMsg || weatherErrorMsg) {
  return (
    <View className="flex-1 justify-center items-center bg-red-50" style={{ paddingTop: insets.top }}>
      <Text className="text-red-500 mt-4 text-center px-4 font-medium">{errorMsg || addressErrorMsg || weatherErrorMsg}</Text>
      <TouchableOpacity onPress={onRefresh} className="mt-4 bg-red-500 px-6 py-3 rounded-full">
        <Text className="text-white font-medium">Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

  return (
    <SafeAreaView className="flex-1 bg-green-50" style={{ paddingTop: insets.top }}>
    
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md"
        style={{ marginTop: insets.top }}
      >
        <Ionicons name="arrow-back" size={24} color="#4CAF50" />
      </TouchableOpacity>
      <ScrollView
        className=""
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" colors={["#059669"]} />
        }
      >

        <View className="bg-green-600 px-5 py-3">
          <Text className="text-green-50 text-sm font-medium">Your Garden Location</Text>
          <Text className="text-white text-lg font-semibold">
            {address?.city}, {address?.region}
          </Text>
        </View>
        <View className="p-5">
            <View className="flex-row items-center mb-4">
              {/* <Cloud size={24} color="#059669" /> */}
              <Text className="text-xl font-bold text-gray-800 ml-2">Today's Weather</Text>
            </View>
            {weather && address ? (
              <WeatherBanner weather={weather} address={address} />
            ) : (
              <View className="h-32 justify-center items-center bg-white rounded-xl shadow-sm">
                <ActivityIndicator size="large" color="#059669" />
              </View>
            )}
          </View>
        <View className="mt-5 px-5 pb-5">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              {/* <Sprout size={24} color="#059669" /> */}
              <Text className="text-xl font-bold text-gray-800 ml-2">Recommended Plants</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-green-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-4">Based on your location and current weather conditions</Text>

        </View>

        <Plant />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Garden

