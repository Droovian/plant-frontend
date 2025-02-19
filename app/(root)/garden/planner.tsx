import { View, Text, TextInput, TouchableOpacity, ScrollView, type TextInputProps } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomButton from "@/components/Button"
import { router } from "expo-router"
import { useGardenStore } from "@/store"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

const Planner = () => {
  const { width, height, unit, squareArea, soilType, sunlightExposure, soilPH, soilNutrientLevel, setGardenData } =
    useGardenStore()

  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="p-6">
          <Text className="text-black font-bold text-3xl text-center">Plan Your Garden</Text>
        </View>

        <View className="px-6 mt-6">
          <View className="mb-6">
            <Text className="text-green-800 font-semibold text-lg mb-2">Garden Dimensions</Text>
            <View className="flex-row items-center space-x-3 gap-7">
              <TextInput
                className="flex-1 bg-white border border-green-300 rounded-lg p-3 text-green-800"
                placeholder="Width"
                placeholderTextColor="#81C784"
                value={width}
                onChangeText={(text) => setGardenData("width", text)}
                keyboardType="numeric"
              />
              <Text className="text-green-800 font-bold text-3xl">×</Text>
              <TextInput
                className="flex-1 bg-white border border-green-300 rounded-lg p-3 text-green-800"
                placeholder="Height"
                placeholderTextColor="#81C784"
                value={height}
                onChangeText={(text) => setGardenData("height", text)}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-row justify-center mt-3 space-x-4">
              <UnitButton title="Feet" isSelected={unit === "feet"} onPress={() => setGardenData("unit", "feet")} />
              <UnitButton
                title="Meters"
                isSelected={unit === "meters"}
                onPress={() => setGardenData("unit", "meters")}
              />
            </View>
          </View>

          <InputGroup
            label="Square Area Representation"
            placeholder="e.g., 1 sq ft"
            value={squareArea}
            onChangeText={(text) => setGardenData("squareArea", text)}
          />

          <SelectGroup
            label="Sunlight Exposure"
            value={sunlightExposure}
            onValueChange={(value) => setGardenData("sunlightExposure", value)}
            options={[
              { label: "Full Sun", value: "full_sun" },
              { label: "Partial Shade", value: "partial_shade" },
              { label: "Full Shade", value: "full_shade" },
            ]}
          />

          <InputGroup
            label="Soil pH Level (optional)"
            placeholder="e.g., 6.5"
            value={soilPH}
            onChangeText={(text) => setGardenData("soilPH", text)}
            keyboardType="numeric"
          />

          <SelectGroup
            label="Soil Nutrient Level (optional)"
            value={soilNutrientLevel || ''}
            onValueChange={(value) => setGardenData("soilNutrientLevel", value)}
            options={[
              { label: "Low", value: "low" },
              { label: "Moderate", value: "moderate" },
              { label: "High", value: "high" },
            ]}
          />

          <SelectGroup
            label="Soil Type"
            value={soilType}
            onValueChange={(value) => setGardenData("soilType", value)}
            options={[
              { label: "Clay", value: "clay" },
              { label: "Sandy", value: "sandy" },
              { label: "Silt", value: "silt" },
              { label: "Loam", value: "loam" },
            ]}
          />

          <CustomButton
            title="Proceed to Layout"
            bgVariant="black"
            onPress={() => router.push("/(root)/garden/builder")}
            className="mt-6"
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg"
        style={{ marginTop: insets.top }}
      >
        <Ionicons name="arrow-back" size={24} color="#15803d" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

interface InputGroupProps extends TextInputProps {
  label: string
}

const InputGroup = ({ label, ...props }: InputGroupProps) => (
  <View className="mb-6">
    <Text className="text-green-800 font-semibold text-lg mb-2">{label}</Text>
    <TextInput
      className="bg-white border border-green-300 rounded-lg p-3 text-green-800"
      placeholderTextColor="#81C784"
      {...props}
    />
  </View>
)

interface SelectGroupProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: { label: string; value: string }[]
}

const SelectGroup = ({ label, value, onValueChange, options }: SelectGroupProps) => (
  <View className="mb-6">
    <Text className="text-green-800 font-semibold text-lg mb-2">{label}</Text>
    <View className="flex-row flex-wrap -mx-1">
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          className={`m-1 px-4 py-2 rounded-full ${value === option.value ? "bg-green-800" : "bg-green-100"}`}
          onPress={() => onValueChange(option.value)}
        >
          <Text className={`text-sm font-medium ${value === option.value ? "text-white" : "text-green-800"}`}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)

interface UnitButtonProps {
  title: string
  isSelected: boolean
  onPress: () => void
}

const UnitButton = ({ title, isSelected, onPress }: UnitButtonProps) => (
  <TouchableOpacity
    className={`px-4 py-2 rounded-full ${isSelected ? "bg-green-800" : "bg-green-100"}`}
    onPress={onPress}
  >
    <Text className={`text-sm font-medium ${isSelected ? "text-white" : "text-green-800"}`}>{title}</Text>
  </TouchableOpacity>
)

export default Planner

