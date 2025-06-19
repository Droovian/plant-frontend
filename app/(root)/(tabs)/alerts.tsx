import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, Pressable, Alert as RNAlert } from 'react-native';
// import { AlertCircle, Bug, CheckCircle, Info, XCircle, Bell } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';

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
                console.log("Fetched alerts:", data);
            } catch (error) {
                console.error("Error fetching alerts:", error);
            }
        };

        fetchAlerts();
    }, [id]); // Add id to dependency array to refetch if user changes

    const dismissAlert = (alertId: string) => {
        RNAlert.alert(
            "Dismiss Alert",
            "Are you sure you want to dismiss this alert?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Dismiss",
                    onPress: () => {
                        setAlerts(alerts.filter(alert => alert._id !== alertId));
                        // Optionally, send a request to your backend to mark the alert as dismissed
                    }
                }
            ]
        );
    };

    const formatTimestamp = (timestamp?: string) => {
        if (!timestamp) return '';
        // Example: "2024-05-20 10:30:00 AM" -> "2024-05-20" "10:30:00 AM"
        const datePart = timestamp.split(' ')[0];
        const timePart = timestamp.split(' ')[1];
        const meridiem = timestamp.includes('PM') ? 'PM' : 'AM';
        
        // Basic example of relative time for demonstration, consider using a library like 'date-fns' for robust handling
        const alertDate = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));

        if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffMinutes < 24 * 60) {
            const hours = Math.floor(diffMinutes / 60);
            return `${hours}h ago`;
        } else {
            return `${datePart} ${timePart} ${meridiem}`;
        }
    };

    // const getAlertIcon = (alertType: string) => {
    //     switch (alertType) {
    //         case 'Critical': // Example type based on title or another property
    //             return <AlertCircle className="h-6 w-6 text-red-500" />;
    //         case 'Warning':
    //             return <Bug className="h-6 w-6 text-yellow-500" />;
    //         case 'Info':
    //         default:
    //             return <Info className="h-6 w-6 text-blue-500" />;
    //     }
    // };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-gray-100 px-4 py-4">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-2xl font-semibold text-gray-900 mb-1">Garden Alerts</Text>
                </View>

                {alerts.length === 0 ? (
                    <View className="bg-white rounded-xl p-8 items-center justify-center shadow-md border border-gray-200 mt-8">
                        {/* <CheckCircle className="h-12 w-12 text-green-400 mb-4" /> */}
                        <Text className="text-gray-600 text-lg font-medium text-center">All clear! No new alerts.</Text>
                        <Text className="text-gray-400 text-sm text-center mt-2">Your garden is thriving.</Text>
                    </View>
                ) : (
                    <View className="space-y-4">
                        {alerts.map((alert) => {
                          
                            return (
                                <Pressable
                                    key={alert._id}
                                    className={`bg-[#A4BE7B] rounded-xl overflow-hidden mb-5`}
                                >
                                    <View className="flex-row items-start p-4">
                                        
                                        <View className="flex-1 gap-3">
                                            <View className="flex-row items-center justify-between mb-1">
                                                <Text className={`font-bold text-lg text-[#285430]`}>
                                                    {alert.title}
                                                </Text>
                                                <Text className="text-xs text-gray-500">
                                                    {formatTimestamp(alert.timestamp)}
                                                </Text>
                                            </View>

                                            {alert.imageUrl && (
                                            <Image
                                                source={{ uri: alert.imageUrl }}
                                                className="w-full h-32 rounded-lg ml-3"
                                                resizeMode="cover"
                                            />
                                        )}

                                            <Text className={`text-md mb-2 font-light text-[#285430] italic`}>
                                                "{alert.body}"
                                            </Text>

                                            {alert.nameOfAnimal && (
                                                <View className="flex-row items-center mt-2">
                                                    <View className="bg-gray-200 rounded-full px-3 py-1">
                                                        <Text className="text-xs text-gray-700 font-medium">
                                                            {alert.nameOfAnimal}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default AlertsComponent;