import { useEffect, useRef, useState } from "react";
import { Text, View, Animated, ScrollView, TouchableOpacity, Image, Dimensions, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/Button";
import { MotiView } from "moti";
import { useGardenStore } from "@/store";
import { plantImages } from "@/constants";
import { compatibility } from "@/assets/data/plant";

// Max grid size in meters
const MAX_METERS = 20;
const FEET_TO_METERS = 0.3048;
const METERS_TO_FEET = 3.28084;
// Base cell size for small grids, scaled down for larger ones
const BASE_CELL_SIZE = Dimensions.get("window").width < 375 ? 40 : 48;

type Unit = "meters" | "feet";
type Position = { row: number; col: number };

const getSpacingInMeters = (vegetable: string) => {
  const plant = vegetables.find((v) => v.name === vegetable);
  if (!plant) return 1;
  const spacingFeet = plant.spacingFeet;
  return spacingFeet * 0.3048; // Convert feet to meters accurately
};

// Utility functions for unit conversion and distance calculation
const convertDistance = (distance: number, fromUnit: Unit, toUnit: Unit): number => {
  if (fromUnit === toUnit) return distance;
  return fromUnit === "feet" 
    ? distance * FEET_TO_METERS  // feet to meters
    : distance * METERS_TO_FEET; // meters to feet
};

const getPlantSpacing = (vegetable: string, unit: Unit): number => {
  const plant = vegetables.find(v => v.name === vegetable);
  if (!plant) return 0;
  // Convert from feet (base unit in data) to target unit
  return convertDistance(plant.spacingFeet, "feet", unit);
};

const calculateDistance = (pos1: Position, pos2: Position): number => {
  const deltaX = pos1.col - pos2.col;
  const deltaY = pos1.row - pos2.row;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};




const vegetables = [
  {
    name: "Okra",
    image: plantImages.okra,
    color: "#A8E6CE",
    spacingFeet: 2,
    soilPH: [6.0, 7.0],
    sunlight: "Full Sun",
    soilType: ["Loamy"],
    nutrientLevel: "Moderate",
  },
  {
    name: "Tomato",
    image: plantImages.tomato,
    color: "#FFB3B3",
    spacingFeet: 3,
    soilPH: [6.0, 6.8],
    sunlight: "Full Sun",
    soilType: ["Loamy", "Sandy"],
    nutrientLevel: "High",
  },
  {
    name: "Chilli",
    image: plantImages.chilli,
    color: "#FFDBA4",
    spacingFeet: 1,
    soilPH: [5.5, 7.0],
    sunlight: "Full Sun",
    soilType: ["Loamy", "Sandy"],
    nutrientLevel: "Moderate",
  },
  {
    name: "Brinjal",
    image: plantImages.Eggplant,
    color: "#D4B8E2",
    spacingFeet: 2,
    soilPH: [5.5, 6.5],
    sunlight: "Full Sun",
    soilType: ["Loamy"],
    nutrientLevel: "Moderate",
  },
];

const Builder = () => {
  const { width, height, unit, squareArea, soilType, sunlightExposure, soilPH, soilNutrientLevel } = useGardenStore();
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedVegetable, setSelectedVegetable] = useState<string | null>(null);
  const [insights, setInsights] = useState<{
    companions: string[];
    avoid: string[];
    spacingIssues: string[];
    envIssues: string[];
  }>({
    companions: [],
    avoid: [],
    spacingIssues: [],
    envIssues: [],
  });
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const gridWidth = Number(width);
  const gridHeight = Number(height);
  const maxCells = unit === "meters" ? MAX_METERS : Math.floor(MAX_METERS * 3.28);
  const cellSize = Math.min(
    BASE_CELL_SIZE,
    (Dimensions.get("window").width - 32) / Math.min(gridWidth, maxCells),
    (Dimensions.get("window").height / 2) / Math.min(gridHeight, maxCells)
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    if (gridWidth > 0 && gridHeight > 0) {
      const cappedWidth = Math.min(gridWidth, maxCells);
      const cappedHeight = Math.min(gridHeight, maxCells);
      const newGrid = Array(cappedHeight).fill(null).map(() => Array(cappedWidth).fill(""));
      setGrid(newGrid);

      if (squareArea) {
        const calculatedArea = gridWidth * gridHeight;
        const areaMatch = squareArea.includes(calculatedArea.toString());
        if (!areaMatch) console.log(`Warning: squareArea "${squareArea}" doesn’t match ${calculatedArea} ${unit}^2`);
      }
    }
  }, [width, height, unit, squareArea]);


  const isValidPlacement = (
    rowIndex: number,
    colIndex: number,
    vegetable: string,
    currentGrid: string[][],
    gridHeight: number,
    gridWidth: number
  ) => {
    const plant = vegetables.find((v) => v.name === vegetable);
    if (!plant) return false;

    const spacingMeters = getSpacingInMeters(vegetable); // Real-world spacing in meters
    const cellSizeInMeters = unit === "meters" ? 1 : 0.3048; // 1 cell = 1 meter or 1 foot
    console.log(`Checking placement for ${vegetable} at (${rowIndex}, ${colIndex}) with spacing: ${spacingMeters} meters`);

    for (let r = 0; r < gridHeight; r++) {
      for (let c = 0; c < gridWidth; c++) {
        if (currentGrid[r][c] && (r !== rowIndex || c !== colIndex)) {
          const neighborSpacingMeters = getSpacingInMeters(currentGrid[r][c]);
          const distanceCells = Math.sqrt((r - rowIndex) ** 2 + (c - colIndex) ** 2);
          const distanceMeters = distanceCells * cellSizeInMeters;
          const requiredSpacing = Math.max(spacingMeters, neighborSpacingMeters);
          console.log(
            `Distance to ${currentGrid[r][c]} at (${r}, ${c}): ${distanceMeters.toFixed(2)} meters, required: ${requiredSpacing} meters`
          );
          if (distanceMeters <= requiredSpacing) {
            console.log(`Blocked: Too close to ${currentGrid[r][c]} at (${r}, ${c})`);
            return false;
          }
        }
      }
    }
    return true;
  };

  
  const analyzeGarden = (currentGrid: string[][]) => {
    const spacingIssues: string[] = [];
    const envIssues: string[] = [];
    const plantPositions: { [key: string]: { row: number; col: number }[] } = {};

    currentGrid.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell) {
          if (!plantPositions[cell]) plantPositions[cell] = [];
          plantPositions[cell].push({ row: r, col: c });
        }
      })
    );

    const cellSizeInMeters = unit === "meters" ? 1 : 0.3048;
    Object.entries(plantPositions).forEach(([plantName, positions]) => {
      const plant = vegetables.find((v) => v.name === plantName);
      if (!plant) return;

      const spacingMeters = getSpacingInMeters(plantName);
      positions.forEach((pos1, i) => {
        positions.slice(i + 1).forEach((pos2) => {
          const distanceMeters = Math.sqrt((pos1.row - pos2.row) ** 2 + (pos1.col - pos2.col) ** 2) * cellSizeInMeters;
          if (distanceMeters < spacingMeters) {
            spacingIssues.push(
              `${plantName} at (${pos1.row}, ${pos1.col}) and (${pos2.row}, ${pos2.col}) are too close. Minimum spacing: ${spacingMeters.toFixed(2)} meters`
            );
          }
        });
      });

      const phNum = Number(soilPH);
      if (soilPH && (!plant.soilPH.includes(phNum) || isNaN(phNum))) {
        envIssues.push(`${plantName} prefers pH ${plant.soilPH.join("-")}, current: ${soilPH}.`);
      }
      if (plant.sunlight !== sunlightExposure) {
        envIssues.push(`${plantName} requires ${plant.sunlight}, current: ${sunlightExposure || "unknown"}.`);
      }
      if (!plant.soilType.includes(soilType)) {
        envIssues.push(`${plantName} prefers ${plant.soilType.join(" or ")}, current: ${soilType || "unknown"}.`);
      }
      if (soilNutrientLevel && plant.nutrientLevel !== soilNutrientLevel) {
        envIssues.push(
          `${plantName} prefers ${plant.nutrientLevel} nutrient level, current: ${soilNutrientLevel || "unknown"}.`
        );
      }
    });

    return { spacingIssues, envIssues };
  };

  const handleCellPress = (rowIndex: number, colIndex: number) => {
    const cappedHeight = Math.min(gridHeight, maxCells);
    const cappedWidth = Math.min(gridWidth, maxCells);
    const newGrid = grid.map((row) => [...row]);

    if (newGrid[rowIndex][colIndex]) {
      const removedPlant = newGrid[rowIndex][colIndex];
      newGrid[rowIndex][colIndex] = "";
      setGrid(newGrid);
      console.log(`Removed ${removedPlant} from (${rowIndex}, ${colIndex})`);

      setInsights((prev) => ({
        ...prev,
        spacingIssues: prev.spacingIssues.filter((issue) => !issue.includes(`(${rowIndex}, ${colIndex})`)),
      }));

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
      ]).start();
      return;
    }

    if (!selectedVegetable) return;

    console.log(`Attempting to place ${selectedVegetable} at (${rowIndex}, ${colIndex})`);
    if (isValidPlacement(rowIndex, colIndex, selectedVegetable, newGrid, cappedHeight, cappedWidth)) {
      newGrid[rowIndex][colIndex] = selectedVegetable;
      setGrid(newGrid);
      console.log(`Placed ${selectedVegetable} at (${rowIndex}, ${colIndex})`);

      setInsights((prev) => ({
        ...prev,
        spacingIssues: prev.spacingIssues.filter((issue) => !issue.includes(`Cannot place ${selectedVegetable}`)),
      }));

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
      ]).start();
    } else {
      console.log(`Cannot place ${selectedVegetable} at (${rowIndex}, ${colIndex}) due to spacing`);
      setInsights((prev) => ({
        ...prev,
        spacingIssues: [
          ...prev.spacingIssues.filter((issue) => !issue.includes(`Cannot place ${selectedVegetable} at (${rowIndex}, ${colIndex})`)),
          `Cannot place ${selectedVegetable} at (${rowIndex}, ${colIndex}) due to spacing constraints.`,
        ],
      }));
    }
  };

  const updateInsights = (vegetable: string) => {
    const compatibilityInfo = compatibility[0][vegetable];
    if (compatibilityInfo) {
      setInsights((prev) => ({
        ...prev,
        companions: compatibilityInfo.companions || [],
        avoid: compatibilityInfo.avoid || [],
      }));
    }
  };

  const handleShowInsights = () => {
    const { spacingIssues, envIssues } = analyzeGarden(grid);
    setInsights((prev) => ({ ...prev, spacingIssues, envIssues }));
    setShowInsightsModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-50 to-green-100">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 18 }}
          className="items-center py-6"
        >
          <Text className="text-3xl font-bold text-green-800">Virtual Garden</Text>
          <Text className="text-base text-green-600 mt-2">Design Your Perfect Layout</Text>
        </MotiView>

        {/* Plant Selection */}
        <View className="mb-6 px-4">
          <Text className="text-lg font-semibold text-green-700 mb-3 ml-2">
            Select Plants
          </Text>
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
                    style={{ backgroundColor: "white" }} 
                  />
                  <Text className="text-base font-medium text-green-800">
                    {veg.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Garden Grid */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }} className="items-center mb-6 px-4">
          <View className="bg-white rounded-xl p-4 shadow-md">
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row">
                {row.map((cell, colIndex) => (
                  <TouchableOpacity
                    key={colIndex}
                    className={`m-0.5 rounded-lg overflow-hidden ${cell ? "bg-opacity-20" : "bg-green-50"}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: cell ? vegetables.find((v) => v.name === cell)?.color : "#f0fdf4",
                    }}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                  >
                    {cell && (
                      <View className="flex-1 items-center justify-center">
                        <Image source={vegetables.find((v) => v.name === cell)?.image} className="w-8 h-8" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Garden Details */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-xl p-5 shadow-md">
            <Text className="text-xl font-semibold text-green-800 mb-4">
              Garden Details
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-green-600">Dimensions</Text>
                <Text className="font-medium text-green-900">
                  {width} x {height} {unit}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-green-600">Area</Text>
                <Text className="font-medium text-green-900">
                  {squareArea || "Not specified"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-green-600">Soil Type</Text>
                <Text className="font-medium text-green-900">
                  {soilType || "Not specified"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Planting Guide */}
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

        {/* Action Buttons */}
        <View className="px-4 mb-8 flex-row justify-between">
          <CustomButton
            title="Show Insights"
            bgVariant="plant"
            className="py-4 rounded-xl shadow-lg flex-1 mr-2"
            onPress={handleShowInsights}
          />
          <CustomButton
            title="Clear Garden"
            bgVariant="plant"
            className="py-4 rounded-xl shadow-lg flex-1 ml-2"
            onPress={() => {
              setGrid(Array(gridHeight).fill(null).map(() => Array(gridWidth).fill("")));
              setInsights({
                companions: [],
                avoid: [],
                spacingIssues: [],
                envIssues: []
              });
            }}
          />
        </View>

        {/* Insights Modal */}
        <Modal visible={showInsightsModal} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
            <View className="bg-white rounded-2xl p-6 w-11/12 max-h-[80%]">
              <ScrollView>
                <Text className="text-2xl font-bold text-green-800 mb-4">Garden Insights</Text>

                <View className="mb-6">
                  <Text className="text-xl font-semibold text-green-700 mb-2">Companions</Text>
                  <Text className="text-green-900">
                    {insights.companions.length > 0 ? insights.companions.join(", ") : "No specific companions recommended"}
                  </Text>
                </View>

                <View className="mb-6">
                  <Text className="text-xl font-semibold text-red-700 mb-2">Plants to Avoid</Text>
                  <Text className="text-red-900">
                    {insights.avoid.length > 0 ? insights.avoid.join(", ") : "No specific plants to avoid"}
                  </Text>
                </View>

                {insights.spacingIssues.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-xl font-semibold text-orange-700 mb-2">Spacing Issues</Text>
                    {insights.spacingIssues.map((issue, index) => (
                      <Text key={index} className="text-orange-900">{issue}</Text>
                    ))}
                  </View>
                )}

                {insights.envIssues.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-xl font-semibold text-orange-700 mb-2">Environmental Issues</Text>
                    {insights.envIssues.map((issue, index) => (
                      <Text key={index} className="text-orange-900">{issue}</Text>
                    ))}
                  </View>
                )}

                {insights.spacingIssues.length === 0 && insights.envIssues.length === 0 && (
                  <Text className="text-green-900 text-lg">Your garden looks perfect!</Text>
                )}
              </ScrollView>
              <CustomButton
                title="Close"
                bgVariant="plant"
                className="mt-4 py-4 rounded-xl"
                onPress={() => setShowInsightsModal(false)}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Builder;