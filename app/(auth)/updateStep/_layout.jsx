import { Stack } from "expo-router";

// Layout component for the [id] route
export default function Layout() {
    return (
        <Stack screenOptions={{contentStyle: { backgroundColor: "#1E1E1E" }}}>
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
        </Stack>
    );
}