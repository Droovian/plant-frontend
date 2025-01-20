import React from "react"
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo"
import { Link, router } from "expo-router"
import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native"
import { useAuth } from "@clerk/clerk-expo"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

const FeatureCard = ({ icon, title, description, onPress }: any) => (
  <TouchableOpacity className="bg-white rounded-xl p-4 shadow-md mb-4 flex-row items-center" onPress={onPress}>
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

export default function HomePage() {
  const { user } = useUser()
  const { signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
    router.replace("/(auth)/sign-in")
  }

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <ScrollView className="flex-1 px-4 pt-4">
        <SignedIn>
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-800">Welcome back, {user?.username}</Text>
              <Text className="text-lg text-gray-600">{user?.firstName || user?.emailAddresses[0].emailAddress}</Text>
            </View>
            <TouchableOpacity onPress={handleSignOut} className="p-2">
              <Ionicons name="log-out-outline" size={24} color="#5B8E55" />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: "https://placeholder.svg?height=200&width=400" }}
            className="w-full h-40 rounded-xl mb-6"
          />

          <Text className="text-xl font-semibold mb-4 text-gray-800">Explore Features</Text>

          <FeatureCard
            icon="leaf-outline"
            title="Virtual Gardening"
            description="Design and plan your dream garden"
            onPress={() => router.push("/(root)/garden")}
          />

          <FeatureCard
            icon="bug-outline"
            title="Pest & Animal Detection"
            description="Identify and manage garden intruders"
            onPress={() => {}}
          />

          <FeatureCard
            icon="camera-outline"
            title="Disease Detection"
            description="Upload photos to diagnose plant issues"
            onPress={() => {}}
          />

          <FeatureCard
            icon="people-outline"
            title="Community"
            description="Connect with fellow gardeners"
            onPress={() => {}}
          />
        </SignedIn>
        <SignedOut>
          <View className="flex-1 items-center justify-center">
            <Text className="text-xl mb-4">Welcome to PlantPal</Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="bg-green-600 py-2 px-4 rounded-full mb-2">
                <Text className="text-white font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity className="bg-white border border-green-600 py-2 px-4 rounded-full">
                <Text className="text-green-600 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SignedOut>
      </ScrollView>
    </SafeAreaView>
  )
}

