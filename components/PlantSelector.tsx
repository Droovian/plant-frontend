import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';

interface Plant {
  id: string;
  name: string;
  image: string;
}

interface PlantSelectorProps {
  plants: Plant[];
  selectedPlant: Plant | null;
  onSelectPlant: (plant: Plant) => void;
}

export default function PlantSelector({ plants, selectedPlant, onSelectPlant }: PlantSelectorProps) {
  return (
    <View className="space-y-4">
      <Text className="text-xl font-semibold text-[#2D3B2D]">Select Plant</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="flex"
      >
        {plants.map((plant) => (
          <TouchableOpacity
            key={plant.id}
            className={`items-center ${selectedPlant?.id === plant.id ? 'opacity-100' : 'opacity-70'}`}
            onPress={() => onSelectPlant(plant)}
          >
            <View className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
              selectedPlant?.id === plant.id ? 'border-[#2D3B2D]' : 'border-[#4A5D4A]'
            }`}>
              <Image 
                source={{ uri: plant.image }} 
                className="w-full h-full" 
                resizeMode="cover"
              />
            </View>
            <Text className="mt-2 text-center text-sm font-medium text-[#2D3B2D]">
              {plant.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

