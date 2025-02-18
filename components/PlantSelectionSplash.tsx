import React, { useState } from "react"
import { View, Text, Image, TouchableOpacity, FlatList, Modal, SafeAreaView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { X, Check, AlertCircle } from "lucide-react-native"
import { Crop } from "@/types/plant"
import { BlurView } from "expo-blur"

const plants: Crop[] = [
  { id: "wheat", name: "Wheat", npkRequirement: { N: 120, P: 60, K: 40 } },
  { id: "rice", name: "Rice", npkRequirement: { N: 100, P: 50, K: 50 } },
  { id: "maize", name: "Maize", npkRequirement: { N: 150, P: 75, K: 50 } },
  { id: "tomato", name: "Tomato", npkRequirement: { N: 90, P: 45, K: 60 } },
  { id: "potato", name: "Potato", npkRequirement: { N: 120, P: 50, K: 150 } },
  { id: "brinjal", name: "Brinjal (Eggplant)", npkRequirement: { N: 100, P: 50, K: 50 } },
  { id: "chili", name: "Chili", npkRequirement: { N: 80, P: 40, K: 60 } },
  { id: "cucumber", name: "Cucumber", npkRequirement: { N: 100, P: 50, K: 50 } },
  { id: "pumpkin", name: "Pumpkin", npkRequirement: { N: 100, P: 50, K: 50 } },
  { id: "bittergourd", name: "Bittergourd", npkRequirement: { N: 100, P: 50, K: 50 } },
]

export default function PlantSelectionScreen({ onComplete }: { onComplete: (plants: Crop[]) => Promise<void> }) {
  const [selectedPlants, setSelectedPlants] = useState<Crop[]>([])
  const [modalVisible, setModalVisible] = useState(true)

  const togglePlantSelection = (plant: Crop) => {
    setSelectedPlants((prevSelected) =>
      prevSelected.includes(plant)
        ? prevSelected.filter((p) => p.id !== plant.id)
        : prevSelected.length < 5
        ? [...prevSelected, plant]
        : prevSelected
    )
  }

  const handleComplete = () => {
    onComplete(selectedPlants)
    setModalVisible(false)
  }

  const PlantCard = ({ item }: { item: Crop }) => {
    const isSelected = selectedPlants.includes(item)
    return (
      <TouchableOpacity
        onPress={() => togglePlantSelection(item)}
        className="items-center m-2"
      >
        <View
          className={`w-28 h-32 rounded-2xl ${
            isSelected ? "bg-green-50" : "bg-white"
          } shadow-lg overflow-hidden`}
        >
          <View className="h-24 w-full bg-gray-100 rounded-t-2xl overflow-hidden">
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full"
            />
            {isSelected && (
              <BlurView
                intensity={70}
                className="absolute inset-0 items-center justify-center"
              >
                <View className="bg-green-600 rounded-full p-2">
                  <Check color="white" size={20} />
                </View>
              </BlurView>
            )}
          </View>
          <View className="p-1">
            <Text className="text-center text-sm font-medium text-gray-800" numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-1 px-4 pt-2">
          {/* Header */}
          <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
            <View>
              <Text className="text-2xl font-bold text-gray-800">Select Plants</Text>
              <Text className="text-sm text-gray-500 mt-1">Choose up to 5 plants for your garden</Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <X color="#374151" size={20} />
            </TouchableOpacity>
          </View>

          {/* Selection Progress */}
          <View className="py-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold text-gray-800">
                {selectedPlants.length}/5 Selected
              </Text>
              {selectedPlants.length === 5 && (
                <View className="ml-2 px-3 py-1 bg-green-100 rounded-full">
                  <Text className="text-green-700 text-sm font-medium">Ready!</Text>
                </View>
              )}
            </View>
            {selectedPlants.length === 0 && (
              <View className="flex-row items-center">
                <AlertCircle size={16} color="#6B7280" className="mr-1" />
                <Text className="text-gray-500 text-sm">Select at least 5 plants</Text>
              </View>
            )}
          </View>

          {/* Plant Grid */}
          <FlatList
            data={plants}
            renderItem={({ item }) => <PlantCard item={item} />}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 8 }}
          />

          {/* Action Button */}
          <View className="py-4 px-4 border-t border-gray-100">
            <TouchableOpacity
              onPress={handleComplete}
              disabled={selectedPlants.length < 5}
              className={`py-4 rounded-xl ${
                selectedPlants.length === 5
                  ? "bg-green-600"
                  : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-center font-bold text-lg ${
                  selectedPlants.length === 5 ? "text-white" : "text-gray-400"
                }`}
              >
                {selectedPlants.length === 5
                  ? "Continue to Garden"
                  : `Select ${5 - selectedPlants.length} more plants`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}