import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useGardenStore } from '@/store';
import CustomButton from '@/components/Button';
import { plants } from '@/assets/data/plant';
import { compatibility } from '@/assets/data/plant';
import { StyleSheet } from 'react-native';
import axios from 'axios';

const BASE_CELL_SIZE = Dimensions.get('window').width < 375 ? 40 : 48;
const DEFAULT_IMAGE = require('@/assets/images/healthy-plant.jpg'); // Matches your provided path

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  message: string;
}

interface PlantIssue {
  plant: string;
  row: number;
  col: number;
  issues: string[];
}

const Builder = () => {
  const { width, height, unit, soilType, sunlightExposure, soilPH, soilNutrientLevel } = useGardenStore();
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [grid, setGrid] = useState<string[][]>([]);
  const [hasIssue, setHasIssue] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, message: '' });
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [plantIssues, setPlantIssues] = useState<PlantIssue[]>([]);
  const gridContainerRef = useRef<View>(null);
  const shake = useSharedValue(0);

  const gridWidth = Math.min(Number(width) || 10, 20);
  const gridHeight = Math.min(Number(height) || 10, 20);
  const cellSize = Math.min(
    BASE_CELL_SIZE,
    (Dimensions.get('window').width - 32) / gridWidth,
    (Dimensions.get('window').height / 2) / gridHeight
  );

  // Convert feet to cells based on unit
  const feetToCells = (feet: number) => {
    if (unit === 'meters') return Math.ceil(feet / 3.281);
    return Math.ceil(feet);
  };

  // Shake animation for issues
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        ),
      },
    ],
  }));

  // Initialize grid
  useEffect(() => {
    setGrid(Array(gridHeight).fill(null).map(() => Array(gridWidth).fill('')));
  }, [gridWidth, gridHeight]);

  // Play sound for issues
  useEffect(() => {
    if (hasIssue) {
      const playSound = async () => {
        try {
          if (sound) await sound.unloadAsync();
          const { sound: newSound } = await Audio.Sound.createAsync(require('@/assets/audio/error.mp3'));
          setSound(newSound);
          await newSound.playAsync();
          setTimeout(async () => {
            await newSound.stopAsync();
            await newSound.unloadAsync();
            setSound(null);
          }, 1000);
        } catch (error) {
          console.log('Error playing sound:', error);
        }
      };
      playSound();
      setHasIssue(false);
      shake.value = shake.value + 1;
    }
  }, [hasIssue, sound, shake]);

  // Debug selectedPlant changes
  useEffect(() => {
    console.log('selectedPlant updated:', selectedPlant);
  }, [selectedPlant]);

  // Check plant compatibility with garden conditions
  const isPlantCompatible = (plant: typeof plants[0]) => {
    const issues: string[] = [];
    const normalize = (str: string) => str.toLowerCase();

    const plantSunlight = normalize(plant.sunlight);
    const gardenSunlight = sunlightExposure ? normalize(sunlightExposure) : '';
    const sunlightOptions = plantSunlight.includes('to')
      ? plantSunlight.split(' to ').map(normalize)
      : [plantSunlight];
    if (sunlightExposure && !sunlightOptions.some(opt => gardenSunlight.includes(opt))) {
      issues.push(`Prefers ${plant.sunlight}`);
    }

    if (soilType && !plant.optimal_soil_type.includes(soilType)) {
      issues.push(`Prefers ${plant.optimal_soil_type.join(' or ')} soil`);
    }

    if (soilPH && (Number(soilPH) < plant.optimal_ph_range[0] || Number(soilPH) > plant.optimal_ph_range[1])) {
      issues.push(`Prefers pH ${plant.optimal_ph_range[0]}-${plant.optimal_ph_range[1]}`);
    }

    // Planting month check (June 2025)
    const currentMonth = 'June'; // Hardcoded for June 19, 2025
    if (!plant.planting_months.includes(currentMonth)) {
      issues.push(`Best planted in ${plant.planting_months.join(', ')}`);
    }

    return { issues };
  };

  const canPlacePlant = (row: number, col: number, plantName: string): { canPlace: boolean; reason?: string } => {
    const plant = plants.find((v) => v.name === plantName);
    if (!plant) return { canPlace: false, reason: 'Plant not found' };

    if (grid[row] && grid[row][col] !== '') {
      return { canPlace: false, reason: 'Cell is already occupied' };
    }

    const spacingCells = feetToCells(plant.spacingFeet);
    const spacingIssues: string[] = [];
    for (let r = Math.max(0, row - spacingCells); r <= Math.min(gridHeight - 1, row + spacingCells); r++) {
      for (let c = Math.max(0, col - spacingCells); c <= Math.min(gridWidth - 1, col + spacingCells); c++) {
        if (grid[r] && grid[r][c] && (r !== row || c !== col)) {
          const distance = Math.sqrt((r - row) ** 2 + (c - col) ** 2);
          if (distance < spacingCells) {
            spacingIssues.push(`Too close to ${grid[r][c]} (needs ${plant.spacingFeet} ${unit})`);
          }
        }
      }
    }

    return { canPlace: true, reason: spacingIssues.length > 0 ? spacingIssues.join('; ') : undefined };
  };

  const getBorderStyle = (row: number, col: number, plantName: string) => {
    const compInfo = compatibility[0][plantName] || { companions: [], avoid: [] };
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];
    let isCompanion = false;
    let shouldAvoid = false;
    let spacingIssue = false;
    let incompatiblePlants: string[] = [];

    for (const [dr, dc] of directions) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r] && grid[r][c]) {
        const neighbor = grid[r][c];
        if (compInfo.companions?.includes(neighbor)) isCompanion = true;
        if (compInfo.avoid?.includes(neighbor)) {
          shouldAvoid = true;
          if (!incompatiblePlants.includes(neighbor)) incompatiblePlants.push(neighbor);
        }
      }
    }

    // Check spacing violations
    const plant = plants.find((v) => v.name === plantName);
    if (plant) {
      const spacingCells = feetToCells(plant.spacingFeet);
      for (let r = Math.max(0, row - spacingCells); r <= Math.min(gridHeight - 1, row + spacingCells); r++) {
        for (let c = Math.max(0, col - spacingCells); c <= Math.min(gridWidth - 1, col + spacingCells); c++) {
          if (grid[r] && grid[r][c] && (r !== row || c !== col)) {
            const distance = Math.sqrt((r - row) ** 2 + (c - col) ** 2);
            if (distance < spacingCells) {
              spacingIssue = true;
              if (!incompatiblePlants.includes(grid[r][c])) incompatiblePlants.push(grid[r][c]);
            }
          }
        }
      }
    }

    return { isCompanion, shouldAvoid, incompatiblePlants, spacingIssue };
  };

  const showTooltip = (rowIndex: number, colIndex: number, message: string) => {
    if (gridContainerRef.current) {
      gridContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
        const cellX = pageX + colIndex * cellSize;
        const cellY = pageY + rowIndex * cellSize;
        setTooltip({
          visible: true,
          x: cellX + cellSize,
          y: cellY,
          message,
        });
      });
    }
  };

  const hideTooltip = () => setTooltip(prev => ({ ...prev, visible: false }));

  const handlePlantSelect = useCallback((plantName: string) => {
    console.log('Selecting plant:', plantName);
    setSelectedPlant(prev => prev === plantName ? null : plantName);
  }, []);

  const handleCellPress = useCallback((rowIndex: number, colIndex: number) => {
    console.log('handleCellPress: selectedPlant=', selectedPlant, 'row=', rowIndex, 'col=', colIndex);
    
    if (!grid[rowIndex]) {
      console.log('Invalid row index');
      return;
    }

    const newGrid = grid.map((row) => [...row]);

    // Remove plant if cell is occupied
    if (newGrid[rowIndex][colIndex]) {
      newGrid[rowIndex][colIndex] = '';
      setGrid(newGrid);
      // Remove issues for this cell
      setPlantIssues((prev) => prev.filter((issue) => issue.row !== rowIndex || issue.col !== colIndex));
      return;
    }

    if (!selectedPlant) {
      Alert.alert('No Plant Selected', 'Please select a plant first');
      setHasIssue(true);
      return;
    }

    const { canPlace, reason } = canPlacePlant(rowIndex, colIndex, selectedPlant);
    
    if (canPlace) {
      newGrid[rowIndex][colIndex] = selectedPlant;
      setGrid(newGrid);
      
      const { shouldAvoid, incompatiblePlants } = getBorderStyle(rowIndex, colIndex, selectedPlant);
      const plant = plants.find((v) => v.name === selectedPlant);
      const { issues } = plant ? isPlantCompatible(plant) : { issues: [] };
      
      const allIssues = [
        ...issues,
        ...(reason ? [reason] : []),
        ...(shouldAvoid ? [`Incompatible with: ${incompatiblePlants.join(', ')}`] : []),
      ];
      
      if (allIssues.length > 0) {
        setHasIssue(true);
        showTooltip(rowIndex, colIndex, allIssues.join('; '));
        setPlantIssues((prev) => [
          ...prev.filter(issue => issue.row !== rowIndex || issue.col !== colIndex),
          { plant: selectedPlant, row: rowIndex, col: colIndex, issues: allIssues },
        ]);
      }
      
    } else {
      setHasIssue(true);
      Alert.alert('Cannot Place Plant', reason || 'Invalid placement');
    }
  }, [selectedPlant, grid, canPlacePlant, getBorderStyle, isPlantCompatible, showTooltip]);

  const saveLayout = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please sign in to save your layout.');
      return;
    }

    try {
      const gridData = grid.map((row) => row.map((cell) => ({ plantName: cell })));
      await axios.post(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/layout`, {
        userId,
        grid: { rows: gridData },
        width: gridWidth,
        height: gridHeight,
      });

      // Generate summary of issues
      const issueSummary = plantIssues.map(
        (issue) => `${issue.plant} at (${issue.row + 1}, ${issue.col + 1}): ${issue.issues.join('; ')}`
      );

      Alert.alert(
        'Layout Saved',
        issueSummary.length > 0
          ? `Layout and care reminders saved! Issues found:\n${issueSummary.join('\n')}`
          : 'Layout and care reminders saved successfully!'
      );
    } catch (error) {
      console.error('Error saving layout:', error);
      Alert.alert('Error', 'Failed to save layout.');
    }
  };

  const clearGarden = useCallback(() => {
    setGrid(Array(gridHeight).fill(null).map(() => Array(gridWidth).fill('')));
    setPlantIssues([]);
    setSelectedPlant(null);
    Alert.alert('Garden Cleared', 'All plants have been removed from the garden');
  }, [gridHeight, gridWidth]);

  const memoizedGrid = useMemo(() => {
    return grid.map((row, rowIndex) => (
      <View key={rowIndex} className="flex-row">
        {row.map((cell, colIndex) => {
          const { isCompanion, shouldAvoid, incompatiblePlants, spacingIssue } = cell
            ? getBorderStyle(rowIndex, colIndex, cell)
            : { isCompanion: false, shouldAvoid: false, incompatiblePlants: [], spacingIssue: false };
          const plantInfo = plants.find((v) => v.name === cell);

          return (
            <TouchableOpacity
              key={colIndex}
              className={`border ${cell ? 'bg-opacity-20' : 'bg-green-50'} ${
                spacingIssue
                  ? 'border-2 border-yellow-500'
                  : isCompanion
                  ? 'border-2 border-green-500'
                  : shouldAvoid
                  ? 'border-2 border-red-500'
                  : 'border-gray-300'
              }`}
              style={{ width: cellSize, height: cellSize, backgroundColor: cell ? '#dcfce7' : '#f0fdf4' }}
              onPress={() => handleCellPress(rowIndex, colIndex)}
              onLongPress={() => {
                if (shouldAvoid && incompatiblePlants.length > 0) {
                  showTooltip(rowIndex, colIndex, `Incompatible with: ${incompatiblePlants.join(', ')}`);
                }
              }}
              delayLongPress={300}
              onPressOut={hideTooltip}
              accessible
              accessibilityLabel={cell ? `${cell} plant` : 'Empty garden cell'}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {cell && (
                <View className="flex-1 items-center justify-center">
                  <Image
                    source={plantInfo?.image || DEFAULT_IMAGE}
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                  <View className="absolute bottom-0 right-0 bg-green-600 rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                    <Text className="text-white text-xs font-bold">{plantInfo?.noCount || 1}</Text>
                  </View>
                  {shouldAvoid && <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  }, [grid, cellSize, handleCellPress, getBorderStyle, showTooltip, hideTooltip]);

  // Debug garden store values
  useEffect(() => {
    console.log('Garden Store:', { width, height, unit, soilType, sunlightExposure, soilPH, soilNutrientLevel });
  }, [width, height, unit, soilType, sunlightExposure, soilPH, soilNutrientLevel]);

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-50 to-green-100" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18 }}
          className="items-center py-6"
        >
          <Text className="text-3xl font-bold text-green-800">Virtual Garden</Text>
          <Text className="text-base text-green-600 mt-2">Design Your {width}x{height} {unit} Layout</Text>
          {selectedPlant && (
            <Text className="text-sm text-green-700 mt-1 font-medium">Selected: {selectedPlant}</Text>
          )}
        </MotiView>

        <View className="mb-6 px-4">
          <Text className="text-lg font-semibold text-green-700 mb-3 ml-2">Select Plants</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pt-2"
            contentContainerStyle={{ paddingHorizontal: 4 }}
            bounces={false}
          >
            {plants.map((plant) => (
              <TouchableOpacity
                key={plant.name}
                className={`mr-4 rounded-xl shadow-sm overflow-hidden ${
                  selectedPlant === plant.name ? 'border-2 border-green-600' : 'border border-gray-200'
                }`}
                style={{ 
                  backgroundColor: selectedPlant === plant.name ? '#dcfce7' : (plant.color || '#C5E1A5'), 
                  width: 120, 
                  height: 120 
                }}
                onPress={() => handlePlantSelect(plant.name)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessible
                accessibilityLabel={`Select ${plant.name}`}
              >
                <View className="p-4 items-center justify-center flex-1">
                  <Image
                    source={plant.image || DEFAULT_IMAGE}
                    className="w-12 h-12 rounded-full mb-2"
                    style={{ backgroundColor: 'white' }}
                    resizeMode="contain"
                  />
                  <Text className="text-base font-medium text-black text-center" numberOfLines={2}>
                    {plant.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Animated.View style={animatedStyle} className="items-center mb-6 px-4" ref={gridContainerRef}>
          <View className="bg-white rounded-xl p-4 shadow-md">{memoizedGrid}</View>
          <View className="flex-row justify-center items-center mt-4 bg-white p-3 rounded-lg shadow-sm">
            <View className="flex-row items-center mr-4">
              <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <Text className="text-xs text-gray-700">Incompatible plants</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <View className="w-4 h-4 border border-green-500 mr-2" />
              <Text className="text-xs text-gray-700">Companion plants</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <View className="w-4 h-4 border border-yellow-500 mr-2" />
              <Text className="text-xs text-gray-700">Spacing Issue</Text>
            </View>
          </View>
        </Animated.View>

        <View className="px-4 mb-8 flex-row justify-between">
          <CustomButton
            title="Save Layout"
            bgVariant="plant"
            className="py-4 rounded-xl shadow-lg flex-1 mr-2"
            onPress={() => { saveLayout(); router.push('/my-layouts'); }}
          />
          <CustomButton
            title="Clear Garden"
            bgVariant="plant"
            className="py-4 rounded-xl shadow-lg flex-1 ml-2"
            onPress={clearGarden}
          />
        </View>

        {tooltip.visible && (
          <View
            style={[
              styles.tooltip,
              { left: Math.min(tooltip.x, Dimensions.get('window').width - 200), top: tooltip.y },
            ]}
          >
            <Text className="text-sm font-medium text-white mb-1">Issues:</Text>
            <Text className="text-sm text-white">{tooltip.message}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg"
        style={{ marginTop: insets.top }}
        accessible
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={24} color="#16a34a" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 6,
    maxWidth: 200,
    zIndex: 1000,
  },
});

export default Builder;