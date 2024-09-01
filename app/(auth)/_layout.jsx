import { Stack } from "expo-router";

// Layout component for the (tabs) route
export default function Layout() {
    return (
        <Stack screenOptions={{contentStyle: { backgroundColor: "#1E1E1E" }}}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="trip" options={{ headerShown: false }}/>
            <Stack.Screen name="updateStep" options={{ headerShown: false }}/>
            <Stack.Screen name="step" options={{ headerShown: false }}/>
        </Stack>
    );
}