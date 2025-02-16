import { useState, useCallback } from "react"
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native"
import { fertilizers, crops } from "@/assets/data/plant"
import { ChevronDown, Minus, Plus, Leaf } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Crop, Fertilizer } from "@/types/plant"
import { Image } from "react-native"
import { AI_GEN_IMAGES } from "@/constants"

interface NPKValues {
  N: number
  P: number
  K: number
}

// interface Crop {
//   id: string
//   name: string
//   npkRequirement: NPKValues
// }

// interface Fertilizer {
//   name: string
//   composition: NPKValues
//   costPerBag: number
//   bagWeightKg: number
// }

const FertilizerCalculator = () => {
  const [selectedCrop, setSelectedCrop] = useState<Crop>(crops[0])
  const [npkValues, setNpkValues] = useState<NPKValues>(selectedCrop.npkRequirement)
  const [unit, setUnit] = useState<"Acre" | "Hectare">("Acre")
  const [plotSize, setPlotSize] = useState<number>(1)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [result, setResult] = useState<Record<string, { quantity: string; cost: string }> | null>(null)

  const calculateFertilizer = () => {
    let remainingN = npkValues.N * plotSize;
    let remainingP = npkValues.P * plotSize;
    let remainingK = npkValues.K * plotSize;
  
    const requiredFertilizers: Record<string, { quantity: string; cost: string }> = {};
  
    // Sort fertilizers by their cost-effectiveness for each nutrient
    const sortedFertilizers = [...fertilizers].sort((a, b) => {
      const aScore = (a.composition.N + a.composition.P + a.composition.K) / a.costPerBag;
      const bScore = (b.composition.N + b.composition.P + b.composition.K) / b.costPerBag;
      return bScore - aScore; // Higher score = better value
    });
  
    sortedFertilizers.forEach((fertilizer) => {
      if (remainingN <= 0 && remainingP <= 0 && remainingK <= 0) return;
  
      const { N, P, K } = fertilizer.composition;
      const bagWeight = fertilizer.bagWeightKg;
      const bagCost = fertilizer.costPerBag;
  
      let requiredBags = 0;
  
      if (N > 0 && remainingN > 0) requiredBags = Math.max(requiredBags, remainingN / N);
      if (P > 0 && remainingP > 0) requiredBags = Math.max(requiredBags, remainingP / P);
      if (K > 0 && remainingK > 0) requiredBags = Math.max(requiredBags, remainingK / K);
  
      requiredBags = Math.ceil(requiredBags); // Round up to whole number
  
      // Reduce the remaining NPK requirements
      remainingN = Math.max(0, remainingN - requiredBags * N);
      remainingP = Math.max(0, remainingP - requiredBags * P);
      remainingK = Math.max(0, remainingK - requiredBags * K);
  
      if (requiredBags > 0) {
        requiredFertilizers[fertilizer.name] = {
          quantity: (requiredBags * bagWeight).toFixed(2) + " kg",
          cost: "₹" + (requiredBags * bagCost).toFixed(2),
        };
      }
    });
  
    setResult(requiredFertilizers);
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <ScrollView className="flex-1 px-4 py-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Fertilizer Calculator</Text>
          <Text className="text-gray-600 mb-4">Get personalized fertilizer recommendations for your crops</Text>
        </View>

        <View className="rounded-md w-full h-80 mb-6">
          <Image source={AI_GEN_IMAGES.farmer} className="w-full h-full object-cover" />
        </View>

        <View className="bg-white rounded-lg shadow-md p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Selected Crop:</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-row items-center justify-between bg-gray-100 rounded-md p-3"
          >
            <Text className="text-gray-800 font-medium">{selectedCrop.name}</Text>
            <ChevronDown size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 justify-end bg-opacity-50">
            <View className="bg-white rounded-t-3xl p-4">
              <Text className="text-xl font-bold text-gray-800 mb-4">Select a Crop</Text>
              <ScrollView className="max-h-80">
                {crops.map((crop) => (
                  <TouchableOpacity
                    key={crop.id}
                    onPress={() => {
                      setSelectedCrop(crop)
                      setNpkValues(crop.npkRequirement)
                      setModalVisible(false)
                    }}
                    className="py-3 border-b border-gray-200"
                  >
                    <Text className="text-gray-800">{crop.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-800 rounded-md p-3 mt-4">
                <Text className="text-white text-center font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View className="bg-white rounded-lg shadow-md p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Nutrient Requirements:</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-gray-600 font-medium">Nitrogen (N)</Text>
              <Text className="text-2xl font-bold text-gray-800">{npkValues.N}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-600 font-medium">Phosphorus (P)</Text>
              <Text className="text-2xl font-bold text-gray-800">{npkValues.P}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-600 font-medium">Potassium (K)</Text>
              <Text className="text-2xl font-bold text-gray-800">{npkValues.K}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-md p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Plot Details:</Text>
          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Unit:</Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setUnit("Acre")}
                className={`flex-1 p-2 rounded-l-md ${unit === "Acre" ? "bg-gray-800" : "bg-gray-200"}`}
              >
                <Text className={`text-center ${unit === "Acre" ? "text-white" : "text-gray-800"}`}>Acre</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUnit("Hectare")}
                className={`flex-1 p-2 rounded-r-md ${unit === "Hectare" ? "bg-gray-800" : "bg-gray-200"}`}
              >
                <Text className={`text-center ${unit === "Hectare" ? "text-white" : "text-gray-800"}`}>Hectare</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Text className="text-gray-600 mb-2">Plot Size ({unit}):</Text>
            <View className="flex-row items-center justify-between bg-gray-100 rounded-md p-2">
              <TouchableOpacity onPress={() => setPlotSize(Math.max(1, plotSize - 1))}>
                <Minus size={24} color="#4B5563" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">{plotSize}</Text>
              <TouchableOpacity onPress={() => setPlotSize(plotSize + 1)}>
                <Plus size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={calculateFertilizer} className="bg-gray-800 rounded-md p-4 mb-6">
          <Text className="text-white text-center font-semibold text-lg">Calculate Fertilizer</Text>
        </TouchableOpacity>

        {result && (
          <View className="bg-white rounded-lg shadow-md p-4 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Recommended Fertilizers:</Text>
            {Object.entries(result).map(([fertilizer, details]) => (
              <View
                key={fertilizer}
                className="flex-row justify-between items-center mb-2 pb-2 border-b border-gray-200"
              >
                <View className="flex-row items-center">
                  <Leaf size={24} color="#4B5563" />
                  <Text className="ml-2 text-gray-800 font-medium">{fertilizer}</Text>
                </View>
                <View>
                  <Text className="text-gray-600">{details.quantity}</Text>
                  <Text className="text-gray-800 font-semibold">{details.cost}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default FertilizerCalculator

