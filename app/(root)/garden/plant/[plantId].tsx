import { Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from "react-native"
import React, { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import Carousel from "react-native-reanimated-carousel"
import {
  ArrowLeft,
  Thermometer,
  Sun,
  Droplets,
  FlaskConical,
  Timer,
  Calendar,
  Ruler,
  TreeDeciduous,
  Bug,
  Sprout,
  Scale,
  Leaf,
} from "lucide-react-native"
import { useAuth } from "@clerk/clerk-expo"

interface Temperature {
  min: number
  max: number
}

interface pH {
  min: number
  max: number
}

interface Pest {
  pest: string
  solution: string
}

interface Plant {
  _id: string
  common_name: string
  scientific_name: string
  category: string
  region: string
  ideal_conditions: {
    soil_type: string[]
    temperature_range: Temperature
    sunlight: string
    watering_frequency: string
    pH_range: pH
    fertilizer: string
  }
  growth_info: {
    time_to_harvest: string
    sowing_season: string[]
    spacing: string
    plant_height: string
  }
  maintenance: {
    pruning: string
    pest_control: Pest[]
  }
  yield: {
    per_plant: string
    optimal_yield: string
  }
  popular_varieties: string[]
  uses: string[]
  images: string[]
  notes: string
}

const { width: screenWidth } = Dimensions.get("window")

const PlantIndividual = () => {
  const { plantId } = useLocalSearchParams()
  const { getToken } = useAuth()
  const [plant, setPlant] = useState<Plant | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlantDetails = async () => {
      const token = await getToken()
      try {

        if(!token){
          return router.push('/sign-in')
        }
        const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/plant/${plantId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        setPlant(data)
        setLoading(false)
      } catch (err) {
        setError("Error fetching plant details")
        setLoading(false)
      }
    }

    fetchPlantDetails()
  }, [plantId])

  const renderCarouselItem = ({ item }: { item: string }) => (
    <View className="w-full h-full">
      <View className="w-full h-full rounded-lg overflow-hidden">
        <Image source={{ uri: item }} className="w-full h-full" resizeMode="cover" />
      </View>
    </View>
  )

  if (loading) return <Text className="text-center text-lg">Loading...</Text>
  if (error) return <Text className="text-center text-lg text-red-500">{error}</Text>
  if (!plant) return null

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <ScrollView className="flex-1">
        {/* Header with back button */}
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center p-4 absolute z-10">
          <ArrowLeft size={24} color="#1F2937" />
          <Text className="ml-2 text-gray-800 font-medium">Back</Text>
        </TouchableOpacity>

        {/* Image Carousel */}
        <View className="w-full h-80">
          <Carousel
            loop
            width={screenWidth}
            height={320}
            data={plant.images}
            renderItem={renderCarouselItem}
            autoPlay={true}
          />
        </View>

        {/* Plant Information */}
        <View className="px-4 -mt-6">
          <View className="bg-white rounded-t-3xl shadow-lg p-6">
            {/* Basic Info */}
            <Text className="text-3xl font-bold text-gray-800">{plant.common_name}</Text>
            <Text className="text-lg text-gray-600 italic mb-2">{plant.scientific_name}</Text>
            <View className="flex-row items-center mb-4">
              <Leaf size={20} color="#059669" />
              <Text className="ml-2 text-green-700">{plant.category}</Text>
            </View>

            {/* Region & Notes */}
            <View className="bg-green-50 rounded-lg p-4 mb-6">
              <Text className="text-gray-700 mb-2">{plant.region}</Text>
              <Text className="text-gray-600 italic">{plant.notes}</Text>
            </View>

            {/* Ideal Conditions */}
            <View className="mb-6">
              <Text className="text-xl font-semibold text-gray-800 mb-4">Ideal Growing Conditions</Text>
              <View className="grid grid-cols-2 gap-4">
                <View className="bg-green-50 p-4 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    <Thermometer size={20} color="#059669" />
                    <Text className="ml-2 font-medium text-gray-700">Temperature</Text>
                  </View>
                  <Text className="text-gray-600">
                    {plant.ideal_conditions.temperature_range.min}°C - {plant.ideal_conditions.temperature_range.max}°C
                  </Text>
                </View>

                <View className="bg-green-50 p-4 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    <Sun size={20} color="#059669" />
                    <Text className="ml-2 font-medium text-gray-700">Sunlight</Text>
                  </View>
                  <Text className="text-gray-600">{plant.ideal_conditions.sunlight}</Text>
                </View>

                <View className="bg-green-50 p-4 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    <Droplets size={20} color="#059669" />
                    <Text className="ml-2 font-medium text-gray-700">Watering</Text>
                  </View>
                  <Text className="text-gray-600">{plant.ideal_conditions.watering_frequency}</Text>
                </View>

                <View className="bg-green-50 p-4 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    <FlaskConical size={20} color="#059669" />
                    <Text className="ml-2 font-medium text-gray-700">Soil pH</Text>
                  </View>
                  <Text className="text-gray-600">
                    {plant.ideal_conditions.pH_range.min} - {plant.ideal_conditions.pH_range.max}
                  </Text>
                </View>
              </View>
            </View>

            {/* Growth Information */}
            <View className="mb-6">
              <Text className="text-xl font-semibold text-gray-800 mb-4">Growth Information</Text>
              <View className="space-y-4">
                <View className="flex-row items-center">
                  <Timer size={20} color="#059669" />
                  <Text className="ml-2 text-gray-700">Time to Harvest: {plant.growth_info.time_to_harvest}</Text>
                </View>
                <View className="flex-row items-center">
                  <Calendar size={20} color="#059669" />
                  <Text className="ml-2 text-gray-700">
                    Sowing Season: {plant.growth_info.sowing_season.join(", ")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ruler size={20} color="#059669" />
                  <Text className="ml-2 text-gray-700">Spacing: {plant.growth_info.spacing}</Text>
                </View>
                <View className="flex-row items-center">
                  <TreeDeciduous size={20} color="#059669" />
                  <Text className="ml-2 text-gray-700">Height: {plant.growth_info.plant_height}</Text>
                </View>
              </View>
            </View>

            {/* Maintenance */}
            <View className="mb-6">
              <Text className="text-xl font-semibold text-gray-800 mb-4">Maintenance</Text>
              <View className="bg-green-50 rounded-lg p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Sprout size={20} color="#059669" />
                  <Text className="ml-2 font-medium text-gray-700">Pruning</Text>
                </View>
                <Text className="text-gray-600">{plant.maintenance.pruning}</Text>
              </View>

              <Text className="font-medium text-gray-700 mb-2">Pest Control:</Text>
              {plant.maintenance.pest_control.map((pest, index) => (
                <View key={index} className="bg-green-50 rounded-lg p-4 mb-2">
                  <View className="flex-row items-center mb-2">
                    <Bug size={20} color="#059669" />
                    <Text className="ml-2 font-medium text-gray-700">{pest.pest}</Text>
                  </View>
                  <Text className="text-gray-600">Solution: {pest.solution}</Text>
                </View>
              ))}
            </View>

            {/* Yield Information */}
            <View className="mb-6">
              <Text className="text-xl font-semibold text-gray-800 mb-4">Yield</Text>
              <View className="space-y-4">
                <View className="flex-row items-center">
                  <Scale size={20} color="#059669" />
                  <Text className="ml-2 text-gray-700">Per Plant: {plant.yield.per_plant}</Text>
                </View>
                <Text className="text-gray-600">Optimal Yield: {plant.yield.optimal_yield}</Text>
              </View>
            </View>

            {/* Popular Varieties */}
            <View className="mb-6">
              <Text className="text-xl font-semibold text-gray-800 mb-4">Popular Varieties</Text>
              <View className="flex-row flex-wrap gap-2">
                {plant.popular_varieties.map((variety, index) => (
                  <View key={index} className="bg-green-100 rounded-full px-3 py-1">
                    <Text className="text-green-700">{variety}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Uses */}
            <View>
              <Text className="text-xl font-semibold text-gray-800 mb-4">Uses</Text>
              <View className="space-y-2">
                {plant.uses.map((use, index) => (
                  <Text key={index} className="text-gray-700">
                    • {use}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PlantIndividual

