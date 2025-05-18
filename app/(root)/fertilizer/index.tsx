import { useState, useCallback, useEffect } from "react"
import { View, Text, Modal, TouchableOpacity, ScrollView, Animated, TextInput } from "react-native"
import { crops, indianStates, regionalFertilizers, fertilizers } from "@/assets/data/plant"
import { ChevronDown, Minus, Plus, Leaf, AlertTriangle, Droplet, MapPin } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Crop, Fertilizer, IndianState, RegionalFertilizer } from "@/types/plant"
import { Image } from "react-native"
import { AI_GEN_IMAGES } from "@/constants"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Slider from "@react-native-community/slider"

interface NPKValues {
  N: number
  P: number
  K: number
}

// Extended to include soil and regional data
interface CalculationParams {
  npkValues: NPKValues
  plotSize: number
  unit: LandUnit
  soilPH: number
  selectedState: IndianState
}

type LandUnit = "Acre" | "Hectare" | "Bigha" | "Guntha"

// Conversion factors to standardize land measurements to hectares
const unitConversions = {
  Acre: 0.4047,
  Hectare: 1,
  Bigha: 0.25, // Standard North Indian Bigha approximation
  Guntha: 0.0101, // 1 Guntha = 1/40 Acre = 0.0101 hectares
}

// pH adjustment factors for NPK requirements
const phAdjustmentFactors = {
  N: {
    low: (ph: number) => ph < 6 ? 1.2 : 1, // Increase N in acidic soils
    high: (ph: number) => ph > 7.5 ? 1.15 : 1, // Increase N in alkaline soils
  },
  P: {
    low: (ph: number) => ph < 6 ? 1.3 : 1, // Increase P in acidic soils - phosphorus gets fixed
    high: (ph: number) => ph > 7.5 ? 1.25 : 1, // Increase P in alkaline soils
  },
  K: {
    low: (ph: number) => ph < 6 ? 1.1 : 1, // Slight increase in acidic soils
    high: (ph: number) => ph > 7.5 ? 1.05 : 1, // Slight increase in alkaline soils
  }
}

