import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, Alert, Dimensions, ScrollView, Image, 
  TouchableOpacity, Animated, ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { vegetables } from '@/assets/data/plant';
import { MotiView } from 'moti';
import { Calendar } from 'react-native-calendars';

const BASE_CELL_SIZE = Dimensions.get('window').width < 375 ? 40 : 48;

interface LayoutData {
  _id: string;
  grid: { rows: { plantName: string }[][] };
  width: number;
  height: number;
  createdAt: string;
}

interface WateringSchedule {
  [date: string]: { marked: boolean; dotColor: string };
}

const LayoutDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const userId = user?.id;
  const insets = useSafeAreaInsets();

  const [layout, setLayout] = useState<LayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [wateringSchedule, setWateringSchedule] = useState<WateringSchedule>({});
  const [waterLevels, setWaterLevels] = useState<{ [plantName: string]: Animated.Value }>({});

  useEffect(() => {
    if (id && userId) {
      fetchLayout();
    }
  }, [id, userId]);

  const fetchLayout = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_NODE_KEY}/api/layout/${id}`
      );
      setLayout(response.data);
      generateWateringSchedule(response.data);
      initializeWaterLevels(response.data);
    } catch (error) {
      console.error('Error fetching layout:', error);
      Alert.alert('Error', 'Failed to fetch layout.');
    } finally {
      setLoading(false);
    }
  };

  const initializeWaterLevels = (layoutData: LayoutData) => {
    if (!layoutData) return;
    const initialLevels: { [plantName: string]: Animated.Value } = {};
    layoutData.grid.rows.forEach((row) => {
      row.forEach((cell) => {
        if (cell.plantName) {
          initialLevels[cell.plantName] = new Animated.Value(100);
        }
      });
    });
    setWaterLevels(initialLevels);
  };

  const generateWateringSchedule = (layoutData: LayoutData) => {
    if (!layoutData) return;
    const schedule: WateringSchedule = {};
    const createdDate = new Date(layoutData.createdAt);

    layoutData.grid.rows.forEach((row) => {
      row.forEach((cell) => {
        if (cell.plantName) {
          const plant = vegetables.find((v) => v.name === cell.plantName);
          if (plant) {
            const wateringDays = calculateWateringDays(createdDate, plant.name);
            wateringDays.forEach((day) => {
              const dateStr = day.toISOString().split('T')[0];
              schedule[dateStr] = { marked: true, dotColor: plant.color };
            });
          }
        }
      });
    });
    setWateringSchedule(schedule);
  };

  const calculateWateringDays = (startDate: Date, plantName: string) => {
    const wateringDays = [];
    const waterInterval = getWateringInterval(plantName);
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + waterInterval);

    for (let i = 0; i < 7; i++) {
      wateringDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + waterInterval);
    }
    return wateringDays;
  };

  const getWateringInterval = (plantName: string) => {
    switch (plantName) {
      case 'Tomato': return 3;
      case 'Chilli': return 2;
      case 'Radish': return 1;
      case 'Lettuce': return 2;
      default: return 3;
    }
  };

  const renderGrid = useCallback(() => {
    if (!layout) return null;

    const { grid, width, height } = layout;
    const maxCells = 20;
    const cellSize = Math.min(
      BASE_CELL_SIZE,
      (Dimensions.get('window').width - 32) / Math.min(width, maxCells),
      (Dimensions.get('window').height / 4) / Math.min(height, maxCells)
    );

    return grid.rows.map((row, rowIndex) => (
      <View key={rowIndex} className="flex-row">
        {row.map((cell, colIndex) => (
          <View key={colIndex} className="border border-gray-300 bg-white justify-center items-center" style={{ width: cellSize, height: cellSize }}>
            {cell.plantName && (
              <Image
                source={vegetables.find((v) => v.name === cell.plantName)?.image}
                className="w-4/5 h-4/5"
                resizeMode="contain"
              />
            )}
          </View>
        ))}
      </View>
    ));
  }, [layout]);

  const logWatering = (plantName: string) => {
    if (waterLevels[plantName]) {
      Animated.sequence([
        Animated.timing(waterLevels[plantName], {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(waterLevels[plantName], {
          toValue: 100,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start(() => {
        updateWateringHistory(plantName);
      });
    }
  };
  
  const updateWateringHistory = (plantName: string) => {
    const today = new Date().toISOString().split('T')[0];
  
    setWateringSchedule((prevSchedule) => ({
      ...prevSchedule,
      [today]: { marked: true, dotColor: '#16a34a', customLabel: '✅' },
    }));
  };
  

  const renderPlantCards = useCallback(() => {
    if (!layout) return null;
    const plantList: { [key: string]: boolean } = {};
    layout.grid.rows.forEach((row) => {
      row.forEach((cell) => {
        if (cell.plantName) {
          plantList[cell.plantName] = true;
        }
      });
    });

    return Object.keys(plantList).map((plantName) => {
      const plant = vegetables.find((v) => v.name === plantName);
      if (!plant) return null;

      return (
        <MotiView
          key={plantName}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="bg-white rounded-lg p-4 m-2 shadow-md w-full max-w-sm"
        >
          <View className="flex-row items-center mb-2">
            <Image source={plant.image} className="w-12 h-12 mr-3" resizeMode="contain" />
            <Text className="text-lg font-semibold">{plant.name}</Text>
          </View>
          <Text className="text-sm text-gray-600">Water every {getWateringInterval(plant.name)} days.</Text>
          <View className="mt-2 bg-gray-200 rounded-full h-4 overflow-hidden">
            <Animated.View className="bg-blue-500 h-4 rounded-full" style={{ width: waterLevels[plantName]?.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
          </View>
          <TouchableOpacity onPress={() => logWatering(plantName)} className="mt-2 bg-blue-100 p-2 rounded-md">
            <Text className="text-blue-600">Log Watering</Text>
          </TouchableOpacity>
        </MotiView>
      );
    });
  }, [layout]);

  return (
    <SafeAreaView className="flex-1 bg-green-50" style={{ paddingTop: insets.top }}>
      {loading ? <ActivityIndicator size="large" color="#4CAF50" className="mt-10" /> : (
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
          {renderGrid()}
          <Calendar markedDates={wateringSchedule} />
          {renderPlantCards()}
        </ScrollView>
      )}

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

export default LayoutDetail;
