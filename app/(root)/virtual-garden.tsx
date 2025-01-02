import CustomButton from '@/components/Button';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/constants';
import { useUser } from '@clerk/clerk-expo';

interface CropType {
  id: string;
  name: string;
  color: string;
  size: number;
}

interface GridCell {
  position: string;
  cropId: string | null;
}

interface GardenLayout {
  id?: string;
  name: string;
  rows: number;
  columns: number;
  cellSize: number;
  unit: 'feet' | 'meters';
  cells: GridCell[];
  userId: string;
}

interface UIGridCell {
  id: string;
  crop?: CropType;
}

const SAMPLE_CROPS: CropType[] = [
  { id: 'tomato', name: 'Tomato', color: '#ff6b6b', size: 1 },
  { id: 'carrot', name: 'Carrot', color: '#ffd93d', size: 1 },
  { id: 'lettuce', name: 'Lettuce', color: '#95e1d3', size: 1 },
  { id: 'cucumber', name: 'Cucumber', color: '#a8e6cf', size: 1 },
  { id: 'pepper', name: 'Pepper', color: '#ff8b94', size: 1 },
];

const UNITS = ['feet', 'meters'] as const;
type Unit = typeof UNITS[number];

const Create = () => {
  const { user } = useUser();
  // console.log(user?.id);
  const [layoutName, setLayoutName] = useState<string>('');
  const [rows, setRows] = useState<string>('4');
  const [columns, setColumns] = useState<string>('4');
  const [cellSize, setCellSize] = useState<string>('2');
  const [unit, setUnit] = useState<Unit>('feet');
  const [selectedCrop, setSelectedCrop] = useState<CropType | null>(null);
  const [grid, setGrid] = useState<UIGridCell[][]>([]);

  const convertGridToDBFormat = (): GridCell[] => {
    const cells: GridCell[] = [];
    
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        cells.push({
          position: `${rowIndex}-${colIndex}`,
          cropId: cell.crop?.id || null,
        });
      });
    });

    return cells;
  };

  const initializeGrid = () => {
    if (!layoutName.trim()) {
      Alert.alert('Error', 'Please enter a layout name');
      return;
    }
    
    const numRows = parseInt(rows);
    const numCols = parseInt(columns);
    
    const newGrid = Array(numRows).fill(null).map((_, rowIndex) =>
      Array(numCols).fill(null).map((_, colIndex) => ({
        id: `${rowIndex}-${colIndex}`,
      }))
    );
    
    setGrid(newGrid);
  };

  const handleCellPress = (rowIndex: number, colIndex: number) => {
    if (!selectedCrop) return;

    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = {
      ...newGrid[rowIndex][colIndex],
      crop: selectedCrop,
    };
    setGrid(newGrid);
  };

  const saveLayout = () => {
    if (!grid.length) {
      Alert.alert('Error', 'Please create a grid first');
      return;
    }

    const layout: GardenLayout = {
      name: layoutName,
      rows: parseInt(rows),
      columns: parseInt(columns),
      cellSize: parseInt(cellSize),
      unit,
      cells: convertGridToDBFormat(),
      userId: user?.id || '',
    };

    console.log('Layout saved:', JSON.stringify(layout, null, 2));
    // Alert.alert('Success', 'Layout saved successfully! Check console for data');

    // save to mongodb database at /api/layout/add

    fetch('http://192.168.0.140:3000/api/layout/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layout),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Layout saved:', data);
        Alert.alert('Success', 'Layout saved successfully!');
      })
      .catch((error) => {
        console.error('Error saving layout:', error);
        Alert.alert('Error', 'Failed to save layout');
      });
   

  };

  const renderCropItem = ({ item }: { item: CropType }) => (
    <TouchableOpacity
      className={`p-4 mr-3 rounded-xl ${
        selectedCrop?.id === item.id ? 'border-2 border-black' : ''
      }`}
      style={{ backgroundColor: item.color }}
      onPress={() => setSelectedCrop(item)}
    >
      <Text className="text-black font-bold text-center">{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="bg-white">
      <ScrollView className="p-4">
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.replace("/(root)/(tabs)/home")}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image source={icons?.backArrow} className="w-6 h-6" />
              </View>
            </TouchableOpacity>
          <Text className="text-2xl font-bold mb-4">Garden Layout Planner</Text>
          
          <View className="bg-gray-50 p-4 rounded-xl mb-6">
            <TextInput
              className="bg-white p-3 rounded-lg mb-4 border border-gray-200"
              placeholder="Layout Name"
              value={layoutName}
              onChangeText={setLayoutName}
            />

            <View className="flex-row items-center mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-600 mb-1">Rows</Text>
                <TextInput
                  className="bg-white p-3 rounded-lg border border-gray-200"
                  value={rows}
                  onChangeText={setRows}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-600 mb-1">Columns</Text>
                <TextInput
                  className="bg-white p-3 rounded-lg border border-gray-200"
                  value={columns}
                  onChangeText={setColumns}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-600 mb-1">Plot Size</Text>
                <TextInput
                  className="bg-white p-3 rounded-lg border border-gray-200"
                  value={cellSize}
                  onChangeText={setCellSize}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-600 mb-1">Unit</Text>
                <View className="flex-row">
                  {UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      className={`flex-1 p-3 rounded-lg mr-1 ${
                        unit === u ? 'bg-[#5B8E55]' : 'bg-gray-200'
                      }`}
                      onPress={() => setUnit(u)}
                    >
                      <Text className={`text-center ${
                        unit === u ? 'text-white' : 'text-gray-700'
                      }`}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              className="bg-[#5B8E55] p-4 rounded-lg"
              onPress={initializeGrid}
            >
              <Text className="text-white text-center font-bold">Create Grid</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-3">Select a Crop:</Text>
          <FlatList
            horizontal
            data={SAMPLE_CROPS}
            renderItem={renderCropItem}
            keyExtractor={(item) => item.id}
            className="mb-4"
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View className="items-center mb-6">
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row">
              {row.map((cell, colIndex) => (
                <TouchableOpacity
                  key={cell.id}
                  className={`border border-gray-300 justify-center items-center ${
                    cell.crop ? '' : 'bg-white'
                  }`}
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: cell.crop?.color || undefined,
                  }}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                >
                  {cell.crop && (
                    <Text className="font-bold">
                      {cell.crop.name.charAt(0)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {grid.length > 0 && (
          <CustomButton
            title="Save Layout"
            bgVariant='plant'
            onPress={saveLayout}
          /> 
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;