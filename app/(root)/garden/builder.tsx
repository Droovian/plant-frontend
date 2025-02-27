import { useRef, useEffect, useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/Button";
import { MotiView } from "moti";
import { useGardenStore } from "@/store";
import { vegetables } from "@/assets/data/plant";
import { compatibility } from "@/assets/data/plant";
import { StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context"
import axios from "axios";
import { Alert } from "react-native";
const BASE_CELL_SIZE = Dimensions.get("window").width < 375 ? 40 : 48;

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  message: string;
}

const Builder = () => {
  const { width, height } = useGardenStore();
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const insets = useSafeAreaInsets()
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [grid, setGrid] = useState<string[][]>([]);
  const [hasIncompatible, setHasIncompatible] = useState<boolean>(false);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const gridContainerRef = useRef<View>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    message: "",
  });
  const [selectedVegetable, setSelectedVegetable] = useState<string | null>(null);
  
  const gridWidth = Number(width);
  const gridHeight = Number(height);
  const maxCells = 20;
  const cellSize = Math.min(
    BASE_CELL_SIZE,
    (Dimensions.get("window").width - 32) / Math.min(gridWidth, maxCells),
    (Dimensions.get("window").height / 2) / Math.min(gridHeight, maxCells)
  );

  const saveLayout = async () => {
    if (!userId) {
      Alert.alert("Error", "Please sign in to save your layout.");
      return;
    }

    try {
      const gridData = grid.map((row) => row.map((cell) => ({ plantName: cell })));

      const response = await axios.post(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/layout`, { // Replace with your backend URL
        userId,
        grid: { rows: gridData },
        width: gridWidth,
        height: gridHeight,
      });

      Alert.alert("Success", "Layout saved successfully!");
    } catch (error) {
      console.error("Error saving layout:", error);
      Alert.alert("Error", "Failed to save layout.");
    }
  };

  async function playSound() {
    if (sound) {
      await sound.unloadAsync(); // Unload any existing sound instance
    }
    const { sound: newSound } = await Audio.Sound.createAsync(require('@/assets/audio/error.mp3'));
    setSound(newSound);
    await newSound.playAsync();

    setTimeout(async () => {
      await newSound.stopAsync();
      await newSound.unloadAsync();
      setSound(null);
    }, 1000);
  }

  useEffect(() => {
    const cappedWidth = Math.min(gridWidth, maxCells);
    const cappedHeight = Math.min(gridHeight, maxCells);
    setGrid(Array(cappedHeight).fill(null).map(() => Array(cappedWidth).fill("")));
  }, [width, height]);

  useEffect(() => {
    if (hasIncompatible) {
      playSound();
      // Reset the flag after playing the sound 
      setHasIncompatible(false);
    }
  }, [hasIncompatible]);

  const canPlacePlant = (row: number, col: number, vegetable: string): boolean => {
    const plantInfo = vegetables.find(v => v.name === vegetable);
    const requiredSquares = plantInfo?.noOfSquares || 1;
    
    // Single square plants can be placed anywhere empty
    if (requiredSquares === 1) {
      return grid[row][col] === "";
    }
    
    // Find the best pattern for the required squares
    const pattern = getOptimalPattern(requiredSquares, row, col);
    
    // If no valid pattern exists from this position, return false
    if (!pattern || pattern.length === 0) return false;
    
    // Check if all cells in the pattern are available
    for (const [r, c] of pattern) {
      if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== "") {
        return false;
      }
    }
    
    return true;
  };

  const getOptimalPattern = (squaresNeeded: number, startRow: number, startCol: number): [number, number][] => {
    const pattern: [number, number][] = [];
    
    // Priority: try to grow right, then down, then left to create a compact shape
    
    const directions = [
      [0, 0],  // Start position
      [0, 1],  // Right
      [1, 0],  // Down
      [1, 1],  // Down-Right
      [0, -1], // Left
      [-1, 0], // Up
      [-1, 1], // Up-Right
      [1, -1], // Down-Left
      [-1, -1] // Up-Left
    ];
    
    // Try to get the most compact shape by starting with the closest cells to origin
    for (let i = 0; i < directions.length && pattern.length < squaresNeeded; i++) {
      const [dr, dc] = directions[i];
      const r = startRow + dr;
      const c = startCol + dc;
      
      // Check if this cell is in bounds and empty
      if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c] === "") {
        // Add to pattern if not already in it
        if (!pattern.some(([pr, pc]) => pr === r && pc === c)) {
          pattern.push([r, c]);
        }
      }
    }
    
    let distance = 2;
    while (pattern.length < squaresNeeded && distance < Math.max(grid.length, grid[0].length)) {
      for (let dr = -distance; dr <= distance; dr++) {
        for (let dc = -distance; dc <= distance; dc++) {
          if (pattern.length >= squaresNeeded) break;
          
          const r = startRow + dr;
          const c = startCol + dc;
          
          // Only add cells that are on the edge of the current distance
          if (Math.abs(dr) === distance || Math.abs(dc) === distance) {
            if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c] === "") {
              if (!pattern.some(([pr, pc]) => pr === r && pc === c)) {
                pattern.push([r, c]);
              }
            }
          }
        }
      }
      distance++;
    }
    
    return pattern.length === squaresNeeded ? pattern : [];
  };

  const getBorderStyle = (row: number, col: number, vegetable: string) => {
    const compInfo = compatibility[0][vegetable] || { companions: [], avoid: [] };
    const vegetableSquareSize = vegetables.find((v) => v.name === vegetable)?.noOfSquares || 1;
    
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],  // Cardinal directions
      [-1, -1], [-1, 1], [1, -1], [1, 1]  // Diagonal directions
    ];
    
    let isCompanion = false;
    let shouldAvoid = false;
    let takesMoreSquares = (vegetableSquareSize > 1) ? true : false;
    let incompatiblePlants: string[] = [];

    for (const [dr, dc] of directions) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c]) {
        const neighbor = grid[r][c];
        if (compInfo.companions && compInfo.companions.includes(neighbor)) isCompanion = true;
        if (compInfo.avoid && compInfo.avoid.includes(neighbor)) {
          shouldAvoid = true;
          if (!incompatiblePlants.includes(neighbor)) {
            incompatiblePlants.push(neighbor);
          }
        }
      }
    }
    return { isCompanion, shouldAvoid, incompatiblePlants, takesMoreSquares };
  };

  const showTooltip = (rowIndex: number, colIndex: number, incompatiblePlants: string[]) => {
    gridContainerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const cellX = pageX + colIndex * cellSize;
      const cellY = pageY + rowIndex * cellSize;
      
      setTooltip({
        visible: true,
        x: cellX + cellSize,
        y: cellY,
        message: `Incompatible with: ${incompatiblePlants.join(", ")}`,
      });
    });
  };

  const hideTooltip = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const handleCellPress = (rowIndex: number, colIndex: number) => {
    const newGrid = grid.map((row) => [...row]);
  
    // Handle removing a plant
    if(newGrid[rowIndex][colIndex]) {
   
      newGrid[rowIndex][colIndex] = "";
      setGrid(newGrid);
      return;
    }
  
    if(!selectedVegetable) return;
  
    // Get the number of squares this plant requires
    const plantInfo = vegetables.find(v => v.name === selectedVegetable);
    const requiredSquares = plantInfo?.noOfSquares || 1;
  
    if(canPlacePlant(rowIndex, colIndex, selectedVegetable)) {
      
      const pattern = getOptimalPattern(requiredSquares, rowIndex, colIndex);
    
      // Place the plant in all cells in the pattern
      for (const [r, c] of pattern) {
        newGrid[r][c] = selectedVegetable;
      }
      
      setGrid(newGrid);
  
      const { shouldAvoid } = getBorderStyle(rowIndex, colIndex, selectedVegetable);
      if (shouldAvoid) {
        setHasIncompatible(true);
      }
    } else {
      console.log("Cannot place plant", selectedVegetable);
      // You could add visual feedback here
      setHasIncompatible(true); // Use your existing error sound
    }
  }

  // Helper function to get the plant count for display
  const getPlantCount = (plantName: string): number => {
    const plantInfo = vegetables.find(v => v.name === plantName);
    return plantInfo?.noCount || 1; // Default to 1 if noCount is not specified
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-50 to-green-100" style={{ paddingTop: insets.top }}>
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
                }}
              >
                <View className="p-4 items-center">
                  <Image source={veg.image} className="w-16 h-16 rounded-full mb-2" style={{ backgroundColor: "white" }} />
                  <Text className="text-base font-medium text-black">{veg.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View 
          className="items-center mb-6 px-4"
          ref={gridContainerRef}
        >
          <View className="bg-white rounded-xl p-4 shadow-md">
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row">
                {row.map((cell, colIndex) => {
                  const { isCompanion, shouldAvoid, incompatiblePlants, takesMoreSquares } = cell ? getBorderStyle(rowIndex, colIndex, cell) : { isCompanion: false,
                    takesMoreSquares: false, shouldAvoid: false, incompatiblePlants: [] };
                  
                  return (
                    <TouchableOpacity
                      key={colIndex}
                      className={`border border-1 ${cell ? "bg-opacity-20" : "bg-green-50"} ${
                        isCompanion ? "border-2 border-green-500" : shouldAvoid ? "border-2 border-red-500" : "border-gray-300"
                      }`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: "#f0fdf4",
                      }}
                      onPress={() => handleCellPress(rowIndex, colIndex)}
                      onLongPress={() => {
                        if (shouldAvoid && incompatiblePlants.length > 0) {
                          showTooltip(rowIndex, colIndex, incompatiblePlants);
                        }
                      }}
                      delayLongPress={300}
                      onPressOut={hideTooltip}
                    >
                      {cell && (
                        <View className="flex-1 items-center justify-center">
                          <Image source={vegetables.find((v) => v.name === cell)?.image} className="w-8 h-8" />
                          
                          {/* Plant count badge */}
                          <View className="absolute bottom-0 right-0 bg-green-600 rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                            <Text className="text-white text-xs font-bold">{getPlantCount(cell)}</Text>
                          </View>
                          
                          {shouldAvoid && (
                            <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
          
          {/* Legend for compatibility indicators */}
          <View className="flex-row justify-center items-center mt-4 bg-white p-3 rounded-lg shadow-sm">
            <View className="flex-row items-center mr-4">
              <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <Text className="text-xs text-gray-700">Incompatible plants</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <View className="w-4 h-4 border border-green-500 mr-2" />
              <Text className="text-xs text-gray-700">Companion plants</Text>
            </View>
          </View>
        </View>

        <View className="px-4 mb-8 flex-row justify-between">
          <CustomButton title="Save layout" bgVariant="plant" className="py-4 rounded-xl shadow-lg flex-1 mr-2" onPress={saveLayout} />
          <CustomButton
            title="Clear Garden"
            bgVariant="plant"
            className="py-4 rounded-xl shadow-lg flex-1 ml-2"
            onPress={() => setGrid(Array(gridHeight).fill(null).map(() => Array(gridWidth).fill("")))}
          />
        </View>

        {tooltip.visible && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.min(tooltip.x, Dimensions.get("window").width - 200), // Prevent overflow
                top: tooltip.y,
              },
            ]}
          >
            <Text className="text-sm font-medium text-white mb-1">Incompatible Plants:</Text>
            {tooltip.message.replace("Incompatible with: ", "").split(", ").map((plant, index) => (
              <View key={index} className="flex-row items-center mb-1">
                <View className="w-2 h-2 bg-red-400 rounded-full mr-1" />
                <Text className="text-sm text-white">{plant}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg"
        style={{ marginTop: insets.top }}
      >
        <Ionicons name="arrow-back" size={24} color="#16a34a" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 6,
    maxWidth: 200,
    zIndex: 1000,
  },
});

export default Builder;