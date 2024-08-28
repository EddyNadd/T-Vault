import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack screenOptions={{contentStyle: { backgroundColor: "#1E1E1E" }}}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="trip" options={{ headerShown: false }}/>
            <Stack.Screen name="updateStep" options={{ headerShown: false }}/>
        </Stack>
    );
}