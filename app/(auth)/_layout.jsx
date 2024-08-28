import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function Layout() {
    return (
        <Stack screenOptions={{contentStyle: { backgroundColor: "#1E1E1E" }}}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="trip" options={{ headerShown: false }}/>
        </Stack>
    );
}