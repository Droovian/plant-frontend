import { useState, useEffect } from "react"
import { LocationObject } from "expo-location"
import useLocationStore from "@/store";

interface WeatherData {
  current: {
    condition: { text: string; icon: string }
    temp_c: number
    wind_kph: number
    humidity: number
    uv: number
    cloud: number
  },
  dewpoint_c: number,
  gust_kph: number,
  heatindex_c: number,
  pressure_in: number,
  wind_kph: number,
  feelslike_c: number,
  forecast: {
    forecastday: Array<{
      date: string
      day: {
        condition: { text: string; icon: string }
        maxtemp_c: number
        mintemp_c: number
        totalprecip_in: number
        daily_will_it_rain: number
        daily_chance_of_rain: number
      }
    }>
  }
}

const useWeather = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const { location, address } = useLocationStore();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY!;
  
    useEffect(() => {
      if (!location || !address?.city) {
        setError("Location or address not available");
        setLoading(false);
        return;
      }
  
      const fetchWeather = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${address.city}&days=3`
          );
  
          if (!response.ok) {
            throw new Error("Failed to fetch weather data");
          }
  
          const data = await response.json();
          setWeather(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchWeather();
    }, [location, address?.city]); // Depend on both location and address.city
  
    return { weather, loading, error, address };
  };
  
  export default useWeather;
