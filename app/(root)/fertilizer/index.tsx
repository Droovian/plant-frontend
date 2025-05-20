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
  Bigha: 0.6772,
  Guntha: 0.0101, // 1 Guntha = 1/40 Acre = 0.0101 hectares
}

interface FertilizerResult {
  quantity: string;
  originalCost: string;
  subsidy: string;
  subsidizedCost: string;
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
    subsidy: string;
    subsidizedCost: string;
  }> | null>(null)

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [])

  const calculateFertilizer = () => {
  setLoading(true);
  try {
    // Convert plot size to hectares
    const plotSizeInHectares = plotSize * unitConversions[unit];

    // Adjust NPK requirements based on soil pH
    const adjustedNPK: NPKValues = {
      N: npkValues.N,
      P: npkValues.P,
      K: npkValues.K,
    };

    if (soilPH < 6) {
      adjustedNPK.P *= 1.1; // Increase P by 10%
      adjustedNPK.N *= 0.95; // Reduce N by 5%
    } else if (soilPH > 7.5) {
      adjustedNPK.N *= 1.1; // Increase N by 10%
      adjustedNPK.K *= 1.1; // Increase K by 10%
      adjustedNPK.P *= 0.9; // Reduce P by 10%
    }

    // Calculate total NPK required in kg
    const totalNPKRequired = {
      N: adjustedNPK.N * plotSizeInHectares,
      P: adjustedNPK.P * plotSizeInHectares,
      K: adjustedNPK.K * plotSizeInHectares,
    };

    // Initialize result object
    const fertilizerRecommendations: Record<string, FertilizerResult> = {};

    // Helper function to calculate costs
    const calculateCosts = (
      fertilizerName: string,
      totalKg: number,
      bagWeightKg: number,
      costPerBag: number,
      fertilizerId?: string
    ) => {
      const bags = Math.ceil(totalKg / bagWeightKg);
      const actualKg = bags * bagWeightKg;
      const originalCost = bags * costPerBag;

      // Find subsidy for the fertilizer in the selected state
      const subsidyData = regionalFertilizers.find(
        (rf) => rf.stateId === selectedState.id && rf.fertilizerId === fertilizerId
      );
      const subsidyPercentage = subsidyData ? subsidyData.subsidyPercentage : 0;
      const subsidyAmount = (originalCost * subsidyPercentage) / 100;
      const subsidizedCost = originalCost - subsidyAmount;

      return {
        quantity: `${bags} bag${bags > 1 ? 's' : ''} (${actualKg.toFixed(1)} kg)`,
        originalCost: `₹${originalCost.toFixed(2)}`,
        subsidy: `₹${subsidyAmount.toFixed(2)} (${subsidyPercentage}%)`,
        subsidizedCost: `₹${subsidizedCost.toFixed(2)}`,
      };
    };

    // Step 1: Fulfill Phosphorus with DAP
    const dap = fertilizers.find((f) => f.name === "DAP (Diammonium Phosphate)");
    if (dap && totalNPKRequired.P > 0) {
      const pFromDAP = dap.composition.P / 100;
      const dapKg = totalNPKRequired.P / pFromDAP;
      fertilizerRecommendations[dap.name] = calculateCosts(
        dap.name,
        dapKg,
        dap.bagWeightKg,
        dap.costPerBag,
        dap.id
      );

      const actualDAPKg = Math.ceil(dapKg / dap.bagWeightKg) * dap.bagWeightKg;
      totalNPKRequired.P -= actualDAPKg * pFromDAP;
      totalNPKRequired.N -= actualDAPKg * (dap.composition.N / 100);
      totalNPKRequired.K -= actualDAPKg * (dap.composition.K / 100);
    }

    // Step 2: Fulfill Potassium with MOP
    const mop = fertilizers.find((f) => f.name === "MOP (Muriate of Potash)");
    if (mop && totalNPKRequired.K > 0) {
      const kFromMOP = mop.composition.K / 100;
      const mopKg = totalNPKRequired.K / kFromMOP;
      fertilizerRecommendations[mop.name] = calculateCosts(
        mop.name,
        mopKg,
        mop.bagWeightKg,
        mop.costPerBag,
        mop.id
      );

      const actualMOPKg = Math.ceil(mopKg / mop.bagWeightKg) * mop.bagWeightKg;
      totalNPKRequired.K -= actualMOPKg * kFromMOP;
      totalNPKRequired.N -= actualMOPKg * (mop.composition.N / 100);
      totalNPKRequired.P -= actualMOPKg * (mop.composition.P / 100);
    }

    // Step 3: Fulfill Nitrogen with Urea
    const urea = fertilizers.find((f) => f.name === "Urea");
    if (urea && totalNPKRequired.N > 0) {
      const nFromUrea = urea.composition.N / 100;
      const ureaKg = totalNPKRequired.N / nFromUrea;
      fertilizerRecommendations[urea.name] = calculateCosts(
        urea.name,
        ureaKg,
        urea.bagWeightKg,
        urea.costPerBag,
        urea.id
      );

      const actualUreaKg = Math.ceil(ureaKg / urea.bagWeightKg) * urea.bagWeightKg;
      totalNPKRequired.N -= actualUreaKg * nFromUrea;
      totalNPKRequired.P -= actualUreaKg * (urea.composition.P / 100);
      totalNPKRequired.K -= actualUreaKg * (urea.composition.K / 100);
    }

    // Step 4: Soil pH amendments (lime or gypsum)
    // Assume typical costs since not in fertilizers data
    const amendmentCostPerBag = 300; // ₹300 per 50 kg bag (approximate market rate)
    const amendmentBagWeight = 50; // Standard 50 kg bag
    if (soilPH < 6) {
      const limeKg = 1000 * plotSizeInHectares; // 1000 kg/ha for pH correction
      fertilizerRecommendations["Lime (Agricultural Grade)"] = calculateCosts(
        "Lime (Agricultural Grade)",
        limeKg,
        amendmentBagWeight,
        amendmentCostPerBag
        // No fertilizerId, so no subsidy applied
      );
    } else if (soilPH > 7.5) {
      const gypsumKg = 500 * plotSizeInHectares; // 500 kg/ha for pH correction
      fertilizerRecommendations["Gypsum"] = calculateCosts(
        "Gypsum",
        gypsumKg,
        amendmentBagWeight,
        amendmentCostPerBag
        // No fertilizerId, so no subsidy applied
      );
    }

    // Remove zero-bag recommendations
    Object.keys(fertilizerRecommendations).forEach((key) => {
      const bags = parseInt(fertilizerRecommendations[key].quantity);
      if (bags === 0) {
        delete fertilizerRecommendations[key];
      }
    });

    // Set the result
    setResult(fertilizerRecommendations);
  } catch (error) {
    console.error("Error calculating fertilizer:", error);
    setResult(null);
  } finally {
    setLoading(false);
  }
};

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
                <View key={fertilizer} className="p-3 border-b border-gray-100">
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
              <View className="mt-2 p-3 bg-red-50 rounded-lg">
                <Text className="text-red-800 text-sm">
                  Costs and subsidies may vary due to regional differences and policy changes. Please confirm with local agricultural authorities for accurate pricing.
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