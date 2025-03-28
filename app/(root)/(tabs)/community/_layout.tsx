import { Stack } from "expo-router";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function CommunityLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Community Feed",
          headerShown: false, 
        }}
      />

    <Stack.Screen
        name="post/[id]"
        options={{
          title: "Post Detail",
          headerShown: false, 
        }}
        />
     
      <Stack.Screen
        name="create"
        options={{
          title: "Create Post",
          headerShown: true, 
        }}
      />
    </Stack>
  );
}
