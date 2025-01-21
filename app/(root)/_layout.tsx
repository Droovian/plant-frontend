import { Stack } from "expo-router";

const Layout = () => {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="garden" options={{ headerShown: true, headerTitle: ""}} />
        </Stack>
    );
}

export default Layout;