import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Alert,
  Dimensions,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Calendar } from 'react-native-calendars';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import useWeather from '@/hooks/useWeather';
import WeatherBanner from '@/components/WeatherBanner';
import CustomButton from '@/components/Button';
import { plants, compatibility } from '@/assets/data/plant';

const BASE_CELL_SIZE = Dimensions.get('window').width < 375 ? 40 : 48;

interface Plant {
  name: string;
  image: any;
  sunlight: string;
  optimal_soil_type: string[];
  fertilizerNeeds?: string;
  pestSusceptibility?: string[];
  daysToHarvest?: number;
}

interface LayoutData {
  _id: string;
  name?: string;
  grid: { rows: { plantName: string }[][] };
  width: number;
  height: number;
  createdAt: string;
  plantingDate?: string;
}

interface WateringSchedule {
  [date: string]: { marked: boolean; dots: { color: string }[] };
}

interface WateringHistory {
  layoutId: string | string[];
  plantName: string;
  wateringDates: string[];
}

interface Task {
  id: string;
  description: string;
  completed: boolean;
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
  const [wateringInsights, setWateringInsights] = useState<string[]>([]);
  const [wateringHistory, setWateringHistory] = useState<WateringHistory[]>([]);
  const [waterLevels, setWaterLevels] = useState<{ [plantName: string]: Animated.Value }>({});
  const [tasks, setTasks] = useState<Task[]>([]); // This state is declared but not used, consider removing if not needed.
  const [tooltip, setTooltip] = useState<{ message: string; x: number; y: number } | null>(null); // This state is declared but not used, consider removing if not needed.
  const { weather, address, error } = useWeather();

  const weatherData = useMemo(() => {
    if (!weather) return null;
    return {
      currentTemp: weather.current?.temp_c,
      currentCondition: weather.current?.condition?.text,
      dewPoint: weather?.dewpoint_c,
      humidity: weather.current?.humidity,
      windSpeed: weather.current?.wind_kph,
      uvIndex: weather.current?.uv,
      gust: weather?.gust_kph,
      heatIndex: weather?.heatindex_c,
      pressure: weather?.pressure_in,
      feelsLike: weather?.feelslike_c,
      forecast: weather.forecast?.forecastday?.map((day) => ({
        date: day.date,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        totalPrecip: day.day.totalprecip_in,
        willRain: day.day.daily_will_it_rain,
        chanceOfRain: day.day.daily_chance_of_rain,
      })),
    };
  }, [weather]);

  useEffect(() => {
    if (id && userId) {
      fetchLayout();
      fetchWateringHistory();
    }
  }, [id, userId]); // Dependencies for initial data fetch

  // Initialize water levels when layout is available
  useEffect(() => {
    if (layout) {
      const levels: { [plantName: string]: Animated.Value } = {};
      const plantList: { [key: string]: boolean } = {};
      layout.grid.rows.forEach((row) => {
        row.forEach((cell) => {
          if (cell.plantName && !plantList[cell.plantName]) {
            plantList[cell.plantName] = true;
            levels[cell.plantName] = new Animated.Value(100);
          }
        });
      });
      setWaterLevels(levels);
    }
  }, [layout]); // Only run when layout changes

