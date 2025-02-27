import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const Layout = () => {
  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="planner" options={{ headerShown: false }} />
        <Stack.Screen name="plant/[plantId]" options={{ headerShown: false }} />
        <Stack.Screen name="builder" options={{ headerShown: false }} />
      </Stack>
  );
};

export default Layout;