import { useRef, useEffect, useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/Button";
import { MotiView } from "moti";
import { useGardenStore } from "@/store";
import { vegetables } from "@/assets/data/plant";
import { compatibility } from "@/assets/data/plant";
import { StyleSheet } from "react-native";

const BASE_CELL_SIZE = Dimensions.get("window").width < 375 ? 40 : 48;

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  message: string;
}

const Builder = () => {
  const { width, height } = useGardenStore();
  const [grid, setGrid] = useState<string[][]>([]);
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

  useEffect(() => {
    const cappedWidth = Math.min(gridWidth, maxCells);
    const cappedHeight = Math.min(gridHeight, maxCells);
    setGrid(Array(cappedHeight).fill(null).map(() => Array(cappedWidth).fill("")));
  }, [width, height]);

  const canPlacePlant = (row: number, col: number, vegetable: string): boolean => {
    // You can implement additional placement validation logic here
    return true;
  };

  const getBorderStyle = (row: number, col: number, vegetable: string) => {
    const compInfo = compatibility[0][vegetable] || { companions: [], avoid: [] };
    // Include all 8 directions (4 cardinal + 4 diagonal)
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],  // Cardinal directions
      [-1, -1], [-1, 1], [1, -1], [1, 1]  // Diagonal directions
    ];
    
    let isCompanion = false;
    let shouldAvoid = false;
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
    return { isCompanion, shouldAvoid, incompatiblePlants };
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

    if(newGrid[rowIndex][colIndex]){
      const removedPlant = newGrid[rowIndex][colIndex];
      newGrid[rowIndex][colIndex] = "";
      setGrid(newGrid);
      console.log("Removed plant", removedPlant);

      return;
    }

    if(!selectedVegetable) return;

    if(canPlacePlant(rowIndex, colIndex, selectedVegetable)){
      newGrid[rowIndex][colIndex] = selectedVegetable;
      setGrid(newGrid);
    } else {
      console.log("Cannot place plant", selectedVegetable);
    }

    console.log(`Attempting to place ${selectedVegetable} at (${rowIndex}, ${colIndex})`);
  };

  // Helper function to get the plant count for display
  const getPlantCount = (plantName: string): number => {
    const plantInfo = vegetables.find(v => v.name === plantName);
    return plantInfo?.noCount || 1; // Default to 1 if noCount is not specified
  };

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
                onPress={() => setSelectedVegetable(veg.name)}
              >
                <View className="p-4 items-center">
                  <Image source={veg.image} className="w-16 h-16 rounded-full mb-2" style={{ backgroundColor: "white" }} />
                  <Text className="text-base font-medium text-green-800">{veg.name}</Text>
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
                  const { isCompanion, shouldAvoid, incompatiblePlants } = cell ? getBorderStyle(rowIndex, colIndex, cell) : { isCompanion: false, shouldAvoid: false, incompatiblePlants: [] };
        
                  return (
                    <TouchableOpacity
                      key={colIndex}
                      className={`m-0.5 border ${cell ? "bg-opacity-20" : "bg-green-50"} ${
                        isCompanion ? "border-green-500" : shouldAvoid ? "border-red-500" : "border-gray-400"
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
          <CustomButton title="Show Insights" bgVariant="plant" className="py-4 rounded-xl shadow-lg flex-1 mr-2" onPress={() => {}} />
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