  const fetchLayout = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/layout/${id}`);
      setLayout(response.data);
    } catch (error) {
      console.error('Error fetching layout:', error);
      Alert.alert('Error', 'Failed to fetch layout.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchWateringHistory = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_NODE_KEY}/api/watering-history/layout/${id}`
      );
      setWateringHistory(response.data);
    } catch (error) {
      console.error('Error fetching watering history:', error);
    }
  }, [id]);

  const generateColorMap = useCallback(() => {
    if (!layout) return {};
    const colors = ['#3b82f6', '#16a34a', '#f97316', '#d946ef', '#2dd4bf', '#facc15'];
    const colorMap: { [key: string]: string } = {};
    const plantList: { [key: string]: boolean } = {};
    let colorIndex = 0;
    layout.grid.rows.forEach((row) => {
      row.forEach((cell) => {
        if (cell.plantName && !plantList[cell.plantName]) {
          plantList[cell.plantName] = true;
          colorMap[cell.plantName] = colors[colorIndex % colors.length];
          colorIndex++;
        }
      });
    });
    return colorMap;
  }, [layout]); // Only re-create if layout changes

  const getWateringInterval = useCallback((plantName: string) => {
    switch (plantName) {
      case 'Okra':
        return 3;
      case 'Tomato':
        return 3;
      case 'Chilli':
        return 2;
      case 'Drumstick':
        return 7;
      case 'Pumpkin':
        return 3;
      case 'Breadfruit':
        return 7;
      case 'Radish':
        return 1;
      case 'Eggplant':
        return 3;
      case 'Potato':
        return 3;
      case 'Asparagus':
        return 3;
      case 'Beet':
        return 2;
      case 'Spinach':
        return 2;
      case 'Corn':
        return 3;
      case 'Cucumber':
        return 2;
      case 'Onion':
        return 3;
      case 'Cowpea':
        return 3;
      case 'Lettuce':
        return 2;
      default:
        return 3;
    }
  }, []); // This function has no external dependencies, so it only needs to be created once.

  const getGrowthStage = useCallback((plantName: string, days: number) => {
    const plant = plants.find((v) => v.name === plantName);
    if (!plant) return 'Unknown';
    const stages = {
      Seedling: 14,
      Vegetative: 30,
      Flowering: 50,
      Fruiting: Infinity,
    };
    if (days <= stages.Seedling) return 'Seedling';
    if (days <= stages.Vegetative) return 'Vegetative';
    if (days <= stages.Flowering) return 'Flowering';
    return 'Fruiting';
  }, []); // No external dependencies

  const getBorderStyle = useCallback((row: number, col: number, plantName: string) => {
    if (!plantName || !compatibility[0][plantName] || !layout) return { isCompanion: false, shouldAvoid: false };
    const compInfo = compatibility[0][plantName] || { companions: [], avoid: [] };
    let isCompanion = false;
    let shouldAvoid = false;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    layout.grid.rows.forEach((r, ri) => {
      r.forEach((c, ci) => {
        if (directions.some(([dr, dc]) => ri === row + dr && ci === col + dc) && c.plantName) {
          if (compInfo.companions && compInfo.companions.includes(c.plantName)) isCompanion = true;
          if (compInfo.avoid && compInfo.avoid.includes(c.plantName)) shouldAvoid = true;
        }
      });
    });
    return { isCompanion, shouldAvoid };
  }, [layout]); // Depends on layout

  const showTooltip = useCallback((rowIndex: number, colIndex: number, message: string) => {
    Alert.alert('Plant Info', message);
  }, []); // No external dependencies

  const MemoizedColorMap = useMemo(() => generateColorMap(), [generateColorMap]);

  // Generate watering calendar inside useEffect to prevent infinite loops
  useEffect(() => {
    if (!layout || !wateringHistory.length) {
      setWateringSchedule({}); // Clear schedule if data is missing
      return;
    }

    const schedule: WateringSchedule = {};
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 30);
    const colorMap = MemoizedColorMap; // Use the memoized color map

    wateringHistory.forEach((item) => {
      item.wateringDates.forEach((date) => {
        if (!schedule[date]) {
          schedule[date] = { marked: true, dots: [] };
        }
        schedule[date].dots.push({ color: colorMap[item.plantName] });
      });
    });

    const plantList: { [key: string]: boolean } = {};
    layout.grid.rows.forEach((row) => {
      row.forEach((cell) => {
        if (cell.plantName) plantList[cell.plantName] = true;
      });
    });

    Object.keys(plantList).forEach((plantName) => {
      const plantHistory = wateringHistory.find((h) => h.plantName === plantName);
      if (!plantHistory || !plantHistory.wateringDates.length) return;
      const sortedDates = [...plantHistory.wateringDates].sort();
      const lastWateredDate = new Date(sortedDates[sortedDates.length - 1]);
      let waterInterval = getWateringInterval(plantName);
      let nextWateringDate = new Date(lastWateredDate);
      nextWateringDate.setDate(nextWateringDate.getDate() + waterInterval);

      while (nextWateringDate <= futureDate) {
        const dateString = nextWateringDate.toISOString().split('T')[0];
        if (!schedule[dateString]) {
          schedule[dateString] = { marked: true, dots: [] };
        }
        schedule[dateString].dots.push({ color: colorMap[plantName] });
        nextWateringDate.setDate(nextWateringDate.getDate() + waterInterval);
      }
    });

    const todayString = today.toISOString().split('T')[0];
    if (!schedule[todayString]) {
      schedule[todayString] = { marked: true, dots: [] };
    }
    schedule[todayString].dots.push({ color: '#000000' });

    // Only update state if the schedule has actually changed to prevent unnecessary re-renders
    if (JSON.stringify(schedule) !== JSON.stringify(wateringSchedule)) {
      setWateringSchedule(schedule);
    }
  }, [layout, wateringHistory, getWateringInterval, MemoizedColorMap]); // Dependencies for watering calendar generation

  const generateWateringInsights = useCallback(() => {
    if (!layout || !weatherData || !weatherData.forecast) {
      setWateringInsights(['No insights available due to missing data.']);
      return;
    }

    const recommendations: string[] = [];
    const today = new Date().toISOString().split('T')[0];
    const todayForecast = weatherData.forecast?.find((day) => day.date === today);
    const plantList: { [key: string]: boolean } = {};
    layout.grid.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.plantName) {
          plantList[cell.plantName] = true;
          const { isCompanion, shouldAvoid } = getBorderStyle(rowIndex, colIndex, cell.plantName);
          if (isCompanion) {
            recommendations.push(
              `Great pairing: ${cell.plantName} benefits from nearby companions. 🌿`
            );
          }
          if (shouldAvoid) {
            recommendations.push(
              `Warning: ${cell.plantName} is near incompatible plants, consider relocating. ⚠️`
            );
          }
        }
      });
    });

    const plantsNeedingWater: string[] = [];
    const todaySchedule = wateringSchedule[today];
    const colorMap = MemoizedColorMap; // Use the memoized color map

    if (todaySchedule && todaySchedule.marked) {
      Object.keys(plantList).forEach((plantName) => {
        const needsWater = todaySchedule.dots.some(
          (dot) => dot.color === colorMap[plantName]
        );
        if (needsWater) plantsNeedingWater.push(plantName);
      });
    }

    if (plantsNeedingWater.length > 0) {
      plantsNeedingWater.forEach((plantName) => {
        const plant = plants.find((v) => v.name === plantName);
        if (!plant) return;
        if (todayForecast && todayForecast.maxTemp > 32) {
          recommendations.push(
            `${plant.name} needs watering today. High temperature (${todayForecast.maxTemp}°C) requires extra moisture. 🌞`
          );
        } else if (weatherData.humidity && weatherData.humidity > 70) {
          recommendations.push(
            `Consider watering ${plant.name} lightly today. High humidity (${weatherData.humidity}%) reduces evaporation. 🌧️`
          );
        } else if (weatherData.windSpeed && weatherData.windSpeed > 20) {
          recommendations.push(
            `${plant.name} may dry out quickly due to high winds (${weatherData.windSpeed} kph). Water thoroughly. 💨`
          );
        } else {
          recommendations.push(`${plant.name} needs watering today. 🌱`);
        }
        if (plant.pestSusceptibility && weatherData.humidity > 80) {
          recommendations.push(
            `${plant.name} at risk of ${plant.pestSusceptibility.join(', ')} due to high humidity. Inspect regularly. 🐞`
          );
        }
      });
    } else {
      recommendations.push('No plants need watering today according to the schedule. 👍');
    }

    if (todayForecast && todayForecast.maxTemp > 35) {
      recommendations.push(
        `Garden Alert: Extreme heat (${todayForecast.maxTemp}°C) today. Water all plants deeply in the early morning or evening. 🔥`
      );
    } else if (weatherData.humidity && weatherData.humidity > 80) {
      recommendations.push(
        `Garden Tip: High humidity (${weatherData.humidity}%) today. Monitor for fungal diseases and reduce watering frequency. 🌧️`
      );
    } else if (weatherData.uvIndex && weatherData.uvIndex > 7) {
      recommendations.push(
        `Garden Caution: High UV index (${weatherData.uvIndex}) today. Water early morning or late evening to prevent leaf burn. ☀️`
      );
    }
    setWateringInsights(recommendations);
  }, [layout, weatherData, wateringSchedule, getBorderStyle, MemoizedColorMap]); // Dependencies for insights generation

  const updateWateringHistory = useCallback(async (plantName: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/watering-history`, {
        layoutId: id,
        plantName,
        date: today,
      });
      fetchWateringHistory(); // Re-fetch history to update the calendar
    } catch (error) {
      console.error('Error logging watering:', error);
      Alert.alert('Error', 'Failed to log watering.');
    }
  }, [id, fetchWateringHistory]); // Depends on id and fetchWateringHistory

  const logWatering = useCallback((plantName: string) => {
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
  }, [waterLevels, updateWateringHistory]); // Depends on waterLevels and updateWateringHistory

  const logHarvest = useCallback(async (plantName: string) => {
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/harvest-history`, {
        layoutId: id,
        plantName,
        date: new Date().toISOString().split('T')[0],
      });
      Alert.alert('Success', `${plantName} harvest logged!`);
    } catch (error) {
      console.error('Error logging harvest:', error);
      Alert.alert('Error', 'Failed to log harvest.');
    }
  }, [id]);

  const exportLayoutReport = useCallback(async () => {
    if (!layout) return;
    const plantList: string[] = [];
    layout.grid.rows.forEach((row) =>
      row.forEach((cell) => {
        if (cell.plantName && !plantList.includes(cell.plantName)) plantList.push(cell.plantName);
      })
    );
    const html = `
      <h1>${layout.name || 'My Garden Layout'}</h1>
      <p>Created: ${new Date(layout.createdAt).toLocaleDateString()}</p>
      <h2>Plants</h2>
      <ul>${plantList.map((p) => `<li>${p}</li>`).join('')}</ul>
      <h2>Watering Schedule</h2>
      <ul>${Object.keys(wateringSchedule)
        .map(
          (date) =>
            `<li>${date}: ${wateringSchedule[date].dots
              .map((dot) => Object.keys(MemoizedColorMap).find((key) => MemoizedColorMap[key] === dot.color))
              .join(', ')}</li>`
        )
        .join('')}</ul>
      <h2>Insights</h2>
      <ul>${wateringInsights.map((insight) => `<li>${insight}</li>`).join('')}</ul>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Garden Report' });
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report.');
    }
  }, [layout, wateringSchedule, wateringInsights, MemoizedColorMap]); // Dependencies for report export

  const renderGrid = useCallback(() => {
    if (!layout) return null;
    const { grid, width, height } = layout;
    const maxCells = 20;
    const cellSize = Math.min(
      BASE_CELL_SIZE,
      (Dimensions.get('window').width - 32) / Math.min(width, maxCells),
      (Dimensions.get('window').height / 4) / Math.min(height, maxCells)
    );

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', delay: 300 }}
      >
        {grid.rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-center">
            {row.map((cell, colIndex) => {
              const plant = plants.find((v) => v.name === cell.plantName);
              const { isCompanion, shouldAvoid } = getBorderStyle(rowIndex, colIndex, cell.plantName);
              return (
                <TouchableOpacity
                  key={colIndex}
                  onPress={() => showTooltip(rowIndex, colIndex, plant?.name || 'Empty')}
                  className={`border-2 ${
                    isCompanion ? 'border-green-400' : shouldAvoid ? 'border-red-400' : 'border-gray-300'
                  } bg-white justify-center items-center rounded-md m-0.5`}
                  style={{ width: cellSize, height: cellSize }}
                  activeOpacity={0.8}
                >
                  {cell.plantName && plant?.image && (
                    <Image source={plant.image} className="w-4/5 h-4/5" resizeMode="contain" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </MotiView>
    );
  }, [layout, getBorderStyle, showTooltip]); // Dependencies for renderGrid

  const renderColorLegend = useCallback(() => {
    const colorMap = MemoizedColorMap; // Use the memoized color map
    return (
      <View className="flex-row flex-wrap justify-start">
        {Object.entries(colorMap).map(([plantName, color]) => (
          <View key={plantName} className="flex-row items-center mr-3 mb-2">
            <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }} />
            <Text className="text-xs text-gray-600">{plantName}</Text>
          </View>
        ))}
      </View>
    );
  }, [MemoizedColorMap]); // Depends on the memoized color map

  const renderPlantCards = useCallback(() => {
  if (!layout) return null;
  const plantListArray: Plant[] = []; // Changed to store plant objects
  const seenPlantNames: { [key: string]: boolean } = {};

  layout.grid.rows.forEach((row) => {
    row.forEach((cell) => {
      if (cell.plantName && !seenPlantNames[cell.plantName]) {
        const plant = plants.find((v) => v.name === cell.plantName);
        if (plant) {
          plantListArray.push(plant);
          seenPlantNames[cell.plantName] = true;
        }
      }
    });
  });

  // Instead of returning the JSX directly, return the array of plant objects
  return plantListArray;
}, [layout]); // Dependencies remain the same as the data source hasn't changed.

  return (
    <LinearGradient colors={['#D1FAE5', '#F0FFF4']} className="flex-1" style={{ paddingTop: insets.top }}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" className="mt-10" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 100 }}
            className="my-4"
          >
            <Text className="mx-auto text-3xl font-bold text-green-800">
              {layout?.name || 'My Garden Layout'}
            </Text>
            <Text className="mx-auto text-sm text-gray-500 font-bold mt-2">
              Created: {layout?.createdAt ? new Date(layout.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 200 }}
            className="my-4"
          >
            {weather && address ? (
              <WeatherBanner
                weather={weather}
                address={address}
                style={{
                  backgroundColor: '#E6F3FA',
                  borderRadius: 12,
                  padding: 16,
                }}
              />
            ) : error ? (
              <Text className="text-red-500 text-center">Weather data unavailable</Text>
            ) : (
              <View className="h-24 justify-center items-center bg-gray-100 rounded-lg">
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text className="text-gray-600 mt-2">Loading weather...</Text>
              </View>
            )}
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 300 }}
            className="my-4 bg-white p-5 rounded-2xl shadow-md"
          >
            <Text className="text-xl font-bold text-green-800 mb-3">Garden Layout</Text>
            {renderGrid()}
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 400 }}
            className="mt-6 bg-white p-5 rounded-2xl shadow-md"
          >
            <Text className="text-xl font-bold text-green-800 mb-3">Watering Schedule</Text>
            <Calendar
              style={{
                borderRadius: 12,
                backgroundColor: '#F9FAFB',
              }}
              theme={{
                backgroundColor: '#F9FAFB',
                calendarBackground: '#F9FAFB',
                textSectionTitleColor: '#16A34A',
                selectedDayBackgroundColor: '#16A34A',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#16A34A',
                dayTextColor: '#1F2937',
                dotColor: '#16A34A',
                selectedDotColor: '#FFFFFF',
                textDayFontWeight: '500',
              }}
              markedDates={Object.keys(wateringSchedule).reduce(
                (acc: { [key: string]: { dots: { color: string }[]; marked: boolean } }, date) => {
                  acc[date] = {
                    dots: wateringSchedule[date].dots,
                    marked: wateringSchedule[date].marked,
                  };
                  return acc;
                },
                {}
              )}
              markingType={'multi-dot'}
            />
            <View className="mt-3 bg-gray-100 p-3 rounded-lg">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Legend</Text>
              {renderColorLegend()}
              <View className="flex-row items-center justify-center mt-2">
                <View className="bg-black w-3 h-3 rounded-full mr-1" />
                <Text className="text-xs text-gray-600">Today</Text>
              </View>
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 500 }}
            className="mt-6 bg-white p-5 rounded-2xl shadow-md"
          >
            <Text className="text-xl font-bold text-green-800 mb-3">Watering Recommendations</Text>
            {wateringInsights.length > 0 ? (
              wateringInsights.map((insight, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center bg-gray-50 p-3 rounded-lg mb-2"
                  activeOpacity={0.9}
                >
                  <MaterialCommunityIcons
                    name={insight.includes('water') ? 'water' : insight.includes('heat') ? 'weather-sunny' : 'leaf'}
                    size={20}
                    color="#16A34A"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-sm text-gray-700 flex-1">{insight}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-sm text-gray-500 italic">Generate insights to see recommendations.</Text>
            )}
            <CustomButton
              title="Generate Insights"
              bgVariant="plant"
              onPress={generateWateringInsights}
              className="mt-4 py-3 rounded-xl"
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 700 }}
            className="mt-6"
          >
            <Text className="text-xl font-bold text-green-800 mb-3">My Plants</Text>
            {/* --- START CHANGES HERE --- */}
            <FlatList
              data={renderPlantCards()} // Pass the array of plant objects
              horizontal // Enable horizontal scrolling
              showsHorizontalScrollIndicator={false} // Hide the scroll indicator
              keyExtractor={(item) => item.name} // Unique key for each plant card
              contentContainerStyle={{ paddingRight: 16 }} // Add some padding to the end
              renderItem={({ item: plant, index }) => { // item is now a plant object
                const history = wateringHistory.find((h) => h.plantName === plant.name);
                const plantingDate = history?.wateringDates[0];
                const daysSincePlanted = plantingDate
                  ? Math.floor((Date.now() - new Date(plantingDate).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                const growthStage = getGrowthStage(plant.name, daysSincePlanted);
                const harvestDate = plantingDate
                  ? new Date(new Date(plantingDate).setDate(new Date(plantingDate).getDate() + (plant.daysToHarvest || 60)))
                  : null;

                return (
                  <MotiView
                    key={plant.name} // Use plant.name for key here, as FlatList needs it
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', delay: 100 * (index + 6) }}
                    className="bg-white p-4 rounded-2xl mb-4"
                    // Add width for each card so they don't take up full screen
                    style={{ width: Dimensions.get('window').width * 0.8, marginRight: 16 }} // Adjust width and margin as needed
                  >
                    <View className="flex-row items-center mb-3">
                      <Image source={plant.image} className="w-16 h-16 rounded-full mr-3" resizeMode="contain" />
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-green-800">{plant.name}</Text>
                        <Text className="text-sm text-gray-500">
                          Stage: {growthStage} {growthStage === 'Seedling' ? '🌱' : growthStage === 'Flowering' ? '🌸' : '🍅'}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-sm text-gray-600">
                        Water every {getWateringInterval(plant.name)} days
                      </Text>
                      {harvestDate && (
                        <Text className="text-sm text-gray-600">
                          Harvest: {harvestDate.toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View className="bg-gray-100 rounded-full h-3 overflow-hidden mb-3">
                      <Animated.View
                        className="bg-blue-400 h-3 rounded-full"
                        style={{
                          width: waterLevels[plant.name]?.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          }),
                        }}
                      />
                    </View>
                    <View className="flex-row justify-between">
                      <CustomButton
                        title="Log Watering"
                        bgVariant="plant"
                        onPress={() => logWatering(plant.name)}
                        className="flex-1 mr-2 py-2 rounded-lg"
                      />
                      <CustomButton
                        title="Log Harvest"
                        bgVariant="secondary"
                        onPress={() => logHarvest(plant.name)}
                        className="flex-1 ml-2 py-2 rounded-lg"
                      />
                    </View>
                  </MotiView>
                    );
                  }}
                />
                {/* --- END CHANGES HERE --- */}
              </MotiView>

          <CustomButton
            title="Export Garden Report"
            bgVariant="plant"
            onPress={exportLayoutReport}
            className="mt-6 py-3 rounded-xl"
          />
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg"
        style={{ marginTop: insets.top }}
      >
        <Ionicons name="arrow-back" size={24} color="#16A34A" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default LayoutDetail;