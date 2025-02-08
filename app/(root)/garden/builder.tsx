"use client"

import { useEffect, useRef, useState } from "react"
import { Text, View, Animated, ScrollView, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomButton from "@/components/Button"
import { MotiView } from "moti"
import { useGardenStore } from "@/store"
import Okra from "@/assets/images/okra.png";
import Tomato from "@/assets/images/tomato.png";
import Chilli from "@/assets/images/chilli.png";
import Eggplant from "@/assets/images/eggplant.png";

const vegetables = [
  { name: "Okra", image: Okra },
  { name: "Tomato", image: Tomato },
  { name: "Chilli", image: Chilli },
  { name: "Brinjal", image: Eggplant },
]

const Builder = () => {
  const { width, height, unit, squareArea, soilType } = useGardenStore()
  const [grid, setGrid] = useState<string[][]>([])
  const [selectedVegetable, setSelectedVegetable] = useState<string | null>(null)

  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    const newGrid = Array(Number(height))
      .fill(null)
      .map(() => Array(Number(width)).fill(""))
    setGrid(newGrid)
  }, [width, height, fadeAnim])

  const handleCellPress = (rowIndex: number, colIndex: number) => {
    if (selectedVegetable) {
      const newGrid = [...grid]
      newGrid[rowIndex][colIndex] = selectedVegetable
      setGrid(newGrid)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-green-100 p-4">
      <MotiView
        from={{ opacity: 0, translateY: -50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 1000 }}
        className="items-center mt-5 mb-5"
      >
        <Text className="text-2xl font-bold text-green-800">Build Your Garden</Text>
      </MotiView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {vegetables.map((veg, index) => (
          <TouchableOpacity
            key={index}
            className={`flex my-auto items-center p-4 mx-2 rounded-lg border-2 ${
              selectedVegetable === veg.name ? "border-green-800 bg-green-200" : "border-transparent"
            }`}
            onPress={() => setSelectedVegetable(veg.name)}
          >
            <Image source={veg?.image} className="w-10 h-10 rounded-full" />
            <Text className="mt-1 text-sm text-green-900">{veg.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedVegetable && (
        <Text className="text-center text-green-800 mb-3 text-lg">
          Selected: {selectedVegetable} - Tap grid to place
        </Text>
      )}

      <Animated.View style={{ opacity: fadeAnim }} className="items-center mb-5">
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row">
            {row.map((cell, colIndex) => (
              <TouchableOpacity 
                key={colIndex} 
                className={`w-10 h-10 border border-black flex items-center justify-center ${
                  selectedVegetable && cell === "" ? "bg-green-100" : "bg-green-300"
                }`}
                onPress={() => handleCellPress(rowIndex, colIndex)}
              >
                {cell && (
                  <Image 
                    source={ vegetables.find((v) => v.name === cell)?.image } 
                    className="w-4 h-4" 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </Animated.View>

      <View className="p-5 border border-gray-500 rounded-lg mx-5 mb-5">
        <Text className="text-lg text-green-900 mb-1">Dimensions: {width} x {height} {unit}</Text>
        <Text className="text-lg text-green-900 mb-1">Square Area: {squareArea}</Text>
        <Text className="text-lg text-green-900">Soil Type: {soilType}</Text>
      </View>

      <CustomButton title="Save my layout" bgVariant="plant" onPress={() => {}}  />
    </SafeAreaView>
  )
}

export default Builder