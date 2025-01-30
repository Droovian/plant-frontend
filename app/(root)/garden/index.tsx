import React, { useEffect, useState, useCallback } from "react"
import { Text, View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import useLocationStore from "@/store"
import WeatherBanner from "@/components/WeatherBanner"
import Plant from "@/components/Plants"
import { Cloud, Sprout, Settings, Search, Sun, Droplets, Wind, AlertCircle } from "lucide-react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
const Garden = () => {
  const { location, address, errorMsg, addressErrorMsg, getLocation, getAddress } = useLocationStore()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const weatherApiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY!
  const [weather, setWeatherForecast] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchWeather = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${address?.city}&days=3`,
      )
      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }
      const data = await response.json()
      setWeatherForecast(data)
    } catch (error) {
      console.error("Error fetching weather")
      setWeatherForecast(null)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await getLocation()
      await getAddress()
      if (address?.city) {
        await fetchWeather()
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshing(false)
    }
  }, [address?.city])

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

  useEffect(() => {
    if (address?.city) {
      fetchWeather()
    }
  }, [address?.city])

  if (errorMsg || addressErrorMsg) {
    return (
      <View className="flex-1 justify-center items-center bg-red-50" style={{ paddingTop: insets.top }}>
        <AlertCircle size={48} color="#EF4444" />
        <Text className="text-red-500 mt-4 text-center px-4 font-medium">{errorMsg || addressErrorMsg}</Text>
        <TouchableOpacity onPress={onRefresh} className="mt-4 bg-red-500 px-6 py-3 rounded-full">
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    )
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
            <Cloud size={24} color="#059669" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Today's Weather</Text>
          </View>

          {weather && address ? (
            <WeatherBanner weather={weather} address={address} />
          ) : loading ? (
            <View className="h-32 justify-center items-center bg-white rounded-xl shadow-sm">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : null}

          {weather && (
            <View className="flex-row justify-between mt-4">
              <View className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
                <View className="flex-row items-center">
                  <Sun size={20} color="#059669" />
                  <Text className="text-gray-600 ml-2">UV Index</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-800 mt-1">{weather.current.uv}</Text>
              </View>
              <View className="flex-1 bg-white rounded-xl p-4 mx-2 shadow-sm">
                <View className="flex-row items-center">
                  <Droplets size={20} color="#059669" />
                  <Text className="text-gray-600 ml-2">Humidity</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-800 mt-1">{weather.current.humidity}%</Text>
              </View>
              <View className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
                <View className="flex-row items-center">
                  <Wind size={20} color="#059669" />
                  <Text className="text-gray-600 ml-2">Wind</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-800 mt-1">{weather.current.wind_kph} km/h</Text>
              </View>
            </View>
          )}
        </View>

        <View className="px-5 pb-5">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Sprout size={24} color="#059669" />
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

