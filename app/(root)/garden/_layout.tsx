import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="planner" options={{ headerShown: true, headerTitle: "Garden Planner" }} />
      <Stack.Screen name="plant/[plantId]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;