const FertilizerCalculator = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [fadeAnim] = useState(new Animated.Value(0))
  
  // Core crop and NPK state
  const [selectedCrop, setSelectedCrop] = useState<Crop>(crops[0])
  const [userPlants, setUserPlants] = useState<Crop[]>([])
  const [npkValues, setNpkValues] = useState<NPKValues>(selectedCrop.npkRequirement)
  
  // Land measurement state
  const [unit, setUnit] = useState<LandUnit>("Acre")
  const [plotSize, setPlotSize] = useState<number>(1)
  
  // UI control state
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [stateModalVisible, setStateModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  
  // New soil and regional data state
  const [soilPH, setSoilPH] = useState<number>(7)
  const [selectedState, setSelectedState] = useState<IndianState>(indianStates[0])
  
  // Results state
  const [result, setResult] = useState<Record<string, { 
    quantity: string; 
    originalCost: string;
    subsidizedCost: string;
    subsidy: string;
  }> | null>(null)

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
      // Convert plot size to hectares for standardized calculation
      const sizeInHectares = plotSize * unitConversions[unit]
      
      // Apply pH adjustments to NPK requirements
      const adjustedNPK = {
        N: npkValues.N * (soilPH < 6 ? phAdjustmentFactors.N.low(soilPH) : phAdjustmentFactors.N.high(soilPH)),
        P: npkValues.P * (soilPH < 6 ? phAdjustmentFactors.P.low(soilPH) : phAdjustmentFactors.P.high(soilPH)),
        K: npkValues.K * (soilPH < 6 ? phAdjustmentFactors.K.low(soilPH) : phAdjustmentFactors.K.high(soilPH)),
      }
      
      let remainingN = adjustedNPK.N * sizeInHectares
      let remainingP = adjustedNPK.P * sizeInHectares
      let remainingK = adjustedNPK.K * sizeInHectares

      const requiredFertilizers: Record<string, { 
        quantity: string; 
        originalCost: string;
        subsidizedCost: string;
        subsidy: string;
      }> = {}

      // Get available fertilizers for the selected state
      const availableFertilizers = regionalFertilizers
        .filter(rf => rf.stateId === selectedState.id)
        .map(rf => ({
          ...fertilizers.find(f => f.id === rf.fertilizerId)!,
          subsidy: rf.subsidyPercentage
        }))

      const P2O5_TO_P = 0.436;
      const K2O_TO_K = 0.83;

      // Calculate the "nutrient fulfillment score" for each fertilizer
      const sortedFertilizers = [...availableFertilizers].sort((a, b) => {
          if (a.subsidy !== b.subsidy) return b.subsidy - a.subsidy;

          // Calculate "weighted" nutrient value based on what is still needed
          const aN = a.composition.N;
          const aP = a.composition.P * P2O5_TO_P;
          const aK = a.composition.K * K2O_TO_K;
          const bN = b.composition.N;
          const bP = b.composition.P * P2O5_TO_P;
          const bK = b.composition.K * K2O_TO_K;

          // Use remainingN, remainingP, remainingK from your context
          const aScore = (
            (remainingN > 0 ? aN : 0) +
            (remainingP > 0 ? aP : 0) +
            (remainingK > 0 ? aK : 0)
          ) / a.costPerBag;

          const bScore = (
            (remainingN > 0 ? bN : 0) +
            (remainingP > 0 ? bP : 0) +
            (remainingK > 0 ? bK : 0)
          ) / b.costPerBag;

          return bScore - aScore;
      });

      sortedFertilizers.forEach((fertilizer) => {
        if (remainingN <= 0 && remainingP <= 0 && remainingK <= 0) return

        const { N, P, K } = fertilizer.composition
        const bagWeight = fertilizer.bagWeightKg
        const bagCost = fertilizer.costPerBag
        const subsidy = fertilizer.subsidy / 100 // Convert percentage to decimal

        const nutrientNPerBag = (N / 100) * bagWeight;
        const P2O5_to_P = 0.436 // Conversion factor
        const nutrientPPerBag = (P / 100) * bagWeight * P2O5_to_P
        const K2O_to_K = 0.83
        const nutrientKPerBag = (K / 100) * bagWeight * K2O_to_K

        let requiredBags = 0

        // Calculate required bags based on remaining nutrients
        if (nutrientNPerBag > 0 && remainingN > 0) requiredBags = Math.max(requiredBags, remainingN / nutrientNPerBag)
        if (nutrientPPerBag > 0 && remainingP > 0) requiredBags = Math.max(requiredBags, remainingP / nutrientPPerBag)
        if (nutrientKPerBag > 0 && remainingK > 0) requiredBags = Math.max(requiredBags, remainingK / nutrientKPerBag)

        requiredBags = Number(requiredBags.toFixed(2))
        // Round up to the nearest whole number
        
        if (requiredBags > 0) {
          // Adjust remaining nutrients
          remainingN = Math.max(0, remainingN - requiredBags * nutrientNPerBag)
          remainingP = Math.max(0, remainingP - requiredBags * nutrientPPerBag)
          remainingK = Math.max(0, remainingK - requiredBags * nutrientKPerBag)

          // Calculate costs
          const totalWeight = requiredBags * bagWeight
          const originalCost = requiredBags * bagCost
          const subsidyAmount = originalCost * subsidy
          const subsidizedCost = originalCost - subsidyAmount

          requiredFertilizers[fertilizer.name] = {
            quantity: totalWeight.toFixed(2) + " kg",
            originalCost: "₹" + originalCost.toFixed(2),
            subsidizedCost: "₹" + subsidizedCost.toFixed(2),
            subsidy: "₹" + subsidyAmount.toFixed(2) + " (" + (subsidy * 100).toFixed(0) + "%)",
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

  // Modal Components
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

  const StateSelectionModal = () => (
    <Modal visible={stateModalVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Select Your State</Text>
            <Text className="text-gray-600 mt-1">Fertilizer availability and subsidies vary by state</Text>
          </View>
          
          <ScrollView className="max-h-[70vh]">
            <View className="p-4">
              {indianStates.map((state: any) => (
                <TouchableOpacity
                  key={state.id}
                  onPress={() => {
                    setSelectedState(state)
                    setStateModalVisible(false)
                  }}
                  className="flex-row items-center p-3 bg-gray-50 rounded-lg mb-2"
                >
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <MapPin size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-gray-800 font-medium">{state.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity 
            onPress={() => setStateModalVisible(false)}
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
            <Text className="text-gray-600">Get precise fertilizer recommendations with subsidies for Indian farmers</Text>
          </View>

          <View className="rounded-2xl w-full h-80 mb-6 shadow-lg">
            <Image source={AI_GEN_IMAGES.farmer} className="w-full h-full object-cover" />
          </View>

          {/* Crop Selection Section */}
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

          {/* State Selection Section - NEW */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">State/Region</Text>
            <TouchableOpacity
              onPress={() => setStateModalVisible(true)}
              className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <MapPin size={20} color="#3b82f6" />
                </View>
                <Text className="text-gray-800 font-medium">{selectedState.name}</Text>
              </View>
              <ChevronDown size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Soil Data Section - NEW */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Soil Data</Text>
            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Soil pH ({soilPH.toFixed(1)})</Text>
              <View className="px-2">
                <Slider
                  minimumValue={5}
                  maximumValue={9}
                  step={0.1}
                  value={soilPH}
                  onValueChange={setSoilPH}
                  minimumTrackTintColor="#16a34a"
                  maximumTrackTintColor="#d1d5db"
                  thumbTintColor="#16a34a"
                />
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-gray-500">Acidic (5.0)</Text>
                  <Text className="text-xs text-gray-500">Neutral (7.0)</Text>
                  <Text className="text-xs text-gray-500">Alkaline (9.0)</Text>
                </View>
              </View>
            </View>
            <View className="bg-yellow-50 rounded-lg p-3">
              <View className="flex-row items-center">
                <AlertTriangle size={16} color="#d97706" className="mr-2" />
                <Text className="text-yellow-800 text-sm">
                  {soilPH < 6 
                    ? "Acidic soil may require lime application alongside fertilizers."
                    : soilPH > 7.5 
                    ? "Alkaline soil may require gypsum or sulfur amendments."
                    : "Your soil pH is in the optimal range for most crops."}
                </Text>
              </View>
            </View>
          </View>

          {/* NPK Requirements Section */}
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

          {/* Plot Details Section - ENHANCED with additional units */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Plot Details</Text>
            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Unit of Measurement</Text>
              <View className="flex-wrap flex-row">
                {["Acre", "Hectare", "Bigha", "Guntha"].map((option, index) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setUnit(option as LandUnit)}
                    className={`${
                      index < 2 ? "w-1/2" : "w-1/2"
                    } p-3 ${
                      unit === option ? "bg-gray-800" : "bg-gray-200"
                    } ${
                      index % 2 === 0 ? "rounded-l-lg" : "rounded-r-lg"
                    } ${
                      index < 2 ? "mb-2" : ""
                    }`}
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
                  onPress={() => setPlotSize(Math.max(0.1, plotSize - (unit === "Guntha" ? 0.1 : 0.5)))}
                  className="bg-gray-200 rounded-full p-2"
                >
                  <Minus size={20} color="#4B5563" />
                </TouchableOpacity>
                <TextInput
                  value={plotSize.toString()}
                  onChangeText={(text) => {
                    const value = parseFloat(text)
                    if (!isNaN(value) && value > 0) {
                      setPlotSize(value)
                    }
                  }}
                  keyboardType="numeric"
                  className="text-xl font-bold text-gray-800 text-center w-20"
                />
                <TouchableOpacity 
                  onPress={() => setPlotSize(plotSize + (unit === "Guntha" ? 0.1 : 0.5))}
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

          {/* Results Section - ENHANCED with subsidy information */}
          {result && (
            <View className="bg-white rounded-xl shadow-md p-4 mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">Recommended Fertilizers</Text>
              <View className="bg-blue-50 rounded-lg p-3 mb-4">
                <Text className="text-blue-800 text-sm">
                  Recommendations include govt. subsidies for {selectedState.name} and account for your soil pH ({soilPH.toFixed(1)})
                </Text>
              </View>
              
              {Object.entries(result).map(([fertilizer, details]) => (
                <View
                  key={fertilizer}
                  className="p-3 border-b border-gray-100"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                        <Leaf size={20} color="#16a34a" />
                      </View>
                      <View>
                        <Text className="text-gray-800 font-medium">{fertilizer}</Text>
                        <Text className="text-gray-500">{details.quantity}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className="mt-2 ml-12">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500">Original Cost:</Text>
                      <Text className="text-gray-500">{details.originalCost}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-green-600">Subsidy:</Text>
                      <Text className="text-green-600">{details.subsidy}</Text>
                    </View>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-gray-800 font-semibold">Your Cost:</Text>
                      <Text className="text-gray-800 font-bold">{details.subsidizedCost}</Text>
                    </View>
                  </View>
                </View>
              ))}
              
              <View className="mt-4 p-3 bg-green-50 rounded-lg">
                <Text className="text-green-800 text-sm">
                  Visit your nearest Krishi Vigyan Kendra or Agricultural Extension Center for more information on these fertilizers and subsidy schemes.
                </Text>
              </View>
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
      <StateSelectionModal />
    </SafeAreaView>
  )
}

export default FertilizerCalculator