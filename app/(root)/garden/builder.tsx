import { useEffect, useRef, useState } from "react"
import { Text, View, Animated, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomButton from "@/components/Button"
import { MotiView } from "moti"
import { useGardenStore } from "@/store"
import { plantImages } from "@/constants"
import { compatibility } from "@/assets/data/plant"
import { LinearGradient } from "expo-linear-gradient"

const CELL_SIZE = Dimensions.get('window').width < 375 ? 40 : 48

const vegetables = [
  { name: "Okra", image: plantImages.okra, color: "#A8E6CE" },
  { name: "Tomato", image: plantImages.tomato, color: "#FFB3B3" },
  { name: "Chilli", image: plantImages.chilli, color: "#FFDBA4" },
  { name: "Brinjal", image: plantImages.Eggplant, color: "#D4B8E2" },
]

const Builder = () => {
  const { width, height, unit, squareArea, soilType, sunlightExposure, soilPH, soilNutrientLevel } = useGardenStore()
  const [grid, setGrid] = useState<string[][]>([])
  const [selectedVegetable, setSelectedVegetable] = useState<string | null>(null)
  const [insights, setInsights] = useState<{ companions: string[], avoid: string[] }>({ companions: [], avoid: [] })
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start()

    const newGrid = Array(Number(height))
      .fill(null)
      .map(() => Array(Number(width)).fill(""))
    setGrid(newGrid)
  }, [width, height])

  const handleCellPress = (rowIndex: number, colIndex: number) => {
    if (selectedVegetable) {
      const newGrid = [...grid]
      newGrid[rowIndex][colIndex] = selectedVegetable
      setGrid(newGrid)
      
      // Add haptic feedback here if desired
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start()
    }
  }

  const updateInsights = (vegetable: string) => {
    const compatibilityInfo = compatibility[0][vegetable]
    if (compatibilityInfo) {
      setInsights({
        companions: compatibilityInfo.companions || [],
        avoid: compatibilityInfo.avoid || [],
      })
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-50 to-green-100">
      <ScrollView showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 18 }}
          className="items-center py-6"
        >
          <Text className="text-3xl font-bold text-green-800">Virtual Garden</Text>
          <Text className="text-base text-green-600 mt-2">Design Your Perfect Layout</Text>
        </MotiView>

        {/* Vegetable Selection Carousel */}
        <View className="mb-6 px-4">
          <Text className="text-lg font-semibold text-green-700 mb-3 ml-2">Select Plants</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pt-2">
            {vegetables.map((veg, index) => (
              <TouchableOpacity
                key={index}
                className={`mr-4 rounded-xl shadow-sm overflow-hidden ${
                  selectedVegetable === veg.name ? "border-2 border-green-600" : ""
                }`}
                style={{ backgroundColor: veg.color }}
                onPress={() => {
                  setSelectedVegetable(veg.name)
                  updateInsights(veg.name)
                }}
              >
                <View className="p-4 items-center">
                  <Image 
                    source={veg.image} 
                    className="w-16 h-16 rounded-full mb-2"
                    style={{ backgroundColor: 'white' }}
                  />
                  <Text className="text-base font-medium text-green-800">{veg.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Garden Grid */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }} 
          className="items-center mb-6 px-4"
        >
          <View className="bg-white rounded-xl p-4 shadow-md">
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row">
                {row.map((cell, colIndex) => (
                  <TouchableOpacity 
                    key={colIndex} 
                    className={`m-0.5 rounded-lg overflow-hidden ${
                      cell ? "bg-opacity-20" : "bg-green-50"
                    }`}
                    style={{ 
                      width: CELL_SIZE, 
                      height: CELL_SIZE,
                      backgroundColor: cell ? 
                        vegetables.find(v => v.name === cell)?.color : 
                        "#f0fdf4"
                    }}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                  >
                    {cell && (
                      <View className="flex-1 items-center justify-center">
                        <Image 
                          source={vegetables.find((v) => v.name === cell)?.image} 
                          className="w-8 h-8" 
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Garden Information */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-xl p-5 shadow-md">
            <Text className="text-xl font-semibold text-green-800 mb-4">Garden Details</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-green-600">Dimensions</Text>
                <Text className="font-medium text-green-900">{width} x {height} {unit}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-green-600">Area</Text>
                <Text className="font-medium text-green-900">{squareArea}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-green-600">Soil Type</Text>
                <Text className="font-medium text-green-900">{soilType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Companion Planting Insights */}
        {selectedVegetable && (
          <View className="px-4 mb-6">
            <View className="bg-white rounded-xl p-5 shadow-md">
              <Text className="text-xl font-semibold text-green-800 mb-4">Planting Guide</Text>
              <View className="space-y-4">
                <View>
                  <Text className="text-green-600 mb-2">Good Companions</Text>
                  <Text className="text-green-900">
                    {insights.companions.length > 0 ? 
                      insights.companions.join(", ") : 
                      "No specific companions recommended"}
                  </Text>
                </View>
                <View>
                  <Text className="text-red-600 mb-2">Plants to Avoid</Text>
                  <Text className="text-red-900">
                    {insights.avoid.length > 0 ? 
                      insights.avoid.join(", ") : 
                      "No specific plants to avoid"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className="px-4 mb-8">
          <CustomButton 
            title="Save Garden Layout" 
            bgVariant="plant"
            className="py-4 rounded-xl shadow-lg"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Builder