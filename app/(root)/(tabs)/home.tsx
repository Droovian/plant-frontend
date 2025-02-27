import React, { useEffect, useState } from "react"
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo"
import { Link, router } from "expo-router"
import { Text, View, TouchableOpacity, ScrollView, Image, Modal, Animated } from "react-native"
import { useAuth } from "@clerk/clerk-expo"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import PlantSelectionScreen from "@/components/PlantSelectionSplash"
import LayoutImage from "@/assets/images/layout.png"
import { Crop } from "@/types/plant"

const HomePage = () => {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [showPlantModal, setShowPlantModal] = useState<boolean>(false)
  const [fadeAnim] = useState(new Animated.Value(0))
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    const checkPlantSelection = async () => {
      const storedPlants = await AsyncStorage.getItem("selectedPlants")
      if (!storedPlants) {
        setShowPlantModal(true)
      }
    }
    checkPlantSelection()
  }, [])

  const handlePlantSelectionComplete = async (selectedPlants: Crop[]) => {
    await AsyncStorage.setItem("selectedPlants", JSON.stringify(selectedPlants))
    setShowPlantModal(false)
  }

  const handleSignOut = () => {
    signOut()
    router.replace("/(auth)/sign-in")
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <ScrollView className="flex-1 px-4 pt-4">
        <SignedIn>
          <Animated.View style={{ opacity: fadeAnim }} className="mb-6">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg text-gray-600 mb-1">{getGreeting()},</Text>
                <Text className="text-2xl font-bold text-gray-800">{user?.username || user?.firstName}</Text>
                <Text className="text-sm text-gray-500 mt-1">Let's grow something amazing today!</Text>
              </View>
              <TouchableOpacity 
                onPress={handleSignOut}
                className="bg-white p-3 rounded-full shadow-sm"
              >
                <Ionicons name="log-out-outline" size={24} color="#5B8E55" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <TouchableOpacity 
            className="relative overflow-hidden rounded-xl mb-8 shadow-lg" 
            onPress={() => router.push("/(root)/garden")}
          >
            <Image 
              source={LayoutImage} 
              className="w-full h-80 rounded-xl"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/30 p-6 flex justify-end">
              <Text className="text-white text-4xl font-bold mb-2">
                Plant Repository
              </Text>
              <Text className="text-white text-xl opacity-90">
                Get detailed information in seconds
              </Text>
            </View>
          </TouchableOpacity>

          <Text className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</Text>

          <View className="flex-row flex-wrap justify-between mb-8">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </View>

          <Text className="text-xl font-semibold mb-4 text-gray-800">Explore Features</Text>

          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </SignedIn>

        <SignedOut>
          <View className="flex-1 items-center justify-center py-20">
            <Image 
              source={LayoutImage} 
              className="w-48 h-48 mb-8 rounded-full"
              resizeMode="cover"
            />
            <Text className="text-3xl font-bold mb-2 text-gray-800">Welcome to PlantPal</Text>
            <Text className="text-gray-600 mb-8 text-center px-6">
              Your personal gardening companion for growing success
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="bg-green-600 py-3 px-8 rounded-full mb-4 w-64">
                <Text className="text-white font-semibold text-center text-lg">Sign In</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity className="bg-white border-2 border-green-600 py-3 px-8 rounded-full w-64">
                <Text className="text-green-600 font-semibold text-center text-lg">Create Account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SignedOut>
      </ScrollView>

      <Modal visible={showPlantModal} animationType="slide">
        <PlantSelectionScreen onComplete={handlePlantSelectionComplete} />
      </Modal>
    </SafeAreaView>
  )
}

const QuickActionCard = ({ icon, title, onPress }: any) => (
  <TouchableOpacity 
    className="bg-white w-[48%] rounded-xl p-4 shadow-sm mb-4 items-center" 
    onPress={onPress}
  >
    <View className="bg-green-100 rounded-full p-3 mb-2">
      <Ionicons name={icon} size={24} color="#5B8E55" />
    </View>
    <Text className="text-gray-800 font-medium text-center">{title}</Text>
  </TouchableOpacity>
)

const FeatureCard = ({ icon, title, description, onPress }: any) => (
  <TouchableOpacity 
    className="bg-white rounded-xl p-4 shadow-sm mb-4 flex-row items-center border border-gray-100" 
    onPress={onPress}
  >
    <View className="bg-green-100 rounded-full p-3 mr-4">
      <Ionicons name={icon} size={24} color="#5B8E55" />
    </View>
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-800">{title}</Text>
      <Text className="text-sm text-gray-600">{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#5B8E55" />
  </TouchableOpacity>
)

const quickActions = [
  {
    icon: "clipboard-outline",
    title: "My Layouts",
    onPress: () => { router.push("/my-layouts") },
  },
  {
    icon: "sunny-outline",
    title: "Light Meter",
    onPress: () => {},
  },
  {
    icon: "calendar-outline",
    title: "Plant Calendar",
    onPress: () => {},
  },
  {
    icon: "leaf-outline",
    title: "My Plants",
    onPress: () => {},
  },
]

const features = [
  {
    icon: "leaf-outline",
    title: "Virtual Garden Planner",
    description: "Design and visualize your dream garden layout",
    onPress: () => router.push("/(root)/garden/planner"),
  },
  {
    icon: "bug-outline",
    title: "Pest & Disease Detection",
    description: "Identify and treat garden problems instantly",
    onPress: () => {},
  },
  {
    icon: "flask-outline",
    title: "Smart Fertilizer Calculator",
    description: "Get customized fertilizer recommendations",
    onPress: () => router.push("/(root)/fertilizer"),
  },
  {
    icon: "people-outline",
    title: "Gardening Community",
    description: "Connect and share with fellow plant enthusiasts",
    onPress: () => {},
  },
]

export default HomePage