import { useState } from "react"
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native"
import { StatusBar } from "expo-status-bar"

const plants = [
  { id: 1, name: "Tomato", image: "/placeholder.svg?height=100&width=100" },
  { id: 2, name: "Basil", image: "/placeholder.svg?height=100&width=100" },
  { id: 3, name: "Rosemary", image: "/placeholder.svg?height=100&width=100" },
  { id: 4, name: "Lavender", image: "/placeholder.svg?height=100&width=100" },
  { id: 5, name: "Mint", image: "/placeholder.svg?height=100&width=100" },
  { id: 6, name: "Cucumber", image: "/placeholder.svg?height=100&width=100" },
  { id: 7, name: "Strawberry", image: "/placeholder.svg?height=100&width=100" },
  { id: 8, name: "Pepper", image: "/placeholder.svg?height=100&width=100" },
  { id: 9, name: "Lettuce", image: "/placeholder.svg?height=100&width=100" },
  { id: 10, name: "Carrot", image: "/placeholder.svg?height=100&width=100" },
  { id: 11, name: "Spinach", image: "/placeholder.svg?height=100&width=100" },
  { id: 12, name: "Cilantro", image: "/placeholder.svg?height=100&width=100" },
]

export default function PlantSelectionScreen() {
  const [selectedPlants, setSelectedPlants] = useState<number[]>([])

  const togglePlantSelection = (plantId: number) => {
    setSelectedPlants((prev) => (prev.includes(plantId) ? prev.filter((id) => id !== plantId) : [...prev, plantId]))
  }

  const renderPlantItem = ({ item }: { item: (typeof plants)[0] }) => (
    <TouchableOpacity
      onPress={() => togglePlantSelection(item.id)}
      className={`w-1/3 p-2 items-center ${selectedPlants.includes(item.id) ? "bg-green-200" : "bg-white"}`}
    >
      <Image source={{ uri: item.image }} className="w-20 h-20 rounded-full" />
      <Text className="mt-2 text-center font-semibold">{item.name}</Text>
    </TouchableOpacity>
  )

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar style="auto" />
      <View className="p-6 bg-white">
        <Text className="text-2xl font-bold text-center">Choose Your Plants</Text>
        <Text className="text-base text-center mt-2">Select at least 5 plants to get started</Text>
      </View>
      <FlatList
        data={plants}
        renderItem={renderPlantItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        className="flex-1"
      />
      <View className="p-6">
        <TouchableOpacity
          className={`py-3 px-6 rounded-full ${selectedPlants.length >= 5 ? "bg-green-500" : "bg-gray-300"}`}
          disabled={selectedPlants.length < 5}
        >
          <Text className="text-white text-center font-semibold">
            {selectedPlants.length >= 5 ? "Continue" : `Select ${5 - selectedPlants.length} more`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

