import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack screenOptions={{contentStyle: { backgroundColor: "#1E1E1E" }}}>
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
        </Stack>
    );
}