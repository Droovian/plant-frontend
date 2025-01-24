import React, { useEffect, useState, useRef, useCallback } from "react"
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native"
import { router } from "expo-router"
import Carousel from "react-native-reanimated-carousel"
import { useAuth } from "@clerk/clerk-expo"

interface Plant {
  _id: string
  common_name: string
  scientific_name: string
  category: string
  images: string[]
}

const { width: screenWidth } = Dimensions.get("window")

const Plant = () => {
  const { getToken } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const carouselRef = useRef(null)

  useEffect(() => {
    const fetchPlants = async () => {
      const token = await getToken();
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/plant`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        setPlants(data)
        setLoading(false)
      } catch (err) {
        setError("Error fetching plants")
        setLoading(false)
      }
    }

    fetchPlants()
  }, [])

  const renderPlantItem = useCallback(({ item }: { item: Plant }) => {
    return (
    <TouchableOpacity
      onPress={() => router.push(`/garden/plant/${item._id}`)}
      className="bg-white rounded-lg shadow-md mx-2 my-4 overflow-hidden"
      style={{ width: screenWidth - 32 }} // Adjust width to account for padding
    >
      <Image source={{ uri: item.images[0] }} className="w-full h-48 rounded-t-lg" />
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-1">{item.common_name}</Text>
        <Text className="text-sm text-gray-600 italic mb-1">{item.scientific_name}</Text>
        <Text className="text-sm text-gray-700">{item.category}</Text>
      </View>
    </TouchableOpacity>
  )}, [])

  if (loading) return <Text className="text-center text-lg mt-6">Loading...</Text>
  if (error) return <Text className="text-center text-lg text-red-500 mt-6">{error}</Text>

  return (
    <View className="flex justify-center">
      <Carousel
        loop
        width={screenWidth-2}
        height={screenWidth * 0.8} 
        autoPlay={false}
        data={plants}
        scrollAnimationDuration={1000}
        renderItem={renderPlantItem}
        ref={carouselRef}
      />
    </View>
  )
}

export default Plant

