import { useState, useCallback, useEffect } from "react"
import { View, Text, Modal, TouchableOpacity, ScrollView, Animated } from "react-native"
import { fertilizers, crops } from "@/assets/data/plant"
import { ChevronDown, Minus, Plus, Leaf, AlertTriangle } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Crop, Fertilizer } from "@/types/plant"
import { Image } from "react-native"
import { AI_GEN_IMAGES } from "@/constants"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

interface NPKValues {
  N: number
  P: number
  K: number
}

const FertilizerCalculator = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [fadeAnim] = useState(new Animated.Value(0))
  const [selectedCrop, setSelectedCrop] = useState<Crop>(crops[0])
  const [userPlants, setUserPlants] = useState<Crop[]>([])
  const [npkValues, setNpkValues] = useState<NPKValues>(selectedCrop.npkRequirement)
  const [unit, setUnit] = useState<"Acre" | "Hectare">("Acre")
  const [plotSize, setPlotSize] = useState<number>(1)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [result, setResult] = useState<Record<string, { quantity: string; cost: string }> | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [])

  const calculateFertilizer = () => {
    setLoading(true)
    setTimeout(() => {
      let remainingN = npkValues.N * plotSize
      let remainingP = npkValues.P * plotSize
      let remainingK = npkValues.K * plotSize

      const requiredFertilizers: Record<string, { quantity: string; cost: string }> = {}

      const sortedFertilizers = [...fertilizers].sort((a, b) => {
        const aScore = (a.composition.N + a.composition.P + a.composition.K) / a.costPerBag
        const bScore = (b.composition.N + b.composition.P + b.composition.K) / b.costPerBag
        return bScore - aScore
      })

      sortedFertilizers.forEach((fertilizer) => {
        if (remainingN <= 0 && remainingP <= 0 && remainingK <= 0) return

        const { N, P, K } = fertilizer.composition
        const bagWeight = fertilizer.bagWeightKg
        const bagCost = fertilizer.costPerBag

        let requiredBags = 0

        if (N > 0 && remainingN > 0) requiredBags = Math.max(requiredBags, remainingN / N)
        if (P > 0 && remainingP > 0) requiredBags = Math.max(requiredBags, remainingP / P)
        if (K > 0 && remainingK > 0) requiredBags = Math.max(requiredBags, remainingK / K)

        requiredBags = Math.ceil(requiredBags)

        remainingN = Math.max(0, remainingN - requiredBags * N)
        remainingP = Math.max(0, remainingP - requiredBags * P)
        remainingK = Math.max(0, remainingK - requiredBags * K)

        if (requiredBags > 0) {
          requiredFertilizers[fertilizer.name] = {
            quantity: (requiredBags * bagWeight).toFixed(2) + " kg",
            cost: "₹" + (requiredBags * bagCost).toFixed(2),
          }
        }
      })

      setResult(requiredFertilizers)
      setLoading(false)
    }, 1000)
  }

  const fetchSelectedPlants = useCallback(async () => {
    try {
      const selectedPlants = await AsyncStorage.getItem("selectedPlants")
      if (selectedPlants) {
        const plants = JSON.parse(selectedPlants)
        setUserPlants(plants)
        if (plants.length > 0) {
          setSelectedCrop(plants[0])
          setNpkValues(plants[0].npkRequirement)
        }
      }
    } catch (error) {
      console.error("Error fetching plants:", error)
    }
  }, [])

  useEffect(() => {
    fetchSelectedPlants()
  }, [fetchSelectedPlants])

  const PlantSelectionModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Select Your Crop</Text>
            <Text className="text-gray-600 mt-1">Choose from your plants or browse all crops</Text>
          </View>
          
          <ScrollView className="max-h-[70vh]">
            {userPlants.length > 0 && (
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-800 mb-2">Your Plants</Text>
                {userPlants.map((plant) => (
                  <PlantOption key={plant.id} plant={plant} />
                ))}
              </View>
            )}
            
            <View className="p-4">
              <Text className="text-lg font-semibold text-gray-800 mb-2">All Crops</Text>
              {crops.map((crop) => (
                <PlantOption key={crop.id} plant={crop} />
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity 
            onPress={() => setModalVisible(false)}
            className="m-4 bg-gray-800 rounded-lg p-4"
          >
            <Text className="text-white text-center font-semibold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  const PlantOption = ({ plant }: { plant: Crop }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedCrop(plant)
        setNpkValues(plant.npkRequirement)
        setModalVisible(false)
      }}
      className="flex-row items-center p-3 bg-gray-50 rounded-lg mb-2"
    >
      <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
        <Leaf size={20} color="#16a34a" />
      </View>
      <View>
        <Text className="text-gray-800 font-medium">{plant.name}</Text>
        <Text className="text-gray-500 text-sm">
          NPK: {plant.npkRequirement.N}-{plant.npkRequirement.P}-{plant.npkRequirement.K}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-green-50" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-4 py-6">
        <Animated.View style={{ opacity: fadeAnim }}>
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-800 mb-2">Fertilizer Calculator</Text>
            <Text className="text-gray-600">Get precise fertilizer recommendations for optimal crop growth</Text>
          </View>

          <View className="rounded-2xl w-full h-80 mb-6 shadow-lg">
            <Image source={AI_GEN_IMAGES.farmer} className="w-full h-full object-cover" />
          </View>

          <View className="bg-white rounded-xl shadow-md p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Selected Crop</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Leaf size={20} color="#16a34a" />
                </View>
                <Text className="text-gray-800 font-medium">{selectedCrop.name}</Text>
              </View>
              <ChevronDown size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-md p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">NPK Requirements</Text>
            <View className="flex-row justify-between">
              {[
                { label: "Nitrogen (N)", value: npkValues.N },
                { label: "Phosphorus (P)", value: npkValues.P },
                { label: "Potassium (K)", value: npkValues.K },
              ].map((nutrient) => (
                <View key={nutrient.label} className="items-center bg-gray-50 rounded-lg p-3 flex-1 mx-1">
                  <Text className="text-gray-600 text-sm mb-1">{nutrient.label}</Text>
                  <Text className="text-2xl font-bold text-gray-800">{nutrient.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white rounded-xl shadow-md p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Plot Details</Text>
            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Unit of Measurement</Text>
              <View className="flex-row">
                {["Acre", "Hectare"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setUnit(option as "Acre" | "Hectare")}
                    className={`flex-1 p-3 ${
                      unit === option ? "bg-gray-800" : "bg-gray-200"
                    } ${option === "Acre" ? "rounded-l-lg" : "rounded-r-lg"}`}
                  >
                    <Text className={`text-center font-medium ${unit === option ? "text-white" : "text-gray-800"}`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-gray-600 mb-2">Plot Size ({unit})</Text>
              <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3">
                <TouchableOpacity 
                  onPress={() => setPlotSize(Math.max(0.5, plotSize - 0.5))}
                  className="bg-gray-200 rounded-full p-2"
                >
                  <Minus size={20} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">{plotSize}</Text>
                <TouchableOpacity 
                  onPress={() => setPlotSize(plotSize + 0.5)}
                  className="bg-gray-200 rounded-full p-2"
                >
                  <Plus size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={calculateFertilizer} 
            className="bg-gray-800 rounded-lg p-4 mb-6"
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? "Calculating..." : "Calculate Fertilizer"}
            </Text>
          </TouchableOpacity>

          {result && (
            <View className="bg-white rounded-xl shadow-md p-4 mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">Recommended Fertilizers</Text>
              <View className="bg-blue-50 rounded-lg p-3 mb-4">
                <Text className="text-blue-800 text-sm">
                  Recommendations are based on optimal NPK requirements for your selected crop and plot size
                </Text>
              </View>
              
              {Object.entries(result).map(([fertilizer, details]) => (
                <View
                  key={fertilizer}
                  className="flex-row justify-between items-center p-3 border-b border-gray-100"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                      <Leaf size={20} color="#16a34a" />
                    </View>
                    <View>
                      <Text className="text-gray-800 font-medium">{fertilizer}</Text>
                      <Text className="text-gray-500">{details.quantity}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-800 font-bold">{details.cost}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg"
        style={{ marginTop: insets.top }}
      >
        <Ionicons name="arrow-back" size={24} color="#16a34a" />
      </TouchableOpacity>

      <PlantSelectionModal />
    </SafeAreaView>
  )
}

export default FertilizerCalculator