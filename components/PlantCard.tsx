import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface PlantCardProps {
  name: string;
  image: string;
  description: string;
  onPress: () => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ name, image, description, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-lg shadow-md overflow-hidden mb-4 mr-4 w-[calc(50%-8px)]">
      <Image source={{ uri: image }} className="w-full h-32" />
      <View className="p-3">
        <Text className="text-lg font-semibold mb-1">{name}</Text>
        <Text className="text-sm text-gray-600" numberOfLines={2}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default PlantCard;
