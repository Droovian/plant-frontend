import type React from "react"
import { View, Text, Image, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useMemo } from "react"

interface WeatherData {
  current: {
    condition: { text: string; icon: string }
    temp_c: number
    wind_kph: number
    humidity: number
    uv: number
  }
  forecast: {
    forecastday: Array<{
      date: string
      day: {
        condition: { text: string; icon: string }
        maxtemp_c: number
        mintemp_c: number
      }
    }>
  }
}

interface WeatherBannerProps {
  weather: WeatherData
  address: any 
}

const WeatherBanner: React.FC<WeatherBannerProps> = ({ weather, address }) => {
  return (
    <View className="bg-blue-500 rounded-3xl p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-white text-2xl font-bold">{address?.city}</Text>
          <Text className="text-white text-sm">{address?.country}</Text>
        </View>
        <View className="flex-row items-center">
          <Image source={{ uri: `https:${weather.current.condition.icon}` }} className="w-16 h-16" />
          <Text className="text-white text-4xl font-bold ml-2">{Math.round(weather.current.temp_c)}°C</Text>
        </View>
      </View>
      <Text className="text-white text-lg mb-2">{weather.current.condition.text}</Text>
      <View className="flex-row justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="water-outline" size={18} color="white" />
          <Text className="text-white ml-1">{weather.current.humidity}%</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="speedometer-outline" size={18} color="white" />
          <Text className="text-white ml-1">{weather.current.wind_kph} km/h</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="sunny-outline" size={18} color="white" />
          <Text className="text-white ml-1">UV {weather.current.uv}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {weather.forecast.forecastday.map((day) => (
          <View key={day.date} className="items-center mr-4">
            <Text className="text-white">{new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}</Text>
            <Image source={{ uri: `https:${day.day.condition.icon}` }} className="w-10 h-10 my-1" />
            <Text className="text-white">{Math.round(day.day.maxtemp_c)}°</Text>
            <Text className="text-white text-xs">{Math.round(day.day.mintemp_c)}°</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default WeatherBanner

