import { Stack } from "expo-router";

const Layout = () => {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="garden" options=
            {
                { headerShown: false,
                  headerTitle: "",
                  headerBackTitle: "Go Back",
                }
            } 
            />
            <Stack.Screen name="fertilizer" options={{ headerShown: false }} />
        </Stack>
    );
}

export default Layout;