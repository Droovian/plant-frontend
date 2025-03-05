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
import useWeather from '@/hooks/useWeather';
import WeatherBanner from '@/components/WeatherBanner';
import CustomButton from '@/components/Button';
const BASE_CELL_SIZE = Dimensions.get('window').width < 375 ? 40 : 48;

interface LayoutData {
  _id: string;
  grid: { rows: { plantName: string }[][] };
  width: number;
  height: number;
  createdAt: string;
}

interface WateringSchedule {
  [date: string]: { marked: boolean; dots: { color: string }[] };
}

interface WateringHistory {
  layoutId: string | string[]; // Add layoutId if needed.
  plantName: string;
  wateringDates: string[]; // Change 'dates' to 'wateringDates' and make it an array of strings.
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
  const { weather, address, error } = useWeather();
  
  const weatherData = weather ? {
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
  } : null;

  useEffect(() => {
    if (id && userId) {
      fetchLayout();
      fetchWateringHistory();
    }
  }, [id, userId]);

  useEffect(() => {
    if (layout) {
      initializeWaterLevels();
      generateWateringCalendar();
    }
  }, [layout, wateringHistory]);

  const fetchLayout = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_NODE_KEY}/api/layout/${id}`
      );
      setLayout(response.data);
    } catch (error) {
      console.error('Error fetching layout:', error);
      Alert.alert('Error', 'Failed to fetch layout.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWateringHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_NODE_KEY}/api/watering-history/layout/${id}`
      );
      setWateringHistory(response.data);
      generateWateringCalendar(); // Regenerate calendar after fetching
    } catch (error) {
      console.error('Error fetching watering history:', error);
    }
  };

  const initializeWaterLevels = () => {
    if (!layout) return;
    
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
  };


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
  }, [layout]);

  const generateWateringCalendar = useCallback(() => {
    if (!layout || !wateringHistory.length) return;
  
    const schedule: WateringSchedule = {};
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 30);
  
    const colorMap = generateColorMap();
  
    // Mark past watering dates
    wateringHistory.forEach((item) => {
      item.wateringDates.forEach((date) => {
        if (!schedule[date]) {
          schedule[date] = { marked: true, dots: [] };
        }
        schedule[date].dots.push({ color: colorMap[item.plantName] });
      });
    });
  
    // Calculate future watering dates
    const plantList: { [key: string]: boolean } = {};
    layout.grid.rows.forEach((row) => {
      row.forEach((cell) => {
        if (cell.plantName) {
          plantList[cell.plantName] = true;
        }
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
  
    // Mark today
    const todayString = today.toISOString().split('T')[0];
    if (!schedule[todayString]) {
      schedule[todayString] = { marked: true, dots: [] };
    }
    schedule[todayString].dots.push({ color: '#000000' }); // Red for today
  
    setWateringSchedule(schedule);
  }, [wateringHistory, layout, generateColorMap]);

  const generateWateringInsights = () => {
    if (!layout || !weatherData || !weatherData.forecast) {
      setWateringInsights(['No insights available due to missing data.']);
      return;
    }
  
    const recommendations: string[] = [];
    const today = new Date().toISOString().split('T')[0];
    const todayForecast = weatherData.forecast?.find((day) => day.date === today);
    
    // Plants that need watering today
    const plantsNeedingWater: string[] = [];
    
    // Check which plants need water today based on schedule
    const todaySchedule = wateringSchedule[today];
    if (todaySchedule && todaySchedule.marked) {
      const plantList: { [key: string]: boolean } = {};
      layout.grid.rows.forEach((row) => {
        row.forEach((cell) => {
          if (cell.plantName) {
            plantList[cell.plantName] = true;
          }
        });
      });
      
      Object.keys(plantList).forEach(plantName => {
        // Check if this plant has a watering date today
        const needsWater = Object.keys(wateringSchedule).includes(today) &&
                         wateringSchedule[today].marked;
        
        if (needsWater) {
          plantsNeedingWater.push(plantName);
        }
      });
    }
  
    // Generate insights for plants needing water
    if (plantsNeedingWater.length > 0) {
      plantsNeedingWater.forEach(plantName => {
        const plant = vegetables.find((v) => v.name === plantName);
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
      });
    } else {
      recommendations.push("No plants need watering today according to the schedule. 👍");
    }
  
    // General Garden Recommendations based on weather
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
  };

  const getWateringInterval = (plantName: string) => {
    switch (plantName) {
        case 'Okra': return 3;        // Moderate water needs
        case 'Tomato': return 3;      // Consistent moisture, every 3 days
        case 'Chilli': return 2;      // Frequent watering, every 2 days
        case 'Drumstick': return 7;   // Drought-tolerant once established, weekly
        case 'Pumpkin': return 3;     // High water needs due to large leaves
        case 'Breadfruit': return 7;  // Tree, weekly once established
        case 'Radish': return 1;      // Shallow roots, daily watering
        case 'Eggplant': return 3;    // Moderate water needs
        case 'Potato': return 3;      // Consistent moisture for tubers
        case 'Asparagus': return 3;   // Moderate water needs
        case 'Beet': return 2;        // Frequent watering for root development
        case 'Spinach': return 2;     // Cool-season, frequent shallow watering
        case 'Corn': return 3;        // High water needs during growth
        case 'Cucumber': return 2;    // High water needs, especially when fruiting
        case 'Onion': return 3;       // Moderate water needs
        case 'Cowpea': return 3;      // Moderate, drought-tolerant once established
        case 'Lettuce': return 2;     // Frequent shallow watering for leaves
        default: return 3;            // Default to moderate watering
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
      <View key={rowIndex} className="flex-row justify-center">
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
  
  const updateWateringHistory = async (plantName: string) => {
    const today = new Date().toISOString().split('T')[0];

    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_NODE_KEY}/api/watering-history`,
        {
          layoutId: id,
          plantName: plantName,
          date: today,
        }
      );
      fetchWateringHistory(); // Refresh data and calendar
    } catch (error) {
      console.error('Error logging watering:', error);
      Alert.alert('Error', 'Failed to log watering.');
    }
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
            <Animated.View className="bg-blue-500 h-4 rounded-full" style={{ 
              width: waterLevels[plantName]?.interpolate({ 
                inputRange: [0, 100], 
                outputRange: ['0%', '100%'] 
              }) 
            }} />
          </View>
          <TouchableOpacity 
            onPress={() => logWatering(plantName)} 
            className="mt-2 bg-blue-500 p-2 rounded-md items-center"
          >
            <Text className="text-white font-medium">Log Watering</Text>
          </TouchableOpacity>
        </MotiView>
      );
    });
  }, [layout, waterLevels, wateringHistory]);


  const renderColorLegend = useCallback(() => {
    const colorMap = generateColorMap();

    return (
      <View className="flex-row flex-wrap mt-2 justify-around">
        {Object.entries(colorMap).map(([plantName, color]) => (
          <View key={plantName} className="flex-row items-center m-1">
            <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }} />
            <Text className="text-xs text-gray-600">{plantName}</Text>
          </View>
        ))}
      </View>
    );
  }, [generateColorMap]);

  return (
    <SafeAreaView className="flex-1 bg-green-50" style={{ paddingTop: insets.top }}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" className="mt-10" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text className="text-2xl font-semibold text-gray-800 my-3">Your Garden!</Text>
          
          {(weather && address) ? (
            <WeatherBanner weather={weather} address={address} />
          ) : (
            <Text>Loading weather data...</Text>
          )}
          
          <View className="my-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Garden Layout:</Text>
            <View className="bg-white p-3 rounded-lg shadow-sm">
              {renderGrid()}
            </View>
          </View>
          
          <View className="mt-4 bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Watering Schedule:</Text>
            <Calendar
              style={{
                borderRadius: 10,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#16a34a',
                selectedDayBackgroundColor: '#16a34a',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#16a34a',
                dayTextColor: '#2d4150',
                dotColor: '#16a34a',
                selectedDotColor: '#ffffff',
              }}
              markedDates={Object.keys(wateringSchedule).reduce(
                (acc: { [key: string]: { dots: { color: string }[]; marked: boolean } }, date) => { // Explicitly type acc
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
            {renderColorLegend()}
            <View className='flex flex-row justify-center mt-2'>
              <View className="bg-black w-3 h-3 rounded-full mr-1" />
              <Text className='text-xs text-gray-600 text-center'>Today</Text>
            </View>
          </View>
          
          <View className="mt-4 bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Watering Recommendations:</Text>
            {wateringInsights.length > 0 ? (
              wateringInsights.map((insight, index) => (
                <View key={index} className="flex-row mb-2 items-start">
                  <View className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-2" />
                  <Text className="text-sm text-gray-600 flex-1">{insight}</Text>
                </View>
              ))
            ) : (
              <Text className="text-sm text-gray-600 mb-1">
                No recommendations available yet. Generate insights to see watering recommendations.
              </Text>
            )}
            <CustomButton
              title="Generate Watering Insights"
              bgVariant='plant'
              onPress={generateWateringInsights} 
              style={{ marginTop: 10 }}
            />
          </View>
          
          <View className="mt-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">My Plants:</Text>
            {renderPlantCards()}
          </View>
          
          <View className="h-16" />
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