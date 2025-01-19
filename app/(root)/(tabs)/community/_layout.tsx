import { Stack } from "expo-router";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

export default function CommunityLayout() {
  return (
    <Stack>
      {/* Community Feed Screen */}
      <Stack.Screen
        name="index"
        options={{
          title: "Community Feed",
          headerShown: false, // Customize as needed
        }}
      />

    <Stack.Screen
        name="post/[id]"
        options={{
          title: "Post Detail",
          headerShown: true, // You can enable the header for stack screens
        }}
        />
      {/* Create Post Screen */}
      <Stack.Screen
        name="create"
        options={{
          title: "Create Post",
          headerShown: true, // You can enable the header for stack screens
        }}
      />
    </Stack>
  );
}
