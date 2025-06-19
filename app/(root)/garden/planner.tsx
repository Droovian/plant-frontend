import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  type TextInputProps,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useGardenStore } from '@/store';
import CustomButton from '@/components/Button';

const Planner = () => {
  const {
    width,
    height,
    unit,
    squareArea,
    soilType,
    sunlightExposure,
    soilPH,
    soilNutrientLevel,
    setGardenData,
  } = useGardenStore();
  const insets = useSafeAreaInsets();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auto-calculate square area
  useEffect(() => {
    if (width && height && !isNaN(Number(width)) && !isNaN(Number(height))) {
      const area = Number(width) * Number(height);
      setGardenData('squareArea', `${area} sq ${unit}`);
    } else {
      setGardenData('squareArea', '');
    }
  }, [width, height, unit, setGardenData]);

  // Validate inputs before proceeding
  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};
    if (!width || isNaN(Number(width)) || Number(width) <= 0) {
      newErrors.width = 'Enter a valid width (> 0)';
    }
    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      newErrors.height = 'Enter a valid height (> 0)';
    }
    if (!unit) {
      newErrors.unit = 'Select a unit';
    }
    if (!soilType) {
      newErrors.soilType = 'Select a soil type';
    }
    if (!sunlightExposure) {
      newErrors.sunlightExposure = 'Select sunlight exposure';
    }
    if (soilPH && (isNaN(Number(soilPH)) || Number(soilPH) < 0 || Number(soilPH) > 14)) {
      newErrors.soilPH = 'Enter a valid pH (0-14)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = () => {
    if (validateInputs()) {
      router.push('/(root)/garden/builder');
    } else {
      Alert.alert('Invalid Input', 'Please fix the errors before proceeding.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <Animated.View entering={FadeIn} className="p-6">
          <Text className="text-green-900 font-bold text-3xl text-center">Plan Your Garden</Text>
          <Text className="text-green-700 text-center mt-2 text-sm">
            Enter details to design your perfect garden
          </Text>
        </Animated.View>

        <View className="px-6 mt-6">
          <InputGroup
            label="Garden Dimensions"
            placeholder="Width"
            value={width}
            onChangeText={(text) => setGardenData('width', text)}
            keyboardType="numeric"
            error={errors.width}
            icon="ruler"
            secondaryInput={{
              placeholder: 'Height',
              value: height,
              onChangeText: (text) => setGardenData('height', text),
              error: errors.height,
            }}
          />
          <View className="flex-row justify-center mt-3 space-x-4">
            <UnitButton
              title="Feet"
              isSelected={unit === 'feet'}
              onPress={() => setGardenData('unit', 'feet')}
              error={errors.unit}
            />
            <UnitButton
              title="Meters"
              isSelected={unit === 'meters'}
              onPress={() => setGardenData('unit', 'meters')}
              error={errors.unit}
            />
          </View>

          <InputGroup
            label="Square Area"
            value={squareArea}
            editable={false}
            placeholder="Calculated automatically"
            icon="area-chart"
          />

          <SelectGroup
            label="Sunlight Exposure"
            value={sunlightExposure}
            onValueChange={(value) => setGardenData('sunlightExposure', value)}
            options={[
              { label: 'Full Sun', value: 'Full Sun' },
              { label: 'Partial Shade', value: 'Partial Shade' },
              { label: 'Full Shade', value: 'Full Shade' },
              { label: 'Full Sun to Partial Shade', value: 'Full Sun to Partial Shade' },
              { label: 'Partial Shade to Full Sun', value: 'Partial Shade to Full Sun' },
            ]}
            error={errors.sunlightExposure}
          />

          <InputGroup
            label="Soil pH Level (optional)"
            placeholder="e.g., 6.5"
            value={soilPH}
            onChangeText={(text) => setGardenData('soilPH', text)}
            keyboardType="numeric"
            error={errors.soilPH}
            icon="test-tube"
          />

          <SelectGroup
            label="Soil Nutrient Level (optional)"
            value={soilNutrientLevel || ''}
            onValueChange={(value) => setGardenData('soilNutrientLevel', value)}
            options={[
              { label: 'Low', value: 'Low' },
              { label: 'Moderate', value: 'Moderate' },
              { label: 'High', value: 'High' },
            ]}
          />

          <SelectGroup
            label="Soil Type"
            value={soilType}
            onValueChange={(value) => setGardenData('soilType', value)}
            options={[
              { label: 'Loamy', value: 'Loamy' },
              { label: 'Sandy Loam', value: 'Sandy Loam' },
              { label: 'Clay Loam', value: 'Clay Loam' },
            ]}
            error={errors.soilType}
          />

          <CustomButton
            title="Proceed to Layout"
            bgVariant="black"
            onPress={handleProceed}
            className="mt-8"
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg"
        style={{ marginTop: insets.top }}
        accessible
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={24} color="#15803d" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

interface InputGroupProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: string;
  secondaryInput?: {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
  };
}

const InputGroup = ({ label, error, icon, secondaryInput, ...props }: InputGroupProps) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => (scale.value = withSpring(0.98));
  const handlePressOut = () => (scale.value = withSpring(1));

  return (
    <View className="mb-6">
      <Text className="text-green-800 font-semibold text-lg mb-2">{label}</Text>
      <View className="flex-row items-center space-x-3">
        <Animated.View style={animatedStyle} className="flex-1">
          <View className="flex-row items-center bg-white border border-green-300 rounded-lg p-3">
            {icon && <Ionicons size={20} color="#15803d" className="mr-2" />}
            <TextInput
              className="flex-1 text-green-800"
              placeholderTextColor="#81C784"
              {...props}
              accessible
              accessibilityLabel={label}
            />
          </View>
          {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </Animated.View>
        {secondaryInput && (
          <>
            <Text className="text-green-800 font-bold text-2xl">×</Text>
            <Animated.View style={animatedStyle} className="flex-1">
              <View className="flex-row items-center bg-white border border-green-300 rounded-lg p-3">
                {icon && <Ionicons size={20} color="#15803d" className="mr-2" />}
                <TextInput
                  className="flex-1 text-green-800"
                  placeholderTextColor="#81C784"
                  {...secondaryInput}
                  keyboardType="numeric"
                  accessible
                  accessibilityLabel="Height"
                />
              </View>
              {secondaryInput.error && (
                <Text className="text-red-500 text-xs mt-1">{secondaryInput.error}</Text>
              )}
            </Animated.View>
          </>
        )}
      </View>
    </View>
  );
};

interface SelectGroupProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  error?: string;
}

const SelectGroup = ({ label, value, onValueChange, options, error }: SelectGroupProps) => (
  <View className="mb-6">
    <Text className="text-green-800 font-semibold text-lg mb-2">{label}</Text>
    <View className="flex-row flex-wrap -mx-1">
      {options.map((option) => {
        const scale = useSharedValue(1);
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }));

        return (
          <Animated.View key={option.value} style={animatedStyle}>
            <TouchableOpacity
              className={`m-1 px-4 py-2 rounded-full ${
                value === option.value ? 'bg-green-800' : 'bg-green-100'
              }`}
              onPress={() => onValueChange(option.value)}
              onPressIn={() => (scale.value = withSpring(0.98))}
              onPressOut={() => (scale.value = withSpring(1))}
              accessible
              accessibilityLabel={option.label}
            >
              <Text
                className={`text-sm font-medium ${
                  value === option.value ? 'text-white' : 'text-green-800'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
    {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
  </View>
);

interface UnitButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
  error?: string;
}

const UnitButton = ({ title, isSelected, onPress, error }: UnitButtonProps) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        className={`px-4 py-2 rounded-full ${isSelected ? 'bg-green-800' : 'bg-green-100'}`}
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98))}
        onPressOut={() => (scale.value = withSpring(1))}
        accessible
        accessibilityLabel={title}
      >
        <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-green-800'}`}>
          {title}
        </Text>
      </TouchableOpacity>
      {error && <Text className="text-red-500 text-xs mt-1 text-center">{error}</Text>}
    </Animated.View>
  );
};

export default Planner;