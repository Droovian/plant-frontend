import { create } from 'zustand';
import * as Location from 'expo-location';

type LocationStore = {
    location: Location.LocationObject | null;
    address: Location.LocationGeocodedAddress | null;
    errorMsg: string | null;
    addressErrorMsg: string | null;
    getLocation: () => Promise<void>;
    getAddress: () => Promise<void>;
}


type GardenState = {
  width: string;
  height: string;
  unit: string;
  squareArea: string;
  soilType: string;
  setGardenData: (key: keyof GardenState, value: string) => void;
};

export const useGardenStore = create<GardenState>((set) => ({
  width: "",
  height: "",
  unit: "feet",
  squareArea: "",
  soilType: "",
  setGardenData: (key, value) => set((state) => ({ ...state, [key]: value })),
}));


const useLocationStore = create<LocationStore>((set) => ({
    location: null,
    address: null,
    errorMsg: null,
    addressErrorMsg: null,
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
    }
}));


export default useLocationStore;