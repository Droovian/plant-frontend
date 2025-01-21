import { StyleSheet, Text, View, ActivityIndicator, ScrollView, Image, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useLocationStore from '@/store'
import WeatherBanner from '@/components/WeatherBanner'
import { Ionicons } from "@expo/vector-icons"

const Garden = () => {
  const { location, address, errorMsg, addressErrorMsg, getLocation, getAddress } = useLocationStore();
  const insets = useSafeAreaInsets()
  const weatherApiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY!;
  const [weather, setWeatherForecast] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  
  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${address?.city}&days=3`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      setWeatherForecast(data);
    } catch (error) {
      console.error('Error fetching weather');
      setWeatherForecast(null);
    }
    finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getLocation();
    await getAddress();
    await fetchWeather();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    (async () => {
      await getLocation();
      await getAddress();
      // console.log(location, address);
      if (location && address && address?.city) {
        await fetchWeather();
        
      }
    })();
  }, []);

  if (errorMsg) {
    return (
      <View className="flex-1 justify-center items-center bg-green-100" style={{ paddingTop: insets.top }}>
        <Ionicons name="warning-outline" size={48} color="#EF4444" />
        <Text className="text-red-500 mt-4 text-center px-4">{errorMsg}</Text>
      </View>
    );
  }

  if (addressErrorMsg) {
    return (
      <View className="flex-1 justify-center items-center bg-green-100" style={{ paddingTop: insets.top }}>
        <Ionicons name="warning-outline" size={48} color="#EF4444" />
        <Text className="text-red-500 mt-4 text-center px-4">{addressErrorMsg}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-green-50 p-5'>
      <ScrollView
        className='flex-1 px-4'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />}
      >
        <Text className="text-3xl font-bold text-green-800 mb-4">My Garden</Text>
        {weather && address && <WeatherBanner weather={weather} address={address} />}
        { loading && <ActivityIndicator size="large" color="#000000" />}
        <Text className="text-2xl font-semibold text-green-800 mb-4">Plants in Your Region</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Garden;
