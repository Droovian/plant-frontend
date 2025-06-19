import { create } from 'zustand';
import * as Location from 'expo-location';

type SoilType = 'Clay' | 'Sandy' | 'Silt' | 'Loam';

type LocationStore = {
    location: Location.LocationObject | null;
    address: Location.LocationGeocodedAddress | null;
    errorMsg: string | null;
    addressErrorMsg: string | null;
    weather: any | null; // Replace 'any' with a Weather type if possible
    weatherErrorMsg: string | null;
    getLocation: () => Promise<void>;
    getAddress: () => Promise<void>;
    getWeather: (city: string, apiKey: string) => Promise<void>;
}

interface GardenState {
  width: string;
  height: string;
  unit: 'feet' | 'meters';
  squareArea: string;
  soilType: SoilType;
  sunlightExposure: string;
  soilPH: string;
  soilNutrientLevel: string;
  plants: { id: string; x: number; y: number; name: string }[];
  setGardenData: (key: keyof Omit<GardenState, 'setGardenData' | 'addPlant'>, value: any) => void;
  addPlant: (plant: { id: string; x: number; y: number; name: string }) => void;
}
  
 export const useGardenStore = create<GardenState>((set) => ({
  width: '',
  height: '',
  unit: 'feet',
  squareArea: '',
  soilType: 'Loam' as SoilType,
  sunlightExposure: '',
  soilPH: '',
  soilNutrientLevel: '',
  plants: [],
  setGardenData: (key, value) => set({ [key]: value }),
  addPlant: (plant) => set((state) => ({ plants: [...state.plants, plant] })),
}));
  
const useLocationStore = create<LocationStore>((set) => ({
    location: null,
    address: null,
    errorMsg: null,
    addressErrorMsg: null,
    weather: null,
    weatherErrorMsg: null,
    getLocation: async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                set({ errorMsg: 'Permission to access location was denied' });
                return;
            }

            const currentLoc = await Location.getCurrentPositionAsync({});
            set({ location: currentLoc, errorMsg: null });
        } catch (error) {
            set({ errorMsg: 'An error occured while trying to fetch the location' });
        }
    },
    getAddress: async () => {
        try {
            const location = useLocationStore?.getState().location;

            if(!location){
                set({ addressErrorMsg: 'No location found' });
                return;
            }

            const userAddress = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            set({ address: userAddress[0], addressErrorMsg: null });
        }
        catch(error){
            set({ addressErrorMsg: 'An error occured while trying to fetch the address' });
        }
    },
    getWeather: async(city: string, apiKey: string) => {
        try {
        const response = await fetch(
            `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
            set({ weather: data, weatherErrorMsg: null });
        } catch (error) {
            set({ weatherErrorMsg: 'Failed to fetch weather data' });
        }
  },
}));

export default useLocationStore;