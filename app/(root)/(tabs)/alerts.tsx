import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, Pressable, Alert as RNAlert, Platform } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

interface Alert {
  _id: string;
  imageUrl: string;
  nameOfAnimal: string;
  token: string;
  title: string;
  body: string;
  timestamp?: string;
}

const AlertsComponent = () => {
  const { user } = useUser();
  const id = user?.id;
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_KEY}/api/notification?id=${id}`);
        const data = await response.json();
        setAlerts(data);
        console.log('Fetched alerts:', data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, [id]);

  const dismissAlert = (alertId: string) => {
    RNAlert.alert(
      'Dismiss Alert',
      'Are you sure you want to dismiss this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          onPress: () => {
            setAlerts(alerts.filter((alert) => alert._id !== alertId));
            // Optionally, send backend request to mark as dismissed
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return '';

  try {
    const date = parseISO(timestamp); // Parse ISO string to Date object
    const now = new Date();

    // Calculate time difference in minutes
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    // Show relative time for recent alerts (within 7 days)
    if (diffMinutes < 7 * 24 * 60) {
      return formatDistanceToNow(date, { addSuffix: true }); // e.g., "2 hours ago"
    }

    // Show absolute time for older alerts
    return format(date, 'MMM d, yyyy, h:mm a'); // e.g., "May 20, 2025, 5:14 AM"
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
};

  const AlertCard = ({ alert }: { alert: Alert }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} className="mb-4">
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={() => dismissAlert(alert._id)}
        >
          <Animated.View
            style={[animatedStyle]}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle-outline" size={20} color="#FF0000" className="mr-2" />
                  {/* <Text className="text-lg font-bold text-[#285430]">{alert.title}</Text> */}
                </View>
                <Text className="text-xs text-gray-500 mr-10">{formatTimestamp(alert.timestamp)}</Text>
              </View>

              {alert.imageUrl && (
                <Image
                  source={{ uri: alert.imageUrl }}
                  className="w-full h-40 rounded-lg mb-3"
                  resizeMode="cover"
                />
              )}

              <Text className="text-base text-[#285430] mb-3">{alert.body}</Text>

              {alert.nameOfAnimal && (
                <View className="flex-row items-center">
                  <View className="bg-[#E5D9B6] rounded-full px-3 py-1">
                    <Text className="text-xs text-[#285430] font-medium">{alert.nameOfAnimal}</Text>
                  </View>
                </View>
              )}

              <Pressable
                onPress={() => dismissAlert(alert._id)}
                className="absolute top-2 right-2 p-2"
              >
                <Ionicons name="close-circle-outline" size={24} color="#285430" />
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <View className="px-4 py-6">
        <Text className="text-3xl font-bold text-[#285430] mb-6">Garden Alerts</Text>
      </View>
      <ScrollView className="flex-1 px-4">
        {alerts.length === 0 ? (
          <Animated.View
            entering={FadeIn}
            className="bg-white rounded-2xl p-8 items-center justify-center shadow-lg border border-gray-100 mt-8"
          >
            <Ionicons name="leaf-outline" size={48} color="#A4BE7B" className="mb-4" />
            <Text className="text-lg font-semibold text-[#285430] text-center">
              All clear! No new alerts.
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
              Your garden is thriving.
            </Text>
          </Animated.View>
        ) : (
          <View className="pb-6">
            {alerts.map((alert) => (
              <AlertCard key={alert._id} alert={alert} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
export default AlertsComponent;